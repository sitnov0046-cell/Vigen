import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/referral/leaderboard?week=current
 * Получить лидерборд реферальной программы за неделю
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || 'current';

    // Получить начало текущей недели (понедельник 00:00)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    // Конец недели (воскресенье 23:59:59)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Получить статистику за текущую неделю
    const stats = await prisma.weeklyReferralStats.findMany({
      where: {
        weekStart: weekStart,
      },
      orderBy: {
        newReferrals: 'desc', // Сортировка по убыванию НОВЫХ рефералов
      },
    });

    // Получить реферера через связь User -> Referral с учётом равных позиций
    // Позиция определяется по уникальному значению newReferrals
    let currentPosition = 1;
    let previousNewReferrals: number | null = null;

    const leaderboard = await Promise.all(
      stats.map(async (stat, index) => {
        // Если количество новых рефералов отличается от предыдущего участника,
        // переходим на следующую позицию в лидерборде
        if (previousNewReferrals !== null && previousNewReferrals !== stat.newReferrals) {
          currentPosition++;
        }

        previousNewReferrals = stat.newReferrals;

        const position = currentPosition;

        // Получить пользователя-реферера
        const referrer = await prisma.user.findUnique({
          where: { id: stat.referrerId },
          select: {
            id: true,
            username: true,
            telegramId: true,
            publicId: true,
          },
        });

        // Посчитать количество рефералов
        const referralCount = await prisma.referral.count({
          where: { referrerId: stat.referrerId },
        });

        return {
          position,
          referrer: referrer
            ? {
                username: referrer.username || `User${referrer.telegramId}`,
                telegramId: referrer.telegramId,
                publicId: referrer.publicId || 'N/A',
              }
            : null,
          newReferrals: stat.newReferrals, // Количество новых рефералов за эту неделю
          totalSpending: stat.totalSpending, // Траты всех рефералов
          payoutPercent: stat.payoutPercent,
          payoutAmount: stat.payoutAmount,
          referralCount, // Всего рефералов (включая старых)
          isPaid: stat.isPaid,
        };
      })
    );

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      leaderboard,
      totalParticipants: leaderboard.length,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
