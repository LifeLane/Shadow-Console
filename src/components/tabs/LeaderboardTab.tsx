
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Eye, Award as RankIcon, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  accuracy: number; // Contribution Score (Shadow XP)
  missionsCompleted: number; // Missions for Shadow Core
  airdropContribution: number; // Airdrop Points
  tags: string[];
}

const mockLeaderboardData: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'CryptoKing', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 9200, missionsCompleted: 50, airdropContribution: 12000, tags: ['🔮 Signal Oracle', '⚡ Chain Whisperer'] },
  { id: '2', rank: 2, name: 'NovaTrader', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 8800, missionsCompleted: 45, airdropContribution: 9500, tags: ['⚡ Chain Whisperer'] },
  { id: '3', rank: 3, name: 'ShadowScout', accuracy: 8500, missionsCompleted: 40, airdropContribution: 8000, tags: ['🔮 Signal Oracle'] },
  { id: '4', rank: 4, name: 'PixelProphet', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 8200, missionsCompleted: 38, airdropContribution: 7500, tags: [] },
  { id: '5', rank: 5, name: 'ByteBard', accuracy: 7900, missionsCompleted: 35, airdropContribution: 6000, tags: ['⚡ Chain Whisperer'] },
];

export default function LeaderboardTab() {
  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl text-primary">Top Shadow Agents</CardTitle>
              <CardDescription>Ranking of agents based on their Shadow XP, mission success, and contributions to the Shadow Core. Climb the ranks to earn greater airdrop rewards!</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockLeaderboardData.map((user, index) => (
            <Card 
              key={user.id} 
              className={cn(
                "shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform", 
                index < 3 ? 'glow-border-accent scale-[1.02] hover:scale-[1.04]' : 'border-border hover:scale-[1.01] hover:shadow-primary/30'
              )}
            >
              <CardContent className={cn(
                "p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 md:space-x-6 bg-card hover:bg-muted/50 transition-colors duration-200",
                index < 3 ? "bg-card/90" : ""
              )}>
                <div className={cn("flex flex-col items-center shrink-0", index < 3 ? "text-accent" : "text-primary")}>
                  {index < 3 && <RankIcon className="w-6 h-6 sm:w-7 sm:h-7 mb-1" />}
                  <span className={cn("font-bold", index < 3 ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>{user.rank}</span>
                </div>
                <Avatar className={cn("h-12 w-12 sm:h-16 sm:w-16 border-2 shrink-0", index < 3 ? "border-accent" : "border-primary")}>
                  <AvatarImage 
                    src={user.avatarUrl}
                    data-ai-hint="profile avatar" 
                    alt={user.name}
                  />
                  <AvatarFallback className="text-lg sm:text-xl bg-muted text-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0"> {/* Added min-w-0 for flex truncation */}
                  <h3 className="text-lg sm:text-xl font-semibold font-headline text-foreground truncate">{user.name}</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                    {user.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={tag.includes('Oracle') ? 'default' : 'secondary'} 
                        className={cn(
                          tag.includes('Oracle') ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground', 
                          'font-code text-xs px-2 py-0.5',
                          index < 3 && tag.includes('Oracle') ? 'shadow-md shadow-primary/50' : '',
                          index < 3 && !tag.includes('Oracle') ? 'shadow-md shadow-accent/50' : ''
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1 text-xs sm:text-sm hidden md:block shrink-0">
                  <p className="flex items-center justify-end text-muted-foreground"><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-primary/80" /> Shadow XP: <span className="font-semibold ml-1 text-foreground">{user.accuracy}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-orange-500" /> Missions: <span className="font-semibold ml-1 text-foreground">{user.missionsCompleted}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-yellow-500" /> Airdrop Pts: <span className="font-semibold ml-1 text-foreground">{user.airdropContribution}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

    