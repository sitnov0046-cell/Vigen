'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Генерируем звёзды
    const initStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 3000); // Плотность звёзд

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5, // Размер от 0.5 до 2
          opacity: Math.random() * 0.5 + 0.5, // Яркость от 0.5 до 1
          twinkleSpeed: Math.random() * 0.02 + 0.005, // Скорость мерцания
          twinklePhase: Math.random() * Math.PI * 2, // Фаза мерцания
        });
      }

      starsRef.current = stars;
    };

    // Анимация звёзд
    const animate = () => {
      // Создаём голубой галактический фон с красивым градиентом
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      // Центр - светлый голубой с переходом в синий
      bgGradient.addColorStop(0, '#38bdf8'); // Яркий голубой (sky-400)
      bgGradient.addColorStop(0.2, '#7dd3fc'); // Светлый голубой (sky-300)
      bgGradient.addColorStop(0.4, '#0ea5e9'); // Средний голубой (sky-500)
      bgGradient.addColorStop(0.6, '#0284c7'); // Тёмный голубой (sky-600)
      bgGradient.addColorStop(0.8, '#0369a1'); // Очень тёмный голубой (sky-700)
      bgGradient.addColorStop(1, '#075985'); // Глубокий синий (sky-800)

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Добавляем голубые и бирюзовые туманности
      const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.3,
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.4
      );
      nebula1.addColorStop(0, 'rgba(34, 211, 238, 0.35)'); // Бирюзовый (cyan-400)
      nebula1.addColorStop(0.5, 'rgba(103, 232, 249, 0.25)'); // Светлый бирюзовый (cyan-300)
      nebula1.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      nebula2.addColorStop(0, 'rgba(59, 130, 246, 0.35)'); // Синий (blue-500)
      nebula2.addColorStop(0.5, 'rgba(147, 197, 253, 0.25)'); // Светлый синий (blue-300)
      nebula2.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Рисуем звёзды
      starsRef.current.forEach((star) => {
        // Мерцание звезды
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Рисуем звезду с эффектом свечения (более яркие на светлом фоне)
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
        glow.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.9})`);
        glow.addColorStop(0.3, `rgba(200, 230, 255, ${currentOpacity * 0.6})`);
        glow.addColorStop(0.6, `rgba(180, 200, 255, ${currentOpacity * 0.3})`);
        glow.addColorStop(1, 'rgba(180, 200, 255, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Яркое ядро звезды
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.95})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: '#0284c7' }}
    />
  );
}
