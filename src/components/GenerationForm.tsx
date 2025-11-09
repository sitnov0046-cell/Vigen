import React, { useState } from 'react';
import { Button } from './Button';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

type Model = 'sora' | 'veo';
type AspectRatio = '16:9' | '9:16';
type Duration = 5 | 10 | 15;

const GenerationForm = () => {
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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-gradient">
        <div className="space-y-6">
          <label className="block text-gray-800 font-semibold text-lg">
            ✨ Опишите видео, которое хотите создать
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-base"
              placeholder={getPromptPlaceholder()}
              rows={4}
              disabled={isGenerating}
            />
          </label>

          <div className="mt-6">
            <label className="block text-gray-800 font-semibold mb-3 text-lg">
              🖼️ Добавить референс (необязательно)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                <span className="text-gray-700 font-medium">📎 Выбрать изображение</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isGenerating}
                />
              </label>
              {imageFile && (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  ✓ {imageFile.name}
                </span>
              )}
            </div>
            {getImageHint()}
          </div>
        </div>

        {/* Слайдер выбора модели */}
        <div className="mb-6 mt-8">
          <label className="block text-gray-800 font-semibold mb-3 text-lg">
            🤖 Выберите нейросеть
          </label>
          <button
            onClick={handleModelChange}
            type="button"
            className="w-full relative h-16 bg-gray-100 rounded-xl overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-purple-300"
          >
            <div
              className={`absolute top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ${
                selectedModel === 'sora' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            <div className="relative z-10 h-full flex items-center justify-between px-4">
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-lg ${
                selectedModel === 'sora' ? 'text-white' : 'text-gray-600'
              }`}>
                Sora 2
              </div>
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-lg ${
                selectedModel === 'veo' ? 'text-white' : 'text-gray-600'
              }`}>
                Veo 3
              </div>
            </div>
          </button>

          {/* Подсказка о выбранной модели */}
          <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            {selectedModel === 'sora' ? (
              <div className="flex items-start gap-2">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="font-bold text-gray-800 mb-1">SORA 2</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Без изображения:</span> создаст видео по вашему описанию
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">С изображением:</span> анимирует загруженное изображение согласно описанию движения
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-bold text-gray-800 mb-1">Veo 3</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Без изображения:</span> создаст видео по вашему описанию
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">С изображением:</span> создаст видео с использованием изображения как референса стиля
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Выбор ориентации */}
        <div className="mb-6 mt-6">
          <label className="block text-gray-800 font-semibold mb-3 text-lg">
            📐 Ориентация видео
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                aspectRatio === '16:9'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`text-4xl ${aspectRatio === '16:9' ? 'scale-110' : ''} transition-transform`}>
                🖥️
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800">Горизонтальное</div>
                <div className="text-sm text-gray-500">16:9 • YouTube</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                aspectRatio === '9:16'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`text-4xl ${aspectRatio === '9:16' ? 'scale-110' : ''} transition-transform`}>
                📱
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800">Вертикальное</div>
                <div className="text-sm text-gray-500">9:16 • Соцсети</div>
              </div>
            </button>
          </div>
        </div>

        {/* Выбор длительности (только для SORA 2) */}
        {selectedModel === 'sora' && (
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-3 text-lg">
              ⏱️ Длительность видео
            </label>
            <div className="flex gap-3">
              {[5, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDuration(sec as Duration)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all duration-200 ${
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
          className={`w-full mt-6 text-xl py-5 px-6 rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
            isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105 active:scale-95 hover:shadow-2xl animate-pulse-slow'
          }`}
        >
          {isGenerating ? '⏳ Генерация...' : '🎬 Начать генерацию'}
        </button>
        <p className="text-center text-gray-500 text-sm font-medium mt-3 flex items-center justify-center gap-2">
          <span>💎</span>
          <span>При генерации будет списано 2 токена</span>
        </p>
      </form>
    </div>
  );
};

export default GenerationForm;