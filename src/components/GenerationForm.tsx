import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { VIDEO_TARIFFS } from '@/config/video-tariffs';

type Model = 'sora' | 'veo';
type AspectRatio = '16:9' | '9:16';
type Duration = 5 | 10 | 15;

const GenerationForm = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('sora');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<Duration>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const { webApp } = useTelegramWebApp();

  const handleModelChange = () => {
    setSelectedModel(prev => prev === 'sora' ? 'veo' : 'sora');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!prompt.trim()) {
      alert('Пожалуйста, опишите желаемое видео');
      return;
    }

    // Получить telegramId из Telegram WebApp
    const telegramId = webApp?.initDataUnsafe?.user?.id;
    if (!telegramId) {
      alert('Не удалось получить данные пользователя из Telegram');
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);
      formData.append('telegramId', telegramId.toString());
      formData.append('aspectRatio', aspectRatio);

      // Длительность только для SORA 2
      if (selectedModel === 'sora') {
        formData.append('duration', duration.toString());
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/generate/video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Видео успешно поставлено в очередь генерации! Проверьте раздел "Мои видео"');
        // Очистить форму
        setPrompt('');
        setImageFile(null);
      } else {
        // Проверяем, если ошибка связана с недостатком токенов
        if (data.error && (data.error.includes('Недостаточно токенов') || data.error.includes('недостаточно токенов') || data.error.toLowerCase().includes('insufficient'))) {
          const confirmRedirect = confirm('У вас недостаточно токенов для генерации видео. Перейти в раздел тарифов для пополнения?');
          if (confirmRedirect) {
            router.push('/pricing');
            return;
          }
        }
        alert(`Ошибка: ${data.error || 'Не удалось создать видео'}`);
      }
    } catch (error) {
      console.error('Ошибка при генерации:', error);
      alert('Произошла ошибка при отправке запроса');
    } finally {
      setIsGenerating(false);
    }
  };

  // Определяем подсказки в зависимости от модели и наличия изображения
  const getPromptPlaceholder = () => {
    if (selectedModel === 'sora') {
      if (imageFile) {
        return 'Опишите движение: камера медленно отдаляется от объекта, вращаясь на 360 градусов. Мягкий свет заката освещает сцену, создавая длинные тени';
      }
      return 'Детальное описание: Закат над океаном, солнце медленно садится за горизонт. Камера плавно движется вдоль пляжа с белым песком. Пальмы качаются на легком ветру, волны мягко набегают на берег. Теплый золотистый свет окутывает сцену';
    } else {
      // Veo 3
      if (imageFile) {
        return 'Полное описание сцены: Футуристический город ночью с неоновыми огнями. Летающие машины проносятся между небоскрёбами. Дождь создаёт отражения на мокром асфальте. Кинематографичное освещение в стиле киберпанк';
      }
      return 'Детальное описание: Уютное кафе в Париже ранним утром. Камера медленно проходит мимо столиков на террасе. Официант наливает кофе, пар поднимается от чашки. Мягкий утренний свет, люди читают газеты. Атмосфера спокойствия и уюта';
    }
  };

  const getImageHint = () => {
    if (!imageFile) return null;

    if (selectedModel === 'sora') {
      return (
        <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
          <span>⚠️</span>
          <span>SORA 2: изображение будет анимировано согласно описанию движения</span>
        </p>
      );
    } else {
      return (
        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
          <span>✅</span>
          <span>Veo 3: изображение будет использовано как референс для стиля</span>
        </p>
      );
    }
  };

  // Расчёт стоимости в токенах на основе выбранных настроек
  const tokenCost = useMemo(() => {
    if (selectedModel === 'veo') {
      // Veo 3 - всегда 8 секунд, 13 токенов
      const veoTariff = VIDEO_TARIFFS.find(t => t.model === 'veo-3-fast');
      return veoTariff?.tokens || 13;
    } else {
      // SORA 2 - зависит от длительности
      const soraTariff = VIDEO_TARIFFS.find(t => t.model === 'sora-2' && t.duration === duration);
      return soraTariff?.tokens || 6;
    }
  }, [selectedModel, duration]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 border border-gray-200 sm:border-2">
        <div className="space-y-3 sm:space-y-5">
          <label className="block text-gray-800 font-semibold text-sm sm:text-base">
            ✨ Опишите видео, которое хотите создать
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm sm:text-base resize-none"
              placeholder={getPromptPlaceholder()}
              rows={4}
              disabled={isGenerating}
            />
          </label>

          <div className="mt-3 sm:mt-5">
            <label className="block text-gray-800 font-semibold mb-2 text-sm sm:text-base">
              🖼️ Добавить референс (необязательно)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <label className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                <span className="text-gray-700 font-bold text-sm sm:text-base">📎 Выбрать изображение</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isGenerating}
                />
              </label>
              {imageFile && (
                <span className="text-green-600 font-bold flex items-center gap-2 text-sm sm:text-base">
                  ✓ {imageFile.name}
                </span>
              )}
            </div>
            {getImageHint()}
          </div>
        </div>

        {/* Слайдер выбора модели */}
        <div className="mb-3 sm:mb-5 mt-4 sm:mt-6">
          <label className="block text-gray-800 font-semibold mb-2 text-sm sm:text-base">
            🤖 Выберите нейросеть
          </label>
          <button
            onClick={handleModelChange}
            type="button"
            className="w-full relative h-14 sm:h-16 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-purple-300"
          >
            <div
              className={`absolute top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ${
                selectedModel === 'sora' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            <div className="relative z-10 h-full flex items-center justify-between px-2 sm:px-3">
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-base sm:text-lg ${
                selectedModel === 'sora' ? 'text-white' : 'text-gray-600'
              }`}>
                Sora 2
              </div>
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-base sm:text-lg ${
                selectedModel === 'veo' ? 'text-white' : 'text-gray-600'
              }`}>
                Veo 3
              </div>
            </div>
          </button>

          {/* Подсказка о выбранной модели */}
          <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-200">
            {selectedModel === 'sora' ? (
              <div className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl flex-shrink-0">🎬</span>
                <div>
                  <p className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-xs sm:text-sm">SORA 2 • Видео с аудио</p>
                  <p className="text-[11px] sm:text-xs text-gray-700 leading-snug">
                    <span className="font-semibold">Без изображения:</span> создаст видео с синхронизированным звуком по вашему описанию
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-700 mt-0.5 sm:mt-1 leading-snug">
                    <span className="font-semibold">С изображением:</span> анимирует загруженное изображение со звуком согласно описанию движения
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl flex-shrink-0">⚡</span>
                <div>
                  <p className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-xs sm:text-sm">Veo 3 • Видео с аудио</p>
                  <p className="text-[11px] sm:text-xs text-gray-700 leading-snug">
                    <span className="font-semibold">Без изображения:</span> создаст видео с аудио по вашему описанию
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-700 mt-0.5 sm:mt-1 leading-snug">
                    <span className="font-semibold">С изображением:</span> создаст видео с аудио, используя изображение как референс стиля
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Выбор ориентации */}
        <div className="mb-3 sm:mb-5 mt-3 sm:mt-5">
          <label className="block text-gray-800 font-semibold mb-2 text-sm sm:text-base">
            📐 Ориентация видео
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 sm:gap-2 ${
                aspectRatio === '16:9'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`text-2xl sm:text-3xl ${aspectRatio === '16:9' ? 'scale-110' : ''} transition-transform`}>
                🖥️
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800 text-xs sm:text-sm">Горизонтальное</div>
                <div className="text-[10px] sm:text-xs text-gray-500">16:9 • YouTube</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 sm:gap-2 ${
                aspectRatio === '9:16'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`text-2xl sm:text-3xl ${aspectRatio === '9:16' ? 'scale-110' : ''} transition-transform`}>
                📱
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800 text-xs sm:text-sm">Вертикальное</div>
                <div className="text-[10px] sm:text-xs text-gray-500">9:16 • Соцсети</div>
              </div>
            </button>
          </div>
        </div>

        {/* Выбор длительности (только для SORA 2) */}
        {selectedModel === 'sora' && (
          <div className="mb-3 sm:mb-5">
            <label className="block text-gray-800 font-semibold mb-2 text-sm sm:text-base">
              ⏱️ Длительность видео
            </label>
            <div className="flex gap-2">
              {[5, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDuration(sec as Duration)}
                  className={`flex-1 py-3 sm:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 font-bold transition-all duration-200 text-sm sm:text-base ${
                    duration === sec
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg scale-105'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {sec} сек
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className={`w-full mt-3 sm:mt-5 text-base sm:text-xl py-4 sm:py-5 px-5 sm:px-6 rounded-lg sm:rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
            isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105 active:scale-95 hover:shadow-2xl'
          }`}
        >
          {isGenerating ? '⏳ Генерация...' : '🎬 Начать генерацию'}
        </button>
        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-200">
          <p className="text-center text-gray-700 text-sm sm:text-base font-semibold flex items-center justify-center gap-1.5 sm:gap-2">
            <span>💎</span>
            <span>Стоимость: {tokenCost} токенов</span>
          </p>
          <p className="text-center text-gray-500 text-xs sm:text-sm mt-0.5">
            {selectedModel === 'veo'
              ? 'Veo 3 • 8 секунд видео с аудио'
              : `SORA 2 • ${duration} секунд видео с аудио`}
          </p>
        </div>
      </form>
    </div>
  );
};

export default GenerationForm;