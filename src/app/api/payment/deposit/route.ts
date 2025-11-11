import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TOKEN_PACKAGES } from '@/config/video-tariffs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/deposit
 * Начислить токены после успешной оплаты
 *
 * ВАЖНО: Этот endpoint должен вызываться только ПОСЛЕ подтверждения оплаты
 * от платёжной системы (webhook от ЮКассы/ЮMoney)
 */
export async function POST(request: NextRequest) {
  try {
    const { telegramId, packageId, paymentId, amount } = await request.json();

    if (!telegramId || !packageId || !amount) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      );
    }

    // Найти пакет
    const tokenPackage = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!tokenPackage) {
      return NextResponse.json(
        { error: 'Пакет не найден' },
        { status: 400 }
      );
    }

    // Проверить сумму платежа
    if (amount !== tokenPackage.price) {
      return NextResponse.json(
        { error: 'Сумма платежа не совпадает с ценой пакета' },
        { status: 400 }
      );
    }

    // Получить пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      include: {
        referrals: {
          take: 1, // Нам нужен только реферер (если есть)
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверить, первое ли это пополнение
    const isFirstDeposit = !user.firstDepositMade;
    const bonusTokens = isFirstDeposit ? tokenPackage.tokens : 0; // х2 бонус при первом пополнении
    const tokensToAdd = tokenPackage.tokens + bonusTokens;

    // Начислить токены пользователю
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: tokensToAdd },
        firstDepositMade: true, // Пометить, что первое пополнение сделано
      },
    });

    // Создать транзакцию пополнения
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: tokensToAdd,
        type: 'deposit',
        description: isFirstDeposit
          ? `Пополнение ${tokenPackage.name} (${tokenPackage.tokens} + ${bonusTokens} бонус х2)`
          : `Пополнение ${tokenPackage.name} (${tokenPackage.tokens} токенов)`,
      },
    });

    // Обновить недельную статистику реферера для лидерборда
    if (user.referrals.length > 0) {
      const referral = user.referrals[0];

      // Получить начало текущей недели (понедельник 00:00)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Если воскресенье, вернуться на 6 дней назад
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);

      // Конец недели (воскресенье 23:59:59)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Найти или создать запись статистики за текущую неделю
      const stats = await prisma.weeklyReferralStats.upsert({
        where: {
          referrerId_weekStart: {
            referrerId: referral.referrerId,
            weekStart: weekStart,
          },
        },
        create: {
          referrerId: referral.referrerId,
          weekStart: weekStart,
          weekEnd: weekEnd,
          totalSpending: amount,
        },
        update: {
          totalSpending: { increment: amount },
        },
      });
    }

    return NextResponse.json({
      success: true,
      tokens: tokensToAdd,
      baseTokens: tokenPackage.tokens,
      bonusTokens: bonusTokens,
      isFirstDeposit: isFirstDeposit,
      newBalance: updatedUser.balance,
      message: isFirstDeposit
        ? `Начислено ${tokensToAdd} токенов с бонусом х2!`
        : `Начислено ${tokensToAdd} токенов`,
    });
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/deposit?telegramId=123
 * Получить информацию о доступных пакетах и статусе бонуса х2
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

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Подготовить пакеты с учётом бонуса х2
    const packagesWithBonusInfo = TOKEN_PACKAGES.map(pkg => ({
      ...pkg,
      tokensYouGet: user.firstDepositMade ? pkg.tokens : pkg.tokensWithBonus,
      hasBonus: !user.firstDepositMade,
    }));

    return NextResponse.json({
      packages: packagesWithBonusInfo,
      isFirstDeposit: !user.firstDepositMade,
      currentBalance: user.balance,
    });
  } catch (error: any) {
    console.error('Error fetching deposit info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
