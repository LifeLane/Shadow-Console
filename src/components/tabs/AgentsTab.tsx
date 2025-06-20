
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, ShieldQuestion, Zap, PlusCircle, BarChart } from 'lucide-react';
import Image from 'next/image';

interface AgentStrategy {
  id: string;
  name: string;
  description: string;
  style: string; // e.g., Scalping, Swing
  riskProfile: string; // e.g., Aggressive, Conservative
  iconUrl?: string; // For a thematic icon
  performanceMetrics?: {
    winRate: string;
    avgReturn: string;
  };
  status: 'active' | 'inactive' | 'training';
}

const mockAgents: AgentStrategy[] = [
  {
    id: 'agent_alpha',
    name: 'Alpha Predator X1',
    description: 'High-frequency scalping agent optimized for volatile markets. Utilizes micro-trend analysis.',
    style: 'Scalping',
    riskProfile: 'Aggressive',
    iconUrl: 'https://placehold.co/150x150.png',
    performanceMetrics: { winRate: '68%', avgReturn: '+1.2%/trade' },
    status: 'active',
  },
  {
    id: 'agent_sigma',
    name: 'Sigma Sentinel',
    description: 'Swing trading agent focusing on macro trends and sustained momentum shifts. Ideal for longer holds.',
    style: 'Swing Trading',
    riskProfile: 'Balanced',
    iconUrl: 'https://placehold.co/150x150.png',
    performanceMetrics: { winRate: '75%', avgReturn: '+5.5%/trade' },
    status: 'inactive',
  },
  {
    id: 'agent_omega',
    name: 'Omega Oracle (Training)',
    description: 'Experimental agent leveraging advanced pattern recognition for futures contracts. Currently in Shadow Core training.',
    style: 'Futures',
    riskProfile: 'Experimental',
    iconUrl: 'https://placehold.co/150x150.png',
    status: 'training',
  },
];


export default function AgentsTab() {
  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl text-primary">Shadow Agent Deployment</CardTitle>
              <CardDescription>Deploy and manage autonomous Shadow Agents. These AI-driven strategies execute trades based on Shadow Core insights and your configured parameters. (Feature in Development)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
           <ShieldQuestion className="h-20 w-20 text-muted-foreground mx-auto animate-pulse-opacity" />
          <p className="text-lg text-muted-foreground">
            The Shadow Agent deployment module is currently under advanced development within the Shadow Core.
          </p>
          <p className="text-sm">
            Soon, you'll be able to select, customize, and deploy sophisticated AI trading agents directly from this console. These agents will learn from your interactions and the Core's collective intelligence.
          </p>
           <Button variant="outline" className="font-code border-primary text-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-5 w-5" /> Notify Me on Launch (Simulated)
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent">Available Agent Blueprints (Conceptual)</CardTitle>
          <CardDescription>Preview of potential Shadow Agent strategies.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAgents.map(agent => (
            <Card key={agent.id} className="bg-card/80 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                {agent.iconUrl && (
                  <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-primary/50">
                    <Image src={agent.iconUrl} alt={`${agent.name} icon`} layout="fill" objectFit="cover" data-ai-hint="strategy robot"/>
                  </div>
                )}
                <CardTitle className="text-xl font-headline text-center text-primary">{agent.name}</CardTitle>
                <CardDescription className="text-xs text-center font-code">{agent.style} - {agent.riskProfile}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                {agent.performanceMetrics && (
                  <div className="text-xs space-y-1 font-code">
                    <p>Simulated Win Rate: <span className="font-semibold text-accent">{agent.performanceMetrics.winRate}</span></p>
                    <p>Simulated Avg Return: <span className="font-semibold text-accent">{agent.performanceMetrics.avgReturn}</span></p>
                  </div>
                )}
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  variant={agent.status === 'active' ? "destructive" : "default"} 
                  size="sm" 
                  className="w-full font-code"
                  disabled={agent.status === 'training'}
                >
                  {agent.status === 'active' ? <Zap className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {agent.status === 'active' ? 'Deactivate Agent (Sim)' : agent.status === 'training' ? 'Training...' : 'Deploy Agent (Sim)'}
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

    