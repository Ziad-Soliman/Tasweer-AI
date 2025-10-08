import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { ImagePage } from './pages/ImagePage';
import { VideoPage } from './pages/VideoPage';
import { EditPage } from './pages/EditPage';
import { SkinEditorPage } from './pages/SkinEditorPage';
import { CharacterPage } from './pages/CharacterPage';
import { UpscalerPage } from './pages/UpscalerPage';
import { AppsPage } from './pages/AppsPage';
import { LivePage } from './pages/LivePage';
import { Icon } from './components/Icon';
import { translations } from './lib/translations';
import { HistoryItem } from './types';
import { nanoid } from 'nanoid';

// 1. Define Language Context
interface LanguageContextType {
    lang: 'en' | 'ar';
    setLang: (lang: 'en' | 'ar') => void;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => {},
});


// 2. Update useTranslation hook to use context
export const useTranslation = () => {
    const { lang } = useContext(LanguageContext);
  
    const t = (key: keyof (typeof translations)['en'], options?: { [key: string]: string | number }) => {
      // Use 'en' as a fallback language
      let translation = (translations[lang] as any)[key] || (translations['en'] as any)[key] || String(key);
      if (options) {
        Object.keys(options).forEach(optKey => {
          const regex = new RegExp(`{{${optKey}}}`, 'g');
          translation = translation.replace(regex, String(options[optKey]));
        });
      }
      return translation;
    };
  
    return { t, lang };
};

// --- DATA FOR MENUS ---

interface MenuItem {
    nameKey: keyof typeof translations.en;
    descriptionKey: keyof typeof translations.en;
    icon: string;
    new?: boolean;
    best?: boolean;
}

const imageFeatures: MenuItem[] = [
    { nameKey: "createImage", descriptionKey: "createImageDesc", icon: "image" },
    { nameKey: "soulIdCharacter", descriptionKey: "soulIdCharacterDesc", icon: "users" },
    { nameKey: "drawToEdit", descriptionKey: "drawToEditDesc", icon: "pencil" },
    { nameKey: "fashionFactory", descriptionKey: "fashionFactoryDesc", icon: "shirt" },
    { nameKey: "editImage", descriptionKey: "editImageDesc", icon: "wand" },
    { nameKey: "imageUpscale", descriptionKey: "imageUpscaleDesc", icon: "expand" },
    { nameKey: "photodumpStudio", descriptionKey: "photodumpStudioDesc", new: true, icon: "camera" },
];

const imageModels: MenuItem[] = [
    { nameKey: "imagen4", descriptionKey: "imagen4Desc", best: true, icon: 'sparkles' },
    { nameKey: "wan22Image", descriptionKey: "wan22ImageDesc", icon: 'image' },
    { nameKey: "seedream4", descriptionKey: "seedream4Desc", new: true, icon: 'sliders' },
    { nameKey: "nanoBanana", descriptionKey: "nanoBananaDesc", icon: 'wand' },
    { nameKey: "fluxKontext", descriptionKey: "fluxKontextDesc", icon: 'pencil' },
    { nameKey: "gptImage", descriptionKey: "gptImageDesc", icon: 'cube' },
    { nameKey: "topaz", descriptionKey: "topazDesc", icon: 'arrow-up' },
];

const videoFeatures: MenuItem[] = [
    { nameKey: "createVideo", descriptionKey: "createVideoDesc", icon: 'video' },
    { nameKey: "lipsyncStudio", descriptionKey: "lipsyncStudioDesc", icon: 'mic' },
    { nameKey: "talkingAvatar", descriptionKey: "talkingAvatarDesc", icon: 'history' },
    { nameKey: "drawToVideo", descriptionKey: "drawToVideoDesc", best: true, icon: 'edit' },
    { nameKey: "ugcFactory", descriptionKey: "ugcFactoryDesc", icon: 'users' },
    { nameKey: "videoUpscale", descriptionKey: "videoUpscaleDesc", icon: 'expand' },
    { nameKey: "higgsfieldAnimate", descriptionKey: "higgsfieldAnimateDesc", new: true, icon: 'sun' },
];

const videoModels: MenuItem[] = [
    { nameKey: "higgsfieldDOP", descriptionKey: "higgsfieldDOPDesc", icon: 'camera' },
    { nameKey: "googleVEO3", descriptionKey: "googleVEO3Desc", icon: 'brand' },
    { nameKey: "kling25Turbo", descriptionKey: "kling25TurboDesc", icon: 'sparkles' },
    { nameKey: "klingSpeak", descriptionKey: "klingSpeakDesc", icon: 'mic' },
    { nameKey: "seedancePro", descriptionKey: "seedanceProDesc", icon: 'sliders' },
    { nameKey: "minimaxHailuo02", descriptionKey: "minimaxHailuo02Desc", icon: 'audio-waveform' },
    { nameKey: "wan25", descriptionKey: "wan25Desc", new: true, icon: 'video' },
];

