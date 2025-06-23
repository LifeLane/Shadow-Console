
'use server';

import { getLeaderboardData } from '@/services/userService';
import type { User } from '@/lib/types';

export async function getLeaderboardAction(): Promise<User[]> {
    try {
        return await getLeaderboardData();
    } catch (error) {
        console.error('Action Error: Failed to get leaderboard data.', error);
        return [];
    }
}
