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
            <div className="border-b">
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
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors focus:outline-none`}
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
