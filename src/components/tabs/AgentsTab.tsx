
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, ShieldQuestion, Zap, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import TypewriterText from '@/components/TypewriterText';

interface AgentStrategy {
  id: string;
  name: string;
  description: string;
  style: string; 
  riskProfile: string; 
  iconUrl?: string; 
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
    description: 'High-frequency scalping agent optimized for volatile markets. Utilizes micro-trend analysis and rapid execution protocols for short-term gains.',
    style: 'Scalping',
    riskProfile: 'Aggressive',
    iconUrl: 'https://placehold.co/150x150.png',
    performanceMetrics: { winRate: '68%', avgReturn: '+1.2%/trade' },
    status: 'active',
  },
  {
    id: 'agent_sigma',
    name: 'Sigma Sentinel',
    description: 'Swing trading agent focusing on macro trends and sustained momentum shifts. Ideal for longer holds, leveraging deep market structure analysis.',
    style: 'Swing Trading',
    riskProfile: 'Balanced',
    iconUrl: 'https://placehold.co/150x150.png',
    performanceMetrics: { winRate: '75%', avgReturn: '+5.5%/trade' },
    status: 'inactive',
  },
  {
    id: 'agent_omega',
    name: 'Omega Oracle (Training)',
    description: 'Experimental agent leveraging advanced pattern recognition and quantum entanglement simulations for futures contracts. Currently in Shadow Core training.',
    style: 'Futures',
    riskProfile: 'Experimental',
    iconUrl: 'https://placehold.co/150x150.png',
    status: 'training',
  },
];


export default function AgentsTab() {
  const [descriptionKey, setDescriptionKey] = useState(0); // For re-triggering typewriter
  
  React.useEffect(() => { // Trigger typewriter on mount for initial descriptions
    setDescriptionKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Shadow Agent Deployment</CardTitle>
              <TypewriterText 
                key={`desc-main-${descriptionKey}`}
                text="Deploy and manage autonomous Shadow Agents. These AI-driven strategies execute trades based on Shadow Core insights and your configured parameters. (Feature in Development)" 
                className="text-xs sm:text-sm text-muted-foreground mt-1"
                speed={15}
                showCaret={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 text-center space-y-4 sm:space-y-6">
           <ShieldQuestion className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto animate-pulse-opacity" />
          <TypewriterText 
            key={`desc-dev-${descriptionKey}`}
            text="The Shadow Agent deployment module is currently under advanced development within the Shadow Core." 
            className="text-base sm:text-lg text-muted-foreground"
            speed={20}
            showCaret={false}
          />
          <TypewriterText
            key={`desc-soon-${descriptionKey}`}
            text="Soon, you'll be able to select, customize, and deploy sophisticated AI trading agents directly from this console. These agents will learn from your interactions and the Core's collective intelligence."
            className="text-xs sm:text-sm"
            speed={15}
            showCaret={false}
          />
           <Button variant="outline" className="font-code border-primary text-primary hover:bg-primary/10 text-sm sm:text-base py-2 px-4">
            <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Notify Me on Launch (Simulated)
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-2xl text-accent">Available Agent Blueprints (Conceptual)</CardTitle>
          <TypewriterText 
            key={`desc-blueprints-${descriptionKey}`}
            text="Preview of potential Shadow Agent strategies you can deploy."
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mockAgents.map(agent => (
            <Card key={agent.id} className="bg-card/80 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-4 text-center">
                {agent.iconUrl && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 rounded-full overflow-hidden border-2 border-primary/50">
                    <Image src={agent.iconUrl} alt={`${agent.name} icon`} layout="fill" objectFit="cover" data-ai-hint="strategy robot"/>
                  </div>
                )}
                <CardTitle className="text-md sm:text-xl font-headline text-primary">{agent.name}</CardTitle>
                <p className="text-xs sm:text-sm font-code text-muted-foreground">{agent.style} - {agent.riskProfile}</p>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <TypewriterText 
                  key={`desc-agent-${agent.id}-${descriptionKey}`}
                  text={agent.description} 
                  className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3"
                  speed={10}
                  showCaret={false}
                />
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
                  className="w-full font-code text-sm py-2"
                  disabled={agent.status === 'training'}
                >
                  {agent.status === 'active' ? <Zap className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {agent.status === 'active' ? 'Deactivate (Sim)' : agent.status === 'training' ? 'Training...' : 'Deploy (Sim)'}
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
