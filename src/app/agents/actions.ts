
"use server";

import { revalidatePath } from 'next/cache';
import { getTrades, saveTrade, updateTrade } from '@/services/tradeService';
import { getUser, updateUser } from '@/services/userService';
import type { Trade } from '@/lib/types';
import { fetchLatestPrice } from '@/services/binanceService';

export async function getTradesAction(): Promise<Trade[]> {
    return getTrades('default_user');
}

export async function placeTradeAction(trade: Omit<Trade, 'id' | 'timestamp' | 'userId' | 'status' | 'pnl' | 'closePrice'>): Promise<Trade> {
    const user = await getUser('default_user');
    if (!user || user.shadowBalance < trade.stake) {
        throw new Error("Insufficient SHADOW balance.");
    }

    // Temporarily deduct stake from balance. It will be trued up when the trade closes.
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

export interface ResolvedTradeResult {
    message: string;
    result: 'WIN' | 'LOSS';
}

export async function resolveOpenTradesAction(): Promise<ResolvedTradeResult[]> {
    const userId = 'default_user';
    const user = await getUser(userId);
    if (!user) {
        console.error("resolveOpenTradesAction: User not found");
        return [];
    }
    
    const allTrades = await getTrades(userId);
    const openTrades = allTrades.filter(t => t.status === 'OPEN');

    if (openTrades.length === 0) {
        return [];
    }

    let userWasUpdated = false;
    const resolvedTradeMessages: ResolvedTradeResult[] = [];

    for (const trade of openTrades) {
        const priceData = await fetchLatestPrice(trade.asset);
        if (!priceData || !priceData.price) {
            console.error(`Could not fetch price for ${trade.asset}`);
            continue;
        }

        const currentPrice = parseFloat(priceData.price);
        let pnl = 0;
        let isResolved = false;

        if (trade.side === 'LONG') {
            if (currentPrice >= trade.takeProfit) {
                pnl = trade.stake; // Simplified PNL: win stake amount
                isResolved = true;
            } else if (currentPrice <= trade.stopLoss) {
                pnl = -trade.stake;
                isResolved = true;
            }
        } else { // SHORT
            if (currentPrice <= trade.takeProfit) {
                pnl = trade.stake;
                isResolved = true;
            } else if (currentPrice >= trade.stopLoss) {
                pnl = -trade.stake;
                isResolved = true;
            }
        }

        if (isResolved) {
            trade.status = 'CLOSED';
            trade.pnl = pnl;
            trade.closePrice = currentPrice;
            await updateTrade(trade);

            // True-up the balance: add back original stake + PNL
            user.shadowBalance += (trade.stake + pnl);
            user.xp += pnl > 0 ? 50 : 10; // 50 XP for a win, 10 for a loss
            userWasUpdated = true;
            
            const result = pnl > 0 ? 'WIN' : 'LOSS';
            resolvedTradeMessages.push({
                message: `Trade ${trade.asset} ${trade.side} closed. PNL: ${pnl > 0 ? '+' : ''}${pnl} SHADOW.`,
                result,
            });
        }
    }

    if (userWasUpdated) {
        // Recalculate win rate
        const allClosedTrades = (await getTrades(userId)).filter(t => t.status === 'CLOSED');
        const wonTrades = allClosedTrades.filter(t => t.pnl && t.pnl > 0).length;
        user.winRate = allClosedTrades.length > 0 ? Math.round((wonTrades / allClosedTrades.length) * 100) : 0;
        
        await updateUser(user);
        revalidatePath('/');
    }
    
    return resolvedTradeMessages;
}
