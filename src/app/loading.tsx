'use client';

import { useState, useEffect } from 'react';
import { StarryBackground } from '@/components/StarryBackground';

export default function Loading() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Проверяем, был ли показан splash screen
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const hasSeenSplash = typeof window !== 'undefined' && sessionStorage.getItem('hasSeenSplash');

    // Показываем loading только если splash уже был показан
    if (hasSeenSplash && !isLocalhost) {
      setShouldShow(true);
    } else if (!isLocalhost) {
      // На не-localhost и без splash - не показываем loading (будет splash)
      setShouldShow(false);
    } else {
      // На localhost всегда показываем (для разработки)
      setShouldShow(true);
    }
  }, []);

  // Не рендерим ничего, пока не определились
  if (!shouldShow) {
    return null;
  }

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
