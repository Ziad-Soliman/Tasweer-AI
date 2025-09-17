

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { nanoid } from 'nanoid';
import { ControlPanel } from '../components/ControlPanel';
import { Canvas } from '../components/Canvas';
import { AspectRatio, GenerationSettings, HistoryItem, Theme, EditorMode, BrandKit, TextOverlay, SceneTemplate, MarketingCopy, VideoLength, CameraMotion, GenerationMode, Preset } from '../types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS, MOCKUP_TYPES, SOCIAL_MEDIA_TEMPLATES } from '../constants';
import { PRESETS } from '../constants/presets';
import * as geminiService from '../services/geminiService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';
import { StylePresetModal } from '../components/StylePresetModal';
import { Tabs } from '../components/Tabs';
import { HistoryPanel } from '../components/HistoryPanel';
import { BrandKitPanel } from '../components/BrandKitPanel';

// Helper function to get initial theme
const getInitialTheme = (): Theme => 'dark'; // Force dark theme for modern UI

const getInitialBrandKits = (): { kits: BrandKit[], activeId: string | null } => {
    if (typeof window === 'undefined' || !window.localStorage) {
        const defaultKit = { id: nanoid(), name: 'Default Kit', logo: null, primaryColor: '#60A5FA', font: 'Inter' };
        return { kits: [defaultKit], activeId: defaultKit.id };
    }

    const storedKitsJSON = window.localStorage.getItem('brand-kit-presets');
    const storedActiveId = window.localStorage.getItem('active-brand-kit-id');
    
    if (storedKitsJSON) {
        try {
            const kits = JSON.parse(storedKitsJSON);
            const activeId = storedActiveId && kits.some((k: BrandKit) => k.id === storedActiveId) 
                ? storedActiveId 
                : (kits.length > 0 ? kits[0].id : null);
            return { kits, activeId };
        } catch (e) {
            console.error("Failed to parse brand kits from local storage", e);
        }
    }
    
    // Migration from old single kit format
    const oldStoredKitJSON = window.localStorage.getItem('brand-kit');
    if (oldStoredKitJSON) {
        try {
            const oldKit = JSON.parse(oldStoredKitJSON);
            const newKit: BrandKit = { id: nanoid(), name: 'My Brand Kit', ...oldKit };
            // Clear old key
            window.localStorage.removeItem('brand-kit');
            return { kits: [newKit], activeId: newKit.id };
        } catch (e) {
            console.error("Failed to migrate old brand kit", e);
        }
    }

    const defaultKit = { id: nanoid(), name: 'Default Kit', logo: null, primaryColor: '#60A5FA', font: 'Inter' };
    return { kits: [defaultKit], activeId: defaultKit.id };
};

const MarketingCopyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    copy: MarketingCopy | null;
    isLoading: boolean;
    onRegenerate: () => void;
}> = ({ isOpen, onClose, copy, isLoading, onRegenerate }) => {
    if (!isOpen) return null;

    const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="grid gap-2">
                 <label className="text-sm font-medium leading-none text-muted-foreground">{label}</label>
                <div className="flex items-center space-x-2">
                    <p dir="auto" className="flex-1 text-sm bg-secondary text-secondary-foreground p-3 rounded-md whitespace-pre-wrap font-mono">{value}</p>
                    <Tooltip text={copied ? "Copied!" : "Copy"}>
                        <button onClick={handleCopy} className="p-2 rounded-md bg-secondary hover:bg-accent text-muted-foreground">
                            <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-card border shadow-lg rounded-lg p-6 w-full max-w-2xl m-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Dialog Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                     <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                        <Icon name="pencil" /> AI Generated Marketing Copy
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Review, copy, and use this AI-generated content for your marketing.
                    </p>
                </div>

                {/* Dialog Content */}
                {isLoading && (
                    <div className="h-72 flex flex-col items-center justify-center text-center">
                        <Icon name="spinner" className="w-8 h-8 animate-spin text-primary" />
                        <p className="mt-3 text-muted-foreground">Generating brilliant copy...</p>
                    </div>
                )}
                
                {!isLoading && copy && (
                    <div className="space-y-4">
                        <CopyField label="Product Name" value={copy.productName} />
                        <CopyField label="Tagline" value={copy.tagline} />
                        <CopyField label="Description" value={copy.description} />
                        <CopyField label="Social Media Post" value={copy.socialMediaPost} />
                        <CopyField label="Social Media Post (Arabic)" value={copy.socialMediaPostArabic} />
                    </div>
                )}

                {/* Dialog Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                     <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 mb-2 sm:mb-0"
                        onClick={onRegenerate}
                    >
                        <Icon name="restart" className="w-4 h-4" /> Regenerate
                    </button>
                </div>
            </div>
        </div>
    );
};

const RightSidebar: React.FC<{
    history: HistoryItem[];
    onRevertToHistory: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
    brandKits: BrandKit[];
    setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
    activeBrandKitId: string | null;
    setActiveBrandKitId: React.Dispatch<React.SetStateAction<string | null>>;
    onClose?: () => void;
}> = (props) => {
    return (
        <>
             <div className="p-4 border-b border-border/80 flex items-center justify-between h-[65px]">
                 <h2 className="text-lg font-semibold">Workspace</h2>
                 {props.onClose && (
                    <button onClick={props.onClose} className="p-2 rounded-md hover:bg-accent text-muted-foreground lg:hidden" aria-label="Close Workspace Panel">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                 )}
             </div>
             <Tabs tabs={[`History (${props.history.length})`, 'Brand']}>
                {(activeTab) => (
                    <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                        {activeTab === `History (${props.history.length})` && 
                            <HistoryPanel 
                                history={props.history}
                                onRevert={props.onRevertToHistory}
                                onToggleFavorite={props.onToggleFavorite}
                            />
                        }
                        {activeTab === 'Brand' &&
                            <BrandKitPanel
                                brandKits={props.brandKits}
                                setBrandKits={props.setBrandKits}
                                activeBrandKitId={props.activeBrandKitId}
                                setActiveBrandKitId={props.setActiveBrandKitId}
                            />
                        }
                    </div>
                )}
            </Tabs>
        </>
    );
};


const PromptBar: React.FC<{
    finalPrompt: string;
    settings: GenerationSettings;
    setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
    onGenerate: () => void;
    isLoading: boolean;
    productImage: File | null;
    onBrowsePresets: () => void;
    isFocused: boolean;
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
    onEnhancePrompt: () => void;
    isEnhancingPrompt: boolean;
}> = ({ finalPrompt, settings, setSettings, onGenerate, isLoading, productImage, onBrowsePresets, isFocused, setIsFocused, onEnhancePrompt, isEnhancingPrompt }) => {
    const isVideoMode = settings.generationMode === 'video';
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);

    useEffect(() => {
        const textarea = textAreaRef.current;
        if (isEditingPrompt && textarea) {
            textarea.style.height = 'auto';
            const singleRowHeight = 24;
            const newHeight = Math.max(textarea.scrollHeight, singleRowHeight);
            textarea.style.height = `${newHeight}px`;
        }
    }, [finalPrompt, isFocused, isEditingPrompt]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setIsEditingPrompt(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [containerRef, setIsFocused]);

    useEffect(() => {
        if (isEditingPrompt) {
            textAreaRef.current?.focus();
        }
    }, [isEditingPrompt]);

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSettings(s => ({...s, editedPrompt: value === '' ? null : value}));
    };

    const enableEditing = () => {
        if (!productImage || isLoading) return;
        setIsEditingPrompt(true);
        setIsFocused(true);
    };


    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div ref={containerRef} className={`w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${isFocused ? 'shadow-primary/20 border-primary/30' : ''}`}>
                <div className={`px-2 pt-2 transition-all duration-300 ease-in-out overflow-hidden ${isFocused ? 'max-h-40' : 'max-h-0'}`}>
                    <textarea
                        value={settings.negativePrompt}
                        onChange={(e) => setSettings(s => ({...s, negativePrompt: e.target.value}))}
                        placeholder="Negative prompt (e.g. text, watermarks, ugly)..."
                        disabled={isLoading || !productImage}
                        rows={2}
                        className="w-full bg-secondary text-secondary-foreground p-2 rounded-md text-sm placeholder:text-muted-foreground disabled:opacity-50 resize-none focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="p-2 flex items-start gap-2">
                    <Tooltip text="Browse Presets">
                        <button onClick={onBrowsePresets} className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent rounded-md"><Icon name="sparkles" className="w-5 h-5"/></button>
                    </Tooltip>
                    
                    {isEditingPrompt ? (
                         <textarea 
                            ref={textAreaRef}
                            value={finalPrompt}
                            onChange={handlePromptChange}
                            placeholder={productImage ? "Describe the scene for your product..." : "Upload a product to start..."}
                            disabled={isLoading || !productImage} 
                            rows={1}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsEditingPrompt(false)}
                            className={`flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50 pt-2 transition-all duration-200 overflow-y-auto ${isFocused ? 'max-h-48' : 'max-h-10'}`}
                        />
                    ) : (
                        <div 
                            className="flex-1 pt-2 min-h-[40px] flex items-center cursor-text"
                            onClick={enableEditing}
                        >
                            <p className={`text-sm ${finalPrompt ? 'text-foreground' : 'text-muted-foreground'} line-clamp-3`}>
                                {finalPrompt || (productImage ? "Describe the scene for your product..." : "Upload a product to start...")}
                            </p>
                        </div>
                    )}
                    
                     <Tooltip text="Enhance Prompt with AI">
                        <button onClick={onEnhancePrompt} disabled={isEnhancingPrompt || !finalPrompt} className="self-end flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <Icon name={isEnhancingPrompt ? 'spinner' : 'wand'} className={`w-5 h-5 ${isEnhancingPrompt ? 'animate-spin' : ''}`}/>
                        </button>
                    </Tooltip>

                    {!isEditingPrompt && (
                        <Tooltip text="Edit Prompt">
                            <button
                                onClick={enableEditing}
                                disabled={!productImage || isLoading}
                                className="self-end flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent rounded-md disabled:opacity-50"
                            >
                                <Icon name="pencil" className="w-4 h-4"/>
                            </button>
                        </Tooltip>
                    )}

                    <button
                        onClick={onGenerate}
                        disabled={isLoading || !productImage}
                        className="self-end inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 animate-glow"
                        title="Generate (Ctrl+G)"
                    >
                        {isLoading ? (
                            <Icon name="spinner" className="animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Icon name={isVideoMode ? 'video' : 'wand'} className="w-4 h-4" />
                                Generate
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ProductGenerationPageProps {
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    setIsRightSidebarOpen: (value: React.SetStateAction<boolean>) => void;
}

export const ProductGenerationPage: React.FC<ProductGenerationPageProps> = ({ isLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen }) => {
    // Core state
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    
    // Settings state
    const [settings, setSettings] = useState<GenerationSettings>(() => {
        const initial: GenerationSettings = {
            generationMode: 'product',
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            videoLength: VIDEO_LENGTHS[0],
            cameraMotion: CAMERA_MOTIONS[0],
            mockupType: MOCKUP_TYPES[0],
            selectedSocialTemplateId: SOCIAL_MEDIA_TEMPLATES[0].id,
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            selectedPresetId: null,
            watermark: { enabled: false, text: '', position: 'bottom-right', scale: 5, opacity: 70, useLogo: false }
        };
        return initial;
    });

    const [sceneTemplates, setSceneTemplates] = useState<SceneTemplate[]>([]);
    
    // Output state
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    
    // UI/App state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [editorMode, setEditorMode] = useState<EditorMode>('view');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [promptGenerationMessage, setPromptGenerationMessage] = useState<string>('');
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [isPromptFocused, setIsPromptFocused] = useState(false);
    
    // Brand Kit State
    const [initialBrandKitState] = useState(getInitialBrandKits);
    const [brandKits, setBrandKits] = useState<BrandKit[]>(initialBrandKitState.kits);
    const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>(initialBrandKitState.activeId);
    
    // Marketing Copy State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isCopyLoading, setIsCopyLoading] = useState(false);
    const [marketingCopy, setMarketingCopy] = useState<MarketingCopy | null>(null);

    const activeBrandKit = useMemo(() => brandKits.find(kit => kit.id === activeBrandKitId), [brandKits, activeBrandKitId]);

    // Derived state for the final prompt
    const finalPrompt = settings.editedPrompt ?? settings.prompt;

    const resetForNewProduct = () => {
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setError(null);
        setTextOverlays([]);
        setSettings(s => ({
            ...s,
            generationMode: 'product',
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            videoLength: VIDEO_LENGTHS[0],
            cameraMotion: CAMERA_MOTIONS[0],
            mockupType: MOCKUP_TYPES[0],
            selectedSocialTemplateId: SOCIAL_MEDIA_TEMPLATES[0].id,
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            selectedPresetId: null,
        }));
        setSceneTemplates([]);
    };

    // Main image upload and analysis
    const handleProductImageUpload = useCallback(async (file: File) => {
        resetForNewProduct();
        setProductImage(file);
        setProductImagePreview(URL.createObjectURL(file));
        setIsLoading(true);
        try {
            setLoadingMessage('Analyzing product...');
            const description = await geminiService.describeProduct(file);
            setSettings(s => ({ ...s, productDescription: description }));

            setLoadingMessage('Generating scene templates...');
            const templates = await geminiService.generateSceneTemplates(description);
            setSceneTemplates(templates);

        } catch (e) {
            setError('Failed to analyze product.');
            console.error(e);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    // Effect to auto-generate and enhance the prompt from settings
    useEffect(() => {
        if (!settings.productDescription || settings.editedPrompt !== null) {
            // If there's no product, ensure the prompt is empty.
            if (!settings.productDescription && settings.prompt) {
                setSettings(s => ({ ...s, prompt: '' }));
            }
            return;
        }
    
        const enhance = async () => {
            const selectedPreset = PRESETS.find(p => p.id === settings.selectedPresetId);
            const styleClause = selectedPreset ? `, Style: ${selectedPreset.name} (${selectedPreset.promptFragment})` : '';
            let concept = '';
    
            switch (settings.generationMode) {
                case 'video':
                    concept = `A ${settings.videoLength.split(' ')[0]} video of ${settings.productDescription}. Camera Motion: ${settings.cameraMotion}${styleClause}.`;
                    break;
                case 'mockup':
                    concept = `A mockup on a ${settings.mockupType}, featuring the product: ${settings.productDescription}${styleClause}.`;
                    break;
                case 'social':
                    const selectedTemplate = SOCIAL_MEDIA_TEMPLATES.find(t => t.id === settings.selectedSocialTemplateId);
                    const templateClause = selectedTemplate ? ` for an ${selectedTemplate.name}` : '';
                    concept = `A social media post${templateClause} for ${settings.productDescription}${styleClause}.`;
                    break;
                case 'design':
                    concept = `A creative graphic design for: ${settings.productDescription}${styleClause}.`;
                    break;
                case 'product':
                default:
                    concept = `Product photography of ${settings.productDescription}. Perspective: ${settings.cameraPerspective}, Lighting: ${settings.lightingStyle}${styleClause}.`;
                    break;
            }
    
            setIsGeneratingPrompt(true);
            const message = selectedPreset
                ? `Analyzing '${selectedPreset.name}' style and writing prompt...`
                : 'Drafting a creative prompt...';
            setPromptGenerationMessage(message);

            try {
                const enhancedPrompt = await geminiService.enhancePrompt(concept);
                setSettings(s => {
                    // Only update if the user hasn't started editing in the meantime
                    if (s.editedPrompt === null) {
                        return { ...s, prompt: enhancedPrompt };
                    }
                    return s;
                });
            } catch (e) {
                console.error("Failed to auto-generate and enhance prompt:", e);
                setError("AI prompt generation failed. Using a basic prompt.");
                // Fallback to the basic concept if enhancement fails
                setSettings(s => {
                    if (s.editedPrompt === null) {
                        return { ...s, prompt: concept };
                    }
                    return s;
                });
            } finally {
                setIsGeneratingPrompt(false);
                setPromptGenerationMessage('');
            }
        };
    
        enhance();
    
    }, [
        settings.productDescription,
        settings.lightingStyle,
        settings.cameraPerspective,
        settings.editedPrompt,
        settings.generationMode,
        settings.videoLength,
        settings.cameraMotion,
        settings.mockupType,
        settings.selectedPresetId,
        settings.selectedSocialTemplateId,
    ]);


    const handleImageGeneration = async () => {
        if (!productImage || !finalPrompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setEditorMode('view');
        setTextOverlays([]);
        try {
            setLoadingMessage('Step 1/2: Removing background...');
            const productWithoutBg = await geminiService.removeBackground(productImage);

            setLoadingMessage(`Step 2/2: Generating ${settings.numberOfImages} image variations...`);
            
            const generationPromises = Array.from({ length: settings.numberOfImages }).map((_, i) => {
                 const currentSeed = settings.seed ? parseInt(settings.seed, 10) + i : null;
                 return geminiService.generateImage(productWithoutBg, finalPrompt, settings.negativePrompt, currentSeed);
            });

            const results = await Promise.all(generationPromises);
            const finalImages = results.map(imgBase64 => `data:image/png;base64,${imgBase64}`);
            
            setGeneratedImages(finalImages);
            setSelectedImageIndex(0);
            
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                images: finalImages,
                settings: { ...settings, prompt: finalPrompt },
                textOverlays: [],
                isFavorite: false,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during image generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleVideoGeneration = async () => {
        if (!productImage || !finalPrompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setEditorMode('view');
        
        const videoLoadingMessages = [
            'Warming up the digital cameras...',
            'Setting up the virtual dolly tracks...',
            'AI Director is calling "Action!"...',
            'Rendering the first few frames...',
            'Applying cinematic color grading...',
            'Adding the final polish...',
            'Almost ready for the premiere!'
        ];
        let messageIndex = 0;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
            setLoadingMessage(videoLoadingMessages[messageIndex]);
        }, 5000);

        try {
            setLoadingMessage('Removing background...');
            const productWithoutBg = await geminiService.removeBackground(productImage);

            const videoUrl = await geminiService.generateVideo(productWithoutBg, finalPrompt);
            setGeneratedVideoUrl(videoUrl);

            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                videoUrl: videoUrl,
                settings: { ...settings, prompt: finalPrompt },
                textOverlays: [],
                isFavorite: false,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during video generation.');
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleMockupGeneration = async () => {
        if (!productImage || !finalPrompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setEditorMode('view');
        setTextOverlays([]);
        try {
            setLoadingMessage('Step 1/2: Preparing product...');
            const productWithoutBg = await geminiService.removeBackground(productImage);

            setLoadingMessage('Step 2/2: Generating mockup...');
            const resultBase64 = await geminiService.generateMockup(productWithoutBg, finalPrompt, settings.mockupType);
            const finalImage = `data:image/png;base64,${resultBase64}`;
            
            setGeneratedImages([finalImage]);
            setSelectedImageIndex(0);
            
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                images: [finalImage],
                settings: { ...settings, prompt: finalPrompt },
                textOverlays: [],
                isFavorite: false,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during mockup generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleSocialPostGeneration = async () => {
        if (!productImage || !finalPrompt) return;

        if (!activeBrandKit?.logo) {
            setError("Please upload a logo to your active brand kit to generate a social media post.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setEditorMode('view');
        setTextOverlays([]);
        try {
            setLoadingMessage('Generating social media post...');
            
            const resultBase64 = await geminiService.generateSocialPost(productImage, activeBrandKit.logo, finalPrompt);
            const finalImage = `data:image/png;base64,${resultBase64}`;
            
            setGeneratedImages([finalImage]);
            setSelectedImageIndex(0);
            
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                images: [finalImage],
                settings: { ...settings, prompt: finalPrompt },
                textOverlays: [],
                isFavorite: false,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during social post generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleDesignGeneration = async () => {
        if (!productImage || !finalPrompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setEditorMode('view');
        setTextOverlays([]);
        try {
            setLoadingMessage('Generating design alternative...');
            
            const resultBase64 = await geminiService.generateDesignAlternative(productImage, finalPrompt);
            const finalImage = `data:image/png;base64,${resultBase64}`;
            
            setGeneratedImages([finalImage]);
            setSelectedImageIndex(0);
            
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                images: [finalImage],
                settings: { ...settings, prompt: finalPrompt },
                textOverlays: [],
                isFavorite: false,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during design generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    // Main generate function
    const handleGenerate = async () => {
        switch (settings.generationMode) {
            case 'video':
                await handleVideoGeneration();
                break;
            case 'mockup':
                await handleMockupGeneration();
                break;
            case 'social':
                // For social posts, we use the standard image generator but with specific settings
                await handleImageGeneration();
                break;
            case 'design':
                await handleDesignGeneration();
                break;
            case 'product':
            default:
                await handleImageGeneration();
                break;
        }
    };

    // Generic function to update the currently selected image in state and history
    const updateCurrentImage = (newImage: string) => {
        if (selectedImageIndex === null) return;

        const updatedImages = [...generatedImages];
        updatedImages[selectedImageIndex] = newImage;
        setGeneratedImages(updatedImages);

        const latestHistoryItem = history[0];
        if (latestHistoryItem) {
            const updatedHistoryImages = [...(latestHistoryItem.images || [])];
            updatedHistoryImages[selectedImageIndex] = newImage;
            const updatedHistoryItem = { ...latestHistoryItem, images: updatedHistoryImages };
            setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
        }
    };
    
    // Magic Edit
    const handleMagicEdit = async (imageWithMaskBase64: string, inpaintPrompt: string) => {
        if (selectedImageIndex === null) return;

        setIsLoading(true);
        setError(null);
        setLoadingMessage('Performing Magic Edit...');

        try {
            const inpaintedImageBase64 = await geminiService.magicEditImage(imageWithMaskBase64, inpaintPrompt);
            updateCurrentImage(`data:image/png;base64,${inpaintedImageBase64}`);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during Magic Edit.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };

    // Remove Object
    const handleRemoveObject = async (imageWithMaskBase64: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Removing object...');
        try {
            const prompt = "Remove the object in the erased area. Fill the space with a realistic background that matches the surrounding image content and style."
            const resultImageBase64 = await geminiService.magicEditImage(imageWithMaskBase64, prompt);
            updateCurrentImage(`data:image/png;base64,${resultImageBase64}`);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during object removal.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };

    // Expand Image
    const handleExpandImage = async (direction: 'up' | 'down' | 'left' | 'right') => {
        if (selectedImageIndex === null) return;
        const originalImageBase64 = generatedImages[selectedImageIndex].split(',')[1];

        setIsLoading(true);
        setError(null);
        setLoadingMessage(`Expanding image ${direction}...`);
        try {
            const expandedImageBase64 = await geminiService.expandImage(originalImageBase64, finalPrompt, direction);
            updateCurrentImage(`data:image/png;base64,${expandedImageBase64}`);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during image expansion.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };


    // Enhance image
    const handleEnhance = async () => {
        if (selectedImageIndex === null) return;
        const originalImageBase64 = generatedImages[selectedImageIndex].split(',')[1];
        
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Enhancing image...');
        setEditorMode('view');

        try {
            const enhancedImageBase64 = await geminiService.enhanceImage(originalImageBase64, finalPrompt);
            updateCurrentImage(`data:image/png;base64,${enhancedImageBase64}`);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during enhancement.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    // AI Marketing Copy
    const handleGenerateCopy = async () => {
        if (selectedImageIndex === null) return;
        const imageBase64 = generatedImages[selectedImageIndex].split(',')[1];
        
        setShowCopyModal(true);
        setIsCopyLoading(true);
        setMarketingCopy(null);
        setError(null);
        
        try {
            const copy = await geminiService.generateMarketingCopy(imageBase64, finalPrompt);
            setMarketingCopy(copy);
        } catch (e) {
            console.error(e);
            // Show error inside modal? For now, just close it and show global error.
            setError(e instanceof Error ? e.message : 'An unknown error occurred during copy generation.');
            setShowCopyModal(false);
        } finally {
            setIsCopyLoading(false);
        }
    };
    
    const handleEnhancePrompt = async () => {
        if (!finalPrompt || isEnhancingPrompt) return;
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const enhancedPrompt = await geminiService.enhancePrompt(finalPrompt);
            setSettings(s => ({...s, editedPrompt: enhancedPrompt}));
        } catch(e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Failed to enhance prompt.");
        } finally {
            setIsEnhancingPrompt(false);
        }
    };

    const handleStartOver = () => {
        setShowConfirmModal(true);
    };

    const confirmStartOver = () => {
        setProductImage(null);
        setProductImagePreview(null);
        resetForNewProduct();
        setHistory([]);
        setShowConfirmModal(false);
    };
    
    const handleRevertToHistory = (historyItem: HistoryItem) => {
        setSettings({ ...historyItem.settings, editedPrompt: historyItem.settings.prompt });
        setGeneratedImages(historyItem.images || []);
        setGeneratedVideoUrl(historyItem.videoUrl || null);
        setTextOverlays(historyItem.textOverlays || []);
        setSelectedImageIndex(0);
        setError(null);
        setIsRightSidebarOpen(false);
    };

    const handleToggleFavorite = (id: string) => {
        setHistory(history.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    };

    const handleExtractPalette = async () => {
        if (selectedImageIndex === null) return;
        const currentImage = generatedImages[selectedImageIndex];
        const latestHistoryItem = history[0];

        if (!latestHistoryItem || latestHistoryItem.palette) return; // Already have it

        setIsLoading(true);
        setLoadingMessage("Extracting colors...");
        try {
            const palette = await geminiService.extractPalette(currentImage.split(',')[1]);
            const updatedHistoryItem = { ...latestHistoryItem, palette };
            setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
        } catch (e) {
            console.error("Palette extraction failed", e);
            setError("Could not extract color palette.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPreset = (preset: Preset) => {
        setSettings(s => ({ ...s, selectedPresetId: preset.id, editedPrompt: null }));
        setIsPresetModalOpen(false);
    };

    // Save text overlays to history
    useEffect(() => {
        if (!history.length) return;
        const latestHistoryItem = history[0];
        // Simple stringify check to avoid deep object comparison on every render
        if (JSON.stringify(latestHistoryItem.textOverlays) !== JSON.stringify(textOverlays)) {
            const updatedHistoryItem = { ...latestHistoryItem, textOverlays };
            setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
        }
    }, [textOverlays, history]);


    // Theme toggle effect
    useEffect(() => {
        window.localStorage.setItem('color-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    
    // Brand Kit persistence
    useEffect(() => {
        window.localStorage.setItem('brand-kit-presets', JSON.stringify(brandKits));
    }, [brandKits]);
    
    useEffect(() => {
        if (activeBrandKitId) {
            window.localStorage.setItem('active-brand-kit-id', activeBrandKitId);
        }
    }, [activeBrandKitId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                if (productImage && !isLoading) {
                    handleGenerate();
                }
            }
            if (generatedImages.length > 1 && selectedImageIndex !== null) {
                if (e.key === 'ArrowRight') {
                    setSelectedImageIndex(i => (i! + 1) % generatedImages.length);
                }
                if (e.key === 'ArrowLeft') {
                    setSelectedImageIndex(i => (i! - 1 + generatedImages.length) % generatedImages.length);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [productImage, isLoading, generatedImages, selectedImageIndex]);

    const rightSidebarProps = {
        history,
        onRevertToHistory: handleRevertToHistory,
        onToggleFavorite: handleToggleFavorite,
        brandKits,
        setBrandKits,
        activeBrandKitId,
        setActiveBrandKitId
    };


    return (
        <React.Fragment>
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmStartOver}
                title="Are you sure?"
                message="This will clear your current product, all generated images, and the session history. This action cannot be undone."
            />
             <MarketingCopyModal
                isOpen={showCopyModal}
                onClose={() => setShowCopyModal(false)}
                copy={marketingCopy}
                isLoading={isCopyLoading}
                onRegenerate={handleGenerateCopy}
            />
            <StylePresetModal
                isOpen={isPresetModalOpen}
                onClose={() => setIsPresetModalOpen(false)}
                presets={PRESETS}
                onSelect={handleSelectPreset}
                activeMode={settings.generationMode}
            />
            <main className="w-full flex-1 flex overflow-hidden">
                <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-background border-r border-border/80 ${isLeftSidebarOpen ? 'w-[350px]' : 'w-0'} overflow-hidden`}>
                    <div className="w-[350px] h-full">
                         <ControlPanel
                            settings={settings}
                            setSettings={setSettings}
                            isLoading={isLoading}
                            isGeneratingPrompt={isGeneratingPrompt}
                            promptGenerationMessage={promptGenerationMessage}
                            activeBrandKit={activeBrandKit}
                            onProductImageUpload={handleProductImageUpload}
                            onClearProductImage={handleStartOver}
                            productImage={productImage}
                        />
                    </div>
                </aside>
                <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
                     {isPromptFocused && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden" onClick={() => setIsPromptFocused(false)} />}
                    <Canvas
                        productImagePreview={productImagePreview}
                        generatedImages={generatedImages}
                        generatedVideoUrl={generatedVideoUrl}
                        selectedImageIndex={selectedImageIndex}
                        onSelectImage={setSelectedImageIndex}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        error={error}
                        onStartOver={handleStartOver}
                        onRetry={handleGenerate}
                        onEnhance={handleEnhance}
                        onMagicEdit={handleMagicEdit}
                        onRemoveObject={handleRemoveObject}
                        onExpandImage={handleExpandImage}
                        onGenerateCopy={handleGenerateCopy}
                        aspectRatio={settings.aspectRatio}
                        editorMode={editorMode}
                        setEditorMode={setEditorMode}
                        textOverlays={textOverlays}
                        setTextOverlays={setTextOverlays}
                        brandKit={activeBrandKit}
                        watermarkSettings={settings.watermark}
                        currentHistoryItem={history[0]}
                        onExtractPalette={handleExtractPalette}
                        onProductImageUpload={handleProductImageUpload}
                        onClearProductImage={handleStartOver}
                    />
                    <PromptBar
                        finalPrompt={finalPrompt}
                        settings={settings}
                        setSettings={setSettings}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        productImage={productImage}
                        onBrowsePresets={() => setIsPresetModalOpen(true)}
                        isFocused={isPromptFocused}
                        setIsFocused={setIsPromptFocused}
                        onEnhancePrompt={handleEnhancePrompt}
                        isEnhancingPrompt={isEnhancingPrompt}
                    />
                </div>
                
                 {/* Desktop Sidebar */}
                <div className={`
                    flex-shrink-0 transition-all duration-300 ease-in-out
                    hidden lg:block
                    ${isRightSidebarOpen ? 'w-[350px]' : 'w-0'}
                `}>
                    <aside className="w-[350px] h-full overflow-hidden border-l border-border/80 flex flex-col">
                        <RightSidebar {...rightSidebarProps} />
                    </aside>
                </div>
                
                {/* Mobile Sidebar */}
                {isRightSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in" onClick={() => setIsRightSidebarOpen(false)}></div>}
                <aside className={`
                    fixed top-0 right-0 h-full w-[350px] max-w-[90vw] z-40
                    bg-card
                    transform transition-transform duration-300 ease-in-out
                    lg:hidden flex flex-col
                    ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                     <RightSidebar {...rightSidebarProps} onClose={() => setIsRightSidebarOpen(false)} />
                </aside>

            </main>
        </React.Fragment>
    );
};
