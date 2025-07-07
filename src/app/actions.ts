
'use server';

import { fetchLatestPrice, fetchTradableUsdtPairs } from "@/services/binanceService";
import type { Market } from "@/lib/types";

/**
 * A Server Action to fetch the latest price for a given symbol.
 * This is called by the client to get live market data securely.
 * @param symbol The trading symbol (e.g., 'BTCUSDT').
 * @returns The latest price as a string, or null if an error occurs.
 */
export async function getLivePrice(symbol: string): Promise<string | null> {
    try {
        const data = await fetchLatestPrice(symbol);
        if (data) {
            return data.price;
        }
        return null;
    } catch (error) {
        console.error(`Server Action getLivePrice failed for ${symbol}:`, error);
        return null;
    }
}

/**
 * A Server Action to fetch the available trading markets from Binance.
 * @returns An array of Market objects.
 */
export async function getAvailableMarketsAction(): Promise<Market[]> {
    return await fetchTradableUsdtPairs();
}
