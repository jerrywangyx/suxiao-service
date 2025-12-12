import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0/dist/transformers.min.js';

// 跳过本地模型检查
env.allowLocalModels = false;
// 使用 ONNX Runtime Web 的 WASM 后端
env.backends.onnx.wasm.numThreads = 1;

class MyTranscriptionPipeline {
  static task = 'automatic-speech-recognition';
  // 使用量化版本的 whisper-tiny，体积小速度快 (~40MB)
  static model = 'Xenova/whisper-tiny';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { audio } = event.data;

  try {
    const transcriber = await MyTranscriptionPipeline.getInstance((data) => {
      self.postMessage({ status: 'progress', ...data });
    });

    const output = await transcriber(audio, {
      language: 'chinese', // 指定中文
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    self.postMessage({ status: 'complete', output });
  } catch (error) {
    self.postMessage({ status: 'error', error: error.message });
  }
});

