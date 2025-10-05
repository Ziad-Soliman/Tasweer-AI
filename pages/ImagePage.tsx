// This is a new, dedicated page for Image Generation.
// It is a refactored and streamlined version of the 'product', 'mockup', 'social', and 'design' modes from the old ProductGenerationPage.

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

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    return (
        <details className="group border border-border rounded-lg bg-card overflow-hidden" open={defaultOpen}>
            <summary className="font-semibold text-foreground px-4 py-3 cursor-pointer list-none flex items-center justify-between hover:bg-muted/50 transition-colors">
                <span>{title}</span>
                <Icon name="chevron-down" className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 pt-2 border-t border-border bg-background space-y-4">
                {children}
            </div>
        </details>
    );
};

interface GeneratedItem {
    id: string;
    src?: string;
    prompt: string;
    isLoading: boolean;
}

const LoadingCard = () => (
    <div className="w-full bg-[#111118] border border-slate-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute w-5 h-5 bg-pink-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full"></div>
        </div>
        <p className="mt-6 font-semibold text-slate-200 tracking-wide">Forging New Realities ...</p>
        <p className="mt-1 text-sm text-slate-400">Rendering impossible landscapes...</p>
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
        action();
    }
    
    return (
        <div className="break-inside-avoid">
            {item.isLoading || !item.src ? (
                <LoadingCard />
            ) : (
                <>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer" onClick={onSelect}>
                        <img src={item.src} alt={item.prompt} className="w-full h-auto block bg-muted" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
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

const WelcomeScreen = ({ onUpload }: { onUpload: (file: File) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in h-full">
            <div className="w-full max-w-lg">
                 <Icon name="wand" className="w-24 h-24 text-primary/20 mx-auto mb-4" />
                 <h2 className="text-4xl font-bold tracking-tight text-foreground">AI Image Studio</h2>
                 <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">Generate new, stylized e-commerce and marketing images from a single product photo.</p>
                 <FileUpload onFileUpload={onUpload} label={t('uploadPhoto')}/>
            </div>
        </div>
    );
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

const IconGridSelector: React.FC<{
    label: string;
    options: readonly { id: string; name: string; icon: string }[];
    value: string;
    onChange: (id: string) => void;
    gridCols?: string;
}> = ({ label, options, value, onChange, gridCols = 'grid-cols-5' }) => (
    <div>
        <Label>{label}</Label>
        <div className={`grid ${gridCols} gap-2`}>
            {options.map(option => (
                <Tooltip key={option.id} text={option.name}>
                    <button onClick={() => onChange(option.id)}
                        className={`h-20 w-full flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 text-xs focus:outline-none ${value === option.id ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-transparent bg-background hover:bg-muted'}`}>
                        <Icon name={option.icon} className="w-6 h-6 mb-1.5" />
                        <span className="text-center leading-tight">{option.name}</span>
                    </button>
                </Tooltip>
            ))}
        </div>
    </div>
);


export const ImagePage: React.FC<ImagePageProps> = (props) => {
    const { history, onToggleFavorite, onRestore, addHistoryItem, deleteHistoryItem, restoredState, clearRestoredState } = props;
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
    const [isPromptDirty, setIsPromptDirty] = useState(false);
    const [socialRefPost, setSocialRefPost] = useState<File | null>(null);
    const [designRefImage, setDesignRefImage] = useState<File | null>(null);
    const [styleRefImage, setStyleRefImage] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const aspectRatios: { id: AspectRatio; icon: string }[] = [{ id: '1:1', icon: 'aspect-ratio-1-1' }, { id: '9:16', icon: 'aspect-ratio-9-16' }, { id: '16:9', icon: 'aspect-ratio-16-9' }, { id: '4:3', icon: 'aspect-ratio-4-3' }, { id: '3:4', icon: 'aspect-ratio-3-4' }];
    const numImages: GenerationSettings['numberOfImages'][] = [1, 2, 3, 4];
    const generationModes: {id: GenerationMode, name: string}[] = [
        {id: 'product', name: 'Product Photos'},
        {id: 'mockup', name: 'Mockups'},
        {id: 'social', name: 'Social Media'},
        {id: 'design', name: 'Designs'},
    ];
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [sceneDescription]);

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
        setIsPromptDirty(false);
        setSocialRefPost(null);
        setDesignRefImage(null);
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
            
            setPromptGenerationMessage(t('loadingRemovingBackground'));
            const base64NoBg = await geminiService.removeBackground(file);
            setProductImageNoBg(base64NoBg);

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
        if (isPromptDirty) return;
        if (!settings.productDescription && !['design', 'social'].includes(settings.generationMode)) {
            setSceneDescription(''); return;
        }

        let autoPrompt = '';
        switch (settings.generationMode) {
            case 'product': autoPrompt = `A professional product photograph of ${settings.productDescription}`; break;
            case 'mockup':
                const selectedMockup = MOCKUP_TYPES.find(m => m.id === settings.mockupType);
                autoPrompt = `A photorealistic mockup of ${settings.productDescription} ${selectedMockup?.promptFragment || 'on a mockup'}.`;
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

    }, [settings.productDescription, settings.generationMode, settings.mockupType, settings.selectedSocialTemplateId, isPromptDirty]);
    
    const handleEnhancePrompt = async () => {
        if (!sceneDescription) return;
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const enhancedPrompt = await geminiService.enhancePrompt(sceneDescription);
            setSceneDescription(enhancedPrompt);
            setIsPromptDirty(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enhance prompt.");
        } finally {
            setIsEnhancingPrompt(false);
        }
    };

    const handleGenerate = async () => {
        setError(null); setIsLoading(true); setPalette(undefined); setSelectedImageIndex(null);
    
        const prepareAndGenerate = async () => {
            try {
                let keyObjectsPrompt = '';
                if (settings.keyObjects.length > 0) {
                    const objectNames = settings.keyObjects.map(o => o.name).filter(Boolean);
                    if (objectNames.length > 0) {
                        keyObjectsPrompt = ` The scene should include these objects: ${objectNames.join(', ')}.`;
                    }
                }
        
                const selectedLightingStyle = CINEMATIC_LIGHTING_STYLES.find(ls => ls.id === settings.lightingStyle)?.name;
                const selectedPhotoStyle = PHOTO_STYLES.find(s => s.id === settings.photoStyle)?.name;
                const selectedCameraZoom = CAMERA_ZOOMS.find(z => z.id === settings.cameraZoom)?.name;
                const selectedShotType = SHOT_TYPES.find(st => st.id === settings.shotType)?.name;
                const selectedColorTone = COLOR_TONES.find(ct => ct.id === settings.colorTone)?.name;
        
                const cinematicPrompt = [
                    selectedPhotoStyle,
                    selectedLightingStyle,
                    settings.cameraPerspective,
                    selectedCameraZoom,
                    selectedShotType,
                    selectedColorTone,
                ].filter(p => p && p !== 'None').join(', ');
        
                const basePrompt = `${sceneDescription}, ${cinematicPrompt}${keyObjectsPrompt}`;
                
                const placeholders: GeneratedItem[] = Array(settings.numberOfImages).fill(0).map(() => ({ id: nanoid(), prompt: basePrompt, isLoading: true }));
                setGeneratedItems(prev => [...placeholders, ...prev]);
        
                const keyObjectParts: Part[] = [];
                for (const obj of settings.keyObjects) {
                    if (obj.image) {
                        keyObjectParts.push(await geminiService.fileToGenerativePart(obj.image));
                    }
                }
        
                const allPromises = placeholders.map(async (placeholder, i) => {
                    const seed = settings.seed ? parseInt(settings.seed) + i : null;
                    let finalPrompt: string;
                    const parts: Part[] = [...keyObjectParts];

                    if (styleRefImage) {
                        parts.unshift(await geminiService.fileToGenerativePart(styleRefImage));
                    }
        
                    switch(settings.generationMode) {
                        case 'social':
                            if (!socialRefPost || !activeBrandKit?.logo) throw new Error("Reference post and brand logo required.");
                            setLoadingMessage(t('loadingGeneratingSocialPost'));
                            parts.push(await geminiService.fileToGenerativePart(socialRefPost));
                            parts.push(geminiService.base64ToGenerativePart(activeBrandKit.logo.split(',')[1], 'image/png'));
                            finalPrompt = `Using the provided images for reference (style, objects, layout, logo), create a new social media post based on the user's request: "${basePrompt}"`;
                            break;
                        case 'design':
                            if (!designRefImage) throw new Error("Reference design required.");
                            setLoadingMessage(t('loadingGeneratingDesign'));
                            parts.push(await geminiService.fileToGenerativePart(designRefImage));
                            finalPrompt = `Using the provided images (style, objects, design reference), create a new design based on: "${basePrompt}"`;
                            break;
                        case 'mockup':
                            if (!productImageNoBg) throw new Error("Product image not ready.");
                            const selectedMockup = MOCKUP_TYPES.find(m => m.id === settings.mockupType);
                            if (!selectedMockup) throw new Error("Invalid mockup type selected.");
                            setLoadingMessage(t('loadingGeneratingMockup'));
                            parts.push(geminiService.base64ToGenerativePart(productImageNoBg));
                            finalPrompt = `Using any style/object references, place the product with the transparent background realistically onto the described mockup scene: "${basePrompt}"`;
                            break;
                        case 'product':
                        default:
                            if (!productImageNoBg) throw new Error("Product image not ready.");
                            setLoadingMessage(t('loadingGeneratingImages', {count: settings.numberOfImages}));
                            parts.push(geminiService.base64ToGenerativePart(productImageNoBg));
                            finalPrompt = `Using the provided style/object references, place the main product (with transparent background) into the scene described: "${basePrompt}"`;
                            break;
                    }
                    
                    if (styleRefImage) {
                         finalPrompt = `Use the first image as a strong style reference for composition and color palette. ${finalPrompt}`;
                    }
        
                    parts.push({ text: `${finalPrompt}${settings.negativePrompt ? `. Negative prompt: do not include ${settings.negativePrompt}.` : ''}` });
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
                        payload: { settings: {...settings, prompt: results[0].prompt}, productImagePreview, productImageNoBg, generatedImages: results.map(r => r.src), textOverlays }
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


    if (!productImagePreview && !['design', 'social'].includes(settings.generationMode)) {
        return <WelcomeScreen onUpload={handleProductImageUpload} />;
    }

    if (selectedImageIndex !== null) {
        return (
            <div className="h-full flex flex-col">
                <Canvas
                    productImagePreview={productImagePreview}
                    generatedImages={selectedItem?.src ? [selectedItem.src] : []}
                    generatedVideoUrl={null}
                    selectedImageIndex={0}
                    onSelectImage={() => {}}
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
                 <button onClick={() => setSelectedImageIndex(null)} className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 hover:bg-accent backdrop-blur-sm text-sm font-medium">
                    <Icon name="arrow-left" className="w-4 h-4"/> Back to Gallery
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="bg-card border-b md:border-b-0 md:border-r border-border md:w-[380px] flex-shrink-0 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Icon name="wand"/> Image Studio</h2>
                </div>
                 <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                     <CollapsibleSection title="Main Asset">
                        <FileUpload 
                            onFileUpload={handleProductImageUpload} 
                            label={t('uploadPhoto')}
                            uploadedFileName={productImage?.name} 
                            onClear={() => setIsStartOverModalOpen(true)}
                            disabled={isLoading || !!promptGenerationMessage || ['design', 'social'].includes(settings.generationMode)}
                            disabledReason={promptGenerationMessage || (['design', 'social'].includes(settings.generationMode) ? "Use Mode-Specific uploads" : undefined)}
                        />
                    </CollapsibleSection>
                     <CollapsibleSection title="Style & Composition">
                        <FileUpload 
                            onFileUpload={setStyleRefImage} 
                            label="Upload Style Reference"
                            uploadedFileName={styleRefImage?.name}
                            onClear={() => setStyleRefImage(null)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">Upload an image to influence the style, colors, and composition of your generation.</p>
                    </CollapsibleSection>
                     <CollapsibleSection title="Key Objects">
                        <div className="space-y-3">
                            {settings.keyObjects.map((obj, index) => (
                                <div key={obj.id} className="bg-background p-2 rounded-md border flex items-start gap-2">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Object name (e.g., 'red apple')"
                                            value={obj.name}
                                            onChange={(e) => {
                                                const newObjects = [...settings.keyObjects];
                                                newObjects[index].name = e.target.value;
                                                setSettings(s => ({...s, keyObjects: newObjects}));
                                            }}
                                            className="w-full bg-muted border-none rounded-md p-2 text-sm h-8"
                                        />
                                        <FileUpload 
                                            onFileUpload={(file) => {
                                                const newObjects = [...settings.keyObjects];
                                                newObjects[index].image = file;
                                                setSettings(s => ({...s, keyObjects: newObjects}));
                                            }}
                                            label="Upload object image (optional)"
                                            uploadedFileName={obj.image?.name}
                                            onClear={() => {
                                                const newObjects = [...settings.keyObjects];
                                                newObjects[index].image = null;
                                                setSettings(s => ({...s, keyObjects: newObjects}));
                                            }}
                                        />
                                    </div>
                                    <button onClick={() => {
                                        setSettings(s => ({...s, keyObjects: s.keyObjects.filter(o => o.id !== obj.id)}));
                                    }} className="p-2 text-muted-foreground hover:text-destructive"><Icon name="trash" className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => {
                                const newObject: KeyObject = { id: nanoid(), name: '', image: null };
                                setSettings(s => ({...s, keyObjects: [...s.keyObjects, newObject]}));
                            }}
                            className="mt-2 w-full text-sm p-2 rounded-md bg-secondary hover:bg-accent flex items-center justify-center gap-2"
                        >
                            <Icon name="plus" className="w-4 h-4" /> Add Object
                        </button>
                    </CollapsibleSection>
                     <CollapsibleSection title="Mode-Specific Settings">
                        {settings.generationMode === 'mockup' && (
                             <IconGridSelector
                                label="Mockup Type"
                                options={MOCKUP_TYPES}
                                value={settings.mockupType}
                                onChange={(v) => { setSettings(s => ({...s, mockupType: v})); setIsPromptDirty(false); }}
                                gridCols="grid-cols-5"
                            />
                        )}
                        {settings.generationMode === 'social' && <>
                            <div>
                                <Label>Social Template</Label>
                                <select value={settings.selectedSocialTemplateId!} onChange={(e) => { setSettings(s => ({...s, selectedSocialTemplateId: e.target.value})); setIsPromptDirty(false); }}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    {SOCIAL_MEDIA_TEMPLATES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                            <FileUpload onFileUpload={setSocialRefPost} label="Upload Style Reference Post" uploadedFileName={socialRefPost?.name} onClear={() => setSocialRefPost(null)} />
                        </>}
                        {settings.generationMode === 'design' && <FileUpload onFileUpload={setDesignRefImage} label="Upload Design to Iterate On" uploadedFileName={designRefImage?.name} onClear={() => setDesignRefImage(null)} />}
                     </CollapsibleSection>
                    <CollapsibleSection title="Cinematic Controls">
                        <IconGridSelector gridCols="grid-cols-3" label="Lighting Style" options={CINEMATIC_LIGHTING_STYLES} value={settings.lightingStyle} onChange={(v) => setSettings(s => ({...s, lightingStyle: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Photo Style" options={PHOTO_STYLES} value={settings.photoStyle} onChange={(v) => setSettings(s => ({...s, photoStyle: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Camera Perspective" options={CAMERA_PERSPECTIVE_OPTIONS} value={settings.cameraPerspective} onChange={(v) => setSettings(s => ({...s, cameraPerspective: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Camera Zoom" options={CAMERA_ZOOMS} value={settings.cameraZoom} onChange={(v) => setSettings(s => ({...s, cameraZoom: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Shot Type" options={SHOT_TYPES} value={settings.shotType} onChange={(v) => setSettings(s => ({...s, shotType: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Color Tone" options={COLOR_TONES} value={settings.colorTone} onChange={(v) => setSettings(s => ({...s, colorTone: v}))} />
                    </CollapsibleSection>
                    <CollapsibleSection title="Output">
                        <div>
                            <Label>Aspect Ratio</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {aspectRatios.map(ratio => (
                                    <Tooltip key={ratio.id} text={ratio.id}>
                                        <button onClick={() => setSettings(s => ({ ...s, aspectRatio: ratio.id }))}
                                            className={`h-10 w-full flex items-center justify-center rounded-md border transition-colors ${settings.aspectRatio === ratio.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}>
                                            <Icon name={ratio.icon} className="w-6 h-6" />
                                        </button>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                         <div>
                            <Label>{t('numberOfImages')}</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {numImages.map(num => (
                                     <button key={num} onClick={() => setSettings(s => ({ ...s, numberOfImages: num }))}
                                        className={`h-10 w-full flex items-center justify-center rounded-md border transition-colors text-sm font-semibold ${settings.numberOfImages === num ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'}`}>
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>
                    <CollapsibleSection title="Advanced">
                         <div>
                            <Label>{t('negativePrompt')}</Label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {NEGATIVE_PROMPT_PRESETS.map(preset => {
                                    const isActive = settings.negativePrompt.includes(preset);
                                    return (
                                        <button
                                            key={preset}
                                            onClick={() => {
                                                const current = settings.negativePrompt.split(', ').filter(Boolean);
                                                const newPrompt = isActive ? current.filter(p => p !== preset) : [...current, preset];
                                                setSettings(s => ({...s, negativePrompt: newPrompt.join(', ')}));
                                            }}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${isActive ? 'bg-destructive/20 text-destructive-foreground border-destructive' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
                                        >
                                            {preset}
                                        </button>
                                    )
                                })}
                            </div>
                            <textarea value={settings.negativePrompt} onChange={(e) => setSettings(s => ({...s, negativePrompt: e.target.value}))}
                                placeholder="Add custom negative prompts, separated by commas..."
                                className="w-full bg-background border border-input rounded-md p-2 text-sm min-h-[60px] resize-none"
                            />
                        </div>
                        <div>
                           <Label>{t('seed')}</Label>
                           <input type="text" value={settings.seed} onChange={(e) => setSettings(s => ({...s, seed: e.target.value}))}
                                placeholder={t('seedPlaceholder')}
                                className="w-full bg-background border border-input rounded-md p-2 text-sm h-10" />
                        </div>
                    </CollapsibleSection>
                 </div>
            </div>
            {/* Center Content */}
            <main className="flex-1 flex flex-col min-h-0 bg-background/95">
                 <div className="flex-shrink-0 px-4 pt-4">
                    <div className="p-1.5 bg-muted rounded-full flex items-center w-fit mx-auto shadow-inner">
                        {generationModes.map(mode => (
                            <button key={mode.id} onClick={() => {
                                setSettings(s => ({...s, generationMode: mode.id}));
                                setIsPromptDirty(false); // Reset prompt dirtiness on mode change
                            }}
                            className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${settings.generationMode === mode.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                                {mode.name}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                    {generatedItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {generatedItems.map((item, index) => (
                                <ImageCard 
                                    key={item.id} item={item} onSelect={() => setSelectedImageIndex(index)} 
                                    onDownload={() => handleDownload(item.src!)}
                                    onEnhance={() => { setSelectedImageIndex(index); setTimeout(() => handleEnhanceImage(), 0); }}
                                    onGenerateCopy={() => { setSelectedImageIndex(index); setTimeout(() => handleGenerateCopy(false), 0); }}
                                    onSetEditorMode={(mode) => { setSelectedImageIndex(index); setEditorMode(mode); }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                            <p>Configure your generation and your results will appear here.</p>
                        </div>
                    )}
                </div>
                 <div className="flex-shrink-0 px-4 pb-4 mt-auto">
                    <div className="max-w-3xl mx-auto space-y-3">
                        <SceneSuggestions templates={suggestions} onSelect={(s) => { setSceneDescription(s.prompt); setIsPromptDirty(true); }} isLoading={isLoadingSuggestions} />
                        <div className="relative bg-card border border-border rounded-2xl shadow-lg flex items-center p-2 gap-2">
                             <Tooltip text={t('browsePresets')}>
                                <button onClick={() => setIsPresetModalOpen(true)} disabled={isLoading || isEnhancingPrompt} className="p-2 rounded-full hover:bg-muted disabled:opacity-50 flex-shrink-0">
                                    <Icon name="sparkles" className="w-5 h-5 text-primary"/>
                                </button>
                            </Tooltip>
                            <textarea ref={textareaRef} value={sceneDescription} onChange={(e) => {setSceneDescription(e.target.value); setIsPromptDirty(true);}}
                                placeholder="Describe your scene..." className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground p-2 resize-none"
                                rows={1} disabled={isLoading || !!promptGenerationMessage} />
                            <Tooltip text={t('enhancePrompt')}>
                                <button onClick={handleEnhancePrompt} disabled={isEnhancingPrompt || !sceneDescription || isLoading} className="p-2 rounded-full hover:bg-muted disabled:opacity-50 flex-shrink-0">
                                    {isEnhancingPrompt ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <Icon name="wand" className="w-5 h-5 text-primary"/>}
                                </button>
                            </Tooltip>
                            <button onClick={handleGenerate} disabled={isLoading || !!promptGenerationMessage || !sceneDescription} className="h-10 px-6 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-all bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0">
                                {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><span>{t('generate')}</span> <Icon name="arrow-right" className="w-4 h-4"/></>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            {/* Right Sidebar */}
            <div className="bg-card border-t md:border-t-0 md:border-l border-border md:w-[350px] flex-shrink-0">
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
                    setIsPromptDirty(true);
                    setIsPresetModalOpen(false);
                }}
                activeMode={settings.generationMode}
            />
        </div>
    );
};