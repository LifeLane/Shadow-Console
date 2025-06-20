
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onComplete?: () => void;
  showCaret?: boolean;
  caretClassName?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className,
  as: Element = 'p',
  onComplete,
  showCaret = true,
  caretClassName,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  return (
    <Element className={cn("whitespace-pre-wrap break-words font-code", className)}>
      {displayedText.split('').map((char, index) => (
        <span key={index} className="typewriter-char" style={{ animationDelay: `${index * (speed / 1000)}s` }}>
          {char}
        </span>
      ))}
      {showCaret && !isComplete && (
         <span className={cn(
           "inline-block w-[1ch] h-[1.2em] ml-0.5",
           caretClassName || "bg-accent animate-blink-caret" // Use provided caret class or default
         )} style={{ animationDelay: `${currentIndex * (speed / 1000) + 0.1}s` }}></span>
      )}
    </Element>
  );
};

export default TypewriterText;
