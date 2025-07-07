
"use server";

import { revalidatePath } from 'next/cache';
import { getTrades, saveTrade, updateTrade } from '@/services/tradeService';
import { getUser, updateUser, updateUserBalance } from '@/services/userService';
import type { Trade } from '@/lib/types';
import { fetchLatestPrice } from '@/services/binanceService';

export async function getTradesAction(): Promise<Trade[]> {
    return getTrades('default_user');
}

export async function placeTradeAction(trade: Omit<Trade, 'id' | 'timestamp' | 'userId' | 'status' | 'pnl' | 'closePrice'>): Promise<Trade> {
    const user = await getUser('default_user');
    if (!user) {
        throw new Error("User not found.");
    }
    
    // This is a server-side check, but the primary gating is handled client-side to show the modal.
    const allTrades = await getTrades('default_user', 999);
    if (allTrades.length >= 3 && !user.hasRegisteredForAirdrop) {
        throw new Error("Trade limit reached. Please register for the airdrop to continue trading.");
    }

    if (user.shadowBalance < trade.stake) {
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


export interface PerformanceStats {
    invested: number;
    livePnl: number;
    totalTrades: number;
    winningTrades: number;
    totalPnl: number;
    bestTrade: number;
    worstTrade: number;
    rewards: number;
}

export async function getPerformanceStatsAction(): Promise<PerformanceStats> {
    const userId = 'default_user';
    const allTrades = await getTrades(userId, 999); // get all trades
    const openTrades = allTrades.filter(t => t.status === 'OPEN');
    const closedTrades = allTrades.filter(t => t.status === 'CLOSED');

    let livePnl = 0;
    // For live PNL, we calculate the potential outcome if closed now
    for (const trade of openTrades) {
        const priceData = await fetchLatestPrice(trade.asset);
        if (priceData) {
            const currentPrice = parseFloat(priceData.price);
            const entryPrice = trade.entryPrice;
            let potentialPnl = 0;
            // Simplified gamified PNL: +/- stake
            if (trade.side === 'LONG') {
                potentialPnl = currentPrice > entryPrice ? trade.stake : -trade.stake;
            } else { // SHORT
                potentialPnl = currentPrice < entryPrice ? trade.stake : -trade.stake;
            }
            livePnl += potentialPnl;
        }
    }

    const invested = closedTrades.reduce((sum, trade) => sum + trade.stake, 0);
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(t => t.pnl && t.pnl > 0).length;
    const totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const pnlValues = closedTrades.map(t => t.pnl || 0);
    const bestTrade = closedTrades.length > 0 ? Math.max(...pnlValues) : 0;
    const worstTrade = closedTrades.length > 0 ? Math.min(...pnlValues) : 0;

    return {
        invested,
        livePnl,
        totalTrades,
        winningTrades,
        totalPnl,
        bestTrade,
        worstTrade,
        rewards: 0, // Placeholder
    };
}


export async function closeAllPositionsAction(): Promise<{ message: string }> {
    const userId = 'default_user';
    const allTrades = await getTrades(userId, 999);
    const openTrades = allTrades.filter(t => t.status === 'OPEN');
    
    if (openTrades.length === 0) {
        return { message: "No open positions to close." };
    }

    const user = await getUser(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    
    let closedCount = 0;
    let totalPnlFromClosure = 0;
    
    for (const trade of openTrades) {
        const priceData = await fetchLatestPrice(trade.asset);
        if (priceData) {
            const currentPrice = parseFloat(priceData.price);
            let pnl = 0;
            const priceDiff = currentPrice - trade.entryPrice;

            if (trade.side === 'LONG') {
                pnl = priceDiff >= 0 ? trade.stake : -trade.stake;
            } else { // SHORT
                pnl = priceDiff <= 0 ? trade.stake : -trade.stake;
            }
            
            trade.status = 'CLOSED';
            trade.pnl = pnl;
            trade.closePrice = currentPrice;
            await updateTrade(trade);
            
            // Accrue PNL to true-up balance later
            totalPnlFromClosure += (trade.stake + pnl);
            closedCount++;
        }
    }

    if (closedCount > 0) {
        user.shadowBalance += totalPnlFromClosure;
        await updateUser(user);
        revalidatePath('/');
    }
    
    return { message: `Successfully closed ${closedCount} open positions.` };
}
