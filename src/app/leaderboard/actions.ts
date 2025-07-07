
'use server';

import { getUser, getLeaderboardData } from '@/services/userService';
import type { User } from '@/lib/types';

export async function getProfileAction(): Promise<User | null> {
    return getUser('default_user');
}

export async function getLeaderboardAction(): Promise<User[]> {
    return getLeaderboardData();
}
