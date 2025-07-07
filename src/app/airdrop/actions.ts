
'use server';

import { revalidatePath } from 'next/cache';
import { getMissions, getCompletedMissionIds, completeMissionForUser } from '@/services/missionService';
import type { Mission, AirdropRegistration } from '@/lib/types';
import { readDb, writeDb } from '@/lib/file-system-db';
import { getUser, updateUser } from '@/services/userService';
import path from 'path';

const AIRDROP_REGISTRATIONS_DB_PATH = path.resolve(process.cwd(), 'src/data/airdrop_registrations.json');

export interface MissionData {
    mission: Mission;
    isCompleted: boolean;
}

export async function getMissionsDataAction(): Promise<MissionData[]> {
    const allMissions = await getMissions();
    const completedIds = await getCompletedMissionIds('default_user');
    const completedIdSet = new Set(completedIds);
    
    return allMissions.map(mission => ({
        mission,
        isCompleted: completedIdSet.has(mission.id),
    }));
}

export async function completeMissionAction(missionId: string): Promise<Mission> {
    const completedMission = await completeMissionForUser('default_user', missionId);
    revalidatePath('/'); // Revalidate all paths to update user XP/rewards everywhere
    return completedMission;
}

export async function registerForAirdropAction(
    registrationData: Omit<AirdropRegistration, 'userId' | 'timestamp'>
): Promise<void> {
    const userId = 'default_user';
    const user = await getUser(userId);

    if (!user) {
        throw new Error("User not found.");
    }
    if (user.hasRegisteredForAirdrop) {
        console.log("User has already registered for airdrop.");
        return;
    }

    const allRegistrations = await readDb<AirdropRegistration[]>(AIRDROP_REGISTRATIONS_DB_PATH);
    const newRegistration: AirdropRegistration = {
        ...registrationData,
        userId,
        timestamp: new Date().toISOString(),
    };
    allRegistrations.push(newRegistration);
    await writeDb(AIRDROP_REGISTRATIONS_DB_PATH, allRegistrations);

    // Update user profile
    user.hasRegisteredForAirdrop = true;
    user.nameEditable = true; // Allow user to change their name once
    user.shadowBalance += 250; // A small bonus for signing up
    await updateUser(user);

    revalidatePath('/');
}
