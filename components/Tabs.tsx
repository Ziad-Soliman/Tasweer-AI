import React, { useState } from 'react';
import { Icon } from './Icon';

interface TabsProps {
    tabs: string[];
    children: (activeTab: string) => React.ReactNode;
}

const ICONS_MAP: { [key: string]: string } = {
    'Generate': 'cog',
    'History': 'history',
    'Brand': 'brand',
};

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <div className="flex flex-col h-full">
            <div className="border-b p-2">
                <nav className="flex space-x-1" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const baseName = tab.split(' ')[0];
                        const iconName = ICONS_MAP[baseName];

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                } flex-1 whitespace-nowrap py-2 px-1 font-medium text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none rounded-md`}
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
