import { useRef } from 'react';
import { useRipple } from '../../hooks/useRipple';

interface RippleEffectProps {
    color?: string;
}

const RippleEffect = ({ color = 'rgba(255, 255, 255, 0.3)' }: RippleEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { ripples, removeRipple } = useRipple(containerRef as React.RefObject<HTMLElement>);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple-effect"
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size,
                        backgroundColor: color,
                    }}
                    onAnimationEnd={() => removeRipple(ripple.id)}
                />
            ))}
        </div>
    );
};

export default RippleEffect;
