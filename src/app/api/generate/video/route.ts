import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVideo } from '@/lib/kie-ai';
import { VIDEO_TARIFFS } from '@/config/video-tariffs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/generate/video
 * Начать генерацию видео
 *
 * Поддерживает два формата:
 * 1. JSON: { telegramId, prompt, tariffId, imageUrl } - старый формат
 * 2. FormData: { prompt, model, image? } - новый формат от GenerationForm
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/generate/video START ===');
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    let telegramId, prompt, model, imageFile, tariffId, imageUrl, aspectRatio, duration;

    // Обработка FormData (новый формат)
    if (contentType?.includes('multipart/form-data')) {
      console.log('Processing FormData...');
      const formData = await request.formData();
      prompt = formData.get('prompt') as string;
      model = formData.get('model') as 'sora' | 'veo'; // 'sora' или 'veo'
      telegramId = formData.get('telegramId') as string;
      imageFile = formData.get('image') as File | null;
      aspectRatio = formData.get('aspectRatio') as string || '16:9';
      duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined;

      console.log('FormData parsed:', {
        prompt: prompt?.substring(0, 50),
        model,
        telegramId,
        hasImage: !!imageFile,
        aspectRatio,
        duration
      });

      // Загрузить изображение если есть и получить публичный URL
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
          );
        }

        const uploadData = await uploadResponse.json();
        // Преобразуем относительный URL в абсолютный для KIE.AI
        imageUrl = `${request.nextUrl.origin}${uploadData.url}`;
      }

      // Определить тариф по модели (используем базовый тариф)
      tariffId = model === 'sora' ? 'sora-basic' : 'veo-basic';
    } else {
      // Обработка JSON (старый формат)
      const body = await request.json();
      telegramId = body.telegramId;
      prompt = body.prompt;
      tariffId = body.tariffId;
      imageUrl = body.imageUrl;
    }

    if (!telegramId || !prompt || !tariffId) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      );
    }

    // Найти тариф
    const tariff = VIDEO_TARIFFS.find(t => t.id === tariffId);
    if (!tariff) {
      return NextResponse.json(
        { error: 'Тариф не найден' },
        { status: 400 }
      );
    }

    // Получить пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверить баланс
    if (user.balance < tariff.tokens) {
      return NextResponse.json(
        { error: 'Недостаточно токенов', required: tariff.tokens, balance: user.balance },
        { status: 402 }
      );
    }

    // Создать запись о видео со статусом "pending"
    const actualDuration = duration || tariff.duration; // Используем выбранную длительность или дефолтную
    const video = await prisma.video.create({
      data: {
        title: prompt.substring(0, 100), // Первые 100 символов промпта
        prompt,
        model: tariff.model,
        duration: actualDuration,
        tokensCost: tariff.tokens,
        status: 'pending',
        userId: user.id,
      },
    });

    // Списать токены
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: tariff.tokens } },
    });

    // Создать транзакцию
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: -tariff.tokens,
        type: 'video_generation',
        description: `Генерация видео "${prompt.substring(0, 50)}" (${tariff.name}, ${actualDuration}с)`,
      },
    });

    // Запустить генерацию через KIE.AI
    try {
      const kieResponse = await generateVideo({
        prompt,
        model: tariff.model,
        duration: actualDuration,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
      });

      // Обновить статус и сохранить job_id
      await prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'processing',
          kieJobId: kieResponse.job_id,
        },
      });

      return NextResponse.json({
        success: true,
        videoId: video.id,
        jobId: kieResponse.job_id,
        status: 'processing',
        message: 'Генерация началась',
      });
    } catch (kieError: any) {
      // Если KIE.AI вернул ошибку, отметить видео как failed
      await prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'failed',
          errorMessage: kieError.message,
        },
      });

      // Вернуть токены пользователю
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: tariff.tokens } },
      });

      // Создать транзакцию возврата
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: tariff.tokens,
          type: 'refund',
          description: `Возврат за ошибку генерации видео #${video.id}`,
        },
      });

      return NextResponse.json(
        { error: 'Ошибка генерации', message: kieError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/video?videoId=123
 * Проверить статус генерации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { id: parseInt(videoId) },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: video.id,
      status: video.status,
      telegramFileId: video.telegramFileId,
      errorMessage: video.errorMessage,
      createdAt: video.createdAt,
      completedAt: video.completedAt,
    });
  } catch (error: any) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
