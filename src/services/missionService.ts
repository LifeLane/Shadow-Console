'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Mission, User } from '@/lib/types';
import path from 'path';

const MISSIONS_DB_PATH = path.resolve(process.cwd(), 'src/data/missions.json');
const USERS_DB_PATH = path.resolve(process.cwd(), 'src/data/users.json');

/**
 * Fetches all available missions from the local JSON file.
 */
export async function getMissions(): Promise<Mission[]> {
    try {
        return await readDb<Mission[]>(MISSIONS_DB_PATH);
    } catch (error) {
        console.error('Error fetching missions:', error);
        throw new Error('Could not retrieve missions data.');
    }
}

/**
 * Fetches the IDs of completed missions for a user from the local JSON file.
 */
export async function getCompletedMissionIds(userId: string): Promise<string[]> {
    try {
        const users = await readDb<User[]>(USERS_DB_PATH);
        const user = users.find(u => u.id === userId);
        return user?.completedMissions || [];
    } catch (error) {
        console.error(`Error fetching completed missions for user ${userId}:`, error);
        throw new Error(`Could not retrieve completed missions for user ${userId}.`);
    }
}

/**
 * Marks a mission as complete for a user and updates their XP in the local JSON file.
 */
export async function completeMissionForUser(userId: string, missionId: string): Promise<Mission> {
    const allMissions = await getMissions();
    const mission = allMissions.find(m => m.id === missionId);

    if (!mission) {
        throw new Error(`Mission with ID ${missionId} not found.`);
    }

    try {
        const users = await readDb<User[]>(USERS_DB_PATH);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error(`User with ID ${userId} not found.`);
        }
        
        const user = users[userIndex];
        
        if (!user.completedMissions.includes(missionId)) {
            user.completedMissions.push(missionId);
            user.xp = (user.xp || 0) + mission.xp;
            user.updatedAt = new Date().toISOString();
            
            users[userIndex] = user;
            await writeDb(USERS_DB_PATH, users);
            console.log(`Mission ${missionId} completed by user ${userId}. XP updated.`);
        } else {
             console.log(`Mission ${missionId} already completed by user ${userId}.`);
        }

        return mission;

    } catch (error) {
        console.error(`Error completing mission ${missionId} for user ${userId}:`, error);
        throw new Error(`Could not complete mission ${missionId} for user ${userId}.`);
    }
}
