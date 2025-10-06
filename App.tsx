


import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { ImagePage } from './pages/ImagePage';
import { VideoPage } from './pages/VideoPage';
import { EditPage } from './pages/EditPage';
import { SkinEditorPage } from './pages/SkinEditorPage';
import { CharacterPage } from './pages/CharacterPage';
import { UpscalerPage } from './pages/UpscalerPage';
import { AppsPage } from './pages/AppsPage';
import { ExplorePage } from './pages/ExplorePage';
import { LiveAssistPage } from './pages/LiveAssistPage';
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
    name: string;
    description: string;
    icon: string;
    new?: boolean;
    best?: boolean;
}

const imageFeatures: MenuItem[] = [
    { name: "Create Image", description: "Generate AI images", icon: "image" },
    { name: "Soul ID Character", description: "Create unique character", icon: "users" },
    { name: "Draw to Edit", description: "From sketch to picture", icon: "pencil" },
    { name: "Fashion Factory", description: "Create fashion sets", icon: "shirt" },
    { name: "Edit Image", description: "Change with inpainting", icon: "wand" },
    { name: "Image Upscale", description: "Enhance image quality", icon: "expand" },
    { name: "Photodump Studio", description: "Generate Your Aesthetic", new: true, icon: "camera" },
];

const imageModels: MenuItem[] = [
    { name: "Imagen 4.0", description: "Google's most powerful image model", best: true, icon: 'sparkles' },
    { name: "Wan 2.2 Image", description: "Realistic images", icon: 'image' },
    { name: "Seedream 4.0", description: "Advanced image editing", new: true, icon: 'sliders' },
    { name: "Nano Banana", description: "Smart image editing", icon: 'wand' },
    { name: "Flux Kontext", description: "Prompt-based editing", icon: 'pencil' },
    { name: "GPT Image", description: "Advanced OpenAI model", icon: 'cube' },
    { name: "Topaz", description: "High-resolution upscaler", icon: 'arrow-up' },
];

const videoFeatures: MenuItem[] = [
    { name: "Create Video", description: "Generate AI videos", icon: 'video' },
    { name: "Lipsync Studio", description: "Create Talking Clips", icon: 'mic' },
    { name: "Talking Avatar", description: "Lipsync with motion", icon: 'history' },
    { name: "Draw to Video", description: "Sketch turns into a cinema", best: true, icon: 'edit' },
    { name: "UGC Factory", description: "Build UGC video with avatar", icon: 'users' },
    { name: "Video Upscale", description: "Enhance video quality", icon: 'expand' },
    { name: "Higgsfield Animate", description: "Video smart replacement", new: true, icon: 'sun' },
];

const videoModels: MenuItem[] = [
    { name: "Higgsfield DOP", description: "VFX and camera control", icon: 'camera' },
    { name: "Google VEO 3", description: "Video with synced audio", icon: 'brand' },
    { name: "Kling 2.5 Turbo", description: "Powerful creation, great value", icon: 'sparkles' },
    { name: "Kling Speak", description: "Next-gen talking avatars", icon: 'mic' },
    { name: "Seedance Pro", description: "Create multi-shot videos", icon: 'sliders' },
    { name: "Minimax Hailuo 02", description: "Fastest high-dynamic video", icon: 'audio-waveform' },
    { name: "Wan 2.5", description: "Next-gen video generation with sound", new: true, icon: 'video' },
];

const editFeatures: MenuItem[] = [
    { name: "Banana Placement", description: "More control, more products", new: true, icon: 'wand' },
    { name: "Product Placement", description: "Place products in an image", icon: 'package' },
    { name: "Edit Image", description: "Change with inpainting", icon: 'edit' },
    { name: "Multi Reference", description: "Multiple edits in one shot", icon: 'copy' },
    { name: "Upscale", description: "Enhance resolution and quality", icon: 'expand' },
];

const editModels: MenuItem[] = [
    { name: "Flux Kontext", description: "Visual edits by prompt", icon: 'pencil' },
    { name: "Nano Banana Edit", description: "Advanced image editing", new: true, icon: 'wand' },
    { name: "Topaz", description: "High-resolution upscaler", icon: 'arrow-up' },
];

