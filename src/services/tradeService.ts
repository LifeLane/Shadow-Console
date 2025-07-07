
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Trade } from '@/lib/types';
import path from 'path';

const TRADES_DB_PATH = path.resolve(process.cwd(), 'src/data/trades.json');

/**
 * Fetches trade history for a user.
 */
export async function getTrades(userId: string, limit = 20): Promise<Trade[]> {
    const allTrades = await readDb<Trade[]>(TRADES_DB_PATH);
    return allTrades
        .filter(trade => trade.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

/**
 * Saves a new trade.
 */
export async function saveTrade(trade: Omit<Trade, 'id' | 'timestamp'> & { userId: string }): Promise<Trade> {
    const allTrades = await readDb<Trade[]>(TRADES_DB_PATH);
    const newId = allTrades.length > 0 ? Math.max(...allTrades.map(t => t.id)) + 1 : 1;
    
    const newTrade: Trade = {
        ...trade,
        id: newId,
        timestamp: new Date().toISOString()
    };
    
    allTrades.unshift(newTrade);
    await writeDb(TRADES_DB_PATH, allTrades);
    
    return newTrade;
}
