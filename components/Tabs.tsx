import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../App';

interface TabsProps {
    tabs: { key: string, label: string }[];
    children: (activeTab: string) => React.ReactNode;
}

const ICONS_MAP: { [key: string]: string } = {
    'History': 'history',
    'Brand': 'brand',
};

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full">
            <div className="border-b p-2">
                <nav className="flex space-x-1" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const iconName = ICONS_MAP[tab.key];

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`${
                                    activeTab === tab.key
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                } flex-1 whitespace-nowrap py-2 px-1 font-medium text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none rounded-md`}
                                aria-current={activeTab === tab.key ? 'page' : undefined}
                            >
                               {iconName && <Icon name={iconName} className="w-4 h-4"/>}
                               {tab.label}
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
