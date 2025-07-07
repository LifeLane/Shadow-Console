
"use server";

import { revalidatePath } from 'next/cache';
import { getTrades, saveTrade } from '@/services/tradeService';
import { getUser, updateUserBalance } from '@/services/userService';
import type { Trade } from '@/lib/types';

export async function getTradesAction(): Promise<Trade[]> {
    return getTrades('default_user');
}

export async function placeTradeAction(trade: Omit<Trade, 'id' | 'timestamp' | 'userId' | 'status' | 'pnl'>): Promise<Trade> {
    const user = await getUser('default_user');
    if (!user || user.shadowBalance < trade.stake) {
        throw new Error("Insufficient SHADOW balance.");
    }

    await updateUserBalance('default_user', -trade.stake);

    const newTrade = await saveTrade({
        ...trade,
        status: 'OPEN',
        pnl: 0,
        userId: 'default_user'
    });

    revalidatePath('/');
    return newTrade;
}
