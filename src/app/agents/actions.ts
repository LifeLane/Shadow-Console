'use server';

import { revalidatePath } from 'next/cache';
import { getAgents, saveAgent, updateAgentStatus } from '@/services/agentService';
import { setupTables, seedInitialUser, seedInitialAgents, seedInitialMissions } from '@/services/setupService';
import type { Agent, Mission, User } from '@/lib/types';
import { getUser } from '@/services/userService';

// This data is used to seed the database the first time the app is run.
const initialMissionsToSeed: Mission[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)'} },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key'} },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)'} },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge'} },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x'} },
];

const initialAgentsData: Omit<Agent, 'id' | 'user_id'>[] = [
    { name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Active', is_custom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, code: `// Strategy: Momentum\n// Indicators: RSI, MACD\n\nif (crossover(rsi, 70)) {\n  sell();\n} else if (crossover(rsi, 30)) {\n  buy();\n}`, performance: { signals: 40, winRate: 85 } },
    { name: 'SOL Scalper v2', description: 'High-frequency scalping for SOL/USDT on the 5m timeframe.', status: 'Inactive', is_custom: true, parameters: { symbol: 'SOLUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, code: `// Strategy: High-frequency\n// Indicators: EMA, Volume\n\nfunction onTick(price, indicators) {\n  if (price > indicators.ema_fast) {\n    return 'BUY';\n  }\n  return 'SELL';\n}`, performance: { signals: 38, winRate: 72 } },
    { name: 'BTC Sentinel Prime', description: 'Balanced agent for BTC/USDT, operating on the 4h chart.', status: 'Inactive', is_custom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, code: '// PREMADE AGENT LOGIC - PROTECTED', performance: { signals: 0, winRate: 0 } },
];


export async function setupDatabaseAndSeed() {
  const agentsToSeed = initialAgentsData.map(agent => ({
    ...agent,
    id: `agent-${agent.is_custom ? 'custom' : 'premade'}-${agent.name.toLowerCase().replace(/\s+/g, '-')}`
  }));

  await setupTables();
  await seedInitialUser();
  await seedInitialAgents(agentsToSeed);
  await seedInitialMissions(initialMissionsToSeed);
}

export async function getAgentsAction(): Promise<Agent[]> {
  try {
    const agents = await getAgents();
    return agents;
  } catch (error) {
    console.error('Action Error: Failed to get agents.', error);
    return [];
  }
}

export async function getUserAction(userId: string): Promise<User | null> {
    try {
        return await getUser(userId);
    } catch (error) {
        console.error(`Action Error: Failed to get user ${userId}.`, error);
        return null;
    }
}

export async function saveAgentAction(agent: Agent) {
  try {
    await saveAgent(agent);
    revalidatePath('/');
  } catch (error) {
    console.error('Action Error: Failed to save agent.', error);
    throw new Error('Failed to save agent.');
  }
}

export async function updateAgentStatusAction(agentId: string, status: Agent['status']) {
  try {
    await updateAgentStatus(agentId, status);
    revalidatePath('/');
  } catch (error) {
    console.error('Action Error: Failed to update agent status.', error);
    throw new Error('Failed to update agent status.');
  }
}
