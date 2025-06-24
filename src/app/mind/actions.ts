'use server';

import { revalidatePath } from 'next/cache';
import { getSignalsForUser, saveSignal } from '@/services/signalService';
import type { Signal } from '@/lib/types';

const DEFAULT_USER_ID = 'default_user';

export async function getSignalHistoryAction(): Promise<Signal[]> {
    return getSignalsForUser(DEFAULT_USER_ID, 5); // Fetch latest 5 signals
}

export async function saveSignalAction(signalData: Omit<Signal, 'id' | 'createdAt' | 'userId'>): Promise<void> {
    try {
        const fullSignalData = { ...signalData, userId: DEFAULT_USER_ID };
        await saveSignal(fullSignalData);
        revalidatePath('/');
    } catch (error) {
        console.error('Action Error: Failed to save signal.', error);
        throw new Error('Failed to save signal.');
    }
}
