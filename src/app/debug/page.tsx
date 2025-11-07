'use client';

import { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function DebugPage() {
  const { webApp } = useTelegramWebApp();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const checkTelegram = () => {
      const newLogs: string[] = [];

      newLogs.push('=== ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ===\n');

      // Проверка window.Telegram
      newLogs.push(`✓ window.Telegram существует: ${!!window.Telegram}`);
      newLogs.push(`✓ window.Telegram.WebApp существует: ${!!window.Telegram?.WebApp}\n`);

    if (window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp as any;

      newLogs.push('=== ДАННЫЕ TELEGRAM WEBAPP ===');
      newLogs.push(`✓ initData: ${app.initData || '(пусто)'}`);
      newLogs.push(`✓ platform: ${app.platform || 'unknown'}`);
      newLogs.push(`✓ version: ${app.version || 'unknown'}\n`);

      newLogs.push('=== ПОЛЬЗОВАТЕЛЬ ===');
      if (app.initDataUnsafe?.user) {
        const user = app.initDataUnsafe.user;
        newLogs.push(`✓ ID: ${user.id}`);
        newLogs.push(`✓ Username: ${user.username || '(нет)'}`);
        newLogs.push(`✓ First Name: ${user.first_name || '(нет)'}`);
        newLogs.push(`✓ Last Name: ${user.last_name || '(нет)'}`);
        newLogs.push(`✓ Language: ${user.language_code || '(нет)'}`);
      } else {
        newLogs.push('❌ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ НЕ НАЙДЕНЫ!');
        newLogs.push('❌ Приложение открыто вне Telegram или бот не настроен');
      }

      newLogs.push('\n=== ПОЛНЫЙ ОБЪЕКТ initDataUnsafe ===');
      newLogs.push(JSON.stringify(app.initDataUnsafe, null, 2));
    } else {
      newLogs.push('❌ TELEGRAM WEBAPP НЕ НАЙДЕН!');
      newLogs.push('❌ Приложение открыто в обычном браузере, а не через Telegram');
    }

      setLogs(newLogs);
    };

    // Проверяем сразу
    if (window.Telegram?.WebApp) {
      checkTelegram();
    } else {
      // Ждём загрузки скрипта
      const interval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(interval);
          checkTelegram();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        checkTelegram(); // Проверяем в любом случае через 5 секунд
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [webApp]);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono text-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">
          🔍 Отладочная информация Telegram WebApp
        </h1>

        <div className="bg-black rounded-lg p-6 shadow-xl border border-green-500">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 ${
                log.includes('❌') ? 'text-red-400 font-bold' :
                log.includes('===') ? 'text-yellow-400 font-bold mt-4' :
                log.includes('✓') ? 'text-green-400' :
                'text-gray-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-900/30 rounded-lg p-4 border border-blue-500">
          <h2 className="text-white font-bold mb-2">📝 Инструкция:</h2>
          <p className="text-blue-200">
            Откройте эту страницу через бота (по кнопке &ldquo;Запустить&rdquo;) и сделайте скриншот этого экрана.
            Это покажет, передаются ли данные от Telegram в приложение.
          </p>
        </div>
      </div>
    </div>
  );
}
