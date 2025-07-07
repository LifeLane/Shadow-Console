
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

const StatCard = ({ icon: Icon, label, value, valuePrefix = '', valueSuffix = '', valueClassName = '' }: { icon: React.ElementType, label: string, value: string | number, valuePrefix?: string, valueSuffix?: string, valueClassName?: string }) => (
    <Card className="bg-card/70">
        <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
            </div>
            <p className={cn("text-xl sm:text-2xl font-bold font-code", valueClassName)}>
                {valuePrefix}
                {typeof value === 'number' ? value.toLocaleString() : value}
                {valueSuffix}
            </p>
        </CardContent>
    </Card>
);

export default StatCard;
