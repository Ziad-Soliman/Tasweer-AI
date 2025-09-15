import React, { useState } from 'react';
import { Icon } from './Icon';

interface TabsProps {
    tabs: string[];
    children: (activeTab: string) => React.ReactNode;
}

const ICONS_MAP: { [key: string]: string } = {
    'Generate': 'cog',
    'History': 'history',
};

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const baseName = tab.split(' ')[0];
                        const iconName = ICONS_MAP[baseName];

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                                aria-current={activeTab === tab ? 'page' : undefined}
                            >
                               {iconName && <Icon name={iconName} className="w-4 h-4"/>}
                               {tab}
                            </button>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                {children(activeTab)}
            </div>
        </div>
    );
};
