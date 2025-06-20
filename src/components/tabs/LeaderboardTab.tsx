
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Eye, Award as RankIcon, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';

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
  { id: '1', rank: 1, name: 'CryptoKingX', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 9200, missionsCompleted: 50, airdropContribution: 12000, tags: ['🔮 Signal Oracle', '⚡ Chain Whisperer'] },
  { id: '2', rank: 2, name: 'NovaTrader7', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 8800, missionsCompleted: 45, airdropContribution: 9500, tags: ['⚡ Chain Whisperer'] },
  { id: '3', rank: 3, name: 'ShadowScout', accuracy: 8500, missionsCompleted: 40, airdropContribution: 8000, tags: ['🔮 Signal Oracle'] },
  { id: '4', rank: 4, name: 'PixelProphet', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 8200, missionsCompleted: 38, airdropContribution: 7500, tags: [] },
  { id: '5', rank: 5, name: 'ByteBard', accuracy: 7900, missionsCompleted: 35, airdropContribution: 6000, tags: ['⚡ Chain Whisperer'] },
];

export default function LeaderboardTab() {
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    setDescriptionKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
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
          {mockLeaderboardData.map((user, index) => (
            <Card 
              key={user.id} 
              className={cn(
                "shadow-lg rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 transform", 
                index < 3 ? 'glow-border-accent scale-[1.01] hover:scale-[1.03]' : 'border-border hover:scale-[1.01] hover:shadow-primary/30'
              )}
            >
              <CardContent className={cn(
                "p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 bg-card hover:bg-muted/50 transition-colors duration-200",
                index < 3 ? "bg-card/90" : ""
              )}>
                <div className={cn("flex flex-col items-center shrink-0 w-10 sm:w-12", index < 3 ? "text-accent" : "text-primary")}>
                  {index < 3 && <RankIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />}
                  <span className={cn("font-bold", index < 3 ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl")}>{user.rank}</span>
                </div>
                <Avatar className={cn("h-10 w-10 sm:h-14 sm:w-14 border-2 shrink-0", index < 3 ? "border-accent" : "border-primary")}>
                  <AvatarImage 
                    src={user.avatarUrl}
                    data-ai-hint="profile avatar" 
                    alt={user.name}
                  />
                  <AvatarFallback className="text-sm sm:text-lg bg-muted text-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold font-headline text-foreground truncate">{user.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                    {user.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={tag.includes('Oracle') ? 'default' : 'secondary'} 
                        className={cn(
                          tag.includes('Oracle') ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground', 
                          'font-code text-[0.6rem] sm:text-xs px-1.5 sm:px-2 py-0.5',
                          index < 3 && tag.includes('Oracle') ? 'shadow-md shadow-primary/50' : '',
                          index < 3 && !tag.includes('Oracle') ? 'shadow-md shadow-accent/50' : ''
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-0.5 text-[0.65rem] sm:text-xs hidden md:block shrink-0 min-w-[120px]">
                  <p className="flex items-center justify-end text-muted-foreground"><Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-primary/80" /> Shadow XP: <span className="font-semibold ml-1 text-foreground">{user.accuracy}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-orange-500" /> Missions: <span className="font-semibold ml-1 text-foreground">{user.missionsCompleted}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-yellow-500" /> Airdrop Pts: <span className="font-semibold ml-1 text-foreground">{user.airdropContribution}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
