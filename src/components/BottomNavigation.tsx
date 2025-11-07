'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavigationItem = {
  name: string;
  path: string;
  icon: string;
};

const navigationItems: NavigationItem[] = [
  { name: 'Главная', path: '/', icon: '🏠' },
  { name: 'Мои видео', path: '/my-videos', icon: '🎬' },
  { name: 'Топ дня', path: '/popular', icon: '🔥' },
  { name: 'Баланс', path: '/balance', icon: '💎' },
  { name: 'Заработать', path: '/referral', icon: '💰' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-nav mx-auto px-4 py-3 backdrop-blur-lg bg-gray-900/90 border-t border-white/20 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all duration-300 ease-in-out
                ${pathname === item.path
                  ? 'text-white scale-110 bg-blue-500 shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}