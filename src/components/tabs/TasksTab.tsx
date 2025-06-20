
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, BadgeCheck, Send, Link2, Award, Gift, KeyRound, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  reward: { type: 'NFT' | 'Key' | 'XP_Boost'; name: string; icon: React.ElementType };
  isCompleted: boolean;
  actionLabel: string;
  actionInProgress?: boolean; // For tasks like "Go to Console"
}

const mockTasksData: Task[] = [
  { id: 'signal', title: 'Submit 1 Signal Test', description: 'Use the Market Command Console to generate and analyze a signal.', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT', icon: Gift }, isCompleted: false, actionLabel: 'Go to Console', actionInProgress: true },
  { id: 'wallet', title: 'Sync Wallet with Polygon Bridge', description: 'Connect your wallet and perform a test sync via Polygon.', xp: 100, reward: { type: 'Key', name: 'Testnet Key', icon: KeyRound }, isCompleted: true, actionLabel: 'View Sync Status' },
  { id: 'share', title: 'Share Prediction on X', description: 'Share one of your Shadow predictions on X (Twitter).', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)', icon: Award }, isCompleted: false, actionLabel: 'Share on X' },
  { id: 'learn', title: 'Complete Learning Module', description: 'Finish the "Intro to ShadowScore" learning module.', xp: 60, reward: { type: 'NFT', name: 'Learner Badge NFT', icon: Gift }, isCompleted: true, actionLabel: 'View Module' },
];

export default function TasksTab() {
  const [tasks, setTasks] = useState(mockTasksData);

  const handleTaskAction = (taskId: string) => {
    // In a real app, this would navigate or trigger an API call.
    // For now, let's toggle completion for non-actionInProgress tasks for demo purposes.
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId && !task.actionInProgress && !task.isCompleted) {
          return { ...task, isCompleted: true, actionLabel: "Claimed!" }; // Example: Update label on completion
        }
        return task;
      })
    );
    // For actionInProgress tasks, this function would typically navigate.
    // For completed tasks, it might show reward details or navigate to where the reward is visible.
  };

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Daily Missions</CardTitle>
          <CardDescription>Complete tasks to earn XP and exclusive rewards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={cn(
                "overflow-hidden transition-all duration-300",
                task.isCompleted ? "opacity-80 glow-border-accent" : "glow-border-primary"
              )}
            >
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6 bg-card hover:bg-muted/30">
                <div className="flex items-start space-x-4 flex-grow">
                  <div className="mt-1">
                    {task.isCompleted ? (
                      <BadgeCheck className="w-7 h-7 text-green-500" />
                    ) : task.actionInProgress ? (
                      <CircleDashed className="w-7 h-7 text-primary animate-spin" />
                    ) : (
                      <Square className="w-7 h-7 text-primary/70" />
                    )}
                  </div>
                  <div>
                    <h3 className={cn("text-lg font-semibold font-headline", task.isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</h3>
                    <p className={cn("text-sm", task.isCompleted ? "text-muted-foreground/80" : "text-muted-foreground")}>{task.description}</p>
                    <div className="mt-2 flex items-center text-xs text-primary">
                      <Award className="w-3.5 h-3.5 mr-1.5" /> XP: {task.xp}
                      <span className="mx-2 text-border">|</span> 
                      <task.reward.icon className="w-3.5 h-3.5 mr-1.5 text-accent" /> Reward: {task.reward.name}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleTaskAction(task.id)}
                  variant={task.isCompleted ? "outline" : "default"} 
                  size="sm" 
                  disabled={task.isCompleted && task.actionLabel === "Claimed!"} // Disable if claimed
                  className={cn(
                    "font-code w-full md:w-auto shrink-0 transition-all", 
                    task.isCompleted 
                      ? "border-accent text-accent hover:bg-accent/10" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                    task.isCompleted && task.actionLabel === "Claimed!" ? "cursor-not-allowed opacity-70" : ""
                  )}
                >
                  {task.actionLabel}
                  {task.id === 'share' && !task.isCompleted && <Send className="w-3.5 h-3.5 ml-2" />}
                  {task.id === 'wallet' && !task.isCompleted && <Link2 className="w-3.5 h-3.5 ml-2" />}
                  {task.actionInProgress && !task.isCompleted && <Send className="w-3.5 h-3.5 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
