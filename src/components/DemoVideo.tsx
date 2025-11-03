interface DemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function DemoVideo({ src, poster, className = '' }: DemoVideoProps) {
  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden shadow-xl ${className}`}>
      <video 
        className="w-full h-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        poster={poster}
      >
        <source src={src} type="video/mp4" />
        Ваш браузер не поддерживает видео
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
  );
}