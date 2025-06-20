"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Eye } from 'lucide-react'; // Using different icons for variety
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
            <Card key={user.id} className={`shadow-lg rounded-xl overflow-hidden ${index < 3 ? 'glow-border-accent' : 'border-border'}`}>
              <CardContent className="p-6 flex items-center space-x-6 bg-card hover:bg-muted/50 transition-colors duration-200">
                <span className={`text-4xl font-bold ${index < 3 ? 'text-accent' : 'text-primary'}`}>{user.rank}</span>
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="profile avatar" />
                  <AvatarFallback className="text-xl bg-muted text-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold font-headline text-foreground">{user.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.tags.map(tag => (
                      <Badge key={tag} variant={tag.includes('Oracle') ? 'default' : 'secondary'} className={cn(tag.includes('Oracle') ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground', 'font-code text-xs')}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1 text-sm">
                  <p className="flex items-center justify-end"><Eye className="w-4 h-4 mr-1.5 text-primary/80" /> Accuracy: <span className="font-semibold ml-1">{user.accuracy}%</span></p>
                  <p className="flex items-center justify-end"><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> Missions: <span className="font-semibold ml-1">{user.missionsCompleted}</span></p>
                  <p className="flex items-center justify-end"><Zap className="w-4 h-4 mr-1.5 text-yellow-500" /> Contribution: <span className="font-semibold ml-1">{user.airdropContribution}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
