
'use server';

import { revalidatePath } from 'next/cache';
import { getMissions, getCompletedMissionIds, completeMissionForUser } from '@/services/missionService';
import type { Mission } from '@/lib/types';

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
    revalidatePath('/'); 
    return completedMission;
}
