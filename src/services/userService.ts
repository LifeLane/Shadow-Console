'use server';

import { query } from '@/lib/postgres';
import type { User } from '@/lib/types';

/**
 * Fetches all users from PostgreSQL.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    try {
        const users = await query<User>(`SELECT * FROM users`);
        return users.map(user => ({
            ...user,
            completed_missions: user.completed_missions ? JSON.parse(user.completed_missions as any) : [],
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Could not retrieve users data.');
    }
}

/**
 * Fetches a single user by ID from PostgreSQL.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
    try {
        const users = await query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
        if (users.length > 0) {
            const user = users[0];
            return {
                ...user,
                completed_missions: user.completed_missions ? JSON.parse(user.completed_missions as any) : [],
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw new Error(`Could not retrieve user ${id}.`);
    }
}

/**
 * Updates a user's wallet information in PostgreSQL.
 * @param userId The ID of the user to update.
 * @param walletAddress The new wallet address.
 * @param walletChain The new wallet chain.
 */
export async function updateUserWallet(userId: string, walletAddress: string | null, walletChain: string | null) {
    try {
        await query(
            `UPDATE users SET wallet_address = $1, wallet_chain = $2, updated_at = $3 WHERE id = $4`,
            [walletAddress, walletChain, new Date().toISOString(), userId]
        );
    } catch (error) {
        console.error(`Error updating wallet for user ${userId}:`, error);
        throw new Error(`Could not update wallet for user ${userId}.`);
    }
}

/**
 * Fetches leaderboard data from PostgreSQL.
 * @returns A promise that resolves to an array of users sorted by XP.
 */
export async function getLeaderboardData(): Promise<User[]> {
    try {
        const users = await query<User>(`SELECT * FROM users ORDER BY xp DESC LIMIT 10`);
        return users.map(user => ({
            ...user,
            completed_missions: user.completed_missions ? JSON.parse(user.completed_missions as any) : [],
        }));
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        throw new Error('Could not retrieve leaderboard data.');
    }
}

/**
 * Creates a new user in PostgreSQL.
 * @param user The user object to create.
 */
export async function createUser(user: User) {
    try {
        await query(
            `INSERT INTO users (id, name, xp, signals_generated, signals_won, bsai_earned, avatarUrl, wallet_address, wallet_chain, created_at, updated_at, completed_missions)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                user.id,
                user.name,
                user.xp,
                user.signals_generated,
                user.signals_won,
                user.bsai_earned,
                user.avatarUrl,
                user.wallet_address,
                user.wallet_chain,
                new Date().toISOString(),
                new Date().toISOString(),
                JSON.stringify(user.completed_missions || [])
            ]
        );
    } catch (error) {
        console.error(`Error creating user ${user.id}:`, error);
        throw new Error(`Could not create user ${user.id}.`);
    }
}

/**
 * Updates an existing user in PostgreSQL.
 * @param userId The ID of the user to update.
 * @param updates The partial user object with fields to update.
 */
export async function updateUser(userId: string, updates: Partial<User>) {
    try {
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === 'completed_missions') {
                    updateFields.push(`${key} = $${paramIndex}`);
                    updateValues.push(JSON.stringify(updates[key]));
                } else {
                    updateFields.push(`${key} = $${paramIndex}`);
                    updateValues.push((updates as any)[key]);
                }
                paramIndex++;
            }
        }

        updateFields.push(`updated_at = $${paramIndex}`);
        updateValues.push(new Date().toISOString());
        paramIndex++;

        await query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
            [...updateValues, userId]
        );
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw new Error(`Could not update user ${userId}.`);
    }
}
