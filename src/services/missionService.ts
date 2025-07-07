
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Mission, User } from '@/lib/types';
import path from 'path';
import { getUser, updateUser } from './userService';

const MISSIONS_DB_PATH = path.resolve(process.cwd(), 'src/data/missions.json');
const USER_MISSIONS_DB_PATH = path.resolve(process.cwd(), 'src/data/user_missions.json');

/**
 * Fetches all available missions.
 */
export async function getMissions(): Promise<Mission[]> {
    return readDb<Mission[]>(MISSIONS_DB_PATH);
}

/**
 * Fetches the IDs of completed missions for a user.
 */
export async function getCompletedMissionIds(userId: string): Promise<string[]> {
    const userMissions = await readDb<Record<string, string[]>>(USER_MISSIONS_DB_PATH);
    return userMissions[userId] || [];
}

/**
 * Marks a mission as complete for a user and updates their stats.
 */
export async function completeMissionForUser(userId: string, missionId: string): Promise<Mission> {
    const allMissions = await getMissions();
    const mission = allMissions.find(m => m.id === missionId);

    if (!mission) {
        throw new Error(`Mission with ID ${missionId} not found.`);
    }

    const user = await getUser(userId);
    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    const userMissions = await readDb<Record<string, string[]>>(USER_MISSIONS_DB_PATH);
    if (!userMissions[userId]) {
        userMissions[userId] = [];
    }

    if (userMissions[userId].includes(missionId)) {
        console.log(`Mission ${missionId} already completed by user ${userId}.`);
        return mission; // Return mission data even if already completed
    }
    
    // Mark as complete
    userMissions[userId].push(missionId);
    await writeDb(USER_MISSIONS_DB_PATH, userMissions);

    // Update user rewards
    user.xp += mission.xp;
    if (mission.reward.type === 'SHADOW') {
        user.shadowBalance += mission.reward.amount;
    }
    await updateUser(user);
    
    return mission;
}
