'use client';

import { useState } from 'react';

interface DemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function DemoVideo({ src, poster, className = '' }: DemoVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden shadow-xl ${className}`}>
      {/* Placeholder пока видео загружается */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 animate-pulse transition-opacity duration-300 ${
        isLoaded ? 'opacity-0' : 'opacity-100'
      }`} />

      <video
        className="relative w-full h-full object-cover z-10"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
        Ваш браузер не поддерживает видео
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
}