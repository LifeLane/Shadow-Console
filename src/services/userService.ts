'use server';

import sql from '@/lib/db';
import type { User } from '@/lib/types';

/**
 * Fetches all users from the database.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    try {
        return await sql<User[]>`SELECT * FROM users`;
    } catch(e) {
        console.error('Failed to fetch users', e);
        if (e.message.includes('relation "users" does not exist')) {
            return [];
        }
        throw e;
    }
}

/**
 * Fetches a single user by ID.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
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
}
