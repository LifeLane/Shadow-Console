
'use server';

import { revalidatePath } from 'next/cache';
import { getMissions, getCompletedMissionIds, completeMissionForUser } from '@/services/missionService';
import type { Mission } from '@/lib/types';

const DEFAULT_USER_ID = 'default_user';

export interface MissionData {
    mission: Mission;
    isCompleted: boolean;
}

export async function getMissionsData(): Promise<MissionData[]> {
    const allMissions = await getMissions();
    const completedIds = await getCompletedMissionIds(DEFAULT_USER_ID);
    const completedIdSet = new Set(completedIds);
    
    return allMissions.map(mission => ({
        mission,
        isCompleted: completedIdSet.has(mission.id),
    }));
}

export async function completeMissionAction(missionId: string): Promise<Mission> {
    try {
        const completedMission = await completeMissionForUser(DEFAULT_USER_ID, missionId);
        revalidatePath('/#missions');
        revalidatePath('/#airdrop');
        revalidatePath('/#agents'); // For XP
        return completedMission;
    } catch (error) {
        console.error('Action Error: Failed to complete mission.', error);
        throw new Error('Failed to complete mission.');
    }
}
