"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Eye, Award as RankIcon, Trophy, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';
import { getLeaderboardAction } from '@/app/leaderboard/actions';
import type { User } from '@/lib/types';

interface LeaderboardUser extends User {
    rank: number;
    isBot?: boolean;
    tags?: string[];
}

const getRankGlowClass = (rank: number) => {
    switch (rank) {
        case 1: return 'shadow-yellow-400/50 glow-border-yellow-400';
        case 2: return 'shadow-gray-400/50 glow-border-gray-400';
        case 3: return 'shadow-orange-400/50 glow-border-orange-400';
        default: return 'border-border hover:scale-[1.01] hover:shadow-primary/30';
    }
};

const getRankAvatarClass = (rank: number) => {
    switch (rank) {
        case 1: return 'border-yellow-400';
        case 2: return 'border-gray-400';
        case 3: return 'border-orange-400';
        default: return 'border-primary';
    }
};


export default function LeaderboardTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    async function loadLeaderboard() {
        if (!isDbInitialized) return;
        setIsLoading(true);
        try {
            const users = await getLeaderboardAction();
            const rankedUsers = users.map((user, index) => ({
                ...user,
                rank: index + 1,
                tags: user.xp > 8000 ? ['🔮 Signal Oracle'] : user.xp > 5000 ? ['⚡ Chain Whisperer'] : []
            }));
            setLeaderboard(rankedUsers);
        } catch (error) {
            console.error("Failed to load leaderboard", error);
        } finally {
            setIsLoading(false);
            setDescriptionKey(prev => prev + 1);
        }
    }
    loadLeaderboard();
  }, [isDbInitialized]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Loading Top Agent Rankings...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Trophy className="h-7 w-7 sm:h-8 sm:h-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Top Shadow Agents</CardTitle>
              <TypewriterText 
                key={`desc-leaderboard-${descriptionKey}`}
                text="Ranking of agents based on their Shadow XP, mission success, and contributions to the Shadow Core. Climb the ranks to earn greater airdrop rewards!" 
                className="text-xs sm:text-sm text-muted-foreground mt-1"
                speed={15}
                showCaret={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {leaderboard.map((user, index) => (
            <Card 
              key={user.id} 
              className={cn(
                "shadow-lg rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 transform scale-100 hover:scale-[1.02]", 
                getRankGlowClass(user.rank)
              )}
            >
              <CardContent className={cn(
                "p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 bg-card hover:bg-muted/50 transition-colors duration-200"
              )}>
                <div className={cn("flex flex-col items-center shrink-0 w-10 sm:w-12", getRankAvatarClass(user.rank))}>
                  {user.rank <= 3 && <RankIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />}
                  <span className={cn("font-bold", user.rank <= 3 ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl")}>{user.rank}</span>
                </div>
                <Avatar className={cn("h-10 w-10 sm:h-14 sm:w-14 border-2 shrink-0", getRankAvatarClass(user.rank))}>
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} data-ai-hint="profile avatar" alt={user.name} />}
                  <AvatarFallback className="text-sm sm:text-lg bg-muted text-foreground">
                    {user.isBot ? <Bot className="w-6 h-6" /> : user.name!.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold font-headline text-foreground truncate flex items-center">
                      {user.name}
                      {user.isBot && <Badge variant="secondary" className="ml-2 text-xs">Bot</Badge>}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                    {user.tags?.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={tag.includes('Oracle') ? 'default' : 'secondary'} 
                        className={cn(
                          tag.includes('Oracle') ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground', 
                          'font-code text-[0.6rem] sm:text-xs px-1.5 sm:px-2 py-0.5',
                          user.rank <= 3 && tag.includes('Oracle') ? 'shadow-md shadow-primary/50' : '',
                          user.rank <= 3 && !tag.includes('Oracle') ? 'shadow-md shadow-accent/50' : ''
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-0.5 text-[0.65rem] sm:text-xs hidden md:block shrink-0 min-w-[120px]">
                  <p className="flex items-center justify-end text-muted-foreground"><Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-primary/80" /> Shadow XP: <span className="font-semibold ml-1 text-foreground">{user.xp.toLocaleString()}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-orange-500" /> Signals: <span className="font-semibold ml-1 text-foreground">{user.signalsGenerated}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-yellow-500" /> Airdrop Pts: <span className="font-semibold ml-1 text-foreground">{user.bsaiEarned.toLocaleString()}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
