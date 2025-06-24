'use server';

import { query, getClient } from '@/lib/postgres';
import type { Mission, User } from '@/lib/types';

/**
 * Fetches all available missions from PostgreSQL.
 */
export async function getMissions(): Promise<Mission[]> {
    try {
        const missions = await query<Mission>(`SELECT id, title, description, xp, reward_type AS "reward.type", reward_name AS "reward.name" FROM missions`);
        return missions.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            xp: m.xp,
            reward: { type: m['reward.type'] as any, name: m['reward.name'] as string }
        }));
    } catch (error) {
        console.error('Error fetching missions:', error);
        throw new Error('Could not retrieve missions data.');
    }
}

/**
 * Fetches the IDs of completed missions for a user from PostgreSQL.
 */
export async function getCompletedMissionIds(userId: string): Promise<string[]> {
    try {
        const users = await query<User>(`SELECT completed_missions FROM users WHERE id = $1`, [userId]);
        if (users.length > 0 && users[0].completed_missions) {
            return users[0].completed_missions as string[];
        }
        return [];
    } catch (error) {
        console.error(`Error fetching completed missions for user ${userId}:`, error);
        throw new Error(`Could not retrieve completed missions for user ${userId}.`);
    }
}

/**
 * Marks a mission as complete for a user and updates their XP in PostgreSQL.
 */
export async function completeMissionForUser(userId: string, missionId: string): Promise<Mission> {
    const allMissions = await getMissions();
    const mission = allMissions.find(m => m.id === missionId);

    if (!mission) {
        throw new Error(`Mission with ID ${missionId} not found.`);
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        const userResult = await client.query<User>(`SELECT xp, completed_missions FROM users WHERE id = $1 FOR UPDATE`, [userId]);
        if (userResult.rows.length === 0) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        const user = userResult.rows[0];
        const completedMissions = user.completed_missions ? user.completed_missions : [];

        if (!Array.isArray(completedMissions)) {
            throw new Error("completed_missions is not an array.");
        }

        if (!completedMissions.includes(missionId)) {
            const updatedCompletedMissions = [...completedMissions, missionId];
            const updatedXp = (user.xp || 0) + mission.xp;
            
            await client.query(
                `UPDATE users SET completed_missions = $1, xp = $2, updated_at = $3 WHERE id = $4`,
                [JSON.stringify(updatedCompletedMissions), updatedXp, new Date().toISOString(), userId]
            );
            console.log(`Mission ${missionId} completed by user ${userId}. XP updated.`);
        } else {
            console.log(`Mission ${missionId} already completed by user ${userId}.`);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error completing mission ${missionId} for user ${userId}:`, error);
        throw new Error(`Could not complete mission ${missionId} for user ${userId}.`);
    } finally {
        client.release();
    }
    
    return mission;
}
