



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
    'Product Studio': { features: imageFeatures, models: imageModels },
    'Video Gen': { features: videoFeatures, models: videoModels },
    'Canvas Board': { features: editFeatures, models: editModels },
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
    <div className="flex-1 flex items-center justify-center text-center p-8 flex-col">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Icon name={icon} className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-md text-muted-foreground">This page is under construction. Coming soon!</p>
    </div>
);


const App: React.FC = () => {
    const [lang, setLang] = useState<'en' | 'ar'>('en');
    const [currentPage, setCurrentPage] = useState('product studio');
    const [selectedModel, setSelectedModel] = useState("Imagen 4.0");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [restoredState, setRestoredState] = useState<HistoryItem | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuCloseTimer, setMenuCloseTimer] = useState<number | null>(null);

    const navItems = ["Product Studio", "Portrait Studio", "Character Studio", "Video Gen", "Canvas Board", "Upscale", "Mini Apps", "Live Assistant", "Gallery", "Pricing"];
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
                return <ComingSoonPage title="Gallery" icon="layout-grid" />;
            case 'pricing':
                return <ComingSoonPage title="Pricing" icon="credit-card" />;
            default:
                 return <ImagePage 
                            key="default-product-studio"
                            {...sharedPageProps}
                       />;
        }
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            <div className="h-screen flex flex-col">
                 <header className="fixed top-0 start-0 end-0 z-40 bg-background/50 backdrop-blur-md border-b border-border/50">
                    <div className="px-4 flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); handleNavClick('Product Studio'); }}>
                                <span className="font-bold text-lg tracking-tight">CRE8 <span className="text-muted-foreground font-normal">by Ziad Ashraf</span></span>
                            </a>
                            <nav ref={menuRef} className="hidden md:flex items-center gap-1 bg-card/50 border border-border/50 rounded-full px-2 shadow-sm">
                                {navItems.map(item => {
                                    const page = item.toLowerCase();
                                    const hasMenu = ['Product Studio', 'Video Gen', 'Canvas Board'].includes(item);
                                    
                                    const handleMouseEnter = () => {
                                        if (menuCloseTimer) clearTimeout(menuCloseTimer);
                                        if (hasMenu) setOpenMenu(item);
                                    };
                                    
                                    const handleMouseLeave = () => {
                                        if (hasMenu) {
                                            const timer = window.setTimeout(() => setOpenMenu(null), 150);
                                            setMenuCloseTimer(timer);
                                        }
                                    };

                                    return (
                                        <div key={item} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                            <button
                                                onClick={() => handleNavClick(item)}
                                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${currentPage === page ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                <span>{item}</span>
                                                {hasMenu && <Icon name="chevron-down" className={`w-3 h-3 transition-transform ${openMenu === item ? 'rotate-180' : ''}`} />}
                                            </button>
                                            {hasMenu && openMenu === item && (
                                                <AppMenu
                                                    features={menuData[item].features}
                                                    models={menuData[item].models}
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
                                {lang.toUpperCase()}
                            </button>
                            <button className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-semibold h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                                Sign Up
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
                                    key={item}
                                    onClick={() => handleNavClick(item)}
                                    className={`w-full text-left p-3 text-lg font-semibold rounded-lg ${currentPage === item.toLowerCase() ? 'bg-muted text-primary' : 'hover:bg-muted'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
                
                <div key={currentPage} className="flex-1 flex pt-16 animate-fade-in">
                     {renderPage()}
                </div>
            </div>
        </LanguageContext.Provider>
    );
};

export default App;