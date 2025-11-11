import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Генерация уникального публичного ID
function generatePublicId(): string {
  // Формат: L + 6 цифр (например, L123456)
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `L${randomNum}`;
}

async function main() {
  console.log('Начинаем генерацию publicId для пользователей без него...');

  // Получаем всех пользователей без publicId
  const usersWithoutPublicId = await prisma.user.findMany({
    where: {
      publicId: null,
    },
  });

  console.log(`Найдено пользователей без publicId: ${usersWithoutPublicId.length}`);

  for (const user of usersWithoutPublicId) {
    let publicId: string;
    let isUnique = false;

    // Генерируем уникальный ID
    while (!isUnique) {
      publicId = generatePublicId();

      // Проверяем уникальность
      const existing = await prisma.user.findUnique({
        where: { publicId },
      });

      if (!existing) {
        isUnique = true;
        // Обновляем пользователя
        await prisma.user.update({
          where: { id: user.id },
          data: { publicId },
        });

        console.log(`Пользователь ID ${user.id} (${user.username || user.telegramId}): установлен publicId = ${publicId}`);
      }
    }
  }

  console.log('Генерация publicId завершена!');
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
