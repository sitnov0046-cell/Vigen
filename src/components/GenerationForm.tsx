import React, { useState } from 'react';
import { Button } from './Button';

type Model = 'sora' | 'veo';

const GenerationForm = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('sora');

  const handleModelChange = () => {
    setSelectedModel(prev => prev === 'sora' ? 'veo' : 'sora');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Здесь будет логика отправки данных для генерации
    console.log('Отправка:', { prompt, imageFile });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6">
        <div className="space-y-4">
          <label className="block text-white font-medium text-lg">
            Опишите видео, которое хотите создать
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors text-lg placeholder:text-base"
              placeholder="Например: Красивый закат на берегу моря с пальмами..."
              rows={4}
            />
          </label>

          <div className="mt-6">
            <label className="block text-white font-medium mb-2 text-lg">
              Добавить референс (фото)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-6 py-3 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-white text-base">📎 Выбрать файл</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-white/80">
                  Выбрано: {imageFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Слайдер выбора модели */}
        <div className="mb-6 mt-8">
          <label className="block text-white font-medium mb-3">
            Выберите нейросеть
          </label>
          <button
            onClick={handleModelChange}
            type="button"
            className="w-full relative h-14 bg-white/10 rounded-lg overflow-hidden transition-all duration-300"
          >
            <div 
              className={`absolute top-0 h-full bg-blue-500 transition-all duration-300 ${
                selectedModel === 'sora' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            <div className="relative z-10 h-full flex items-center justify-between px-4">
              <div className={`flex-1 text-center transition-colors duration-300 font-medium ${
                selectedModel === 'sora' ? 'text-white' : 'text-white/50'
              }`}>
                Sora 2
              </div>
              <div className={`flex-1 text-center transition-colors duration-300 font-medium ${
                selectedModel === 'veo' ? 'text-white' : 'text-white/50'
              }`}>
                Veo 3
              </div>
            </div>
          </button>
        </div>

        <Button type="submit" className="w-full mt-6 text-xl py-4">
          🎬 Начать генерацию
        </Button>
        <p className="text-center text-white/70 text-sm italic mt-2">
          При генерации будет списано 2 токена
        </p>
      </form>
    </div>
  );
};

export default GenerationForm;