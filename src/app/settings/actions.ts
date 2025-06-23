
'use server';

import { revalidatePath } from 'next/cache';
import { getUser, updateUserWallet } from '@/services/userService';
import type { User } from '@/lib/types';

const DEFAULT_USER_ID = 'default_user';

export async function getUserData(): Promise<User | null> {
    return getUser(DEFAULT_USER_ID);
}

export async function updateWalletAction(walletAddress: string | null, walletChain: string | null) {
    try {
        await updateUserWallet(DEFAULT_USER_ID, walletAddress, walletChain);
        revalidatePath('/#settings');
        revalidatePath('/#airdrop');
    } catch (error) {
        console.error('Action Error: Failed to update wallet.', error);
        throw new Error('Failed to update wallet.');
    }
}
