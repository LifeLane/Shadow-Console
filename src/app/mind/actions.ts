
'use server';

import { revalidatePath } from 'next/cache';
import { getSignals, saveSignal, updateSignal } from '@/services/signalService';
import type { Signal } from '@/lib/types';
import { generateSignal } from '@/ai/flows/generate-market-insights';
import { fetchLatestPrice, fetchPriceData } from '@/services/binanceService';
import { getUser, updateUser } from '@/services/userService';
import { fetchSentimentNews } from '@/services/coindeskService';
import { fetchRecentTransactions } from '@/services/polygonService';


export async function getSignalHistoryAction(): Promise<Signal[]> {
    return getSignals('default_user', 10);
}

export async function saveSignalAction(signal: Omit<Signal, 'id' | 'timestamp' | 'userId'>): Promise<void> {
    await saveSignal({ ...signal, userId: 'default_user' });
    revalidatePath('/');
}

export async function generateAiSignalAction(
    market: string, 
    tradingMode: string,
    risk: string,
    indicators: string,
    signalType: 'instant' | 'shadow'
): Promise<Signal> {
    const [priceData, klineData, sentimentNews, onChainData] = await Promise.all([
        fetchLatestPrice(market),
        fetchPriceData(market, '1h', 20),
        fetchSentimentNews(market),
        fetchRecentTransactions(market)
    ]);

    const marketDataSummary = `
        Current Price: ${priceData?.price ? `$${priceData.price}` : 'N/A'}.
        Recent Price Action (K-lines): ${klineData}.
        Market Sentiment/News: ${sentimentNews}.
        On-Chain Activity: ${onChainData}.
    `;

    const aiResult = await generateSignal({ market, marketData: marketDataSummary, tradingMode, risk, indicators, signalType });

    const newSignal: Omit<Signal, 'id' | 'userId' | 'timestamp'> = {
        asset: market,
        prediction: aiResult.prediction as 'LONG' | 'SHORT' | 'HOLD',
        confidence: aiResult.confidence,
        entryPrice: aiResult.entry,
        takeProfit: aiResult.takeProfit,
        stopLoss: aiResult.stopLoss,
        status: 'PENDING',
        source: 'AI_ORACLE',
        reasoning: aiResult.thought,
    };
    
    const savedSignal = await saveSignal({ ...newSignal, userId: 'default_user' });
    revalidatePath('/');

    return savedSignal;
}

export interface ResolvedSignalResult {
    message: string;
    result: 'WIN' | 'LOSS';
}

export async function resolvePendingSignalsAction(): Promise<ResolvedSignalResult[]> {
    const userId = 'default_user';
    const allSignals = await getSignals(userId, 999); // Fetch all signals for the user
    const pendingSignals = allSignals.filter(s => s.status === 'PENDING');

    if (pendingSignals.length === 0) {
        return [];
    }
    
    const resolvedSignalMessages: ResolvedSignalResult[] = [];
    const RESOLUTION_DELAY_MS = 5 * 60 * 1000; // 5 minutes

    let userNeedsUpdate = false;

    for (const signal of pendingSignals) {
        const signalTime = new Date(signal.timestamp).getTime();
        if (Date.now() - signalTime < RESOLUTION_DELAY_MS) {
            continue; // Not old enough to resolve
        }

        const priceData = await fetchLatestPrice(signal.asset);
        if (!priceData || !priceData.price) {
            console.error(`Could not fetch price for ${signal.asset} to resolve signal ${signal.id}`);
            continue;
        }

        const currentPrice = parseFloat(priceData.price);
        const entryPrice = signal.entryPrice;
        let result: 'WIN' | 'LOSS' = 'LOSS';

        const priceChange = (currentPrice - entryPrice) / entryPrice;

        switch (signal.prediction) {
            case 'LONG':
                if (priceChange > 0.001) result = 'WIN'; // Price increased > 0.1%
                break;
            case 'SHORT':
                if (priceChange < -0.001) result = 'WIN'; // Price decreased > 0.1%
                break;
            case 'HOLD':
                if (Math.abs(priceChange) <= 0.001) result = 'WIN'; // Price stayed within +/- 0.1%
                break;
        }

        signal.status = result;
        await updateSignal(signal);
        userNeedsUpdate = true;

        resolvedSignalMessages.push({
            message: `AI Signal for ${signal.asset} resolved as a ${result}.`,
            result,
        });
    }

    if (userNeedsUpdate) {
        const user = await getUser(userId);
        if (user) {
            const allUserSignals = await getSignals(userId, 999);
            const closedSignals = allUserSignals.filter(s => s.status !== 'PENDING');
            const wonSignals = closedSignals.filter(s => s.status === 'WIN').length;

            user.signalAccuracy = closedSignals.length > 0 ? Math.round((wonSignals / closedSignals.length) * 100) : user.signalAccuracy;
            user.xp += resolvedSignalMessages.filter(m => m.result === 'WIN').length * 25; // 25 XP for a win
            user.xp += resolvedSignalMessages.filter(m => m.result === 'LOSS').length * 5; // 5 XP for a loss
            
            await updateUser(user);
            revalidatePath('/');
        }
    }
    
    return resolvedSignalMessages;
}
