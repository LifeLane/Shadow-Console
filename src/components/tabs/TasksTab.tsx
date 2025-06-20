
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, BadgeCheck, Send, Link2, Award, Gift, KeyRound, BookOpen, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  reward: { type: 'NFT' | 'Key' | 'XP_Boost' | 'Badge'; name: string; icon: React.ElementType };
  isCompleted: boolean;
  actionLabel: string;
  completedLabel?: string;
  actionIcon?: React.ElementType;
}

const initialTasksData: Task[] = [
  { id: 'signal', title: 'Submit 1 Signal Test', description: 'Use the Market Command Console to generate and analyze a signal.', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT', icon: Gift }, isCompleted: false, actionLabel: 'Go to Console', completedLabel: "Claimed!", actionIcon: Send },
  { id: 'wallet', title: 'Sync Wallet with Polygon Bridge', description: 'Connect your wallet and perform a test sync via Polygon.', xp: 100, reward: { type: 'Key', name: 'Testnet Key', icon: KeyRound }, isCompleted: false, actionLabel: 'Sync Wallet', completedLabel: "Synced!", actionIcon: Link2 },
  { id: 'share', title: 'Share Prediction on X', description: 'Share one of your Shadow predictions on X (Twitter).', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)', icon: Award }, isCompleted: false, actionLabel: 'Share on X', completedLabel: "Shared!", actionIcon: Send },
  { id: 'learn', title: 'Complete Learning Module', description: 'Finish the "Intro to ShadowScore" learning module.', xp: 60, reward: { type: 'Badge', name: 'Learner Badge', icon: BookOpen }, isCompleted: false, actionLabel: 'Start Module', completedLabel: "Module Done!", actionIcon: BookOpen },
];

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>(initialTasksData);
  const { toast } = useToast();

  const handleTaskAction = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId && !task.isCompleted) {
          toast({
            title: `Task "${task.title}" Completed!`,
            description: `You've earned ${task.xp} XP and a ${task.reward.name}.`,
          });
          return { ...task, isCompleted: true };
        }
        return task;
      })
    );
  };

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Daily Missions</CardTitle>
          <CardDescription>Complete tasks to earn XP and exclusive rewards. (Simulated Actions)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {tasks.map((task) => {
            const ActionIcon = task.actionIcon;
            return (
              <Card 
                key={task.id} 
                className={cn(
                  "overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg",
                  task.isCompleted ? "opacity-80 glow-border-accent hover:shadow-accent/40" : "glow-border-primary hover:shadow-primary/40"
                )}
              >
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6 bg-card hover:bg-muted/30 transition-colors duration-200">
                  <div className="flex items-start space-x-4 flex-grow">
                    <div className="mt-1">
                      {task.isCompleted ? (
                        <BadgeCheck className="w-7 h-7 text-green-500" />
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
                    disabled={task.isCompleted}
                    className={cn(
                      "font-code w-full md:w-auto shrink-0 transition-all duration-300 transform hover:scale-105", 
                      task.isCompleted 
                        ? "border-accent text-accent hover:bg-accent/10 hover:text-accent cursor-default" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                       task.isCompleted ? "cursor-not-allowed opacity-80" : ""
                    )}
                  >
                    {task.isCompleted ? (task.completedLabel || "Completed") : task.actionLabel}
                    {!task.isCompleted && ActionIcon && <ActionIcon className="w-3.5 h-3.5 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

    