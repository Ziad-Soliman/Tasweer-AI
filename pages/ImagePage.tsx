// This is a new, dedicated page for Image Generation.
// It is a refactored and streamlined version of the 'product', 'mockup', 'social', and 'design' modes from the old ProductGenerationPage.

// FIX: Corrected React import to include necessary hooks like useState, useEffect, etc.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Part } from '@google/genai';
import { GenerationSettings, BrandKit, HistoryItem, EditorMode, TextOverlay, MarketingCopy, GenerationMode, KeyObject, AspectRatio, Preset } from '../types';
import { Canvas } from '../components/Canvas';
import { Tabs } from '../components/Tabs';
import { HistoryPanel } from '../components/HistoryPanel';
import { BrandKitPanel } from '../components/BrandKitPanel';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MarketingCopyModal } from '../components/MarketingCopyModal';
import { SceneSuggestions } from '../components/SceneSuggestions';
import { StylePresetModal } from '../components/StylePresetModal';
import { PRESETS } from '../constants/presets';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../App';
import { NEGATIVE_PROMPT_PRESETS, SOCIAL_MEDIA_TEMPLATES, PHOTO_STYLES, CAMERA_ZOOMS, SHOT_TYPES, COLOR_TONES, MOCKUP_TYPES, CINEMATIC_LIGHTING_STYLES, CAMERA_PERSPECTIVE_OPTIONS } from '../constants';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';

const SelectControl: React.FC<{ icon: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ icon, label, value, onChange, children }) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Icon name={icon} className="w-5 h-5" />
            <span>{label}</span>
        </div>
        <div className="relative">
            <select value={value} onChange={onChange} className="bg-input border border-border rounded-md pl-3 pr-8 py-1.5 text-sm w-48 truncate appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                {children}
            </select>
            <Icon name="chevron-down" className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
    </div>
);


interface GeneratedItem {
    id: string;
    src?: string;
    prompt: string;
    isLoading: boolean;
}

const LoadingCard = () => (
    <div className="w-full bg-[#111118] border border-border/50 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute w-5 h-5 bg-pink-500/20 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute w-10 h-10 bg-gradient-to-br from-primary/30 to-purple-700/30 rounded-full"></div>
        </div>
        <p className="mt-6 font-semibold text-foreground tracking-wide">Forging New Realities ...</p>
        <p className="mt-1 text-sm text-muted-foreground">Rendering impossible landscapes...</p>
    </div>
);


