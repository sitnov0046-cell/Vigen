import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/referral/stats?telegramId=123
 * Получить полную статистику реферальной программы для пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 1. Получить всех рефералов пользователя
    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Получить все транзакции типа referral_bonus для этого пользователя
    const allBonusTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'referral_bonus',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Рассчитать totalEarned (всего заработано)
    const totalEarned = allBonusTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    // 4. Рассчитать earnedToday (заработано сегодня)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayBonusTransactions = allBonusTransactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= today && txDate < tomorrow;
    });

    const earnedToday = todayBonusTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    // 5. Для каждого реферала рассчитать totalEarned и earnedToday
    const referralsWithStats = await Promise.all(
      referrals.map(async (ref) => {
        // Получить данные приглашенного пользователя
        const referredUser = await prisma.user.findUnique({
          where: { id: ref.referredId },
          select: {
            id: true,
            username: true,
            telegramId: true,
            createdAt: true,
          },
        });

        if (!referredUser) {
          return null;
        }

        // Получить все траты реферала
        const referredTransactions = await prisma.transaction.findMany({
          where: {
            userId: referredUser.id,
            OR: [
              { type: 'video_generation' },
              { type: 'deposit' },
            ],
          },
        });

        // Для упрощения: считаем что 10% от каждой траты - это бонус
        // (в реальности это будет зависеть от позиции в лидерборде)
        const totalSpent = referredTransactions.reduce(
          (sum, tx) => sum + Math.abs(tx.amount),
          0
        );

        const todaySpent = referredTransactions
          .filter((tx) => {
            const txDate = new Date(tx.createdAt);
            return txDate >= today && txDate < tomorrow;
          })
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        // Примерно 10% от трат (можно уточнить логику)
        const totalEarnedFromRef = Math.floor(totalSpent * 0.1);
        const earnedTodayFromRef = Math.floor(todaySpent * 0.1);

        return {
          id: ref.id,
          username: referredUser.username || `User${referredUser.telegramId}`,
          telegramId: referredUser.telegramId,
          totalEarned: totalEarnedFromRef,
          earnedToday: earnedTodayFromRef,
          joinedAt: ref.createdAt.toISOString(),
        };
      })
    );

    // Убрать null значения
    const validReferrals = referralsWithStats.filter((r) => r !== null);

    // 6. Получить историю бонусов (последние 20)
    const bonusHistory = allBonusTransactions.slice(0, 20).map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    }));

    // 7. Вернуть все данные
    return NextResponse.json({
      totalEarned,
      earnedToday,
      referrals: validReferrals,
      bonusHistory,
      referralCount: validReferrals.length,
    });
  } catch (error: any) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
