
'use server';

import { revalidatePath } from 'next/cache';
import { getWalletStats, stakeShadow, unstakeShadow } from '@/services/walletService';
import type { WalletStats } from '@/lib/types';

export async function getWalletStatsAction(): Promise<WalletStats> {
    return getWalletStats('default_user');
}

export async function stakeShadowAction(amount: number): Promise<void> {
    await stakeShadow('default_user', amount);
    revalidatePath('/');
}

export async function unstakeShadowAction(amount: number): Promise<void> {
    await unstakeShadow('default_user', amount);
    revalidatePath('/');
}
