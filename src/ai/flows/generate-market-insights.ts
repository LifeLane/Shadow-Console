
'use server';

/**
 * @fileOverview A flow to generate market insights using the Gemini Pro API.
 * It now fetches live data from Binance, CoinDesk (conceptual), and Polygon.
 *
 * - generateMarketInsights - A function that generates market insights.
 * - MarketInsightsInput - The input type for the generateMarketInsights function (client-facing).
 * - MarketInsightsOutput - The return type for the generateMarketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as binanceService from '@/services/binanceService';
import * as coindeskService from '@/services/coindeskService';
import * as polygonService from '@/services/polygonService';

// Schema for input from the client
const MarketInsightsInputSchema = z.object({
  target: z.string().describe('The target market (e.g., BTCUSDT).'),
  tradeMode: z.string().describe('The selected trading mode (e.g., Intraday, Scalping).'),
  risk: z.string().describe('The risk level (e.g., Low, Medium, High).'),
});
export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

// Schema for the data passed to the AI prompt (includes fetched API data)
const PromptDataSchema = MarketInsightsInputSchema.extend({
  priceFeed: z.string().describe('Price data summary from Binance API, including recent klines (candlesticks).'),
  sentimentNews: z.string().describe('Sentiment and news data summary, conceptually from CoinDesk or similar sources.'),
  walletTransaction: z.string().describe('Summary of recent wallet actions or token transfers on Polygon relevant to the asset.'),
});

const MarketInsightsOutputSchema = z.object({
  prediction: z.string().describe('The predicted market action (BUY, HOLD, SELL).'),
  confidence: z.number().describe('The confidence score for the prediction (0-100).'),
  entryRange: z.string().describe('The recommended entry range for the trade.'),
  stopLoss: z.string().describe('The recommended stop loss price.'),
  takeProfit: z.string().describe('The recommended take profit price.'),
  shadowScore: z.number().describe('A score reflecting the overall quality of the signal (0-100).'),
  thought: z.string().describe('The AI-generated thought process behind the prediction.'),
});
export type MarketInsightsOutput = z.infer<typeof MarketInsightsOutputSchema>;

export async function generateMarketInsights(input: MarketInsightsInput): Promise<MarketInsightsOutput> {
  return generateMarketInsightsFlow(input);
}

// Helper to map Trade Mode to a technical chart timeframe for the API
const tradeModeToKlineInterval = (tradeMode: string): string => {
  switch (tradeMode.toLowerCase()) {
    case 'scalping':
      return '5m';
    case 'intraday':
      return '1h';
    case 'swing trading':
      return '4h';
    case 'position trading':
    case 'options':
    case 'futures':
      return '1d';
    default:
      return '1d'; // Default to daily for unknown modes
  }
};

const marketInsightsPrompt = ai.definePrompt({
  name: 'marketInsightsPrompt',
  input: {schema: PromptDataSchema}, // Prompt uses the extended schema with API data
  output: {schema: MarketInsightsOutputSchema},
  prompt: `You are an AI-powered market analyst providing insights on cryptocurrency trends.

  Analyze the following market data to generate a trading signal.

  Target Market: {{{target}}}
  Trade Mode: {{{tradeMode}}}
  Risk Level: {{{risk}}}

  Price Feed Data (from Binance): {{{priceFeed}}}
  Sentiment & News Data (conceptual, from CoinDesk/general sources): {{{sentimentNews}}}
  Recent Wallet Transaction/Token Activity (from Polygon): {{{walletTransaction}}}

  Based on this information, provide a prediction, confidence score, entry range, stop loss, take profit, shadow score, and a brief thought process.
  Ensure values like entryRange, stopLoss, and takeProfit are plausible for the {{{target}}} market.
  Confidence and ShadowScore should be between 0 and 100.

  Example Output Format:
  {
    "prediction": "BUY",
    "confidence": 75,
    "entryRange": "$25,200 - $25,500",
    "stopLoss": "$24,800",
    "takeProfit": "$26,200",
    "shadowScore": 85,
    "thought": "Volume is diverging against retail flow, with positive sentiment and notable on-chain accumulation, indicating a potential upward trend."
  }
  `,
});

const generateMarketInsightsFlow = ai.defineFlow(
  {
    name: 'generateMarketInsightsFlow',
    inputSchema: MarketInsightsInputSchema, // Flow accepts client-defined inputs
    outputSchema: MarketInsightsOutputSchema,
  },
  async (clientInput: MarketInsightsInput) => {
    console.log('Received client input for flow:', clientInput);

    // Map the user-facing tradeMode to a technical kline interval
    const klineInterval = tradeModeToKlineInterval(clientInput.tradeMode);

    // Fetch data from external services
    const priceFeedData = await binanceService.fetchPriceData(clientInput.target, klineInterval);
    // For sentiment news, we might pass the base asset (e.g., BTC from BTCUSDT)
    const baseAssetForNews = clientInput.target.replace(/USDT$|USD$/i, ''); 
    const sentimentNewsData = await coindeskService.fetchSentimentNews(baseAssetForNews || clientInput.target);
    const walletTransactionData = await polygonService.fetchRecentTransactions(clientInput.target);

    console.log('Fetched Price Feed:', priceFeedData);
    console.log('Fetched Sentiment News:', sentimentNewsData);
    console.log('Fetched Wallet Transactions:', walletTransactionData);
    
    // Construct the full input for the AI prompt
    const promptData: z.infer<typeof PromptDataSchema> = {
      ...clientInput,
      priceFeed: priceFeedData,
      sentimentNews: sentimentNewsData,
      walletTransaction: walletTransactionData,
    };

    const {output} = await marketInsightsPrompt(promptData);
    if (!output) {
        throw new Error("AI prompt did not return an output.");
    }
    return output;
  }
);

    