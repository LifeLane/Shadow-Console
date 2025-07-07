
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { User } from '@/lib/types';
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
    // Exclude the default_user from the bots on the leaderboard for display purposes
    return users.filter(u => u.id !== 'default_user').sort((a, b) => b.xp - a.xp).slice(0, 10);
}
