'use server';

import { revalidatePath } from 'next/cache';
import { getAgents, saveAgent, updateAgentStatus } from '@/services/agentService';
import { setupTables, seedInitialUser, seedInitialAgents, seedInitialMissions } from '@/services/setupService';
import type { Agent, Mission } from '@/lib/types';

// This data is used to seed the database the first time the app is run.
const initialMissionsToSeed: Mission[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)'} },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key'} },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)'} },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge'} },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x'} },
];

export async function setupDatabaseAndSeed(initialAgents: Agent[]) {
  await setupTables();
  await seedInitialUser();
  await seedInitialAgents(initialAgents);
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

export async function saveAgentAction(agent: Agent) {
  try {
    await saveAgent(agent);
    revalidatePath('/#agents');
  } catch (error) {
    console.error('Action Error: Failed to save agent.', error);
    throw new Error('Failed to save agent.');
  }
}

export async function updateAgentStatusAction(agentId: string, status: Agent['status']) {
  try {
    await updateAgentStatus(agentId, status);
    revalidatePath('/#agents');
  } catch (error) {
    console.error('Action Error: Failed to update agent status.', error);
    throw new Error('Failed to update agent status.');
  }
}