interface ImageCardProps {
    item: GeneratedItem;
    onSelect: () => void;
    onDownload: () => void;
    onEnhance: () => void;
    onGenerateCopy: () => void;
    onSetEditorMode: (mode: EditorMode) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onSelect, onDownload, onEnhance, onGenerateCopy, onSetEditorMode }) => {
    const { t } = useTranslation();

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        onSelect();
        // Use a short timeout to allow the Canvas component to mount before the action is called
        setTimeout(action, 50);
    }
    
    return (
        <div className="break-inside-avoid mb-4">
            {item.isLoading || !item.src ? (
                <LoadingCard />
            ) : (
                <>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer" onClick={onSelect}>
                        <img src={item.src} alt={item.prompt} className="w-full h-auto block bg-muted" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
                            <div className="flex items-center gap-1.5">
                                <Tooltip text={t('editorToolExpandImage')}><button onClick={(e) => handleAction(e, () => onSetEditorMode('expand'))} className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="expand" className="w-4 h-4" /></button></Tooltip>
                                <Tooltip text={t('enhance')}><button onClick={(e) => handleAction(e, onEnhance)} className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="wand" className="w-4 h-4" /></button></Tooltip>
                                <Tooltip text={t('generateCopy')}><button onClick={(e) => handleAction(e, onGenerateCopy)} className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="pencil" className="w-4 h-4" /></button></Tooltip>
                                <Tooltip text={t('download')}><button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="download" className="w-4 h-4" /></button></Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-start mt-2 gap-2">
                        <p className="text-muted-foreground text-xs">{item.prompt}</p>
                         <Tooltip text={t('copy')}>
                            <button onClick={() => navigator.clipboard.writeText(item.prompt)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                                <Icon name="copy" className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    );
};

const DEFAULT_BRAND_KIT: BrandKit = {
    id: 'default',
    name: 'Default Kit',
    logo: null,
    primaryColor: '#ACFD00',
    font: 'Inter',
};

const DEFAULT_SETTINGS: GenerationSettings = {
    generationMode: 'product',
    aspectRatio: '1:1',
    lightingStyle: 'natural',
    cameraPerspective: 'Eye-level Front View',
    videoLength: 'Short (~5s)',
    cameraMotion: 'Static',
    mockupType: 'tshirt',
    selectedSocialTemplateId: 'ig-post',
    prompt: '',
    editedPrompt: null,
    negativePrompt: NEGATIVE_PROMPT_PRESETS.join(', '),
    seed: '',
    numberOfImages: 2,
    productDescription: '',
    selectedPresetId: null,
    watermark: { enabled: false, useLogo: true, text: 'Your Brand', position: 'bottom-right', scale: 10, opacity: 70 },
    photoStyle: 'photorealistic',
    cameraZoom: 'none',
    shotType: 'none',
    colorTone: 'none',
    keyObjects: [],
};

interface ImagePageProps {
    selectedModel: string;
    history: HistoryItem[];
    onToggleFavorite: (id: string) => void;
    onRestore: (item: HistoryItem) => void;
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    deleteHistoryItem: (id: string) => void;
    restoredState: HistoryItem | null;
    clearRestoredState: () => void;
}

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <label className={`block text-sm font-medium text-muted-foreground mb-1.5 ${className}`}>{children}</label>
);

export const ImagePage: React.FC<ImagePageProps> = (props) => {
    const { history, onToggleFavorite, onRestore, addHistoryItem, deleteHistoryItem, restoredState, clearRestoredState, selectedModel } = props;
    const { t } = useTranslation();

    const [settings, setSettings] = useState<GenerationSettings>({ ...DEFAULT_SETTINGS, generationMode: 'product' });
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [productImageNoBg, setProductImageNoBg] = useState<string | null>(null);
    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const selectedItem = useMemo(() => (selectedImageIndex !== null ? generatedItems[selectedImageIndex] : null), [selectedImageIndex, generatedItems]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [promptGenerationMessage, setPromptGenerationMessage] = useState('');
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [isStartOverModalOpen, setIsStartOverModalOpen] = useState(false);
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<EditorMode>('view');
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [brandKits, setBrandKits] = useState<BrandKit[]>([DEFAULT_BRAND_KIT]);
    const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>(DEFAULT_BRAND_KIT.id);
    const activeBrandKit = useMemo(() => brandKits.find(kit => kit.id === activeBrandKitId), [brandKits, activeBrandKitId]);
    const [marketingCopy, setMarketingCopy] = useState<MarketingCopy | null>(null);
    const [palette, setPalette] = useState<string[] | undefined>(undefined);
    const [suggestions, setSuggestions] = useState<{name: string; prompt: string}[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [sceneDescription, setSceneDescription] = useState('');
    const isPromptDirty = useRef(false);
    const [styleRefImage, setStyleRefImage] = useState<File | null>(null);
    const [styleRefImagePreview, setStyleRefImagePreview] = useState<string | null>(null);
    const [keyObjectPreviews, setKeyObjectPreviews] = useState<Record<string, string>>({});
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const numImages: GenerationSettings['numberOfImages'][] = [1, 2, 3, 4];
    const generationModes: {id: GenerationMode, name: string, icon: string}[] = [
        {id: 'product', name: 'Product', icon: 'package'},
        {id: 'mockup', name: 'Mockup', icon: 'shirt'},
        {id: 'social', name: 'Social', icon: 'users'},
        {id: 'design', name: 'Design', icon: 'sparkles'},
    ];
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [sceneDescription]);

    useEffect(() => {
        if (styleRefImage) {
            const url = URL.createObjectURL(styleRefImage);
            setStyleRefImagePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setStyleRefImagePreview(null);
        }
    }, [styleRefImage]);

    useEffect(() => {
        const newPreviews: Record<string, string> = {};
        settings.keyObjects.forEach(obj => {
            if (obj.image) {
                newPreviews[obj.id] = URL.createObjectURL(obj.image);
            }
        });
        setKeyObjectPreviews(newPreviews);

        return () => {
            Object.values(newPreviews).forEach(URL.revokeObjectURL);
        };
    }, [settings.keyObjects]);

    const resetState = (keepImage = false) => {
        const currentMode = settings.generationMode;
        setSettings(s => ({...DEFAULT_SETTINGS, generationMode: keepImage ? currentMode : 'product' }));
        if (!keepImage) {
            setProductImage(null);
            setProductImagePreview(null);
            setProductImageNoBg(null);
        }
        setGeneratedItems([]);
        setSelectedImageIndex(null);
        setIsLoading(false);
        setLoadingMessage('');
        setError(null);
        setEditorMode('view');
        setTextOverlays([]);
        setMarketingCopy(null);
        setPalette(undefined);
        setSuggestions([]);
        setSceneDescription('');
        isPromptDirty.current = false;
        setStyleRefImage(null);
    };

    const handleProductImageUpload = async (file: File) => {
        resetState(true);
        setProductImage(file);
        setProductImagePreview(URL.createObjectURL(file));
        try {
            setPromptGenerationMessage(t('loadingAnalyzing'));
            const desc = await geminiService.describeProduct(file);
            setSettings(s => ({ ...s, productDescription: desc }));
            
            if (['product', 'mockup'].includes(settings.generationMode)) {
                setPromptGenerationMessage(t('loadingRemovingBackground'));
                const base64NoBg = await geminiService.removeBackground(file);
                setProductImageNoBg(base64NoBg);
            }

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to process image.');
        } finally {
             setPromptGenerationMessage('');
        }
    };
    
    const generateSuggestions = useCallback(async () => {
        if (!settings.productDescription || promptGenerationMessage) {
            setSuggestions([]);
            return;
        }
        
        setIsLoadingSuggestions(true);
        setSuggestions([]);
        try {
            const newSuggestions = await geminiService.generateSuggestions(settings.productDescription, settings.generationMode);
            setSuggestions(newSuggestions);
        } catch (e) {
            console.error("Failed to generate suggestions", e);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [settings.productDescription, settings.generationMode, promptGenerationMessage]);

    useEffect(() => {
        generateSuggestions();
    }, [generateSuggestions]);

    useEffect(() => {
        if (isPromptDirty.current) return;
        
        let autoPrompt = '';
        switch (settings.generationMode) {
            case 'product': 
                if (settings.productDescription) autoPrompt = `A professional product photograph of ${settings.productDescription}`; 
                break;
            case 'mockup':
                if (settings.productDescription) {
                    const selectedMockup = MOCKUP_TYPES.find(m => m.id === settings.mockupType);
                    autoPrompt = `A photorealistic mockup of ${settings.productDescription} ${selectedMockup?.promptFragment || 'on a mockup'}.`;
                }
                break;
            case 'social':
                const template = SOCIAL_MEDIA_TEMPLATES.find(t => t.id === settings.selectedSocialTemplateId);
                autoPrompt = `A social media post for ${template?.platform || 'socials'}${settings.productDescription ? ` featuring ${settings.productDescription}` : ''}.`;
                break;
            case 'design':
                autoPrompt = `A new design concept${settings.productDescription ? ` inspired by ${settings.productDescription}` : ''}.`;
                break;
        }
        setSceneDescription(autoPrompt);

    }, [settings.productDescription, settings.generationMode, settings.mockupType, settings.selectedSocialTemplateId]);
    
    const handleEnhancePrompt = async () => {
        if (!sceneDescription) return;
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const enhancedPrompt = await geminiService.enhancePrompt(sceneDescription);
            setSceneDescription(enhancedPrompt);
            isPromptDirty.current = true;
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enhance prompt.");
        } finally {
            setIsEnhancingPrompt(false);
        }
    };

    const handleAddKeyObject = () => {
        setSettings(s => ({ ...s, keyObjects: [...s.keyObjects, { id: nanoid(), name: '', image: null }] }));
    };
    const handleUpdateKeyObject = (id: string, updates: Partial<KeyObject>) => {
        setSettings(s => ({
            ...s,
            keyObjects: s.keyObjects.map(o => o.id === id ? { ...o, ...updates } : o)
        }));
    };
    const handleRemoveKeyObject = (id: string) => {
        setSettings(s => ({
            ...s,
            keyObjects: s.keyObjects.filter(o => o.id !== id)
        }));
    };
    const handleGenerate = async () => {
        setError(null); setIsLoading(true); setPalette(undefined); setSelectedImageIndex(null);
    
        const prepareAndGenerate = async () => {
            try {
                let keyObjectsPrompt = '';
                if (settings.keyObjects.length > 0) {
                     const objectNames = settings.keyObjects.map(o => o.name).filter(Boolean);
                     if (objectNames.length > 0) {
                         keyObjectsPrompt = ` The scene should include these objects (provided as reference images): ${objectNames.join(', ')}.`;
                     }
                }
        
                const selectedLightingStyle = CINEMATIC_LIGHTING_STYLES.find(ls => ls.id === settings.lightingStyle)?.name;
                const selectedPhotoStyle = PHOTO_STYLES.find(s => s.id === settings.photoStyle)?.name;
        
                const cinematicPrompt = [
                    selectedPhotoStyle,
                    selectedLightingStyle,
                    settings.cameraPerspective,
                ].filter(p => p && p !== 'None').join(', ');
        
                const basePrompt = `${sceneDescription}, ${cinematicPrompt}${keyObjectsPrompt}`;
                
                const placeholders: GeneratedItem[] = Array(settings.numberOfImages).fill(null).map(() => ({ id: nanoid(), prompt: basePrompt, isLoading: true }));
                setGeneratedItems(prev => [...placeholders, ...prev.filter(i => !i.isLoading)]);

                const allPromises = placeholders.map(async (placeholder, i) => {
                    const seed = settings.seed ? parseInt(settings.seed) + i : null;
                    let textPrompt = basePrompt;
                    const parts: Part[] = [];

                    // Add style reference image first
                    if (styleRefImage) {
                        parts.push(await geminiService.fileToGenerativePart(styleRefImage));
                        textPrompt = `Use the first image as a strong style reference for composition, mood, and color palette. ${textPrompt}`;
                    }

                    // Add key object images
                    for (const obj of settings.keyObjects) {
                        if (obj.image) {
                            parts.push(await geminiService.fileToGenerativePart(obj.image));
                        }
                    }

                    // Add main subject image last, and clarify its role
                    switch(settings.generationMode) {
                        case 'mockup':
                            if (!productImageNoBg) throw new Error("Product image not ready for mockup.");
                            const selectedMockup = MOCKUP_TYPES.find(m => m.id === settings.mockupType);
                            if (!selectedMockup) throw new Error("Invalid mockup type selected.");
                            setLoadingMessage(t('loadingGeneratingMockup'));
                            parts.push(geminiService.base64ToGenerativePart(productImageNoBg));
                            textPrompt += ` The final reference image is the main subject (with a transparent background); place it realistically onto a ${selectedMockup.promptFragment}.`;
                            break;
                        case 'product':
                        case 'social':
                        case 'design':
                        default:
                            setLoadingMessage(t('loadingGeneratingImages', {count: settings.numberOfImages}));
                            if (productImageNoBg) {
                                parts.push(geminiService.base64ToGenerativePart(productImageNoBg));
                                textPrompt += ` The final reference image is the main subject (with a transparent background); place it realistically into the scene.`;
                            } else if (productImage) {
                                parts.push(await geminiService.fileToGenerativePart(productImage));
                                textPrompt += ` The final reference image is the main subject; use it as the focus of the scene.`;
                            }
                            break;
                    }
                    
                    const finalPromptWithNegative = `${textPrompt}${settings.negativePrompt ? `. Negative prompt: do not include ${settings.negativePrompt}.` : ''}`;
        
                    parts.push({ text: finalPromptWithNegative });
                    
                    const resultBase64 = await geminiService.generateImageFromParts(parts, seed);
                    const src = `data:image/png;base64,${resultBase64}`;
                    setGeneratedItems(prev => prev.map(item => item.id === placeholder.id ? { ...item, src, prompt: basePrompt, isLoading: false } : item));
                    return { src, prompt: basePrompt };
                });
        
                const results = await Promise.all(allPromises);
        
                if (results.length > 0) {
                    addHistoryItem({
                        source: { page: 'product-generation', appName: t(`mode${settings.generationMode.charAt(0).toUpperCase() + settings.generationMode.slice(1)}` as any)},
                        thumbnail: { type: 'image', value: results[0].src },
                        title: results[0].prompt,
                        payload: { settings: {...settings, prompt: results[0].prompt}, productImagePreview, productImageNoBg, generatedItems: results.map(r => ({id: nanoid(), src: r.src, prompt: r.prompt, isLoading: false})), textOverlays }
                    });
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
                setGeneratedItems(items => items.filter(it => !it.isLoading));
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        };
        prepareAndGenerate();
    };
    
    const handleDownload = (src: string) => {
        if (!src) return;
        const link = document.createElement('a');
        link.href = src;
        link.download = `higgsfield-image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStartOver = () => { resetState(); setIsStartOverModalOpen(false); };
    
    const runActionForSelectedIndex = async (action: () => Promise<string | void>, loadingMsg: string, errorMsg: string) => {
        if (selectedImageIndex === null) return;
        
        setIsLoading(true);
        setLoadingMessage(loadingMsg);
        setError(null);
        
        try {
            const result = await action();
            if (typeof result === 'string') {
                const newSrc = `data:image/png;base64,${result}`;
                setGeneratedItems(items => items.map((item, index) => index === selectedImageIndex ? { ...item, src: newSrc } : item));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : errorMsg);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };
    const handleMagicEdit = (imageWithMask: string, prompt: string) => runActionForSelectedIndex(() => geminiService.magicEditImage(imageWithMask, prompt), t('loadingMagicEdit'), "Magic Edit failed.");
    const handleRemoveObject = (imageWithMask: string) => runActionForSelectedIndex(() => geminiService.removeObject(imageWithMask), t('loadingRemovingObject'), "Object removal failed.");
    const handleEnhanceImage = () => runActionForSelectedIndex(() => geminiService.enhanceImage(selectedItem!.src!.split(',')[1], selectedItem!.prompt), t('loadingEnhancingImage'), "Enhancement failed.");
    const handleExpandImage = (direction: 'up'|'down'|'left'|'right') => runActionForSelectedIndex(() => geminiService.expandImage(selectedItem!.src!.split(',')[1], selectedItem!.prompt, direction), t('loadingExpandingImage', { direction }), "Expansion failed.");
    const handleGenerateCopy = async (regenerate = false) => {
        if (!selectedItem?.src) return;
        if (!regenerate) setIsCopyModalOpen(true);
        setIsLoading(true);
        setLoadingMessage(t('loadingGeneratingCopy'));
        try {
            const copy = await geminiService.generateMarketingCopy(selectedItem.src.split(',')[1], selectedItem.prompt);
            setMarketingCopy(copy);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate copy.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    const handleExtractPalette = async () => {
         if (!selectedItem?.src) return;
         runActionForSelectedIndex(async () => {
            const result = await geminiService.extractPalette(selectedItem!.src!.split(',')[1]);
            setPalette(result);
        }, t('loadingExtractingPalette'), "Palette extraction failed.");
    };

    const mainImageLabel = settings.generationMode === 'product' || settings.generationMode === 'mockup' ? 'Product Image' : 'Main Subject Image';

    if (selectedImageIndex !== null) {
        return (
            <div className="h-full flex flex-col">
                <Canvas
                    productImagePreview={productImagePreview}
                    generatedImages={selectedItem?.src ? [selectedItem.src] : []}
                    generatedVideoUrl={null}
                    selectedImageIndex={0}
                    onSelectImage={(index) => setSelectedImageIndex(index)}
                    isLoading={isLoading} loadingMessage={loadingMessage} error={error}
                    onRetry={handleGenerate} onStartOver={() => setIsStartOverModalOpen(true)}
                    aspectRatio={settings.aspectRatio}
                    editorMode={editorMode} setEditorMode={setEditorMode}
                    textOverlays={textOverlays} setTextOverlays={setTextOverlays}
                    brandKit={activeBrandKit} watermarkSettings={settings.watermark}
                    palette={palette} onExtractPalette={handleExtractPalette}
                    onEnhance={handleEnhanceImage} onMagicEdit={handleMagicEdit}
                    onRemoveObject={handleRemoveObject} onExpandImage={handleExpandImage}
                    onGenerateCopy={() => handleGenerateCopy(false)}
                />
                 <button onClick={() => setSelectedImageIndex(null)} className="absolute top-20 left-4 z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 hover:bg-accent backdrop-blur-sm text-sm font-medium">
                    <Icon name="arrow-left" className="w-4 h-4"/> Back to Gallery
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="bg-card/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-border/50 md:w-[380px] flex-shrink-0 flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Product Studio</h2>
                        <p className="text-sm text-muted-foreground mt-1">Generate professional product photos, mockups, and more.</p>
                    </div>
                    <Tooltip text={t('startOver')}>
                        <button onClick={() => setIsStartOverModalOpen(true)} className="p-2 rounded-md hover:bg-accent text-muted-foreground">
                            <Icon name="restart" className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
                    <div className="p-1 bg-muted rounded-lg grid grid-cols-4 items-center shadow-inner">
                        {generationModes.map(mode => (
                            <button key={mode.id} onClick={() => {
                                setSettings(s => ({...s, generationMode: mode.id}));
                                isPromptDirty.current = false;
                            }}
                            className={`flex-1 text-center px-2 py-1.5 text-xs font-semibold rounded-md transition-colors flex flex-col items-center gap-1 ${settings.generationMode === mode.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                                <Icon name={mode.icon} className="w-4 h-4" />
                                {mode.name}
                            </button>
                        ))}
                    </div>

                    {settings.generationMode === 'mockup' && (
                        <div className="animate-fade-in">
                            <Label>Mockup Type</Label>
                            <select
                                value={settings.mockupType}
                                onChange={(e) => {
                                    setSettings(s => ({...s, mockupType: e.target.value}));
                                    isPromptDirty.current = false;
                                }}
                                className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm"
                            >
                                {MOCKUP_TYPES.map(mockup => (
                                    <option key={mockup.id} value={mockup.id}>{mockup.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {settings.generationMode === 'social' && (
                        <div className="animate-fade-in">
                            <Label>Social Media Template</Label>
                            <select
                                value={settings.selectedSocialTemplateId || ''}
                                onChange={(e) => {
                                    setSettings(s => ({...s, selectedSocialTemplateId: e.target.value}));
                                    isPromptDirty.current = false;
                                }}
                                className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm"
                            >
                                {SOCIAL_MEDIA_TEMPLATES.map(template => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {['product', 'mockup', 'social', 'design'].includes(settings.generationMode) && (
                         <div>
                            <Label>{mainImageLabel}</Label>
                            <div className="flex gap-2 items-start">
                                {productImagePreview && (
                                    <img src={productImagePreview} alt="Main subject preview" className="w-20 h-20 object-contain rounded-md border bg-muted flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <FileUpload 
                                        onFileUpload={handleProductImageUpload} 
                                        label={mainImageLabel} 
                                        uploadedFileName={productImage?.name} 
                                        onClear={() => resetState(true)} 
                                    />
                                </div>
                            </div>
                            {promptGenerationMessage && <p className="text-xs text-muted-foreground mt-2 animate-pulse">{promptGenerationMessage}</p>}
                        </div>
                    )}
                     {['social', 'design'].includes(settings.generationMode) && !productImage && (
                        <div>
                            <Label>Core Subject / Idea</Label>
                            <textarea
                                value={settings.productDescription}
                                onChange={(e) => setSettings(s => ({ ...s, productDescription: e.target.value }))}
                                placeholder={settings.generationMode === 'social' ? "e.g., A promotional post for a new coffee shop" : "e.g., A futuristic cityscape in a retro style"}
                                className="w-full bg-input border border-border rounded-md p-2 text-sm min-h-[70px] resize-none"
                            />
                        </div>
                    )}
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <Label className="flex items-center gap-2 font-semibold text-foreground mb-0">
                                <Icon name="pencil" className="w-4 h-4 text-muted-foreground" /> Prompt
                            </Label>
                            <Tooltip text={t('enhancePrompt')}><button onClick={handleEnhancePrompt} disabled={isEnhancingPrompt || !sceneDescription} className="p-1 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50"><Icon name="wand" className={`w-4 h-4 ${isEnhancingPrompt ? 'animate-pulse' : ''}`}/></button></Tooltip>
                        </div>
                        <SceneSuggestions templates={suggestions} onSelect={(s) => { setSceneDescription(s.prompt); isPromptDirty.current = true; }} isLoading={isLoadingSuggestions} />
                         <textarea ref={textareaRef} value={sceneDescription} onChange={(e) => {setSceneDescription(e.target.value); isPromptDirty.current = true;}}
                            placeholder="Describe your scene..." className="w-full bg-input border border-border rounded-md p-2 text-sm min-h-[100px] resize-none mt-2"
                            rows={3} disabled={isLoading || !!promptGenerationMessage} onFocus={() => isPromptDirty.current = true} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Advanced Mode</p>
                        <div className="bg-card border border-border rounded-lg p-2 space-y-2">
                             <SelectControl icon="cube" label="AI Model" value={selectedModel} onChange={() => {}} children={<option>{selectedModel}</option>} />
                             <SelectControl icon="aspect-ratio" label="Aspect Ratio" value={settings.aspectRatio} onChange={e => setSettings(s => ({...s, aspectRatio: e.target.value as AspectRatio}))}>
                                {(['1:1', '4:5', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map(r => <option key={r} value={r}>{r}</option>)}
                            </SelectControl>
                             <SelectControl icon="image" label={t('numberOfImages')} value={String(settings.numberOfImages)} onChange={e => setSettings(s => ({...s, numberOfImages: parseInt(e.target.value, 10) as GenerationSettings['numberOfImages']}))}>
                                {numImages.map(num => <option key={num} value={num}>{num}</option>)}
                            </SelectControl>
                            <SelectControl icon="wand" label="Style" value={settings.photoStyle} onChange={e => setSettings(s => ({...s, photoStyle: e.target.value}))}>
                                {PHOTO_STYLES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                            <SelectControl icon="sun" label="Lighting" value={settings.lightingStyle} onChange={e => setSettings(s => ({...s, lightingStyle: e.target.value}))}>
                                {CINEMATIC_LIGHTING_STYLES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                            <SelectControl icon="camera" label="Perspective" value={settings.cameraPerspective} onChange={e => setSettings(s => ({...s, cameraPerspective: e.target.value}))}>
                                {CAMERA_PERSPECTIVE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                             <div className="p-2">
                                 <Label>Negative Prompt</Label>
                                <input type="text" value={settings.negativePrompt} onChange={(e) => setSettings(s => ({...s, negativePrompt: e.target.value}))} placeholder="e.g. text, watermark, blurry..." className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm"/>
                            </div>
                        </div>
                    </div>

                     <div>
                         <Label>Style Reference Image</Label>
                        <div className="flex gap-2 items-start">
                            {styleRefImagePreview && (
                                <img src={styleRefImagePreview} alt="Style Preview" className="w-20 h-20 object-contain rounded-md border bg-muted flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <FileUpload onFileUpload={setStyleRefImage} label="Upload style reference" uploadedFileName={styleRefImage?.name} onClear={() => setStyleRefImage(null)} />
                            </div>
                        </div>
                    </div>
                    <div>
                         <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground"><Icon name="sparkles" className="w-4 h-4 text-muted-foreground" /> Key Objects</Label>
                        <div className="space-y-3">
                             {settings.keyObjects.map(obj => (
                                 <div key={obj.id} className="bg-input/50 p-2 rounded-md space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="text" placeholder="Object name" value={obj.name} onChange={e => handleUpdateKeyObject(obj.id, { name: e.target.value })} className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-sm"/>
                                        <button onClick={() => handleRemoveKeyObject(obj.id)} className="p-1 text-muted-foreground hover:text-destructive"><Icon name="close" className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {keyObjectPreviews[obj.id] && (
                                            <img src={keyObjectPreviews[obj.id]} alt={obj.name} className="w-12 h-12 object-contain rounded-md border bg-muted flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <FileUpload onFileUpload={file => handleUpdateKeyObject(obj.id, { image: file })} label="Object Image" uploadedFileName={obj.image?.name} onClear={() => handleUpdateKeyObject(obj.id, { image: null })} />
                                        </div>
                                    </div>
                                </div>
                             ))}
                        </div>
                        <button onClick={handleAddKeyObject} className="text-xs font-semibold text-primary mt-2">+ Add Object</button>
                    </div>
                </div>

                 <div className="p-4 border-t mt-auto">
                    <button onClick={handleGenerate} disabled={isLoading || !!promptGenerationMessage || !sceneDescription} className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><Icon name="sparkles" className="w-5 h-5" /> {t('generate')}</>}
                    </button>
                </div>
            </div>
            
            {/* Center Content */}
            <main className="flex-1 flex flex-col min-h-0">
                 <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-8">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6 relative">
                            <h3 className="font-bold">Generation Failed</h3>
                            <p className="text-sm">{error}</p>
                            <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1"><Icon name="close" className="w-4 h-4"/></button>
                        </div>
                    )}
                    {generatedItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {generatedItems.map((item, index) => (
                                <ImageCard 
                                    key={item.id} item={item} onSelect={() => setSelectedImageIndex(index)} 
                                    onDownload={() => handleDownload(item.src!)}
                                    onEnhance={() => handleEnhanceImage()}
                                    onGenerateCopy={() => handleGenerateCopy(false)}
                                    onSetEditorMode={(mode) => setEditorMode(mode)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8 animate-fade-in">
                            <Icon name="image" className="w-24 h-24 text-primary/20" />
                            <h2 className="text-2xl font-bold mt-4 text-foreground">Image Studio</h2>
                            <p className="max-w-sm mt-2">Configure your generation in the left panel. Your results will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
            {/* Right Sidebar */}
            <div className="bg-card/50 backdrop-blur-md border-t md:border-t-0 md:border-l border-border/50 md:w-[350px] flex-shrink-0">
                <Tabs tabs={[{key: 'History', label: t('history')}, {key: 'Brand', label: t('brand')}]}>
                    {(activeTab) => (
                        <div className="p-4 h-full">
                            {activeTab === 'History' && <HistoryPanel history={history} onRestore={onRestore} onToggleFavorite={onToggleFavorite} onDelete={deleteHistoryItem} />}
                            {activeTab === 'Brand' && <BrandKitPanel brandKits={brandKits} setBrandKits={setBrandKits} activeBrandKitId={activeBrandKitId} setActiveBrandKitId={setActiveBrandKitId} />}
                        </div>
                    )}
                </Tabs>
            </div>
            <ConfirmationModal isOpen={isStartOverModalOpen} onClose={() => setIsStartOverModalOpen(false)} onConfirm={handleStartOver} title={t('confirmStartOverTitle')} message={t('confirmStartOverMessage')} />
            <MarketingCopyModal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} copy={marketingCopy} onRegenerate={() => handleGenerateCopy(true)} isLoading={isLoading && isCopyModalOpen} />
            <StylePresetModal
                isOpen={isPresetModalOpen}
                onClose={() => setIsPresetModalOpen(false)}
                presets={PRESETS}
                onSelect={(preset: Preset) => {
                    setSceneDescription(prev => `${prev}${prev ? ', ' : ''}${preset.promptFragment}`);
                    isPromptDirty.current = true;
                    setIsPresetModalOpen(false);
                }}
                activeMode={settings.generationMode}
            />
        </div>
    );
};
