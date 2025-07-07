
'use server';

import { fetchLatestPrice, fetchTradableUsdtPairs, fetchTicker24h } from "@/services/binanceService";
import type { Market, Ticker24h } from "@/lib/types";

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
 * A Server Action to fetch the 24h ticker data for a given symbol.
 * @param symbol The trading symbol (e.g., 'BTCUSDT').
 * @returns The ticker data, or null if an error occurs.
 */
export async function getTicker24hAction(symbol: string): Promise<Ticker24h | null> {
    if (!symbol) return null;
    try {
        return await fetchTicker24h(symbol);
    } catch (error) {
        console.error(`Server Action getTicker24hAction failed for ${symbol}:`, error);
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
