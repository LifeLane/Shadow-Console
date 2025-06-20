'use server';

/**
 * @fileOverview A flow to generate market insights using the Gemini Pro API.
 *
 * - generateMarketInsights - A function that generates market insights.
 * - MarketInsightsInput - The input type for the generateMarketInsights function.
 * - MarketInsightsOutput - The return type for the generateMarketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketInsightsInputSchema = z.object({
  target: z.string().describe('The target market (e.g., BTCUSDT).'),
  timeframe: z.string().describe('The timeframe for analysis (e.g., 15m).'),
  indicators: z.string().describe('The indicators to consider (e.g., RSI, MACD, ATR).'),
  risk: z.string().describe('The risk level (e.g., Low, Medium, High).'),
  priceFeed: z.string().describe('Price data from Binance API'),
  sentimentNews: z.string().describe('Sentiment and news data from CoinDesk API'),
  walletTransaction: z.string().describe('Recent wallet action on asset from Polygon API'),
});
export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

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

const marketInsightsPrompt = ai.definePrompt({
  name: 'marketInsightsPrompt',
  input: {schema: MarketInsightsInputSchema},
  output: {schema: MarketInsightsOutputSchema},
  prompt: `You are an AI-powered market analyst providing insights on cryptocurrency trends.

  Analyze the following market data to generate a trading signal.

  Target Market: {{{target}}}
  Timeframe: {{{timeframe}}}
  Indicators: {{{indicators}}}
  Risk Level: {{{risk}}}

  Price Feed Data: {{{priceFeed}}}
  Sentiment & News Data: {{{sentimentNews}}}
  Recent Wallet Transaction: {{{walletTransaction}}}

  Based on this information, provide a prediction, confidence score, entry range, stop loss, take profit, shadow score, and a brief thought process.

  Example Output Format:
  {
    "prediction": "BUY",
    "confidence": 75,
    "entryRange": "$25,200 - $25,500",
    "stopLoss": "$24,800",
    "takeProfit": "$26,200",
    "shadowScore": 85,
    "thought": "Volume is diverging against retail flow, indicating a potential upward trend."
  }
  `,
});

const generateMarketInsightsFlow = ai.defineFlow(
  {
    name: 'generateMarketInsightsFlow',
    inputSchema: MarketInsightsInputSchema,
    outputSchema: MarketInsightsOutputSchema,
  },
  async input => {
    const {output} = await marketInsightsPrompt(input);
    return output!;
  }
);
