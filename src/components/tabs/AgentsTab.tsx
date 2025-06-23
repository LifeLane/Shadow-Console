
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Bot, History, Target, TrendingUp, TrendingDown, CheckCircle, XCircle, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const userStats = {
  signalsGenerated: 12,
  signalsWon: 9,
  totalBsaiEarned: 7540,
  currentXp: 1250,
  xpForNextLevel: 2000,
  milestones: [
    { name: "First Signal", completed: true },
    { name: "First Win", completed: true },
    { name: "10 Signals", completed: true },
    { name: "5 Wins", completed: true },
    { name: "Signal Streak: 3", completed: false },
  ]
};

const signalHistory = [
  { id: 'sig1', target: 'BTCUSDT', prediction: 'BUY', outcome: 'Take Profit Hit', reward: 850 },
  { id: 'sig2', target: 'ETHUSDT', prediction: 'SELL', outcome: 'Stop Loss Hit', reward: 15 },
  { id: 'sig3', target: 'SOLUSDT', prediction: 'BUY', outcome: 'Take Profit Hit', reward: 1200 },
  { id: 'sig4', target: 'DOGEUSDT', prediction: 'BUY', outcome: 'Take Profit Hit', reward: 450 },
  { id: 'sig5', target: 'LINKUSDT', prediction: 'SELL', outcome: 'Take Profit Hit', reward: 975 },
];

const StatCard = ({ title, value, children }: { title: string; value: string | number; children: React.ReactNode }) => (
    <Card className="p-4 bg-card/80 text-center shadow-inner hover:shadow-lg transition-shadow">
        <div className="text-primary mb-2">{children}</div>
        <p className="text-2xl font-bold font-headline">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
    </Card>
);

export default function AgentsTab() {
  const winRate = useMemo(() => {
    if (userStats.signalsGenerated === 0) return "0.00%";
    return ((userStats.signalsWon / userStats.signalsGenerated) * 100).toFixed(2) + "%";
  }, []);

  const xpProgress = useMemo(() => {
    return (userStats.currentXp / userStats.xpForNextLevel) * 100;
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Agent Profile & Stats Card */}
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Your Agent Profile</CardTitle>
              <CardDescription>Your performance statistics and contributions to the Shadow Core.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Signals Generated" value={userStats.signalsGenerated}>
                  <History className="h-8 w-8 mx-auto" />
              </StatCard>
              <StatCard title="Win Rate" value={winRate}>
                  <CheckCircle className="h-8 w-8 mx-auto" />
              </StatCard>
              <StatCard title="Total BSAI Earned" value={userStats.totalBsaiEarned.toLocaleString()}>
                  <Award className="h-8 w-8 mx-auto" />
              </StatCard>
               <StatCard title="Current XP" value={userStats.currentXp.toLocaleString()}>
                  <Star className="h-8 w-8 mx-auto" />
              </StatCard>
          </div>
           <div>
              <Label className="text-sm font-medium text-muted-foreground">Next Milestone Progress</Label>
              <Progress value={xpProgress} className="w-full mt-2 h-3" />
              <p className="text-xs text-right mt-1 text-muted-foreground">{userStats.currentXp.toLocaleString()} / {userStats.xpForNextLevel.toLocaleString()} XP</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold font-headline mb-2 text-primary">Milestones</h4>
            <div className="flex flex-wrap gap-2">
              {userStats.milestones.map(milestone => (
                <Badge key={milestone.name} variant={milestone.completed ? "default" : "outline"} className={cn("text-xs sm:text-sm py-1 px-2", milestone.completed ? "bg-primary/80 border-primary" : "border-border text-muted-foreground")}>
                  {milestone.completed && <CheckCircle className="h-3 w-3 mr-1.5" />}
                  {milestone.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal History Card */}
      <Card className="glow-border-accent">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-2xl text-accent">Signal Ledger</CardTitle>
          <CardDescription>A log of your recently deployed signals and their outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
            {signalHistory.length > 0 ? signalHistory.map(signal => (
                <Card key={signal.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card/80 hover:bg-muted/50 transition-colors duration-200 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-grow">
                        {signal.prediction === 'BUY' 
                            ? <TrendingUp className="h-7 w-7 text-green-500 shrink-0" /> 
                            : <TrendingDown className="h-7 w-7 text-red-500 shrink-0" />}
                        <div>
                            <p className="font-bold text-base sm:text-lg font-code">{signal.target}</p>
                            <p className="text-xs text-muted-foreground">Predicted: {signal.prediction}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 sm:space-x-6 text-sm w-full sm:w-auto justify-between">
                         <div className={cn("flex items-center", signal.outcome === 'Take Profit Hit' ? 'text-green-400' : 'text-red-400')}>
                            {signal.outcome === 'Take Profit Hit' ? <CheckCircle className="h-4 w-4 mr-1.5" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                            <span className="font-medium">{signal.outcome}</span>
                        </div>
                        <div className="flex items-center text-primary font-semibold">
                            <Award className="h-4 w-4 mr-1.5 text-yellow-500"/>
                            <span>{signal.reward} BSAI</span>
                        </div>
                    </div>
                </Card>
            )) : (
                 <p className="text-center text-muted-foreground py-4">No signals generated yet. Go to the Mind tab to deploy your first signal!</p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
