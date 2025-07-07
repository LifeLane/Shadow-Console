
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Send, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getMissionsDataAction, completeMissionAction, type MissionData } from '@/app/tasks/actions';

export default function TasksTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadMissions() {
      if (!isDbInitialized) return;
      setIsLoading(true);
      try {
        const missionsData = await getMissionsDataAction();
        setMissions(missionsData);
      } catch (error) {
        toast({ title: "Error", description: "Could not load missions data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadMissions();
  }, [isDbInitialized, toast]);

  const handleCompleteMission = async (missionId: string) => {
    setCompletingId(missionId);
    try {
      const completedMission = await completeMissionAction(missionId);
      setMissions(prevMissions =>
        prevMissions.map(m => m.mission.id === missionId ? { ...m, isCompleted: true } : m)
      );
      toast({
        title: `Mission Accomplished!`,
        description: `You've earned ${completedMission.xp} XP and ${completedMission.reward.amount} ${completedMission.reward.type}.`,
        className: "bg-accent text-accent-foreground border-primary"
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete mission.", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center text-2xl"><ListChecks className="mr-3" /> Daily Tasks</CardTitle>
          <CardDescription>Complete daily tasks to earn XP, SHADOW tokens, and climb the leaderboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : (
                missions.map(({ mission, isCompleted }) => {
                    const isCompleting = completingId === mission.id;
                    return (
                        <Card key={mission.id} className={cn("p-4 flex items-center justify-between transition-all", isCompleted && "bg-muted/30 opacity-70")}>
                            <div className="flex-1 mr-4">
                                <h3 className={cn("font-semibold text-lg", isCompleted && "line-through")}>{mission.title}</h3>
                                <p className="text-sm text-muted-foreground">{mission.description}</p>
                                <div className="text-xs text-accent mt-1 font-bold">Reward: +{mission.reward.amount} {mission.reward.type} / +{mission.xp} XP</div>
                            </div>
                            <Button 
                                onClick={() => handleCompleteMission(mission.id)}
                                disabled={isCompleted || isCompleting}
                                variant={isCompleted ? "secondary" : "default"}
                                className={cn(!isCompleted && "bg-accent hover:bg-accent/90 text-accent-foreground")}
                            >
                                {isCompleting ? <Loader2 className="animate-spin"/> : isCompleted ? <Check/> : <Send/>}
                            </Button>
                        </Card>
                    )
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
