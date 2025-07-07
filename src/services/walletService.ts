
'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { User, WalletStats } from '@/lib/types';
import { getUser, updateUser } from './userService';

/**
 * Fetches wallet statistics for a user.
 */
export async function getWalletStats(userId: string): Promise<WalletStats> {
    const user = await getUser(userId);
    if (!user) {
        throw new Error("User not found to fetch wallet stats.");
    }

    // APR and Mining Power can be calculated based on game logic.
    // Here we'll use some placeholder logic.
    const apr = 5.5 + (user.xp / 1000); // APR increases with XP
    const miningPower = 10 + (user.stakedAmount / 100); // Mining power increases with staked amount

    return {
        userId,
        shadowBalance: user.shadowBalance,
        stakedAmount: user.stakedAmount,
        miningPower: parseFloat(miningPower.toFixed(2)),
        apr: parseFloat(apr.toFixed(2)),
    };
}

/**
 * Stakes SHADOW tokens for a user.
 */
export async function stakeShadow(userId: string, amount: number): Promise<void> {
    const user = await getUser(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    if (user.shadowBalance < amount) {
        throw new Error("Insufficient SHADOW balance to stake.");
    }

    user.shadowBalance -= amount;
    user.stakedAmount += amount;
    
    await updateUser(user);
}

/**
 * Unstakes SHADOW tokens for a user.
 */
export async function unstakeShadow(userId: string, amount: number): Promise<void> {
    const user = await getUser(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    if (user.stakedAmount < amount) {
        throw new Error("Insufficient staked amount to unstake.");
    }

    user.stakedAmount -= amount;
    user.shadowBalance += amount;

    await updateUser(user);
}
