
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Signal, User } from '@/lib/types';
import path from 'path';

const SIGNALS_DB_PATH = path.resolve(process.cwd(), 'src/data/signals.json');

/**
 * Fetches signal history for a user.
 */
export async function getSignals(userId: string, limit = 10): Promise<Signal[]> {
    const allSignals = await readDb<Signal[]>(SIGNALS_DB_PATH);
    return allSignals
        .filter(signal => signal.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

/**
 * Saves a new signal.
 */
export async function saveSignal(signal: Omit<Signal, 'id' | 'timestamp'> & { userId: string }): Promise<Signal> {
    const allSignals = await readDb<Signal[]>(SIGNALS_DB_PATH);
    const newId = allSignals.length > 0 ? Math.max(...allSignals.map(s => s.id)) + 1 : 1;
    
    const newSignal: Signal = {
        ...signal,
        id: newId,
        timestamp: new Date().toISOString()
    };
    
    allSignals.unshift(newSignal); // Add to the beginning
    await writeDb(SIGNALS_DB_PATH, allSignals);
    
    return newSignal;
}
