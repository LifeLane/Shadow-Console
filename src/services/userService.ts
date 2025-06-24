'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { User } from '@/lib/types';
import path from 'path';

const USERS_DB_PATH = path.resolve(process.cwd(), 'src/data/users.json');

/**
 * Fetches all users from the local JSON file.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    try {
        return await readDb<User[]>(USERS_DB_PATH);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Could not retrieve users data.');
    }
}

/**
 * Fetches a single user by ID from the local JSON file.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
    try {
        const users = await getUsers();
        return users.find(user => user.id === id) || null;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw new Error(`Could not retrieve user ${id}.`);
    }
}

/**
 * Updates a user's wallet information in the local JSON file.
 * @param userId The ID of the user to update.
 * @param walletAddress The new wallet address.
 * @param walletChain The new wallet chain.
 */
export async function updateUserWallet(userId: string, walletAddress: string | null, walletChain: string | null) {
    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex > -1) {
            users[userIndex].walletAddress = walletAddress;
            users[userIndex].walletChain = walletChain;
            users[userIndex].updatedAt = new Date().toISOString();
            await writeDb(USERS_DB_PATH, users);
        } else {
            throw new Error(`User with ID ${userId} not found.`);
        }
    } catch (error) {
        console.error(`Error updating wallet for user ${userId}:`, error);
        throw new Error(`Could not update wallet for user ${userId}.`);
    }
}

/**
 * Fetches leaderboard data from the local JSON file.
 * @returns A promise that resolves to an array of users sorted by XP.
 */
export async function getLeaderboardData(): Promise<User[]> {
    try {
        const users = await getUsers();
        return users.sort((a, b) => b.xp - a.xp).slice(0, 10);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        throw new Error('Could not retrieve leaderboard data.');
    }
}
