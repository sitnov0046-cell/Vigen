'use client';

import Link from 'next/link';
import { StarryBackground } from '@/components/StarryBackground';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen pt-16 pb-20">
      <StarryBackground />
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Кнопка назад */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl shadow-md transition-all text-gray-700 font-medium text-sm sm:text-base"
        >
          <span>←</span>
          <span>На главную</span>
        </Link>

        {/* Заголовок */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-4xl">📖</span>
            <span>Руководство по созданию видео</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">
            Добро пожаловать! Это руководство поможет вам освоить искусство создания качественных видео с помощью ИИ.
          </p>
        </div>

        {/* Основная информация */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Что нужно знать о нейросетях</span>
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
              <p className="text-gray-700 text-sm sm:text-base"><span className="font-bold">1.</span> ИИ способен создавать видео с естественной озвучкой и музыкальным сопровождением</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
              <p className="text-gray-700 text-sm sm:text-base"><span className="font-bold">2.</span> Нейросеть воспринимает ваш запрос буквально — чем точнее описание, тем лучше результат</p>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-pink-500">
              <p className="text-gray-700 text-sm sm:text-base"><span className="font-bold">3.</span> Можно загрузить изображение-референс для создания видео на его основе</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-orange-500">
              <p className="text-gray-700 text-sm sm:text-base"><span className="font-bold">4.</span> Длительность видео: до 8 секунд — идеально для динамичных сцен и экспериментов</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
              <p className="text-gray-700 text-sm sm:text-base"><span className="font-bold">5.</span> Система автоматически переводит запросы на оптимальный для нейросети язык</p>
            </div>
          </div>
        </section>

        {/* Важные правила */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>Важные ограничения</span>
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-red-200">
              <p className="text-red-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">❌ Недопустимый контент</p>
              <p className="text-gray-700 text-sm sm:text-base">Не используйте нецензурную лексику или контент 18+ в описаниях. Допускаются естественные диалоги, но без злоупотреблений.</p>
            </div>

            <div className="bg-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-orange-200">
              <p className="text-orange-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">👤 Известные личности</p>
              <p className="text-gray-700 text-sm sm:text-base">Избегайте изображений знаменитостей, политиков и публичных персон на референсах.</p>
            </div>

            <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-yellow-200">
              <p className="text-yellow-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">🎭 Результат генерации</p>
              <p className="text-gray-700 text-sm sm:text-base">ИИ-генерация всегда содержит элемент случайности. Мы не возвращаем токены за результат, который вас не устроил.</p>
            </div>
          </div>
        </section>

        {/* Как писать промпты */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span>✍️</span>
            <span>Искусство создания описаний</span>
          </h2>

          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-300">
            <p className="text-base sm:text-lg font-bold text-purple-900 text-center mb-1 sm:mb-2">
              Золотое правило:
            </p>
            <p className="text-center text-gray-800 text-base sm:text-xl font-semibold">
              Чем детальнее описание — тем качественнее результат
            </p>
          </div>

          <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
            Нейросеть не угадывает ваши мысли — она создаёт видео строго по описанию.
            Короткий промпт = случайный результат. Детальный промпт = предсказуемый и качественный результат.
          </p>

          <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">8 элементов идеального описания:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 mb-1 text-sm sm:text-base">1. Главный объект</p>
              <p className="text-xs sm:text-sm text-gray-600">Кто или что в центре кадра?</p>
            </div>

            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 mb-1 text-sm sm:text-base">2. Контекст</p>
              <p className="text-xs sm:text-sm text-gray-600">Где происходит действие?</p>
            </div>

            <div className="bg-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-pink-500">
              <p className="font-bold text-pink-900 mb-1 text-sm sm:text-base">3. Действие</p>
              <p className="text-xs sm:text-sm text-gray-600">Что делает персонаж?</p>
            </div>

            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
              <p className="font-bold text-green-900 mb-1 text-sm sm:text-base">4. Визуальный стиль</p>
              <p className="text-xs sm:text-sm text-gray-600">Какая эстетика видео?</p>
            </div>

            <div className="bg-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-orange-500">
              <p className="font-bold text-orange-900 mb-1 text-sm sm:text-base">5. Движение камеры</p>
              <p className="text-xs sm:text-sm text-gray-600">Как ведёт себя камера?</p>
            </div>

            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
              <p className="font-bold text-red-900 mb-1 text-sm sm:text-base">6. Композиция</p>
              <p className="text-xs sm:text-sm text-gray-600">Расположение объектов</p>
            </div>

            <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-yellow-500">
              <p className="font-bold text-yellow-900 mb-1 text-sm sm:text-base">7. Атмосфера</p>
              <p className="text-xs sm:text-sm text-gray-600">Освещение и настроение</p>
            </div>

            <div className="bg-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-cyan-500">
              <p className="font-bold text-cyan-900 mb-1 text-sm sm:text-base">8. Звуковое оформление</p>
              <p className="text-xs sm:text-sm text-gray-600">Музыка, голоса, звуки</p>
            </div>
          </div>
        </section>

        {/* Примеры */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span>🎬</span>
            <span>Пример хорошего описания</span>
          </h2>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-300 mb-3 sm:mb-4">
            <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
              <span className="font-bold text-purple-600">Сцена:</span> Пожилая женщина сидит на деревянной скамейке в летнем парке,
              в руках держит пакет семечек.
              <br />
              <span className="font-bold text-blue-600">Стиль:</span> Яркий солнечный день,
              винтажная эстетика 1980-х годов, тёплые цвета.
              <br />
              <span className="font-bold text-pink-600">Камера:</span> Плавно
              приближается к персонажу.
              <br />
              <span className="font-bold text-green-600">Звук:</span> Женщина произносит:
              &ldquo;Здравствуйте, дорогие! Сегодня научу вас создавать видео с помощью нейросетей.&rdquo;
            </p>
          </div>

          <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
            <p className="text-gray-700 text-sm sm:text-base">
              <span className="font-bold text-green-800">💡 Совет:</span> Не обязательно использовать все 8 элементов —
              применяйте только те, что важны для вашей сцены.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span>❓</span>
            <span>Частые вопросы</span>
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-l-4 border-purple-500">
              <p className="font-bold text-purple-900 mb-1 sm:mb-2 text-sm sm:text-base">Можно ли добавить фоновую музыку?</p>
              <p className="text-gray-700 text-sm sm:text-base">Да! Укажите в описании: &ldquo;Музыка: жанр, темп (BPM)&rdquo;. Если нужно приглушить музыку под диалогом, добавьте &ldquo;auto-duck&rdquo;.</p>
            </div>

            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-l-4 border-blue-500">
              <p className="font-bold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Что делать, если постоянно появляется ошибка?</p>
              <p className="text-gray-700 text-sm sm:text-base">Проверьте текст на запрещённые слова и убедитесь, что загруженное изображение соответствует правилам платформы.</p>
            </div>

            <div className="bg-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-l-4 border-pink-500">
              <p className="font-bold text-pink-900 mb-1 sm:mb-2 text-sm sm:text-base">Как получить похожий результат снова?</p>
              <p className="text-gray-700 text-sm sm:text-base">Сохраните своё описание и попробуйте сгенерировать заново. Каждая генерация уникальна, но детальный промпт даёт стабильные результаты.</p>
            </div>
          </div>
        </section>

        {/* Заключение */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">🎉 Готовы создать шедевр?</h2>
          <p className="text-sm sm:text-lg mb-4 sm:mb-6 opacity-90">
            Теперь вы знаете все секреты создания качественных видео. Экспериментируйте и творите!
          </p>
          <Link
            href="/?openForm=true"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-transform shadow-lg active:scale-95"
          >
            Начать создавать видео
          </Link>
        </div>
      </div>
    </div>
  );
}
