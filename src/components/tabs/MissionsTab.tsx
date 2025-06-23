
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Square, BadgeCheck, Send, Link2, Award, Gift, KeyRound, BookOpen, Sparkles, CheckCircle, ListChecks, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';
import { getMissionsData, completeMissionAction, type MissionData } from '@/app/missions/actions';
import type { Mission } from '@/lib/types';

// Map mission IDs to icons
const rewardIcons: { [key: string]: React.ElementType } = {
  signal: Gift,
  wallet: KeyRound,
  share: Award,
  learn: BookOpen,
  daily_login: Sparkles,
};

export default function MissionsTab() {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    async function loadMissions() {
      setIsLoading(true);
      try {
        const missionsData = await getMissionsData();
        setMissions(missionsData);
      } catch (error) {
        toast({ title: "Error", description: "Could not load missions data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
        setDescriptionKey(prev => prev + 1);
      }
    }
    loadMissions();
  }, [toast]);

  const handleTaskAction = async (missionId: string) => {
    setCompletingId(missionId);
    try {
      const completedMission = await completeMissionAction(missionId);
      
      setMissions(prevMissions =>
        prevMissions.map(m => m.mission.id === missionId ? { ...m, isCompleted: true } : m)
      );

      toast({
        title: `Mission Accomplished!`,
        description: `You've earned ${completedMission.xp} XP and a ${completedMission.reward.name}. Your efforts strengthen the Shadow Core!`,
      });
      setDescriptionKey(prev => prev + 1);
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete mission.", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  const completedTasksCount = useMemo(() => missions.filter(task => task.isCompleted).length, [missions]);
  const totalTasksCount = missions.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Mission Intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ListChecks className="h-7 w-7 sm:h-8 sm:h-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Agent Missions Hub</CardTitle>
              <TypewriterText 
                key={`desc-missions-${descriptionKey}`}
                text="Undertake missions to earn XP, exclusive rewards, and Airdrop Multipliers. Each completed mission helps train the Shadow Core." 
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
            {missions.map(({ mission, isCompleted }) => {
              const ActionIcon = mission.id === 'wallet' ? Link2 : Send; // Simplified logic
              const RewardIcon = rewardIcons[mission.id] || Gift;
              const isCompleting = completingId === mission.id;

              return (
                <Card 
                  key={mission.id} 
                  className={cn(
                    "overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg",
                    isCompleted 
                      ? "opacity-80 glow-border-accent hover:shadow-accent/40" 
                      : "glow-border-primary hover:shadow-primary/40"
                  )}
                >
                  <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 bg-card hover:bg-muted/30 transition-colors duration-200">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-grow">
                      <div className="mt-1 shrink-0">
                        {isCompleted ? (
                          <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                        ) : (
                          <Square className="w-6 h-6 sm:w-7 sm:h-7 text-primary/70" />
                        )}
                      </div>
                      <div className="min-w-0"> 
                        <h3 className={cn(
                          "text-base sm:text-lg font-semibold font-headline", 
                          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        )}>{mission.title}</h3>
                        <TypewriterText 
                          key={`desc-task-${mission.id}-${descriptionKey}`}
                          text={mission.description}
                          className={cn("text-xs sm:text-sm", isCompleted ? "text-muted-foreground/80" : "text-muted-foreground")}
                          speed={10}
                          showCaret={false}
                        />
                        <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center text-xs flex-wrap gap-x-3 gap-y-1">
                          <span className={cn("flex items-center", isCompleted ? "text-muted-foreground" : "text-primary")}>
                            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> XP: {mission.xp}
                          </span>
                          <span className={cn("flex items-center", isCompleted ? "text-muted-foreground" : "text-primary")}>
                            <RewardIcon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5", isCompleted ? "text-accent/70" : "text-accent")} /> Reward: {mission.reward.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleTaskAction(mission.id)}
                      variant={isCompleted ? "outline" : "default"} 
                      size="sm" 
                      disabled={isCompleted || isCompleting}
                      className={cn(
                        "font-code w-full md:w-auto shrink-0 transition-all duration-300 transform hover:scale-105 py-2 px-3 text-xs sm:text-sm", 
                        isCompleted 
                          ? "border-accent text-accent hover:bg-accent/10 hover:text-accent cursor-default opacity-80" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isCompleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isCompleted ? "Mission Complete!" : "Complete Mission"}
                      {!isCompleted && !isCompleting && <ActionIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 sm:ml-2" />}
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
