import React from 'react';
import { Icon } from '../../../components/Icon';
import { useTranslation } from '../../../App';


interface MiniAppLayoutProps {
  title: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
}

const MiniAppLayout: React.FC<MiniAppLayoutProps> = ({ title, description, onBack, children }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="p-4 border-b border-border/80 flex items-center gap-4 flex-shrink-0">
        <button 
            onClick={onBack} 
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
            aria-label={t('backToMiniApps')}
        >
          <Icon name="arrow-left" className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MiniAppLayout;