const editFeatures: MenuItem[] = [
    { nameKey: "bananaPlacement", descriptionKey: "bananaPlacementDesc", new: true, icon: 'wand' },
    { nameKey: "productPlacement", descriptionKey: "productPlacementDesc", icon: 'package' },
    { nameKey: "editImage", descriptionKey: "editImageDesc", icon: 'edit' },
    { nameKey: "multiReference", descriptionKey: "multiReferenceDesc", icon: 'copy' },
    { nameKey: "upscale", descriptionKey: "upscaleDesc", icon: 'expand' },
];

const editModels: MenuItem[] = [
    { nameKey: "fluxKontext", descriptionKey: "fluxKontextDesc", icon: 'pencil' },
    { nameKey: "nanoBananaEdit", descriptionKey: "nanoBananaEditDesc", new: true, icon: 'wand' },
    { nameKey: "topaz", descriptionKey: "topazDesc", icon: 'arrow-up' },
];

const menuData: Record<string, { features: MenuItem[], models: MenuItem[] }> = {
    'navProductStudio': { features: imageFeatures, models: imageModels },
    'navVideoGen': { features: videoFeatures, models: videoModels },
    'navCanvasBoard': { features: editFeatures, models: editModels },
};

const AppMenu = ({ features, models, selectedModel, onSelectModel }: { features: MenuItem[], models: MenuItem[], selectedModel?: string, onSelectModel?: (model: string) => void; }) => {
    const { t } = useTranslation();
    return (
        <div className="absolute top-full start-0 mt-2 w-[550px] bg-popover border border-border rounded-lg shadow-2xl p-4 grid grid-cols-2 gap-4 animate-slide-up-fade z-50">
            <div>
                <h3 className="font-semibold text-sm mb-3 px-2">{t('features')}</h3>
                <div className="space-y-1">
                    {features.map(feature => (
                        <a key={feature.nameKey} href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                            <Icon name={feature.icon} className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm text-foreground">
                                    {t(feature.nameKey)}
                                    {feature.new && <span className="ms-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">{t('newBadge')}</span>}
                                    {feature.best && <span className="ms-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">{t('bestBadge')}</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{t(feature.descriptionKey)}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-sm mb-3 px-2">{t('models')}</h3>
                <div className="space-y-1">
                    {models.map(model => (
                        <button key={model.nameKey} onClick={() => onSelectModel && onSelectModel(t(model.nameKey))} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedModel === t(model.nameKey) ? 'bg-muted' : 'hover:bg-muted'}`}>
                            <Icon name={model.icon} className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm text-foreground">
                                    {t(model.nameKey)}
                                    {model.new && <span className="ms-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">{t('newBadge')}</span>}
                                    {model.best && <span className="ms-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">{t('bestBadge')}</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{t(model.descriptionKey)}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComingSoonPage = ({ title, icon }: { title: string, icon: string }) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1 flex items-center justify-center text-center p-8 flex-col">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Icon name={icon} className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-md text-muted-foreground">{t('comingSoonMessage')}</p>
        </div>
    );
};

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('product studio');
    const [selectedModel, setSelectedModel] = useState("Imagen 4.0");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [restoredState, setRestoredState] = useState<HistoryItem | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuCloseTimer, setMenuCloseTimer] = useState<number | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);
    const { t, lang } = useTranslation();
    const { setLang } = useContext(LanguageContext);

    const navItems: { key: keyof typeof translations.en, pageId: string, hasMenu?: boolean }[] = [
        { key: 'navProductStudio', pageId: 'product studio', hasMenu: true },
        { key: 'navPortraitStudio', pageId: 'portrait studio' },
        { key: 'navCharacterStudio', pageId: 'character studio' },
        { key: 'navVideoGen', pageId: 'video gen', hasMenu: true },
        { key: 'navCanvasBoard', pageId: 'canvas board', hasMenu: true },
        { key: 'navUpscale', pageId: 'upscale' },
        { key: 'navMiniApps', pageId: 'mini apps' },
        { key: 'navLiveAssistant', pageId: 'live assistant' },
        { key: 'navGallery', pageId: 'gallery' },
        { key: 'navPricing', pageId: 'pricing' },
    ];
    
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = ''; // Cleanup on component unmount
        };
    }, [isMobileMenuOpen]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavClick = (pageId: string) => {
        setCurrentPage(pageId);
        setIsMobileMenuOpen(false);
        setOpenMenu(null);
    }
    
    const toggleLang = () => {
        setLang(lang === 'en' ? 'ar' : 'en');
    };

    const addHistoryItem = (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => {
        const newHistoryItem: HistoryItem = {
            ...itemData,
            id: nanoid(),
            timestamp: Date.now(),
            isFavorite: false,
        };
        setHistory(prev => [newHistoryItem, ...prev.filter(item => item.id !== newHistoryItem.id)]);
    };

    const deleteHistoryItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const toggleFavorite = (id: string) => {
        setHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    };

    const restoreFromHistory = (item: HistoryItem) => {
        setRestoredState(item);
        if (item.source.page === 'product-generation') { // Keep this for backward compatibility
            const mode = item.payload.settings.generationMode;
             if (['video'].includes(mode)) {
                setCurrentPage('video gen');
            } else if (['character'].includes(mode)) {
                setCurrentPage('character studio');
            } else { // product, mockup, social, design
                setCurrentPage('product studio');
            }
        } else if (item.source.page === 'mini-apps') {
            setCurrentPage('mini apps');
        } else if (item.source.page === 'character') {
            setCurrentPage('character studio');
        }
    };

    const clearRestoredState = () => {
        setRestoredState(null);
    };

    const renderPage = () => {
        const sharedPageProps = {
            selectedModel: selectedModel,
            history: history,
            onToggleFavorite: toggleFavorite,
            onRestore: restoreFromHistory,
            addHistoryItem: addHistoryItem,
            deleteHistoryItem: deleteHistoryItem,
            restoredState: restoredState,
            clearRestoredState: clearRestoredState,
        };

        switch(currentPage) {
            case 'product studio':
                 return <ImagePage 
                            key={restoredState ? restoredState.id : 'image'}
                            {...sharedPageProps}
                       />;
            case 'video gen':
                return <VideoPage selectedModel={selectedModel} />;
            case 'live assistant':
                return <LivePage />;
            case 'canvas board':
                return <EditPage />;
            case 'upscale':
                return <UpscalerPage />;
            case 'portrait studio':
                return <SkinEditorPage />;
            case 'character studio':
                 return <CharacterPage 
                            key={restoredState ? restoredState.id : 'character'}
                            addHistoryItem={addHistoryItem}
                            restoredState={restoredState}
                       />;
            case 'mini apps':
                return <AppsPage 
                            addHistoryItem={addHistoryItem}
                            restoredState={restoredState}
                            clearRestoredState={clearRestoredState}
                       />;
            case 'gallery':
                return <ComingSoonPage title={t('navGallery')} icon="layout-grid" />;
            case 'pricing':
                return <ComingSoonPage title={t('navPricing')} icon="credit-card" />;
            default:
                 return <ImagePage 
                            key="default-product-studio"
                            {...sharedPageProps}
                       />;
        }
    };

    return (
        <div className="h-screen flex flex-col">
             <header className="fixed top-0 start-0 end-0 z-40 bg-background/50 backdrop-blur-md border-b border-border/50">
                <div className="px-4 flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        <a href="#" className="flex flex-col leading-tight" onClick={(e) => { e.preventDefault(); handleNavClick('product studio'); }}>
                            <span className="font-bold text-xl tracking-tighter">CRE8</span>
                            <span className="text-xs text-muted-foreground">{t('byZiadAshraf')}</span>
                        </a>
                        <nav ref={menuRef} className="hidden md:flex items-center gap-1 bg-card/50 border border-border/50 rounded-full px-2 shadow-sm">
                            {navItems.map(item => {
                                const hasMenu = item.hasMenu;
                                
                                const handleMouseEnter = () => {
                                    if (menuCloseTimer) clearTimeout(menuCloseTimer);
                                    if (hasMenu) setOpenMenu(item.key);
                                };
                                
                                const handleMouseLeave = () => {
                                    if (hasMenu) {
                                        const timer = window.setTimeout(() => setOpenMenu(null), 150);
                                        setMenuCloseTimer(timer);
                                    }
                                };

                                return (
                                    <div key={item.key} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                        <button
                                            onClick={() => handleNavClick(item.pageId)}
                                            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${currentPage === item.pageId ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <span>{t(item.key)}</span>
                                            {hasMenu && <Icon name="chevron-down" className={`w-3 h-3 transition-transform ${openMenu === item.key ? 'rotate-180' : ''}`} />}
                                        </button>
                                        {hasMenu && openMenu === item.key && menuData[item.key as keyof typeof menuData] && (
                                            <AppMenu
                                                features={menuData[item.key as keyof typeof menuData].features}
                                                models={menuData[item.key as keyof typeof menuData].models}
                                                selectedModel={selectedModel}
                                                onSelectModel={(model) => {
                                                    setSelectedModel(model);
                                                    setOpenMenu(null);
                                                }}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleLang} className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 bg-secondary hover:bg-accent text-secondary-foreground">
                            {lang === 'en' ? 'AR' : 'EN'}
                        </button>
                        <button className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-semibold h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                            {t('signUp')}
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-muted-foreground">
                            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
             </header>

            {isMobileMenuOpen && (
                 <div className="fixed inset-0 top-16 bg-background z-30 md:hidden animate-fade-in">
                    <nav className="flex flex-col p-4 space-y-2">
                         {navItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => handleNavClick(item.pageId)}
                                className={`w-full text-left p-3 text-lg font-semibold rounded-lg ${currentPage === item.pageId ? 'bg-muted text-primary' : 'hover:bg-muted'}`}
                            >
                                {t(item.key)}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
            
            <div key={currentPage} className="flex-1 flex pt-16 animate-fade-in">
                 {renderPage()}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [lang, setLang] = useState<'en' | 'ar'>('ar');

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);
    
    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            <AppContent />
        </LanguageContext.Provider>
    );
};

export default App;