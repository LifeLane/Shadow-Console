"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Check, Gift, Loader2, SendSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getMissionsDataAction, completeMissionAction, type MissionData } from '@/app/airdrop/actions';

export default function AirdropTab({ isDbInitialized }: { isDbInitialized: boolean }) {
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
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete mission.", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  const completedCount = useMemo(() => missions.filter(m => m.isCompleted).length, [missions]);
  const totalCount = missions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="text-primary flex items-center text-2xl"><Gift className="mr-3" /> Airdrop & Missions</CardTitle>
          <CardDescription>Complete quests to earn XP, SHADOW tokens, and exclusive NFT rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span>{completedCount} / {totalCount} Completed</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
          </div>

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
                                <div className="text-xs text-primary mt-1">Reward: +{mission.reward.amount} {mission.reward.type} / +{mission.xp} XP</div>
                            </div>
                            <Button 
                                onClick={() => handleCompleteMission(mission.id)}
                                disabled={isCompleted || isCompleting}
                                className={cn(isCompleted ? "bg-green-500/80" : "bg-accent hover:bg-accent/90")}
                            >
                                {isCompleting ? <Loader2 className="animate-spin"/> : isCompleted ? <Check/> : <SendSquare/>}
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
