
"use client";

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AnimatedAvatarProps {
    name: string;
    className?: string;
}

const AnimatedAvatar = ({ name, className }: AnimatedAvatarProps) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

    const variants = {
        initial: { opacity: 0, scale: 0.5, rotate: -10 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.5, rotate: 10 },
    };

    return (
        <Avatar className={cn(className)}>
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                <motion.div
                    key={firstLetter}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    {firstLetter}
                </motion.div>
            </AvatarFallback>
        </Avatar>
    );
};

export default AnimatedAvatar;
