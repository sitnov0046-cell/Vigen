'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { BottomNavigation } from '@/components/BottomNavigation';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  createdAt: string;
  isPublic?: boolean;
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingVideoId, setPublishingVideoId] = useState<string | null>(null);
  const [minBid, setMinBid] = useState<number>(2);
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const userId = webApp?.initDataUnsafe?.user?.id;

        if (!userId) {
          setVideos([]);
          setIsLoading(false);
          return;
        }

        // Загрузка видео
        const videosResponse = await fetch(`/api/videos?userId=${userId}`);
        const videosData = await videosResponse.json();
        setVideos(videosData);

        // Загрузка информации о минимальной ставке
        const featuredResponse = await fetch('/api/videos/featured');
        const featuredData = await featuredResponse.json();
        setMinBid(featuredData.minBid || 2);
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [webApp?.initDataUnsafe?.user?.id]);

  const handlePublishVideo = async (videoId: string) => {
    try {
      setPublishingVideoId(videoId);
      const telegramId = webApp?.initDataUnsafe?.user?.id;

      // ДЕМО режим: просто обновляем локально
      if (!telegramId || videoId.startsWith('demo-')) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, isPublic: true } : v
        ));
        alert('🎉 Видео опубликовано в рейтинге!\n(Демо режим - изменения не сохранятся)');
        setPublishingVideoId(null);
        return;
      }

      const response = await fetch(`/api/videos/${videoId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId, bidAmount: minBid }),
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем статус видео локально
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, isPublic: true } : v
        ));
        // Обновляем минимальную ставку
        const featuredResponse = await fetch('/api/videos/featured');
        const featuredData = await featuredResponse.json();
        setMinBid(featuredData.minBid || 2);
        alert(`Видео размещено в "Топ дня"!`);
      } else {
        alert(data.error || data.message || 'Ошибка при публикации видео');
      }
    } catch (error) {
      console.error('Error publishing video:', error);
      alert('Ошибка при публикации видео');
    } finally {
      setPublishingVideoId(null);
    }
  };

  const handleUnpublishVideo = async (videoId: string) => {
    try {
      setPublishingVideoId(videoId);
      const telegramId = webApp?.initDataUnsafe?.user?.id;

      // ДЕМО режим: просто обновляем локально
      if (!telegramId || videoId.startsWith('demo-')) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, isPublic: false } : v
        ));
        alert('✅ Видео снято с публичного рейтинга\n(Демо режим - изменения не сохранятся)');
        setPublishingVideoId(null);
        return;
      }

      const response = await fetch(`/api/videos/${videoId}/publish?telegramId=${telegramId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем статус видео локально
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, isPublic: false } : v
        ));
        alert('Видео снято с публичного рейтинга');
      } else {
        alert(data.error || 'Ошибка при снятии видео с публикации');
      }
    } catch (error) {
      console.error('Error unpublishing video:', error);
      alert('Ошибка при снятии видео с публикации');
    } finally {
      setPublishingVideoId(null);
    }
  };

  const handleDownloadVideo = (video: Video) => {
    // В демо режиме показываем уведомление
    if (video.id.startsWith('demo-')) {
      alert('📥 Функция скачивания доступна только для реальных видео');
      return;
    }

    // Открываем видео в новой вкладке - браузер предложит скачать
    window.open(video.url, '_blank');
  };

  const handleShareVideo = (video: Video) => {
    // В демо режиме показываем уведомление
    if (video.id.startsWith('demo-')) {
      alert('📤 Функция отправки доступна только для реальных видео');
      return;
    }

    // Используем Telegram share URL для отправки видео
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(video.url)}&text=${encodeURIComponent(video.title)}`;

    // Открываем в новой вкладке
    window.open(shareUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex flex-col items-center justify-center pb-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Загрузка видео...</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex flex-col items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl mb-4 text-gray-700">У вас пока нет сгенерированных видео</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Создать первое видео
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% pb-20">
      <div className="container mx-auto px-3 py-4 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">🎬 Мои видео</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg active:shadow-xl transition-shadow"
            >
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video relative cursor-pointer group active:opacity-90 transition-opacity"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Play button - видим всегда на мобильных */}
                <div className="absolute inset-0 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </a>
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{video.title}</h3>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Кнопки "Скачать" и "Поделиться" */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadVideo(video)}
                      className="flex-1 py-2 px-2 sm:px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <span className="text-base">📥</span>
                      <span>Скачать</span>
                    </button>
                    <button
                      onClick={() => handleShareVideo(video)}
                      className="flex-1 py-2 px-2 sm:px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <span className="text-base">✈️</span>
                      <span>Поделиться</span>
                    </button>
                  </div>

                  {/* Кнопка публикации/снятия с публикации */}
                  {video.isPublic ? (
                    <button
                      onClick={() => handleUnpublishVideo(video.id)}
                      disabled={publishingVideoId === video.id}
                      className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-xs sm:text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      {publishingVideoId === video.id ? (
                        <>
                          <span className="animate-spin text-base">⏳</span>
                          <span className="text-xs sm:text-sm">Снятие...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">✓</span>
                          <span className="text-xs sm:text-sm">Опубликовано</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublishVideo(video.id)}
                      disabled={publishingVideoId === video.id}
                      className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-xs sm:text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      {publishingVideoId === video.id ? (
                        <>
                          <span className="animate-spin text-base">⏳</span>
                          <span>Публикация...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">🔥</span>
                          <span>Добавить в &quot;Топ дня&quot; ({minBid} {minBid === 1 ? 'токен' : minBid >= 2 && minBid <= 4 ? 'токена' : 'токенов'})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}