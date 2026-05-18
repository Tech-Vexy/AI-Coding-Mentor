// audio-processor.js
// AudioWorkletProcessor with simple linear interpolation downsampling

class GeminiAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];

      // Determine current sample rate (browser usually defaults to 44.1k or 48k)
      // Since AudioWorklet doesn't easily expose context.sampleRate directly in process(),
      // we'll assume a standard 48kHz for the hackathon downsampling ratio.
      const sourceSampleRate = 48000;

      const ratio = sourceSampleRate / this.targetSampleRate;
      const targetLength = Math.round(channelData.length / ratio);
      const int16Array = new Int16Array(targetLength);

      let offsetResult = 0;
      let offsetSource = 0;

      while (offsetResult < targetLength) {
        let nextSourceOffset = Math.round((offsetResult + 1) * ratio);
        let accum = 0;
        let count = 0;

        // Simple averaging/decimation
        for (let i = offsetSource; i < nextSourceOffset && i < channelData.length; i++) {
          accum += channelData[i];
          count++;
        }

        let sample = count > 0 ? accum / count : 0;

        // Float32 to Int16
        let s = Math.max(-1, Math.min(1, sample));
        int16Array[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7FFF;

        offsetResult++;
        offsetSource = nextSourceOffset;
      }

      this.port.postMessage(int16Array.buffer, [int16Array.buffer]);
    }
    return true;
  }
}

registerProcessor('gemini-audio-processor', GeminiAudioProcessor);
