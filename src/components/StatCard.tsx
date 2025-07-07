"use client";

import { cn } from '@/lib/utils';
import React from 'react';

const StatCard = ({ icon: Icon, label, value, valuePrefix = '', valueSuffix = '', valueClassName = '' }: { icon: React.ElementType, label: string, value: string | number, valuePrefix?: string, valueSuffix?: string, valueClassName?: string }) => (
    <div className="bg-muted/40 p-3 rounded-lg flex flex-col space-y-1">
        <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <p className="text-xs font-medium whitespace-nowrap">{label}</p>
        </div>
        <p className={cn("text-lg font-bold font-code", valueClassName)}>
            {valuePrefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {valueSuffix}
        </p>
    </div>
);

export default StatCard;
