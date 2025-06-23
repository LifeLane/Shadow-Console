
'use server';

import sql from '@/lib/db';
import type { Mission } from '@/lib/types';

/**
 * Fetches all available missions.
 */
export async function getMissions(): Promise<Mission[]> {
    try {
        const missions = await sql<Mission[]>`SELECT * FROM missions ORDER BY xp`;
        return missions;
    } catch (error) {
        console.error('Database Error: Failed to fetch missions.', error);
        if (error.message.includes('relation "missions" does not exist')) {
            return [];
        }
        throw error;
    }
}

/**
 * Fetches the IDs of completed missions for a user.
 */
export async function getCompletedMissionIds(userId: string): Promise<string[]> {
    try {
        const result = await sql<{ mission_id: string }[]>`
            SELECT mission_id FROM user_missions WHERE user_id = ${userId}
        `;
        return result.map(r => r.mission_id);
    } catch (error) {
        console.error(`Database Error: Failed to fetch completed missions for user ${userId}.`, error);
        if (error.message.includes('relation "user_missions" does not exist')) {
            return [];
        }
        throw error;
    }
}

/**
 * Marks a mission as complete for a user and updates their XP.
 */
export async function completeMissionForUser(userId: string, missionId: string): Promise<Mission> {
    const missions = await sql<Mission[]>`SELECT * FROM missions WHERE id = ${missionId}`;
    if (missions.length === 0) {
        throw new Error(`Mission with ID ${missionId} not found.`);
    }
    const mission = missions[0];

    await sql.begin(async (sql) => {
        // 1. Add to user_missions
        await sql`
            INSERT INTO user_missions (user_id, mission_id)
            VALUES (${userId}, ${missionId})
            ON CONFLICT (user_id, mission_id) DO NOTHING
        `;

        // 2. Update user's XP
        await sql`
            UPDATE users
            SET xp = xp + ${mission.xp}
            WHERE id = ${userId}
        `;
    });
    
    return mission;
}
