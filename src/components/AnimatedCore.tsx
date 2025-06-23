
"use client";
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

const AnimatedCore = () => {
    return (
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* Orbiting particles */}
            <div 
                className="orbiting-particle" 
                style={{ width: '8px', height: '8px', animation: 'orbit 4s linear infinite' }}
            />
            <div 
                className="orbiting-particle" 
                style={{ width: '12px', height: '12px', animation: 'orbit-reverse 6s linear infinite' }}
            />
             <div 
                className="orbiting-particle" 
                style={{ width: '6px', height: '6px', animation: 'orbit 8s linear infinite reverse' }}
            />

            {/* Central glowing core */}
            <div className={cn(
                "w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center animated-core",
                "border-2 border-primary"
            )}>
                <BrainCircuit className="w-16 h-16 text-primary animate-pulse-opacity" />
            </div>
        </div>
    );
};

export default AnimatedCore;
