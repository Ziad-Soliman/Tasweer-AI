import React, { useState } from 'react';
import { ProductGenerationPage } from './pages/ProductGenerationPage';
import { AppsPage } from './pages/AppsPage';
import { Icon } from './components/Icon';
import { translations } from './lib/translations';
import { HistoryItem } from './types';
import { nanoid } from 'nanoid';

// FIX: Added a useTranslation hook to be used across the application.
export const useTranslation = () => {
    // Hardcoding to 'en' as there's no language switching mechanism provided.
    const lang = 'en'; 
  
    const t = (key: keyof (typeof translations)['en'], options?: { [key: string]: string | number }) => {
      let translation = translations[lang][key] || String(key);
      if (options) {
        Object.keys(options).forEach(optKey => {
          const regex = new RegExp(`{{${optKey}}}`, 'g');
          translation = translation.replace(regex, String(options[optKey]));
        });
      }
      return translation;
    };
  
    return { t };
  };

// --- DATA FOR MENUS ---

const imageFeatures = [
    { name: "Create Image", description: "Generate AI images", icon: "image" },
    { name: "Soul ID Character", description: "Create unique character", icon: "users" },
    { name: "Draw to Edit", description: "From sketch to picture", icon: "pencil" },
    { name: "Fashion Factory", description: "Create fashion sets", icon: "shirt" },
    { name: "Edit Image", description: "Change with inpainting", icon: "wand" },
    { name: "Image Upscale", description: "Enhance image quality", icon: "expand" },
    { name: "Photodump Studio", description: "Generate Your Aesthetic", new: true, icon: "camera" },
];

const imageModels = [
    { name: "Higgsfield Soul", description: "Ultra-realistic fashion visuals", best: true, icon: 'sparkles' },
    { name: "Wan 2.2 Image", description: "Realistic images", icon: 'image' },
    { name: "Seedream 4.0", description: "Advanced image editing", new: true, icon: 'sliders' },
    { name: "Nano Banana", description: "Smart image editing", icon: 'wand' },
    { name: "Flux Kontext", description: "Prompt-based editing", icon: 'pencil' },
    { name: "GPT Image", description: "Advanced OpenAI model", icon: 'cube' },
    { name: "Topaz", description: "High-resolution upscaler", icon: 'arrow-up' },
];

const videoFeatures = [
    { name: "Create Video", description: "Generate AI videos", icon: 'video' },
    { name: "Lipsync Studio", description: "Create Talking Clips", icon: 'mic' },
    { name: "Talking Avatar", description: "Lipsync with motion", icon: 'history' },
    { name: "Draw to Video", description: "Sketch turns into a cinema", best: true, icon: 'edit' },
    { name: "UGC Factory", description: "Build UGC video with avatar", icon: 'users' },
    { name: "Video Upscale", description: "Enhance video quality", icon: 'expand' },
    { name: "Higgsfield Animate", description: "Video smart replacement", new: true, icon: 'sun' },
];

const videoModels = [
    { name: "Higgsfield DOP", description: "VFX and camera control", icon: 'camera' },
    { name: "Google VEO 3", description: "Video with synced audio", icon: 'brand' },
    { name: "Kling 2.5 Turbo", description: "Powerful creation, great value", icon: 'sparkles' },
    { name: "Kling Speak", description: "Next-gen talking avatars", icon: 'mic' },
    { name: "Seedance Pro", description: "Create multi-shot videos", icon: 'sliders' },
    { name: "Minimax Hailuo 02", description: "Fastest high-dynamic video", icon: 'audio-waveform' },
    { name: "Wan 2.5", description: "Next-gen video generation with sound", new: true, icon: 'video' },
];

const editFeatures = [
    { name: "Banana Placement", description: "More control, more products", new: true, icon: 'wand' },
    { name: "Product Placement", description: "Place products in an image", icon: 'package' },
    { name: "Edit Image", description: "Change with inpainting", icon: 'edit' },
    { name: "Multi Reference", description: "Multiple edits in one shot", icon: 'copy' },
    { name: "Upscale", description: "Enhance resolution and quality", icon: 'expand' },
];

const editModels = [
    { name: "Higgsfield Soul Inpaint", description: "Edit stylish visuals", icon: 'sparkles' },
    { name: "Flux Kontext", description: "Visual edits by prompt", icon: 'pencil' },
    { name: "Nano Banana Edit", description: "Advanced image editing", new: true, icon: 'wand' },
    { name: "Topaz", description: "High-resolution upscaler", icon: 'arrow-up' },
];

const menuData: Record<string, { features: any[], models: any[] }> = {
    Image: { features: imageFeatures, models: imageModels },
    Video: { features: videoFeatures, models: videoModels },
    Edit: { features: editFeatures, models: editModels },
};