const menuData: Record<string, { features: MenuItem[], models: MenuItem[] }> = {
    Image: { features: imageFeatures, models: imageModels },
    Video: { features: videoFeatures, models: videoModels },
    Edit: { features: editFeatures, models: editModels },
};

const AppMenu = ({ features, models, selectedModel, onSelectModel }: { features: MenuItem[], models: MenuItem[], selectedModel?: string, onSelectModel?: (model: string) => void; }) => {
    return (
        <div className="absolute top-full start-0 mt-2 w-[550px] bg-popover border border-border rounded-lg shadow-2xl p-4 grid grid-cols-2 gap-4 animate-slide-up-fade z-50">
            <div>
                <h3 className="font-semibold text-sm mb-3 px-2">Features</h3>
                <div className="space-y-1">
                    {features.map(feature => (
                        <a key={feature.name} href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                            <Icon name={feature.icon} className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm text-foreground">
                                    {feature.name}
                                    {feature.new && <span className="ms-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">NEW</span>}
                                    {feature.best && <span className="ms-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">BEST</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-sm mb-3 px-2">Models</h3>
                <div className="space-y-1">
                    {models.map(model => (
                        <button key={model.name} onClick={() => onSelectModel && onSelectModel(model.name)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedModel === model.name ? 'bg-muted' : 'hover:bg-muted'}`}>
                            <Icon name={model.icon} className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm text-foreground">
                                    {model.name}
                                    {model.new && <span className="ms-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">NEW</span>}
                                    {model.best && <span className="ms-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">BEST</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComingSoonPage = ({ title, icon }: { title: string, icon: string }) => (
    <div className="flex-1 flex items-center justify-center text-center p-8 flex-col animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Icon name={icon} className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-md text-muted-foreground">This page is under construction. Coming soon!</p>
    </div>
);


const App: React.FC = () => {
    const [lang, setLang] = useState<'en' | 'ar'>('en');
    const [currentPage, setCurrentPage] = useState('image');
    const [selectedModel, setSelectedModel] = useState("Imagen 4.0");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [restoredState, setRestoredState] = useState<HistoryItem | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuCloseTimer, setMenuCloseTimer] = useState<number | null>(null);

    const navItems = ["Explore", "Image", "Video", "Edit", "Upscale", "Skin Editor", "Character", "Assist", "Apps", "Community"];
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);
    
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

    const handleNavClick = (item: string) => {
        const page = item.toLowerCase();
        setCurrentPage(page);
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
                setCurrentPage('video');
            } else if (['character'].includes(mode)) {
                setCurrentPage('character');
            } else { // product, mockup, social, design
                setCurrentPage('image');
            }
        } else if (item.source.page === 'mini-apps') {
            setCurrentPage('apps');
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
            case 'image':
                 return <ImagePage 
                            key={restoredState ? restoredState.id : 'image'}
                            {...sharedPageProps}
                       />;
            case 'video':
                // FIX: The VideoPage component only accepts the `selectedModel` prop.
                return <VideoPage selectedModel={selectedModel} />;
            case 'edit':
                // FIX: The EditPage component does not accept any props.
                return <EditPage />;
            case 'upscale':
                return <UpscalerPage />;
            case 'skin editor':
                return <SkinEditorPage />;
            case 'character':
                 return <CharacterPage 
                            key={restoredState ? restoredState.id : 'character'}
                            {...sharedPageProps}
                       />;
            case 'apps':
                return <AppsPage 
                            addHistoryItem={addHistoryItem}
                            restoredState={restoredState}
                            clearRestoredState={clearRestoredState}
                       />;
            case 'explore':
                return <ExplorePage />;
            case 'assist':
// FIX: The LiveAssistPage component does not accept any props. Removed sharedPageProps.
                return <LiveAssistPage />;
            case 'community':
                return <ComingSoonPage title="Community" icon="users" />;
            default:
                 return <CharacterPage 
                            key="default-character"
                            {...sharedPageProps}
                       />;
        }
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            <div className="h-screen bg-background flex flex-col">
                 <header className="fixed top-0 start-0 end-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/80">
                    <div className="container mx-auto px-4 flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNy41IDNDNS4yOTEgMyAzIDUuMjUxIDMgNy41VjE2LjVDMyAxOC43NDkgNS4yOTEgMjEgNy41IDIxSDE2LjVDMTguNzQ5IDIxIDIxIDE4Ljc0OSAyMSAxNi41VjcuNUMyMSA1LjI1MSAxODc0OSAzIDE2LjUgM0g3LjVaTTcuNSA0LjVIMTYuNUMxNy44NjkgNC41IDE5IDUuNjMxIDE5IDcuNVYxNi45IDE3Ljg2OSAxNy44NjkgMTkgMTYuNSAxOUg3LjVDNi4xMzEgMTkgNSAxNy44NjkgNSAxNi41VjcuNUM1IDYuMTMxIDYuMTMxIDQuNSA3LjUgNC41WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+" alt="Logo" className="w-8 h-8"/>

                            <nav ref={menuRef} className="hidden md:flex items-center gap-1">
                                {navItems.map(item => {
                                    const isActive = currentPage === item.toLowerCase() || openMenu === item;
                                    return (
                                        <div 
                                            key={item} 
                                            onMouseEnter={() => {
                                                if (menuCloseTimer) clearTimeout(menuCloseTimer);
                                                menuData[item] && setOpenMenu(item);
                                            }} 
                                            onMouseLeave={() => {
                                                const timer = window.setTimeout(() => setOpenMenu(null), 200);
                                                setMenuCloseTimer(timer);
                                            }} 
                                            className="relative"
                                        >
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(item);}} className={`px-3 py-2 text-sm font-medium rounded-md transition-all relative ${isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                                {item}
                                                {item === 'Community' && <span className="ms-1.5 text-xs text-yellow-300 bg-yellow-300/20 px-1.5 py-0.5 rounded-full align-middle">New</span>}
                                                {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full animate-glow"></div>}
                                            </a>
                                            {openMenu === item && menuData[item] && (
                                                <AppMenu 
                                                    features={menuData[item].features} 
                                                    models={menuData[item].models} 
                                                    selectedModel={selectedModel} 
                                                    onSelectModel={(model) => { setSelectedModel(model); setOpenMenu(null); }} 
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </nav>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                            <a href="#" className="text-foreground hover:text-primary transition-colors">{t('pricing')}</a>
                            <button onClick={toggleLang} className="text-foreground hover:text-primary transition-colors">
                                {lang === 'en' ? 'العربية' : 'English'}
                            </button>
                            <a href="#" className="text-foreground hover:text-primary transition-colors">{t('login')}</a>
                            <a href="#" className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors">{t('signUp')}</a>
                            <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground"><Icon name="users" className="w-5 h-5"/></button>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-muted-foreground hover:bg-muted">
                                <Icon name={isMobileMenuOpen ? "close" : "menu"} className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </header>

                {isMobileMenuOpen && (
                     <div className="md:hidden fixed inset-0 top-16 bg-background/95 z-30 animate-fade-in">
                        <div className="container mx-auto px-4 pt-4">
                             <nav className="flex flex-col gap-2">
                                {navItems.map(item => (
                                    <a key={item} href="#" onClick={(e) => { e.preventDefault(); handleNavClick(item);}} className={`px-4 py-3 text-lg font-medium rounded-md transition-colors ${currentPage === item.toLowerCase() ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                        {item}
                                    </a>
                                ))}
                            </nav>
                             <div className="border-t border-border mt-6 pt-6 flex flex-col gap-4 text-lg font-medium">
                                <a href="#" className="text-foreground hover:text-primary transition-colors">{t('pricing')}</a>
                                 <button onClick={toggleLang} className="text-foreground hover:text-primary transition-colors text-start w-fit">
                                    {lang === 'en' ? 'العربية' : 'English'}
                                </button>
                                <a href="#" className="text-foreground hover:text-primary transition-colors">{t('login')}</a>
                                <a href="#" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors text-center">{t('signUp')}</a>
                            </div>
                        </div>
                     </div>
                )}
                
                <main className="pt-16 flex-1 flex flex-col min-h-0">
                     {renderPage()}
                </main>
            </div>
        </LanguageContext.Provider>
    );
};

export default App;