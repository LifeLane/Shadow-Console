'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Signal, User } from '@/lib/types';
import path from 'path';

const SIGNALS_DB_PATH = path.resolve(process.cwd(), 'src/data/signals.json');
const USERS_DB_PATH = path.resolve(process.cwd(), 'src/data/users.json');

/**
 * Fetches signal history for a user from the local JSON file.
 */
export async function getSignalsForUser(userId: string, limitCount = 10): Promise<Signal[]> {
    try {
        const allSignals = await readDb<Signal[]>(SIGNALS_DB_PATH);
        return allSignals
            .filter(signal => signal.userId === userId)
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
            .slice(0, limitCount);
    } catch (error) {
        console.error(`Error fetching signals for user ${userId}:`, error);
        throw new Error(`Could not retrieve signals for user ${userId}.`);
    }
}

/**
 * Saves a new signal and updates user stats in the local JSON files.
 */
export async function saveSignal(signal: Omit<Signal, 'id' | 'createdAt'>): Promise<void> {
    const { userId, outcome, rewardBsai, rewardXp } = signal;

    try {
        // 1. Read existing data
        const allSignals = await readDb<Signal[]>(SIGNALS_DB_PATH);
        const allUsers = await readDb<User[]>(USERS_DB_PATH);
        
        // 2. Add the new signal
        const newSignal: Signal = {
            ...signal,
            id: allSignals.length > 0 ? Math.max(...allSignals.map(s => s.id!)) + 1 : 1,
            createdAt: new Date().toISOString()
        };
        allSignals.push(newSignal);

        // 3. Update user stats
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const user = allUsers[userIndex];
            user.signalsGenerated = (user.signalsGenerated || 0) + 1;
            if (outcome === 'TP_HIT') {
                user.signalsWon = (user.signalsWon || 0) + 1;
            }
            user.bsaiEarned = (user.bsaiEarned || 0) + rewardBsai;
            user.xp = (user.xp || 0) + rewardXp;
            user.updatedAt = new Date().toISOString();
            
            allUsers[userIndex] = user;
        } else {
             console.warn(`Could not find user ${userId} to update stats.`);
        }

        // 4. Write data back to files
        await Promise.all([
            writeDb(SIGNALS_DB_PATH, allSignals),
            writeDb(USERS_DB_PATH, allUsers)
        ]);

    } catch (error) {
        console.error('Error saving signal or updating user stats:', error);
        throw new Error('Could not save signal or update user data.');
    }
}
