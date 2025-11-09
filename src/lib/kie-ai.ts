// Утилиты для работы с KIE.AI API

const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;
const KIE_AI_BASE_URL = process.env.KIE_AI_BASE_URL || 'https://api.kie.ai/v1';

export interface GenerateVideoParams {
  prompt: string;
  model: 'sora-2' | 'veo-3-fast';
  duration: number; // в секундах
  image_url?: string; // опционально, для image-to-video
  aspect_ratio?: string; // опционально, например '16:9' или '9:16'
}

export interface GenerateVideoResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error_message?: string;
}

export interface CheckJobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  progress?: number; // 0-100
}

/**
 * Начать генерацию видео через KIE.AI
 *
 * SORA 2:
 * - Без изображения: Text-to-Video mode
 * - С изображением: Image-to-Video mode (анимация изображения согласно описанию движения)
 *
 * Veo 3:
 * - Без изображения: TEXT_2_VIDEO mode
 * - С изображением: REFERENCE_2_VIDEO mode (изображение как референс стиля)
 */
export async function generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не установлен');
  }

  // Определяем endpoint и параметры в зависимости от модели и наличия изображения
  let endpoint: string;
  let requestBody: any;

  if (params.model === 'sora-2') {
    if (params.image_url) {
      // SORA 2: Image-to-Video mode
      endpoint = `${KIE_AI_BASE_URL}/sora-2/image-to-video`;
      requestBody = {
        prompt: params.prompt, // Описание движения
        image_url: params.image_url,
        duration: params.duration,
      };
      if (params.aspect_ratio) {
        requestBody.aspect_ratio = params.aspect_ratio;
      }
    } else {
      // SORA 2: Text-to-Video mode
      endpoint = `${KIE_AI_BASE_URL}/sora-2/text-to-video`;
      requestBody = {
        prompt: params.prompt,
        duration: params.duration,
      };
      if (params.aspect_ratio) {
        requestBody.aspect_ratio = params.aspect_ratio;
      }
    }
  } else {
    // Veo 3
    if (params.image_url) {
      // Veo 3: REFERENCE_2_VIDEO mode
      endpoint = `${KIE_AI_BASE_URL}/veo-3/reference-to-video`;
      requestBody = {
        prompt: params.prompt, // Описание желаемого видео
        reference_image_url: params.image_url, // Референс стиля
      };
      // Veo 3 поддерживает aspect_ratio
      if (params.aspect_ratio) {
        requestBody.aspect_ratio = params.aspect_ratio;
      }
    } else {
      // Veo 3: TEXT_2_VIDEO mode
      endpoint = `${KIE_AI_BASE_URL}/veo-3/text-to-video`;
      requestBody = {
        prompt: params.prompt,
      };
      // Veo 3 поддерживает aspect_ratio
      if (params.aspect_ratio) {
        requestBody.aspect_ratio = params.aspect_ratio;
      }
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`KIE.AI API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Проверить статус генерации видео
 */
export async function checkJobStatus(jobId: string): Promise<CheckJobStatusResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не установлен');
  }

  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`KIE.AI API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Скачать видео по URL и загрузить в Telegram
 * (будет реализовано позже через Telegram Bot API)
 */
export async function downloadVideoToBuffer(videoUrl: string): Promise<Buffer> {
  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
