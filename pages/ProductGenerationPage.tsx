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
import { useTranslation } from '../App';

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
    const { t } = useTranslation();
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
                        <Icon name="pencil" /> {t('aiGeneratedMarketingCopy')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('marketingCopyDescription')}
                    </p>
                </div>

                {/* Dialog Content */}
                {isLoading && (
                    <div className="h-72 flex flex-col items-center justify-center text-center">
                        <Icon name="spinner" className="w-8 h-8 animate-spin text-primary" />
                        <p className="mt-3 text-muted-foreground">{t('loadingGeneratingCopy')}</p>
                    </div>
                )}
                
                {!isLoading && copy && (
                    <div className="space-y-4">
                        <CopyField label={t('productName')} value={copy.productName} />
                        <CopyField label={t('tagline')} value={copy.tagline} />
                        <CopyField label={t('description')} value={copy.description} />
                        <CopyField label={t('socialMediaPost')} value={copy.socialMediaPost} />
                        <CopyField label={t('socialMediaPostArabic')} value={copy.socialMediaPostArabic} />
                    </div>
                )}

                {/* Dialog Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                     <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent"
                        onClick={onClose}
                    >
                        {t('close')}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 mb-2 sm:mb-0"
                        onClick={onRegenerate}
                    >
                        <Icon name="restart" className="w-4 h-4" /> {t('regenerate')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RightSidebar: React.FC<{
    history: HistoryItem[];
    onRestoreHistory: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
    brandKits: BrandKit[];
    setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
    activeBrandKitId: string | null;
    setActiveBrandKitId: React.Dispatch<React.SetStateAction<string | null>>;
    onClose?: () => void;
}> = (props) => {
    const { t } = useTranslation();
    return (
        <>
             <div className="p-4 border-b border-border/80 flex items-center justify-between h-[65px]">
                 <h2 className="text-lg font-semibold">{t('workspace')}</h2>
                 {props.onClose && (
                    <button onClick={props.onClose} className="p-2 rounded-md hover:bg-accent text-muted-foreground lg:hidden" aria-label="Close Workspace Panel">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                 )}
             </div>
             <Tabs tabs={[
                { key: 'History', label: `${t('history')} (${props.history.length})` },
                { key: 'Brand', label: t('brand') }
             ]}>
                {(activeTab) => (
                    <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                        {activeTab === 'History' && 
                            <HistoryPanel 
                                history={props.history}
                                onRestore={props.onRestoreHistory}
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
    const { t } = useTranslation();
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
                        placeholder={t('negativePromptPlaceholder')}
                        disabled={isLoading || !productImage}
                        rows={2}
                        className="w-full bg-secondary text-secondary-foreground p-2 rounded-md text-sm placeholder:text-muted-foreground disabled:opacity-50 resize-none focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="p-2 flex items-start gap-2">
                    <Tooltip text={t('browsePresets')}>
                        <button onClick={onBrowsePresets} className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent rounded-md"><Icon name="sparkles" className="w-5 h-5"/></button>
                    </Tooltip>
                    
                    {isEditingPrompt ? (
                         <textarea 
                            ref={textAreaRef}
                            value={finalPrompt}
                            onChange={handlePromptChange}
                            placeholder={productImage ? t('promptPlaceholder') : t('promptPlaceholderNoImage')}
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
                                {finalPrompt || (productImage ? t('promptPlaceholder') : t('promptPlaceholderNoImage'))}
                            </p>
                        </div>
                    )}
                    
                     <Tooltip text={t('enhancePrompt')}>
                        <button onClick={onEnhancePrompt} disabled={isEnhancingPrompt || !finalPrompt} className="self-end flex-shrink-0 h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <Icon name={isEnhancingPrompt ? 'spinner' : 'wand'} className={`w-5 h-5 ${isEnhancingPrompt ? 'animate-spin' : ''}`}/>
                        </button>
                    </Tooltip>

                    {!isEditingPrompt && (
                        <Tooltip text={t('editPrompt')}>
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
                                {t('generate')}
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
    // Unified History Props
    history: HistoryItem[];
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    onToggleFavorite: (id: string) => void;
    onRestoreHistory: (item: HistoryItem) => void;
    restoredState: HistoryItem | null;
    clearRestoredState: () => void;
}

export const ProductGenerationPage: React.FC<ProductGenerationPageProps> = ({ 
    isLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen,
    history, addHistoryItem, onToggleFavorite, onRestoreHistory, restoredState, clearRestoredState
}) => {
    const { t } = useTranslation();
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
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [currentPalette, setCurrentPalette] = useState<string[] | undefined>(undefined);
    
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

    // State restoration from history
    useEffect(() => {
        if (restoredState && restoredState.source.page === 'product-generation') {
            const { payload } = restoredState;
            setSettings(payload.settings);
            setGeneratedImages(payload.images || []);
            setGeneratedVideoUrl(payload.videoUrl || null);
            setTextOverlays(payload.textOverlays || []);
            setCurrentPalette(payload.palette);
            // This is tricky, we can't restore the File object, but we can restore the preview
            if (payload.productImagePreview) {
                setProductImagePreview(payload.productImagePreview);
                setProductImage(null); // Mark that we don't have the original file
            }
            setSelectedImageIndex(0);
            setError(null);
            clearRestoredState();
        }
    }, [restoredState, clearRestoredState]);


    const resetForNewProduct = () => {
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setError(null);
        setTextOverlays([]);
        setCurrentPalette(undefined);
        setSettings(s => ({
            ...s,
            prompt: '',
            editedPrompt: null,
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
            setLoadingMessage(t('loadingAnalyzing'));
            const description = await geminiService.describeProduct(file);
            setSettings(s => ({ ...s, productDescription: description }));

            setLoadingMessage(t('loadingGeneratingTemplates'));
            const templates = await geminiService.generateSceneTemplates(description);
            setSceneTemplates(templates);

        } catch (e) {
            setError('Failed to analyze product.');
            console.error(e);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [t]);

    // Effect to auto-generate and enhance the prompt from settings
    useEffect(() => {
        if (!settings.productDescription || settings.editedPrompt !== null) {
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
                    if (s.editedPrompt === null) return { ...s, prompt: enhancedPrompt };
                    return s;
                });
            } catch (e) {
                console.error("Failed to auto-generate and enhance prompt:", e);
                setError("AI prompt generation failed. Using a basic prompt.");
                setSettings(s => {
                    if (s.editedPrompt === null) return { ...s, prompt: concept };
                    return s;
                });
            } finally {
                setIsGeneratingPrompt(false);
                setPromptGenerationMessage('');
            }
        };
    
        enhance();
    
    }, [
        settings.productDescription, settings.lightingStyle, settings.cameraPerspective,
        settings.editedPrompt, settings.generationMode, settings.videoLength,
        settings.cameraMotion, settings.mockupType, settings.selectedPresetId,
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
        setCurrentPalette(undefined);
        try {
            setLoadingMessage(t('loadingRemovingBackground'));
            const productWithoutBg = await geminiService.removeBackground(productImage);

            setLoadingMessage(t('loadingGeneratingImages', { count: settings.numberOfImages }));
            
            const generationPromises = Array.from({ length: settings.numberOfImages }).map((_, i) => {
                 const currentSeed = settings.seed ? parseInt(settings.seed, 10) + i : null;
                 return geminiService.generateImage(productWithoutBg, finalPrompt, settings.negativePrompt, currentSeed);
            });

            const results = await Promise.all(generationPromises);
            const finalImages = results.map(imgBase64 => `data:image/png;base64,${imgBase64}`);
            
            setGeneratedImages(finalImages);
            setSelectedImageIndex(0);
            
            addHistoryItem({
                source: { page: 'product-generation', appName: t('productGeneration') },
                thumbnail: { type: 'image', value: finalImages[0] },
                title: finalPrompt,
                payload: {
                    images: finalImages,
                    settings: { ...settings, prompt: finalPrompt },
                    textOverlays: [],
                    palette: undefined,
                    productImagePreview,
                },
            });

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
            t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'),
            t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'), t('videoLoadingMessage7')
        ];
        let messageIndex = 0;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
            setLoadingMessage(videoLoadingMessages[messageIndex]);
        }, 5000);

        try {
            setLoadingMessage(t('loadingRemovingBackground'));
            const productWithoutBg = await geminiService.removeBackground(productImage);

            const videoUrl = await geminiService.generateVideo(productWithoutBg, finalPrompt);
            setGeneratedVideoUrl(videoUrl);

            addHistoryItem({
                source: { page: 'product-generation', appName: t('productGeneration') },
                thumbnail: { type: 'video', value: 'video' }, // icon name
                title: finalPrompt,
                payload: {
                    videoUrl: videoUrl,
                    settings: { ...settings, prompt: finalPrompt },
                    productImagePreview,
                },
            });

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
        setCurrentPalette(undefined);
        try {
            setLoadingMessage(t('loadingPreparingProduct'));
            const productWithoutBg = await geminiService.removeBackground(productImage);

            setLoadingMessage(t('loadingGeneratingMockup'));
            const resultBase64 = await geminiService.generateMockup(productWithoutBg, finalPrompt, settings.mockupType);
            const finalImage = `data:image/png;base64,${resultBase64}`;
            
            setGeneratedImages([finalImage]);
            setSelectedImageIndex(0);
            
            addHistoryItem({
                source: { page: 'product-generation', appName: t('productGeneration') },
                thumbnail: { type: 'image', value: finalImage },
                title: finalPrompt,
                payload: {
                    images: [finalImage],
                    settings: { ...settings, prompt: finalPrompt },
                    textOverlays: [],
                    palette: undefined,
                    productImagePreview,
                },
            });

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during mockup generation.');
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
        setCurrentPalette(undefined);
        try {
            setLoadingMessage(t('loadingGeneratingDesign'));
            
            const resultBase64 = await geminiService.generateDesignAlternative(productImage, finalPrompt);
            const finalImage = `data:image/png;base64,${resultBase64}`;
            
            setGeneratedImages([finalImage]);
            setSelectedImageIndex(0);
            
            addHistoryItem({
                source: { page: 'product-generation', appName: t('productGeneration') },
                thumbnail: { type: 'image', value: finalImage },
                title: finalPrompt,
                payload: {
                    images: [finalImage],
                    settings: { ...settings, prompt: finalPrompt },
                    textOverlays: [],
                    palette: undefined,
                    productImagePreview,
                },
            });

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during design generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleGenerate = async () => {
        switch (settings.generationMode) {
            case 'video': await handleVideoGeneration(); break;
            case 'mockup': await handleMockupGeneration(); break;
            case 'design': await handleDesignGeneration(); break;
            case 'product': case 'social': default: await handleImageGeneration(); break;
        }
    };

    const updateCurrentImage = (newImage: string) => {
        if (selectedImageIndex === null) return;
        const updatedImages = [...generatedImages];
        updatedImages[selectedImageIndex] = newImage;
        setGeneratedImages(updatedImages);
    };
    
    const handleMagicEdit = async (imageWithMaskBase64: string, inpaintPrompt: string) => {
        if (selectedImageIndex === null) return;
        setIsLoading(true);
        setError(null);
        setLoadingMessage(t('loadingMagicEdit'));
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

    const handleRemoveObject = async (imageWithMaskBase64: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage(t('loadingRemovingObject'));
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

    const handleExpandImage = async (direction: 'up' | 'down' | 'left' | 'right') => {
        if (selectedImageIndex === null) return;
        const originalImageBase64 = generatedImages[selectedImageIndex].split(',')[1];
        setIsLoading(true);
        setError(null);
        setLoadingMessage(t('loadingExpandingImage', { direction }));
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

    const handleEnhance = async () => {
        if (selectedImageIndex === null) return;
        const originalImageBase64 = generatedImages[selectedImageIndex].split(',')[1];
        setIsLoading(true);
        setError(null);
        setLoadingMessage(t('loadingEnhancingImage'));
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

    const handleStartOver = () => setShowConfirmModal(true);

    const confirmStartOver = () => {
        setProductImage(null);
        setProductImagePreview(null);
        resetForNewProduct();
        // The history is now global, so we don't clear it here.
        setShowConfirmModal(false);
    };

    const handleExtractPalette = async () => {
        if (selectedImageIndex === null || currentPalette) return;
        const currentImage = generatedImages[selectedImageIndex];
        setIsLoading(true);
        setLoadingMessage(t('loadingExtractingPalette'));
        try {
            const palette = await geminiService.extractPalette(currentImage.split(',')[1]);
            setCurrentPalette(palette);
        } catch (e) {
            console.error("Palette extraction failed", e);
            setError("Could not extract color palette.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPreset = (preset: Preset) => {
        setSettings(s => ({ ...s, selectedPresetId: preset.id, editedPrompt: null, prompt: '' }));
        setIsPresetModalOpen(false);
    };

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
                if (productImage && !isLoading) handleGenerate();
            }
            if (generatedImages.length > 1 && selectedImageIndex !== null) {
                if (e.key === 'ArrowRight') setSelectedImageIndex(i => (i! + 1) % generatedImages.length);
                if (e.key === 'ArrowLeft') setSelectedImageIndex(i => (i! - 1 + generatedImages.length) % generatedImages.length);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [productImage, isLoading, generatedImages, selectedImageIndex, handleGenerate]);

    const rightSidebarProps = {
        history,
        onRestoreHistory,
        onToggleFavorite,
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
                title={t('confirmStartOverTitle')}
                message={t('confirmStartOverMessage')}
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
                        palette={currentPalette}
                        onExtractPalette={handleExtractPalette}
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
