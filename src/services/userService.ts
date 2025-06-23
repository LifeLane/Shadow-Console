'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { User } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers(): Promise<User[]> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error('Error reading users file:', error);
        throw new Error('Could not read users data.');
    }
}

async function writeUsers(users: User[]) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing users file:', error);
        throw new Error('Could not write users data.');
    }
}


/**
 * Fetches all users from the local JSON file.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    return readUsers();
}

/**
 * Fetches a single user by ID.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
    const users = await readUsers();
    return users.find(u => u.id === id) || null;
}

/**
 * Updates a user's wallet information.
 * @param userId The ID of the user to update.
 * @param walletAddress The new wallet address.
 * @param walletChain The new wallet chain.
 */
export async function updateUserWallet(userId: string, walletAddress: string | null, walletChain: string | null) {
  const users = await readUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex > -1) {
    users[userIndex].wallet_address = walletAddress;
    users[userIndex].wallet_chain = walletChain;
    users[userIndex].updated_at = new Date().toISOString();
    await writeUsers(users);
  } else {
    throw new Error(`User with id ${userId} not found.`);
  }
}

/**
 * Fetches leaderboard data.
 * @returns A promise that resolves to an array of users sorted by XP.
 */
export async function getLeaderboardData(): Promise<User[]> {
    const users = await readUsers();
    return users
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
}
