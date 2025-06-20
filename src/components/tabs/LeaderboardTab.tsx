
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Eye, Award as RankIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  accuracy: number;
  missionsCompleted: number;
  airdropContribution: number;
  tags: string[];
}

const mockLeaderboardData: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'CryptoKing', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 92, missionsCompleted: 50, airdropContribution: 1200, tags: ['🔮 Signal Oracle', '⚡ Chain Whisperer'] },
  { id: '2', rank: 2, name: 'NovaTrader', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 88, missionsCompleted: 45, airdropContribution: 950, tags: ['⚡ Chain Whisperer'] },
  { id: '3', rank: 3, name: 'ShadowScout', accuracy: 85, missionsCompleted: 40, airdropContribution: 800, tags: ['🔮 Signal Oracle'] },
  { id: '4', rank: 4, name: 'PixelProphet', avatarUrl: 'https://placehold.co/100x100.png', accuracy: 82, missionsCompleted: 38, airdropContribution: 750, tags: [] },
  { id: '5', rank: 5, name: 'ByteBard', accuracy: 79, missionsCompleted: 35, airdropContribution: 600, tags: ['⚡ Chain Whisperer'] },
];

export default function LeaderboardTab() {
  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Leaderboard</CardTitle>
          <CardDescription>Top synced minds paving the future of trading.</CardDescription>
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
                "p-6 flex items-center space-x-4 md:space-x-6 bg-card hover:bg-muted/50 transition-colors duration-200",
                index < 3 ? "bg-card/90" : ""
              )}>
                <div className={cn("flex flex-col items-center", index < 3 ? "text-accent" : "text-primary")}>
                  {index < 3 && <RankIcon className="w-7 h-7 mb-1" />}
                  <span className={cn("font-bold", index < 3 ? "text-5xl" : "text-4xl")}>{user.rank}</span>
                </div>
                <Avatar className={cn("h-16 w-16 border-2", index < 3 ? "border-accent" : "border-primary")}>
                  <AvatarImage 
                    src={user.avatarUrl || `https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} 
                    alt={user.name}
                    data-ai-hint="profile avatar" 
                  />
                  <AvatarFallback className="text-xl bg-muted text-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold font-headline text-foreground">{user.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={tag.includes('Oracle') ? 'default' : 'secondary'} 
                        className={cn(
                          tag.includes('Oracle') ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground', 
                          'font-code text-xs',
                          index < 3 && tag.includes('Oracle') ? 'shadow-md shadow-primary/50' : '',
                          index < 3 && !tag.includes('Oracle') ? 'shadow-md shadow-accent/50' : ''
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1 text-sm hidden md:block">
                  <p className="flex items-center justify-end text-muted-foreground"><Eye className="w-4 h-4 mr-1.5 text-primary/80" /> Accuracy: <span className="font-semibold ml-1 text-foreground">{user.accuracy}%</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> Missions: <span className="font-semibold ml-1 text-foreground">{user.missionsCompleted}</span></p>
                  <p className="flex items-center justify-end text-muted-foreground"><Zap className="w-4 h-4 mr-1.5 text-yellow-500" /> Contribution: <span className="font-semibold ml-1 text-foreground">{user.airdropContribution}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
