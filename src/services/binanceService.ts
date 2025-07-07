
'use server';
/**
 * @fileOverview Service for fetching data from Binance API.
 */
import type { Market } from '@/lib/types';

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

/**
 * Fetches the latest ticker price for a given symbol.
 * @param symbol Trading symbol, e.g., BTCUSDT
 * @returns An object containing the price or null if an error occurs.
 */
export async function fetchLatestPrice(symbol: string): Promise<{ symbol: string; price: string } | null> {
  try {
    const formattedSymbol = symbol.toUpperCase();
    const response = await fetch(
      `${BINANCE_API_BASE_URL}/ticker/price?symbol=${formattedSymbol}`
    );
    if (!response.ok) {
      console.error(`Binance API error for ticker ${formattedSymbol}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch latest price from Binance for ${symbol}:`, error);
    return null;
  }
}


/**
 * Fetches recent Klines (candlestick data) for a given symbol.
 * @param symbol Trading symbol, e.g., BTCUSDT
 * @param interval Kline interval, e.g., 1h, 4h, 1d
 * @param limit Number of klines to fetch
 * @returns A string summarizing the price feed or an error message.
 */
export async function fetchPriceData(symbol: string, interval: string = '1h', limit: number = 20): Promise<string> {
  try {
    const formattedSymbol = symbol.toUpperCase();
    const url = `${BINANCE_API_BASE_URL}/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return `Error fetching price data from Binance for ${formattedSymbol}: ${errorData.msg || response.statusText}.`;
    }

    const klines: Kline[] = (await response.json()).map((k: any[]) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6],
    }));

    if (!klines.length) {
      return `No price data found for ${formattedSymbol} on Binance.`;
    }

    const latestKline = klines[klines.length - 1];
    const summary = `Latest price data for ${formattedSymbol} (${interval}): Close ${latestKline.close}, Volume ${latestKline.volume}. Period: ${new Date(latestKline.openTime).toISOString()} to ${new Date(latestKline.closeTime).toISOString()}.`;
    
    return summary;
  } catch (error) {
    console.error(`Failed to fetch price data from Binance for ${symbol}:`, error);
    return `Exception while fetching price data for ${symbol}. Check server logs.`;
  }
}

/**
 * Fetches all tradable USDT pairs from Binance.
 * @returns A promise that resolves to an array of market objects.
 */
export async function fetchTradableUsdtPairs(): Promise<Market[]> {
    const defaultPairs = [
        { symbol: 'BTCUSDT', label: 'BTC/USDT' },
        { symbol: 'ETHUSDT', label: 'ETH/USDT' },
        { symbol: 'MATICUSDT', label: 'MATIC/USDT' },
    ];
    try {
        const response = await fetch(`${BINANCE_API_BASE_URL}/exchangeInfo`);
        if (!response.ok) {
            console.error(`Binance API error for exchangeInfo: ${response.status}`);
            return defaultPairs;
        }
        const data = await response.json();
        const usdtPairs: Market[] = data.symbols
            .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING' && s.isSpotTradingAllowed)
            .map((s: any) => ({
                symbol: s.symbol,
                label: `${s.baseAsset}/${s.quoteAsset}`,
            }));

        const popularAssets = ['BTC', 'ETH', 'MATIC', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX'];
        const filteredPairs = usdtPairs.filter((p: Market) => popularAssets.includes(p.label.split('/')[0]));

        return filteredPairs.length > 0 ? filteredPairs : defaultPairs;

    } catch (error) {
        console.error('Failed to fetch exchange info from Binance:', error);
        return defaultPairs;
    }
}
