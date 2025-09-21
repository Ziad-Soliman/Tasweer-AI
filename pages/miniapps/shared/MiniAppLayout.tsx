

import React from 'react';
import { Icon } from '../../../components/Icon';
import { useTranslation } from '../../../App';

interface MiniAppLayoutProps {
  children: React.ReactNode;
  controls?: React.ReactNode;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const MiniAppLayout: React.FC<MiniAppLayoutProps> = ({ controls, children, title, description, onBack }) => {
  const { t } = useTranslation();

  if (controls) {
    return (
      <main className="flex-1 flex md:flex-row flex-col min-h-0 h-full animate-fade-in">
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 border-e p-4 md:p-6 overflow-y-auto bg-card">
          {controls}
        </aside>
        <div className="flex-1 min-h-0 relative">
          {children}
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-4 mb-8">
                {onBack && (
                    <button 
                        onClick={onBack} 
                        className="p-2 rounded-md hover:bg-accent text-muted-foreground flex-shrink-0 mt-1"
                        aria-label={t('backToMiniApps')}
                    >
                        <Icon name="arrow-left" className="w-5 h-5" />
                    </button>
                )}
                <div>
                    {title && <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
                    {description && <p className="mt-2 text-md text-muted-foreground">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    </main>
  );
};

export default MiniAppLayout;