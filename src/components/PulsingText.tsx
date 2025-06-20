"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PulsingTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const PulsingText: React.FC<PulsingTextProps> = ({
  text,
  className,
  as: Element = 'p',
}) => {
  return (
    <Element className={cn("animate-pulse-opacity", className)}>
      {text}
    </Element>
  );
};

export default PulsingText;
