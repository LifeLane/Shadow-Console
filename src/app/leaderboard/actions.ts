
'use server';

import { getUser, getLeaderboardData } from '@/services/userService';
import type { User } from '@/lib/types';

export async function getProfileAction(): Promise<User | null> {
    // For now, always gets the default user's profile
    return getUser('default_user');
}

export async function getLeaderboardAction(): Promise<User[]> {
    return getLeaderboardData();
}
