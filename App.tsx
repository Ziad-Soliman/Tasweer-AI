import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { ProductGenerationPage } from './pages/ProductGenerationPage';
import { MiniAppsPage } from './pages/MiniAppsPage';
import { ClassicGenerationPage } from './pages/ClassicGenerationPage';
import { LogoConceptualizationPage } from './pages/LogoConceptualizationPage';
import { AITextureEnhancerPage } from './pages/AITextureEnhancerPage';
import { Icon } from './components/Icon';
import { translations } from './lib/translations';
import { HistoryItem } from './types';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en, replacements?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
});

export const useTranslation = () => useContext(LanguageContext);


type Page = 'product-generation' | 'mini-apps' | 'classic-generation' | 'logo-conceptualization' | 'ai-texture-enhancer';

interface PageConfig {
    id: Page;
    titleKey: keyof typeof translations.en;
    component: React.ComponentType<any>;
}

const pageConfigs: PageConfig[] = [
    { id: 'product-generation', titleKey: 'productGeneration', component: ProductGenerationPage },
    { id: 'mini-apps', titleKey: 'miniApps', component: MiniAppsPage },
    { id: 'classic-generation', titleKey: 'classicGeneration', component: ClassicGenerationPage },
    { id: 'logo-conceptualization', titleKey: 'logoConceptualization', component: LogoConceptualizationPage },
    { id: 'ai-texture-enhancer', titleKey: 'aiTextureEnhancer', component: AITextureEnhancerPage },
];

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('product-generation');
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const { language, setLanguage, t } = useTranslation();

    // Centralized history state management
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('unified-history');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.error("Failed to load history from local storage", e);
            return [];
        }
    });

    const [restoredState, setRestoredState] = useState<HistoryItem | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('unified-history', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to local storage", e);
        }
    }, [history]);

    const addHistoryItem = useCallback((itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => {
        const newHistoryItem: HistoryItem = {
            ...itemData,
            id: nanoid(),
            timestamp: Date.now(),
            isFavorite: false,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
    }, []);

    const onToggleFavorite = useCallback((id: string) => {
        setHistory(h => h.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    }, []);

    const onRestoreHistory = useCallback((item: HistoryItem) => {
        setCurrentPage(item.source.page);
        setRestoredState(item);
        // Close sidebar on mobile when restoring
        setIsRightSidebarOpen(false);
    }, []);
    
    const clearRestoredState = useCallback(() => setRestoredState(null), []);

    const pageCommonProps = {
        history,
        addHistoryItem,
        onToggleFavorite,
        onRestoreHistory,
        restoredState,
        clearRestoredState,
    };
    
    let pageContent;
    switch (currentPage) {
        case 'product-generation':
            pageContent = <ProductGenerationPage 
                isLeftSidebarOpen={isLeftSidebarOpen}
                isRightSidebarOpen={isRightSidebarOpen}
                setIsRightSidebarOpen={setIsRightSidebarOpen}
                {...pageCommonProps}
            />;
            break;
        case 'mini-apps':
            pageContent = <MiniAppsPage {...pageCommonProps} />;
            break;
        default:
            const PageComponent = pageConfigs.find(p => p.id === currentPage)!.component;
            pageContent = <PageComponent />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark">
            <header className="w-full px-4 border-b border-border/80 flex-shrink-0 flex justify-between items-center h-[65px]">
                 <div className="flex items-center gap-3">
                    {currentPage === 'product-generation' && (
                        <button 
                            onClick={() => setIsLeftSidebarOpen(p => !p)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 w-10 bg-transparent text-secondary-foreground hover:bg-accent"
                            aria-label={isLeftSidebarOpen ? t('hideControlsPanel') : t('showControlsPanel')}
                        >
                            <Icon name="menu" className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNBNTg1N0Y3Ii8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzYzNjZGMSIvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8cGF0aCBkPSJNMTIgMkwzIDIySDdMOC4yNSAxOEgxNS43NUwxNyAyMkgxMUwxMiAyWk0xMiA2LjhMMTQuMjUgMTRIMi43NUwxMiA2LjhaIiBmaWxsPSJ1cmwoI2xvZ29HcmFkaWVudCkiLz4KICAgIDxwYXRoIGQ9Ik0xOCAyTDE5LjUgNUwyMiA2TDE5LjUgN0wxOCAxMEwxNi41IDdMMTQgNkwxNi41IDVMMTggMloiIGZpbGw9InVybCgjbG9nb0dyYWRpZW50KSIvPgo8L3N2Zz4=" alt="AI Designer Logo" className="w-8 h-8" />
                        <h1 className="text-xl font-semibold text-foreground">
                            {t('aiDesigner')}
                        </h1>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
                    {pageConfigs.map(({ id, titleKey }) => (
                        <button
                            key={id}
                            onClick={() => setCurrentPage(id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${currentPage === id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t(titleKey)}
                        </button>
                    ))}
                </nav>

                 <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 w-10 bg-secondary text-secondary-foreground hover:bg-accent"
                        aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
                    >
                        <span className="font-semibold">{language === 'en' ? 'AR' : 'EN'}</span>
                    </button>
                    {/* Unified workspace button */}
                    <button 
                        onClick={() => setIsRightSidebarOpen(p => !p)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent gap-2"
                        aria-label={isRightSidebarOpen ? t('hideWorkspacePanel') : t('showWorkspacePanel')}
                    >
                         <Icon name="history" className="w-5 h-5" />
                         <span className="hidden sm:inline">{t('workspace')}</span>
                    </button>
                 </div>
            </header>
            
            {pageContent}
        </div>
    );
}


const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const body = document.body;
        if (language === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            body.classList.remove('font-sans');
            body.classList.add('font-cairo');
        } else {
            document.documentElement.removeAttribute('dir');
            body.classList.remove('font-cairo');
            body.classList.add('font-sans');
        }
    }, [language]);

    const t = useCallback((key: keyof typeof translations.en, replacements?: Record<string, string | number>): string => {
        let translation = translations[language][key] || translations.en[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(new RegExp(`{{${rKey}}}`, 'g'), String(replacements[rKey]));
            });
        }
        return translation;
    }, [language]);

    const contextValue = { language, setLanguage, t };

    return (
        <LanguageContext.Provider value={contextValue}>
            <AppContent />
        </LanguageContext.Provider>
    );
};


export default App;