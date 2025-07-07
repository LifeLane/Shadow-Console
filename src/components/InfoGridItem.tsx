
"use client";

import { cn } from '@/lib/utils';
import React from 'react';

const InfoGridItem = ({ label, value, icon: Icon, valueClassName }: { label: string; value: React.ReactNode; icon?: React.ElementType; valueClassName?: string }) => (
    <div className="flex flex-col p-2 rounded-lg bg-muted/40">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            {Icon && <Icon className="h-3 w-3" />}
            <span>{label}</span>
        </div>
        <div className={cn("text-base sm:text-lg font-bold font-code text-foreground", valueClassName)}>
            {value}
        </div>
    </div>
);

export default InfoGridItem;
