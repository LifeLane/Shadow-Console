
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rss, MessageSquare, Users, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import TypewriterText from '@/components/TypewriterText';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StreamItem {
  id: string;
  source: string;
  icon: React.ElementType;
  content: string;
  timestamp: string;
  colorClass: string;
}

const mockStreamData: Omit<StreamItem, 'id' | 'timestamp'>[] = [
  { source: "Market News Aggregator", icon: Rss, content: "BTC rallies above $65,000 as institutional interest surges. Major funds entering the space.", colorClass: "text-blue-400" },
  { source: "Shadow Core AI", icon: MessageSquare, content: ":: Analyzing mempool congestion on ETH. Potential for short-term gas spike. Advise caution on L1 tx.", colorClass: "text-purple-400" },
  { source: "Whale Alert System", icon: Users, content: "Large USDT transfer (150M) detected from unknown wallet to exchange CEX_GAMMA. Monitoring for sell pressure.", colorClass: "text-orange-400" },
  { source: "Shadow Core AI", icon: LinkIcon, content: ":: Correlating LINK wallets with stETH positions. Growing cluster indicates coordinated accumulation. Monitoring for potential market impact.", colorClass: "text-purple-400" },
  { source: "Anomaly Detection", icon: AlertTriangle, content: "Unusual volume spike detected on SOL/USDC pair on decentralized exchange DEX_ALPHA. Investigating wash trading patterns.", colorClass: "text-red-400" },
  { source: "Market News Aggregator", icon: Rss, content: "New DeFi protocol 'QuantumLeap' announces successful audit, token price jumps 20%. Governance token distribution imminent.", colorClass: "text-blue-400" },
];

const generateRandomTimestamp = () => {
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 60);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function CoreDataStreamsTab() {
  const [streamItems, setStreamItems] = useState<StreamItem[]>([]);
  const [descriptionKey, setDescriptionKey] = useState(0); 

  useEffect(() => {
    setDescriptionKey(prev => prev + 1);
    // Initial load of some items
    const initialItems = mockStreamData.slice(0, 3).map((item, index) => ({
      ...item,
      id: `stream-${Date.now()}-${index}`,
      timestamp: generateRandomTimestamp(),
    }));
    setStreamItems(initialItems);

    // Simulate new items arriving
    const intervalId = setInterval(() => {
      setStreamItems(prevItems => {
        const newItemIndex = Math.floor(Math.random() * mockStreamData.length);
        const newItem = {
          ...mockStreamData[newItemIndex],
          id: `stream-${Date.now()}`,
          timestamp: generateRandomTimestamp(),
        };
        const updatedItems = [newItem, ...prevItems];
        return updatedItems.slice(0, 20); // Keep a max of 20 items
      });
    }, 5000); // Add a new item every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Rss className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Core Data Streams</CardTitle>
              <TypewriterText 
                key={`desc-main-streams-${descriptionKey}`}
                text="Live intelligence feeds from the Shadow Core network, including market news, mempool insights, whale movements, and AI-generated observations. (Simulated Real-time)" 
                className="text-xs sm:text-sm text-muted-foreground mt-1"
                speed={15}
                showCaret={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <ScrollArea className="h-[400px] sm:h-[500px] w-full rounded-md border border-border p-3 sm:p-4 bg-black/80 glow-border-accent">
            <div className="space-y-3 sm:space-y-4 font-code text-xs sm:text-sm">
              {streamItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-2 sm:space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 ${item.colorClass}`} />
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className={`font-semibold ${item.colorClass}`}>{item.source}</span>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                     <TypewriterText text={item.content} speed={10} className="text-gray-300 leading-snug" showCaret={false} />
                  </div>
                </div>
              ))}
               {streamItems.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <Rss className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 animate-pulse-opacity" />
                  <p className="text-sm sm:text-base">Initializing data streams... Standby for Shadow Core intelligence.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="glow-border-accent">
        <CardHeader className="p-4 sm:p-6">
            <CardTitle className="font-headline text-lg sm:text-xl text-accent">Understanding the Streams</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
            <TypewriterText key={`desc-streamtype-1-${descriptionKey}`} text="Market News Aggregator: Key headlines impacting crypto markets." speed={10} showCaret={false}><strong className="text-foreground">Market News Aggregator:</strong> Key headlines impacting crypto markets.</TypewriterText>
            <TypewriterText key={`desc-streamtype-2-${descriptionKey}`} text="Shadow Core AI (Insights): Direct observations and interpretations from the AI." speed={10} showCaret={false}><strong className="text-foreground">Shadow Core AI (Insights):</strong> Direct observations and interpretations from the AI.</TypewriterText>
            <TypewriterText key={`desc-streamtype-3-${descriptionKey}`} text="Whale Alert System: Significant token movements by large holders." speed={10} showCaret={false}><strong className="text-foreground">Whale Alert System:</strong> Significant token movements by large holders.</TypewriterText>
            <TypewriterText key={`desc-streamtype-4-${descriptionKey}`} text="Shadow Core AI (LINK Analysis): Connections and patterns identified between wallets or entities." speed={10} showCaret={false}><strong className="text-foreground">Shadow Core AI (LINK Analysis):</strong> Connections and patterns identified between wallets or entities.</TypewriterText>
            <TypewriterText key={`desc-streamtype-5-${descriptionKey}`} text="Anomaly Detection: Unusual market activities flagged by the system." speed={10} showCaret={false}><strong className="text-foreground">Anomaly Detection:</strong> Unusual market activities flagged by the system.</TypewriterText>
        </CardContent>
      </Card>
    </div>
  );
}
