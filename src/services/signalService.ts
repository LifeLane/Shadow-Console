
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Signal, User } from '@/lib/types';

const signalsFilePath = path.join(process.cwd(), 'src', 'data', 'signals.json');
const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readData<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return defaultValue;
        }
        console.error(`Error reading file ${filePath}:`, error);
        throw new Error(`Could not read data from ${filePath}.`);
    }
}

async function writeData<T>(filePath: string, data: T) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw new Error(`Could not write data to ${filePath}.`);
    }
}

/**
 * Fetches signal history for a user.
 */
export async function getSignalsForUser(userId: string, limit = 10): Promise<Signal[]> {
    const allSignals = await readData<Signal[]>(signalsFilePath, []);
    // Data is pre-sorted on write, just filter and slice
    return allSignals
        .filter(s => s.user_id === userId)
        .slice(0, limit);
}

/**
 * Saves a new signal and updates user stats.
 */
export async function saveSignal(signal: Omit<Signal, 'id' | 'created_at'>): Promise<void> {
    const { user_id, outcome, reward_bsai, reward_xp } = signal;

    // 1. Save the new signal
    const allSignals = await readData<Signal[]>(signalsFilePath, []);
    const newSignal: Signal = {
        ...signal,
        id: allSignals.length > 0 ? Math.max(...allSignals.map(s => s.id!)) + 1 : 1,
        created_at: new Date().toISOString(),
    };
    allSignals.push(newSignal);
    
    // Sort all signals by date before writing to ensure consistent order
    allSignals.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    await writeData(signalsFilePath, allSignals);

    // 2. Update user stats
    const users = await readData<User[]>(usersFilePath, []);
    const userIndex = users.findIndex(u => u.id === user_id);

    if (userIndex > -1) {
        const user = users[userIndex];
        user.signals_generated += 1;
        if (outcome === 'TP_HIT') {
            user.signals_won += 1;
        }
        user.bsai_earned = (Number(user.bsai_earned) + reward_bsai);
        user.xp += reward_xp;
        user.updated_at = new Date().toISOString();
        
        users[userIndex] = user;
        await writeData(usersFilePath, users);
    } else {
        console.warn(`Could not find user ${user_id} to update stats.`);
    }
}
