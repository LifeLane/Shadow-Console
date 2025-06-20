"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, CircleDotDashed, Gift, WalletCards, History, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface EligibilityItem {
  id: string;
  label: string;
  isEligible: boolean;
  details?: string;
}

const mockEligibilityData: EligibilityItem[] = [
  { id: 'wallet', label: 'Connected Wallet', isEligible: true, details: 'MetaMask (0x123...abc)' },
  { id: 'bsai', label: 'BSAI Holder Status', isEligible: true, details: 'Holding 500+ BSAI' },
  { id: 'trials', label: 'Signal Trials Completed', isEligible: false, details: '1/5 trials completed' },
  { id: 'invite', label: 'Invite Code Used', isEligible: true, details: 'Code: SHADOW2024' },
];

const mockTransactions = [
  { id: 'tx1', date: '2024-07-20', type: 'Airdrop Claim', amount: '100 BSAI', status: 'Completed', txHash: '0xabc...' },
  { id: 'tx2', date: '2024-07-15', type: 'Task Reward', amount: '20 BSAI', status: 'Completed', txHash: '0xdef...' },
];

export default function AirdropTab() {
  const [eligibilityItems, setEligibilityItems] = useState(mockEligibilityData);
  
  const eligibleCount = eligibilityItems.filter(item => item.isEligible).length;
  const progressPercentage = (eligibleCount / eligibilityItems.length) * 100;
  const allEligible = eligibleCount === eligibilityItems.length;

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center"><Gift className="w-8 h-8 mr-3" />BSAI Airdrop Center</CardTitle>
          <CardDescription>Check your eligibility and claim your BSAI tokens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground font-headline">Eligibility Progress</h3>
            <Progress value={progressPercentage} className="w-full h-3 mb-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            <p className="text-sm text-muted-foreground">{eligibleCount} of {eligibilityItems.length} criteria met.</p>
          </div>

          <div className="space-y-4">
            {eligibilityItems.map((item) => (
              <Card key={item.id} className={cn("p-4 flex items-center justify-between", item.isEligible ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50")}>
                <div className="flex items-center">
                  {item.isEligible ? <CheckCircle className="w-6 h-6 mr-3 text-green-500" /> : <XCircle className="w-6 h-6 mr-3 text-red-500" />}
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
                  </div>
                </div>
                {!item.isEligible && item.id === 'trials' && (
                  <Button variant="outline" size="sm" className="font-code border-primary text-primary hover:bg-primary/10 hover:text-primary">
                    Complete Trials
                  </Button>
                )}
              </Card>
            ))}
          </div>
          
          <Button 
            disabled={!allEligible} 
            className={cn(
              "w-full text-lg py-3 font-code",
              allEligible ? "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow-accent" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <WalletCards className="w-5 h-5 mr-2" /> {allEligible ? "Claim Airdrop" : "Complete All Criteria to Claim"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent flex items-center"><History className="w-6 h-6 mr-3" />Transaction History</CardTitle>
          <CardDescription>Your recent BSAI token transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockTransactions.length > 0 ? (
            <ul className="space-y-3">
              {mockTransactions.map(tx => (
                <li key={tx.id} className="p-3 border border-border rounded-md flex justify-between items-center bg-card hover:bg-muted/20">
                  <div>
                    <p className="font-semibold">{tx.type} - <span className="text-accent font-bold">{tx.amount}</span></p>
                    <p className="text-xs text-muted-foreground">{tx.date} - Status: {tx.status}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    {tx.txHash} <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
