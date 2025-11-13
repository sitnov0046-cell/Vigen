'use client';

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { FEATURED_MIN_BID, FEATURED_DURATION_HOURS } from '@/lib/constants';
import { StarryBackground } from '@/components/StarryBackground';

interface Video {
  id: number;
  title: string;
  userId: number;
  user: {
    username: string | null;
    photoUrl?: string | null;
  };
  votesCount: number;
  isFeatured: boolean;
  currentBid: number;
  featuredUntil: string | null;
  hasUserVoted?: boolean;
}

export default function PopularVideosPage() {
  const { webApp } = useTelegramWebApp();
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [minBid, setMinBid] = useState<number>(FEATURED_MIN_BID);

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Загрузка информации о минимальной ставке
      const featuredResponse = await fetch('/api/videos/featured');
      const featuredData = await featuredResponse.json();
      setMinBid(featuredData.minBid || FEATURED_MIN_BID);

      // TODO: Здесь будет запрос к API для загрузки видео
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Голосование
  const handleVote = async (videoId: number) => {
    try {
      // TODO: API для голосования
      alert('Голос учтён! (Функция будет реализована)');
      loadData();
    } catch (error) {
      alert('Ошибка при голосовании');
    }
  };

  // Ставка на главную
  const handleBidForFeatured = async (videoId: number) => {
    try {
      // TODO: API для ставки с автоматическим minBid
      alert(`Ставка ${minBid} токенов принята! (Функция будет реализована)`);
      await loadData(); // Обновляем минимальную ставку после успешной публикации
    } catch (error) {
      alert('Ошибка при размещении ставки');
    }
  };

  const calculateTimeLeft = (featuredUntil: string | null) => {
    if (!featuredUntil) return null;

    const end = new Date(featuredUntil).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Завершено';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}ч ${minutes}м`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <StarryBackground />
        <div className="text-center">
          <div className="text-5xl mb-3">⏳</div>
          <p className="text-white/90 text-base drop-shadow-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      <StarryBackground />
      <div className="container mx-auto px-3 py-4 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">🔥 Популярные видео</h1>
          <p className="text-white text-sm sm:text-lg">Голосуй за лучшие видео и размести своё на главной!</p>
        </div>

        {/* Видео дня */}
        <div className="mb-6 sm:mb-12">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl sm:rounded-3xl p-1 shadow-xl sm:shadow-2xl">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <span>👑</span>
                  <span>Видео дня</span>
                </h2>
                {featuredVideo && (
                  <div className="text-right">
                    <div className="text-xs sm:text-sm text-gray-500">Осталось</div>
                    <div className="text-base sm:text-2xl font-bold text-orange-600">
                      {calculateTimeLeft(featuredVideo.featuredUntil)}
                    </div>
                  </div>
                )}
              </div>

              {featuredVideo ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 line-clamp-2">{featuredVideo.title}</h3>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2">
                      {/* Аватар автора */}
                      {featuredVideo.user.photoUrl ? (
                        <img
                          src={featuredVideo.user.photoUrl}
                          alt={featuredVideo.user.username || 'User'}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-gray-300">
                          {(featuredVideo.user.username || 'A')[0].toUpperCase()}
                        </div>
                      )}
                      <p className="text-sm sm:text-base text-gray-600">@{featuredVideo.user.username || 'Аноним'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xl sm:text-2xl">❤️</span>
                        <span className="text-base sm:text-xl font-bold text-gray-800">{featuredVideo.votesCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xl sm:text-2xl">💎</span>
                        <span className="text-base sm:text-xl font-bold text-gray-800">{featuredVideo.currentBid} токенов</span>
                      </div>
                    </div>
                  </div>

                  {/* Форма перебивания ставки */}
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">🔥 Перебей ставку!</h4>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      {/* Выбор видео */}
                      <select
                        value={selectedVideoId || ''}
                        onChange={(e) => setSelectedVideoId(Number(e.target.value))}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="">-- Выбери своё видео --</option>
                        {videos.map((video) => (
                          <option key={video.id} value={video.id}>
                            {video.title}
                          </option>
                        ))}
                      </select>

                      {/* Кнопка */}
                      <button
                        onClick={() => selectedVideoId && handleBidForFeatured(selectedVideoId)}
                        disabled={!selectedVideoId}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>👑</span>
                        <span>Разместить за {minBid} {minBid === 1 ? 'токен' : minBid >= 2 && minBid <= 4 ? 'токена' : 'токенов'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                      При перебитии таймер обнулится ({FEATURED_DURATION_HOURS} часа)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎬</div>
                  <p className="text-base sm:text-xl text-gray-600 mb-2 sm:mb-4">Главная позиция свободна!</p>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
                    Поставь свое видео на главную за {FEATURED_MIN_BID} токена на {FEATURED_DURATION_HOURS} часа
                  </p>

                  {/* Форма размещения видео */}
                  <div className="max-w-md mx-auto mt-4 sm:mt-6 px-3">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">📹 Выбери своё видео</h3>

                      {/* Выбор видео из списка */}
                      <select
                        value={selectedVideoId || ''}
                        onChange={(e) => setSelectedVideoId(Number(e.target.value))}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="">-- Выбери видео из списка --</option>
                        {videos.map((video) => (
                          <option key={video.id} value={video.id}>
                            {video.title}
                          </option>
                        ))}
                      </select>

                      {/* Кнопка размещения */}
                      <button
                        onClick={() => selectedVideoId && handleBidForFeatured(selectedVideoId)}
                        disabled={!selectedVideoId}
                        className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm sm:text-lg rounded-lg sm:rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>👑</span>
                        <span>Разместить за {minBid} {minBid === 1 ? 'токен' : minBid >= 2 && minBid <= 4 ? 'токена' : 'токенов'}</span>
                      </button>

                      <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                        Видео будет на главной {FEATURED_DURATION_HOURS} часа
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-5 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">📋 Как это работает?</h3>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>• Начальная ставка для видео дня: <strong>{FEATURED_MIN_BID} токена</strong></p>
            <p>• Видео находится на главной <strong>{FEATURED_DURATION_HOURS} часа</strong></p>
            <p>• Другие могут перебить ставку, поставив на <strong>1 токен больше</strong></p>
            <p>• При перебитии ставки время обнуляется и начинается заново</p>
            <p>• Голосуй за понравившиеся видео бесплатно!</p>
          </div>
        </div>

        {/* Рейтинг видео */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">🏆 Рейтинг</h2>

          {videos.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎥</div>
              <p className="text-base sm:text-xl text-gray-600">Пока нет опубликованных видео</p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">Стань первым, кто опубликует своё видео!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden active:shadow-xl transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    {/* Позиция в рейтинге */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`text-2xl sm:text-4xl font-bold flex-shrink-0 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-300'
                        }`}>
                          #{index + 1}
                        </div>
                        {/* Аватар автора */}
                        {video.user.photoUrl ? (
                          <img
                            src={video.user.photoUrl}
                            alt={video.user.username || 'User'}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg border-2 border-white shadow-md flex-shrink-0">
                            {(video.user.username || 'A')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl font-bold text-gray-800 line-clamp-1">{video.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">@{video.user.username || 'Аноним'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Статистика и действия */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => handleVote(video.id)}
                          disabled={video.hasUserVoted}
                          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all ${
                            video.hasUserVoted
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-pink-500 to-red-500 text-white active:scale-95'
                          }`}
                        >
                          <span>❤️</span>
                          <span>{video.votesCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
