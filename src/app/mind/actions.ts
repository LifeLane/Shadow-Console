
'use server';

import { revalidatePath } from 'next/cache';
import { getSignals, saveSignal } from '@/services/signalService';
import type { Signal } from '@/lib/types';
import { generateSignal } from '@/ai/flows/generate-market-insights';
import { fetchLatestPrice } from '@/services/binanceService';


export async function getSignalHistoryAction(): Promise<Signal[]> {
    return getSignals('default_user', 10);
}

export async function saveSignalAction(signal: Omit<Signal, 'id' | 'timestamp' | 'userId'>): Promise<void> {
    await saveSignal({ ...signal, userId: 'default_user' });
    revalidatePath('/');
}


export async function generateAiSignalAction(market: string): Promise<Signal> {
    const priceData = await fetchLatestPrice(market);
    const marketDataSummary = `Current price for ${market} is ${priceData?.price}.`;

    const aiResult = await generateSignal({ market, marketData: marketDataSummary });

    const newSignal: Omit<Signal, 'id' | 'userId' | 'timestamp'> = {
        asset: market,
        prediction: aiResult.prediction as 'LONG' | 'SHORT' | 'HOLD',
        confidence: aiResult.confidence,
        entryPrice: aiResult.entry,
        takeProfit: aiResult.takeProfit,
        stopLoss: aiResult.stopLoss,
        status: 'PENDING',
        source: 'AI_ORACLE',
    };
    
    const savedSignal = await saveSignal({ ...newSignal, userId: 'default_user' });
    revalidatePath('/');

    return savedSignal;
}
