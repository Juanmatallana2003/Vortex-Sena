"use client";

// components/ProfileMenu.tsx
"use client";
import React, { useEffect, useRef } from 'react';

interface ProfileMenuProps {
    onClose: () => void;
    onSignOut: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    triggerRef?: React.RefObject<HTMLElement | null>;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onSignOut, theme, onToggleTheme, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, triggerRef]);

    return (
        <div
            ref={menuRef}
            className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 animate-scale-in overflow-hidden origin-top-right"
        >
            <div className="p-1 space-y-1">
                <button
                    onClick={onToggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
                        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-neutral-400'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }}></div>
                    </div>
                </button>
                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1"></div>
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );
};
