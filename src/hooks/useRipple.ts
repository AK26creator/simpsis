import { useState, useLayoutEffect } from 'react';

interface Ripple {
    x: number;
    y: number;
    size: number;
    id: number;
}

export const useRipple = (ref: React.RefObject<HTMLElement>) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleClick = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const newRipple = {
                x,
                y,
                size,
                id: Date.now(),
            };

            setRipples((prev) => [...prev, newRipple]);
        };

        element.addEventListener('mousedown', handleClick);
        return () => element.removeEventListener('mousedown', handleClick);
    }, [ref]);

    const removeRipple = (id: number) => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    };

    return { ripples, removeRipple };
};
