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
  { name: 'Баланс', path: '/balance', icon: '💎' },
  { name: 'Заработать', path: '/referral', icon: '💰' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-nav mx-auto px-4 py-2 backdrop-blur-lg bg-black/30 border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200
                ${pathname === item.path 
                  ? 'text-white scale-110' 
                  : 'text-white/60 hover:text-white hover:scale-105'
                }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}