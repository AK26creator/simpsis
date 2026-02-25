import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import RippleEffect from './RippleEffect';
import { useEffect, useState } from 'react';

interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
}

interface BottomNavigationProps {
    items: NavItem[];
}

const BottomNavigation = ({ items }: BottomNavigationProps) => {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const isActive = (path: string) => {
        if (path === '/app' || path === '/admin') {
            return currentPath === path;
        }
        return currentPath.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 px-2 pb-safe font-sans">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {items.slice(0, 5).map((item) => (
                    <a
                        key={item.path}
                        href={item.path}
                        className={clsx(
                            'flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors relative overflow-hidden h-full',
                            isActive(item.path)
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-primary-600'
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        <RippleEffect color="rgba(40, 85, 154, 0.2)" />
                    </a>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavigation;
