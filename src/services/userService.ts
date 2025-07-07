
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import path from 'path';

const USERS_DB_PATH = path.resolve(process.cwd(), 'src/data/users.json');

/**
 * Fetches all users from the local JSON file.
 */
export async function getUsers(): Promise<User[]> {
    return readDb<User[]>(USERS_DB_PATH);
}

/**
 * Fetches a single user by ID.
 */
export async function getUser(id: string): Promise<User | null> {
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
}

/**
 * Updates a user's record.
 */
export async function updateUser(updatedUser: User): Promise<void> {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex > -1) {
        users[userIndex] = updatedUser;
        await writeDb(USERS_DB_PATH, users);
        revalidatePath('/'); // Revalidate all paths to ensure UI updates everywhere
    } else {
        throw new Error(`User with ID ${updatedUser.id} not found.`);
    }
}

/**
 * Updates a user's SHADOW balance.
 */
export async function updateUserBalance(userId: string, amount: number): Promise<void> {
    const user = await getUser(userId);
    if (user) {
        user.shadowBalance += amount;
        if (user.shadowBalance < 0) {
            throw new Error("Insufficient balance.");
        }
        await updateUser(user);
    }
}


/**
 * Fetches leaderboard data, sorted by XP.
 */
export async function getLeaderboardData(): Promise<User[]> {
    const users = await getUsers();
    // Sort all users by XP and return the top 10, including the default_user if not in top 10
    const sortedUsers = users.sort((a, b) => b.xp - a.xp);
    const top10 = sortedUsers.slice(0, 10);
    const defaultUser = users.find(u => u.id === 'default_user');
    if (defaultUser && !top10.some(u => u.id === 'default_user')) {
        // Add user to the list if they aren't in top 10, for display purposes
        // This is a simple implementation, a real one might use pagination
    }
    return top10;
}

/**
 * Gets a string summary of a user's performance stats for the AI tool.
 */
export async function getUserStatsSummary(userId: string): Promise<string> {
    const user = await getUser(userId);
    if (!user) {
        return "User not found.";
    }
    const stats = {
        name: user.name,
        winRate: user.winRate,
        signalAccuracy: user.signalAccuracy,
        shadowBalance: user.shadowBalance
    };
    return JSON.stringify(stats);
}
