import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Генерация уникального публичного ID
async function generateUniquePublicId(): Promise<string> {
  let publicId: string;
  let isUnique = false;

  while (!isUnique) {
    // Формат: L + 6 цифр (например, L123456)
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    publicId = `L${randomNum}`;

    // Проверяем уникальность
    const existing = await prisma.user.findUnique({
      where: { publicId },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return publicId!;
}

export async function POST(request: NextRequest) {
  try {
    const { telegramId, username, firstName, lastName } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    let user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      include: {
        videos: true,
        referrals: true,
      },
    });

    // Если пользователь не существует, создаём его
    if (!user) {
      const publicId = await generateUniquePublicId();

      user = await prisma.user.create({
        data: {
          telegramId: String(telegramId),
          username: username || null,
          publicId,
          balance: 0,
        },
        include: {
          videos: true,
          referrals: true,
        },
      });
    }

    // Возвращаем данные пользователя
    return NextResponse.json({
      videosCount: user.videos.length,
      referralsCount: user.referrals.length,
      balance: user.balance,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        publicId: user.publicId,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