const AppMenu = ({ features, models, selectedModel, onSelectModel }: { features: any[], models: any[], selectedModel?: string, onSelectModel?: (model: string) => void; }) => {
    return (
        <div className="absolute top-full left-0 mt-2 w-[550px] bg-card border border-border rounded-lg shadow-2xl p-4 grid grid-cols-2 gap-4 animate-fade-in z-50">
            <div>
                <h3 className="font-semibold text-sm mb-3 px-2">Features</h3>
                <div className="space-y-1">
                    {features.map(feature => (
                        <a key={feature.name} href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                            <Icon name={feature.icon} className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm text-foreground">
                                    {feature.name}
                                    {feature.new && <span className="ml-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">NEW</span>}
                                    {feature.best && <span className="ml-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">BEST</span>}
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
                                    {model.new && <span className="ml-1 text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">NEW</span>}
                                    {model.best && <span className="ml-1 text-xs text-pink-400 bg-pink-400/20 px-1.5 py-0.5 rounded-full">BEST</span>}
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


const Header = ({ currentPage, setCurrentPage, selectedModel, onSelectModel }: { currentPage: string, setCurrentPage: (page: string) => void, selectedModel: string; onSelectModel: (model: string) => void; }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const navItems = ["Explore", "Image", "Video", "Edit", "Assist", "Apps", "ASMR", "Community"];

    const handleNavClick = (item: string) => {
        const page = item.toLowerCase();
        // Only navigate if it's a main page, otherwise let the menu handle interaction
        if (['image', 'video', 'edit', 'apps'].includes(page)) {
             setCurrentPage(page);
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-md">
            <div className="container mx-auto px-4 flex justify-between items-center h-16 border-b border-border">
                <div className="flex items-center gap-6">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNy41IDNDNS4yOTEgMyAzIDUuMjUxIDMgNy41VjE2LjVDMyAxOC43NDkgNS4yOTEgMjEgNy41IDIxSDE2LjVDMTguNzQ5IDIxIDIxIDE4Ljc0OSAyMSAxNi41VjcuNUMyMSA1LjI1MSAxOC43NDkgMyAxNi41IDNINy41Wk03LjUgNC41SDE2LjVDMTcuODY5IDQuNSAxOSA1LjYzMSAxOSA3LjVWMTYuNUMxOSAxNy44NjkgMTcuODY5IDE5IDE2LjUgMTlINy41QzYuMTMxIDE5IDUgMTcuODY5IDUgMTYuNVY3LjVDNSA2LjEzMSA2LjEzMSA0LjUgNy41IDQuNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==" alt="Logo" className="w-8 h-8"/>

                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map(item => (
                            <div key={item} onMouseEnter={() => menuData[item] && setOpenMenu(item)} onMouseLeave={() => menuData[item] && setOpenMenu(null)} className="relative">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(item);}} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === item.toLowerCase() ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                    {item}
                                    {item === 'ASMR' && <span className="ml-1.5 text-xs text-yellow-300 bg-yellow-300/20 px-1.5 py-0.5 rounded-full align-middle">ASMR</span>}
                                    {item === 'Community' && <span className="ml-1.5 text-xs text-yellow-300 bg-yellow-300/20 px-1.5 py-0.5 rounded-full align-middle">New</span>}
                                </a>
                                {openMenu === item && menuData[item] && (
                                    <AppMenu 
                                        features={menuData[item].features} 
                                        models={menuData[item].models} 
                                        selectedModel={selectedModel} 
                                        onSelectModel={onSelectModel} 
                                    />
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <a href="#" className="text-foreground hover:text-primary transition-colors">Pricing</a>
                    <a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Icon name="copy" className="w-4 h-4" /> Discord
                    </a>
                    <a href="#" className="text-foreground hover:text-primary transition-colors px-4 py-1.5 border border-border rounded-md">Login</a>
                    <a href="#" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Sign Up</a>
                </div>
            </div>
        </header>
    );
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('image');
    const [selectedModel, setSelectedModel] = useState("Higgsfield Soul");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [restoredState, setRestoredState] = useState<HistoryItem | null>(null);

    const addHistoryItem = (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => {
        const newHistoryItem: HistoryItem = {
            ...itemData,
            id: nanoid(),
            timestamp: Date.now(),
            isFavorite: false,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
    };

    const toggleFavorite = (id: string) => {
        setHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    };

    const restoreFromHistory = (item: HistoryItem) => {
        setRestoredState(item);
        if (item.source.page === 'product-generation') {
            const mode = item.payload.settings.generationMode;
             if (['video', 'edit'].includes(mode)) {
                setCurrentPage(mode);
            } else {
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
        const generationModes = ['image', 'video', 'edit'];

        if (generationModes.includes(currentPage)) {
            return <ProductGenerationPage 
                        key={restoredState ? restoredState.id : currentPage}
                        initialMode={currentPage as 'image' | 'video' | 'edit'}
                        selectedModel={selectedModel} 
                        history={history}
                        onToggleFavorite={toggleFavorite}
                        onRestore={restoreFromHistory}
                        addHistoryItem={addHistoryItem}
                        restoredState={restoredState}
                        clearRestoredState={clearRestoredState}
                   />;
        }

        switch(currentPage) {
            case 'apps':
                return <AppsPage 
                            addHistoryItem={addHistoryItem}
                            restoredState={restoredState}
                            clearRestoredState={clearRestoredState}
                       />;
            default:
                // Fallback for Explore, Assist, etc.
                 return <ProductGenerationPage 
                            key="default-image"
                            initialMode="image"
                            selectedModel={selectedModel}
                            history={history}
                            onToggleFavorite={toggleFavorite}
                            onRestore={restoreFromHistory}
                            addHistoryItem={addHistoryItem}
                            restoredState={restoredState}
                            clearRestoredState={clearRestoredState}
                       />;
        }
    };

    return (
        <div className="h-screen bg-background">
            <Header 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                selectedModel={selectedModel} 
                onSelectModel={setSelectedModel} 
            />
            <div className="h-full pt-16 flex flex-col">
                 {renderPage()}
            </div>
        </div>
    );
};

export default App;
