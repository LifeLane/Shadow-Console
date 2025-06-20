
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, BadgeCheck, Send, Link2, Award, Gift, KeyRound, BookOpen, Sparkles, CheckCircle, ListChecks } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';

interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  reward: { type: 'NFT' | 'Key' | 'XP_Boost' | 'Badge' | 'Airdrop_Multiplier'; name: string; icon: React.ElementType };
  isCompleted: boolean;
  actionLabel: string;
  completedLabel?: string;
  actionIcon?: React.ElementType;
}

const initialTasksData: Task[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)', icon: Gift }, isCompleted: false, actionLabel: 'Go to Console', completedLabel: "Mission Complete!", actionIcon: Send },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key', icon: KeyRound }, isCompleted: false, actionLabel: 'Sync Wallet', completedLabel: "Network Sync Confirmed!", actionIcon: Link2 },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)', icon: Award }, isCompleted: false, actionLabel: 'Share on X', completedLabel: "Broadcast Sent!", actionIcon: Send },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge', icon: BookOpen }, isCompleted: false, actionLabel: 'Start Intel Briefing', completedLabel: "Intel Acquired!", actionIcon: BookOpen },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x', icon: Sparkles }, isCompleted: false, actionLabel: 'Report In', completedLabel: "Status Confirmed!", actionIcon: CheckCircle },
];

export default function MissionsTab() {
  const [tasks, setTasks] = useState<Task[]>(initialTasksData);
  const { toast } = useToast();
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    setDescriptionKey(prev => prev + 1);
  }, []);

  const handleTaskAction = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId && !task.isCompleted) {
          toast({
            title: `Mission "${task.title}" Accomplished!`,
            description: `You've earned ${task.xp} XP and a ${task.reward.name}. Your efforts strengthen the Shadow Core!`,
          });
          return { ...task, isCompleted: true };
        }
        return task;
      })
    );
     setDescriptionKey(prev => prev + 1); // Re-trigger typewriter for descriptions
  };

  const completedTasksCount = useMemo(() => tasks.filter(task => task.isCompleted).length, [tasks]);
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ListChecks className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Agent Missions Hub</CardTitle>
              <TypewriterText 
                key={`desc-missions-${descriptionKey}`}
                text="Undertake missions to earn XP, exclusive rewards, and Airdrop Multipliers. Each completed mission helps train the Shadow Core with valuable real-world data interaction. (Actions are Simulated)" 
                className="text-xs sm:text-sm text-muted-foreground mt-1"
                speed={15}
                showCaret={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Overall Progress:</span>
              <span className="text-primary">{completedTasksCount} / {totalTasksCount} Missions Completed</span>
            </div>
            <Progress value={progressPercentage} className="w-full h-2.5 sm:h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {tasks.map((task) => {
              const ActionIcon = task.actionIcon;
              const RewardIcon = task.reward.icon;
              return (
                <Card 
                  key={task.id} 
                  className={cn(
                    "overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg",
                    task.isCompleted 
                      ? "opacity-80 glow-border-accent hover:shadow-accent/40" 
                      : "glow-border-primary hover:shadow-primary/40"
                  )}
                >
                  <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 bg-card hover:bg-muted/30 transition-colors duration-200">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-grow">
                      <div className="mt-1 shrink-0">
                        {task.isCompleted ? (
                          <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                        ) : (
                          <Square className="w-6 h-6 sm:w-7 sm:h-7 text-primary/70" />
                        )}
                      </div>
                      <div className="min-w-0"> 
                        <h3 className={cn(
                          "text-base sm:text-lg font-semibold font-headline", 
                          task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        )}>{task.title}</h3>
                        <TypewriterText 
                          key={`desc-task-${task.id}-${descriptionKey}`}
                          text={task.description}
                          className={cn("text-xs sm:text-sm", task.isCompleted ? "text-muted-foreground/80" : "text-muted-foreground")}
                          speed={10}
                          showCaret={false}
                        />
                        <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center text-xs flex-wrap gap-x-3 gap-y-1">
                          <span className={cn("flex items-center", task.isCompleted ? "text-muted-foreground" : "text-primary")}>
                            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> XP: {task.xp}
                          </span>
                          <span className={cn("flex items-center", task.isCompleted ? "text-muted-foreground" : "text-primary")}>
                            <RewardIcon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5", task.isCompleted ? "text-accent/70" : "text-accent")} /> Reward: {task.reward.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleTaskAction(task.id)}
                      variant={task.isCompleted ? "outline" : "default"} 
                      size="sm" 
                      disabled={task.isCompleted}
                      className={cn(
                        "font-code w-full md:w-auto shrink-0 transition-all duration-300 transform hover:scale-105 py-2 px-3 text-xs sm:text-sm", 
                        task.isCompleted 
                          ? "border-accent text-accent hover:bg-accent/10 hover:text-accent cursor-default opacity-80" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {task.isCompleted ? (task.completedLabel || "Mission Done!") : task.actionLabel}
                      {!task.isCompleted && ActionIcon && <ActionIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 sm:ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

