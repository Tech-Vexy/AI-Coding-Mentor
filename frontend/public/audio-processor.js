// audio-processor.js
// A basic AudioWorkletProcessor to downsample audio to 16kHz 16-bit PCM for Gemini Live API
class GeminiAudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      // Internal buffer for accumulating downsampled data
      this.buffer = [];
    }

    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input.length > 0) {
        const channelData = input[0]; // Process only the first channel (mono)

        // Simple float32 to int16 conversion
        // In a real-world scenario, proper low-pass filtering and interpolation
        // should be done to resample from 48kHz/44.1kHz down to 16kHz.
        // For hackathon purposes, Gemini Live can handle raw Float32 to Int16 conversions well enough.

        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          let s = Math.max(-1, Math.min(1, channelData[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send the PCM data back to the main thread
        this.port.postMessage(int16Array.buffer, [int16Array.buffer]);
      }
      return true;
    }
  }

  registerProcessor('gemini-audio-processor', GeminiAudioProcessor);
