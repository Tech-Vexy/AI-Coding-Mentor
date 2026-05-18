import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

type GeminiLiveState = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useGeminiLive() {
  const [state, setState] = useState<GeminiLiveState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const screenCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);

  const sessionTokenRef = useRef<string | null>(null);

  const playAudioChunk = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 16000);
    audioBuffer.getChannelData(0).set(float32Array);

    audioQueueRef.current.push(audioBuffer);

    const playNext = () => {
      if (!audioContextRef.current || audioQueueRef.current.length === 0) {
        isPlayingRef.current = false;
        return;
      }

      isPlayingRef.current = true;
      const buffer = audioQueueRef.current.shift()!;
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;

      source.onended = playNext;
    };

    if (!isPlayingRef.current) {
        nextPlayTimeRef.current = audioContextRef.current.currentTime;
        playNext();
    }
  }, []);

  const captureAndSendImage = useCallback(async () => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    try {
      // Capture specific node if provided, else body. Improves performance.
      const nodeToCapture = targetRef.current || document.body;
      const canvas = await html2canvas(nodeToCapture, {
        scale: 0.5,
        useCORS: true
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      const base64Data = dataUrl.split(',')[1];

      const payload = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: "image/jpeg",
            data: base64Data
          }]
        }
      };

      wsRef.current.send(JSON.stringify(payload));
    } catch (e) {
      console.error("Screen capture failed:", e);
    }
  }, []);

  const handleToolCall = useCallback(async (functionCalls: any[]) => {
      const responses = [];

      for (const call of functionCalls) {
          const { id, name, args } = call;
          try {
              const headers: Record<string, string> = { "Content-Type": "application/json" };
              if (sessionTokenRef.current) {
                 headers["Authorization"] = `Bearer ${sessionTokenRef.current}`;
              }

              const response = await fetch("http://localhost:8000/api/tools/execute", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({ tool_name: name, arguments: args })
              });

              const data = await response.json();

              responses.push({
                  id,
                  name,
                  response: data
              });
          } catch (e) {
              responses.push({
                  id,
                  name,
                  response: { error: "Failed to execute tool on backend" }
              });
          }
      }

      if (wsRef.current?.readyState === WebSocket.OPEN && responses.length > 0) {
          wsRef.current.send(JSON.stringify({
              toolResponse: {
                  functionResponses: responses
              }
          }));
      }
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    return window.btoa(binary);
  };

  const connect = useCallback(async (token: string, captureRef?: HTMLElement | null) => {
    try {
      setState('connecting');
      sessionTokenRef.current = token;

      if (captureRef) {
          targetRef.current = captureRef;
      }

      // Connect to secure backend WebSocket proxy instead of Google directly
      const wsUrl = `ws://localhost:8000/api/ws/gemini?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        ws.send(JSON.stringify({
            setup: {
                model: "models/gemini-2.0-flash-exp",
                systemInstruction: {
                    parts: [{text: "You are Ada, an AI Tutor. You can see the student's screen and hear their voice."}]
                },
                tools: [
                    { functionDeclarations: [{ name: "query_curriculum", description: "Query the curriculum vector db", parameters: {type: "object", properties: {query: {type: "string"}}} }] },
                    { functionDeclarations: [{ name: "lint_code", description: "Lint student code", parameters: {type: "object", properties: {code: {type: "string"}, language: {type: "string"}}} }] },
                    { functionDeclarations: [{ name: "execute_code", description: "Run student code", parameters: {type: "object", properties: {code: {type: "string"}, language: {type: "string"}}} }] }
                ]
            }
        }));

        setState('connected');

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 16000,
        } });

        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        const workletNode = new AudioWorkletNode(audioContextRef.current, 'gemini-audio-processor');
        audioWorkletNodeRef.current = workletNode;

        workletNode.port.onmessage = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
                const base64Data = arrayBufferToBase64(e.data);

                ws.send(JSON.stringify({
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: "audio/pcm;rate=16000",
                            data: base64Data
                        }]
                    }
                }));
            }
        };

        source.connect(workletNode);

        screenCaptureIntervalRef.current = setInterval(captureAndSendImage, 2000);
      };

      ws.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);

              if (data.serverContent?.modelTurn?.parts) {
                  for (const part of data.serverContent.modelTurn.parts) {
                      if (part.inlineData?.mimeType.startsWith('audio/pcm')) {
                          playAudioChunk(part.inlineData.data);
                      }
                  }
              }
              if (data.toolCall?.functionCalls) {
                  handleToolCall(data.toolCall.functionCalls);
              }
          } catch (e) {
              console.error("Failed to parse WS message", e);
          }
      };

      ws.onerror = (e) => {
          console.error("WebSocket Error:", e);
          setState('error');
      };

      ws.onclose = () => {
          setState('disconnected');
          disconnect();
      };

    } catch (e) {
      console.error("Failed to connect:", e);
      setState('error');
    }
  }, [playAudioChunk, captureAndSendImage, handleToolCall]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
    if (screenCaptureIntervalRef.current) {
        clearInterval(screenCaptureIntervalRef.current);
        screenCaptureIntervalRef.current = null;
    }
    if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    setState('disconnected');
  }, []);

  return { state, connect, disconnect };
}
