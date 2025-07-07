
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
    // New dynamic APR calculation: up to 400% based on XP.
    // Base APR: 5.5%. Max APR: 400%. XP for Max: 10000.
    const baseApr = 5.5;
    const maxApr = 400;
    const xpForMaxApr = 10000;
    const xpContribution = (user.xp / xpForMaxApr) * (maxApr - baseApr);
    const apr = baseApr + xpContribution;
    
    // Mining power is a placeholder for the upcoming rig feature
    const miningPower = 10 + (user.stakedAmount / 100);

    return {
        userId,
        shadowBalance: user.shadowBalance,
        stakedAmount: user.stakedAmount,
        miningPower: parseFloat(miningPower.toFixed(2)),
        apr: parseFloat(Math.min(apr, maxApr).toFixed(2)), // Cap APR at max
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
