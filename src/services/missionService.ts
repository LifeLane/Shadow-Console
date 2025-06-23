'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Mission } from '@/lib/types';

const missionsFilePath = path.join(process.cwd(), 'src', 'data', 'missions.json');
const userMissionsFilePath = path.join(process.cwd(), 'src', 'data', 'user_missions.json');
const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readData<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return defaultValue;
        }
        console.error(`Error reading file ${filePath}:`, error);
        throw new Error(`Could not read data from ${filePath}.`);
    }
}

async function writeData<T>(filePath: string, data: T) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw new Error(`Could not write data to ${filePath}.`);
    }
}

/**
 * Fetches all available missions.
 */
export async function getMissions(): Promise<Mission[]> {
    return readData<Mission[]>(missionsFilePath, []);
}

/**
 * Fetches the IDs of completed missions for a user.
 */
export async function getCompletedMissionIds(userId: string): Promise<string[]> {
    const userMissions = await readData<Record<string, string[]>>(userMissionsFilePath, {});
    return userMissions[userId] || [];
}

/**
 * Marks a mission as complete for a user and updates their XP.
 */
export async function completeMissionForUser(userId: string, missionId: string): Promise<Mission> {
    const allMissions = await getMissions();
    const mission = allMissions.find(m => m.id === missionId);

    if (!mission) {
        throw new Error(`Mission with ID ${missionId} not found.`);
    }

    // Update user missions
    const userMissions = await readData<Record<string, string[]>>(userMissionsFilePath, {});
    if (!userMissions[userId]) {
        userMissions[userId] = [];
    }
    if (!userMissions[userId].includes(missionId)) {
        userMissions[userId].push(missionId);
        await writeData(userMissionsFilePath, userMissions);

        // Update user's XP
        const users = await readData<any[]>(usersFilePath, []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex].xp += mission.xp;
            await writeData(usersFilePath, users);
        }
    }
    
    return mission;
}
