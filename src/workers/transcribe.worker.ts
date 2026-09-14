import { pipeline, env, TextStreamer } from '@huggingface/transformers';

// Skip local check to download directly from Hugging Face CDN inside the worker
env.allowLocalModels = false;

class PipelineSingleton {
  static task = 'automatic-speech-recognition';
  static model = 'Xenova/whisper-tiny.en';
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model, {
        dtype: 'fp32',
        progress_callback,
      } as any);
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { audioArray } = event.data;

  try {
    self.postMessage({ lifecycle: 'downloading', pct: 30 });

    const transcriber = await PipelineSingleton.getInstance((progress: any) => {
      if (
        progress.status === 'progress' &&
        typeof progress.loaded === 'number' &&
        typeof progress.total === 'number'
      ) {
        const pct = Math.round(30 + (progress.loaded / progress.total) * 55);
        self.postMessage({ lifecycle: 'downloading', pct });
      }
    });

    self.postMessage({ lifecycle: 'processing' });

    // Accumulates text across the whole transcription (all chunks combined)
    let streamedText = '';

    const streamer = new TextStreamer(transcriber.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (newText: string) => {
        streamedText += newText;
        self.postMessage({ lifecycle: 'partial', text: streamedText });
      },
    });

    const output = await transcriber(audioArray, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false,
      streamer,
    });

    self.postMessage({
      lifecycle: 'completed',
      chunks: Array.isArray(output) ? output : [output],
    });
  } catch (err: any) {
    self.postMessage({
      lifecycle: 'failed',
      error: err?.message || 'Unknown transcription error occurred.',
    });
  }
});