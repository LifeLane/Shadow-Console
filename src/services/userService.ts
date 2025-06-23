'use server';

import { cache } from 'react';
import sql from '@/lib/db';
import type { User } from '@/lib/types';

/**
 * Fetches all users from the database.
 * This function is cached to optimize data fetching.
 * @returns A promise that resolves to an array of users.
 */
export const getUsers = cache(async (): Promise<User[]> => {
    try {
        return await sql<User[]>`SELECT * FROM users`;
    } catch(e) {
        console.error('Failed to fetch users', e);
        if (e.message.includes('relation "users" does not exist')) {
            return [];
        }
        throw e;
    }
});

/**
 * Fetches a single user by ID.
 * This function is cached to optimize data fetching.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export const getUser = cache(async (id: string): Promise<User | null> => {
    try {
        const users = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
        return users[0] || null;
    } catch(e) {
        console.error(`Failed to fetch user ${id}`, e);
        if (e.message.includes('relation "users" does not exist')) {
            return null;
        }
        throw e;
    }
});

/**
 * Updates a user's wallet information.
 * @param userId The ID of the user to update.
 * @param walletAddress The new wallet address.
 * @param walletChain The new wallet chain.
 */
export async function updateUserWallet(userId: string, walletAddress: string | null, walletChain: string | null) {
  try {
    await sql`
      UPDATE users
      SET wallet_address = ${walletAddress}, wallet_chain = ${walletChain}, updated_at = NOW()
      WHERE id = ${userId};
    `;
  } catch (error) {
    console.error(`Database Error: Failed to update wallet for user ${userId}.`, error);
    throw new Error('Failed to update wallet information.');
  }
}

/**
 * Fetches leaderboard data.
 * This function is cached to optimize data fetching.
 * @returns A promise that resolves to an array of users sorted by XP.
 */
export const getLeaderboardData = cache(async (): Promise<User[]> => {
  try {
    return await sql<User[]>`
        SELECT 
            id,
            name,
            avatarUrl,
            xp,
            bsai_earned,
            signals_generated
        FROM users
        ORDER BY xp DESC
        LIMIT 10;
    `;
  } catch (e) {
    console.error('Failed to fetch leaderboard data', e);
    if (e.message.includes('relation "users" does not exist')) {
        return [];
    }
    throw e;
  }
});
