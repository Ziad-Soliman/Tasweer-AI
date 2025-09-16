import React from 'react';
import { Theme } from '../types';
import { Icon } from './Icon';

interface ThemeToggleProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 bg-secondary hover:bg-accent text-secondary-foreground"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-5 h-5" />
        </button>
    );
};
