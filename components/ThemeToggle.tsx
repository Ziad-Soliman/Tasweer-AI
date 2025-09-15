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
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-5 h-5" />
        </button>
    );
};
