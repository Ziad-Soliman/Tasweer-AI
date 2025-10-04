
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { GenerationSettings, BrandKit, HistoryItem, EditorMode, TextOverlay, MarketingCopy, Preset, GenerationMode, SceneTemplate } from '../types';
import { Canvas } from '../components/Canvas';
import { Tabs } from '../components/Tabs';
import { HistoryPanel } from '../components/HistoryPanel';
import { BrandKitPanel } from '../components/BrandKitPanel';
import { StylePresetModal } from '../components/StylePresetModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MarketingCopyModal } from '../components/MarketingCopyModal';
import { SceneSuggestions } from '../components/SceneSuggestions';
import * as geminiService from '../services/geminiService';
import { PRESETS } from '../constants/presets';
import { useTranslation } from '../App';
import { NEGATIVE_PROMPT_PRESETS, SOCIAL_MEDIA_TEMPLATES, ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS, MOCKUP_TYPES } from '../constants';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';

// --- Start of components moved/recreated from other files for this page ---

const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
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
    videoUrl?: string;
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
                        {item.videoUrl ? (
                            <video src={item.videoUrl} loop autoPlay muted className="w-full h-auto block bg-muted" />
                        ) : (
                            <img src={item.src} alt={item.prompt} className="w-full h-auto block bg-muted" />
                        )}
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

// --- End of components ---


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
    lightingStyle: 'Studio Softbox',
    cameraPerspective: 'Eye-level Front View',
    videoLength: 'Short (~5s)',
    cameraMotion: 'Static',
    mockupType: 'T-shirt on a model',
    selectedSocialTemplateId: 'ig-post',
    prompt: '',
    editedPrompt: null,
    negativePrompt: NEGATIVE_PROMPT_PRESETS.join(', '),
    seed: '',
    numberOfImages: 1,
    productDescription: '',
    selectedPresetId: null,
    watermark: {
        enabled: false,
        useLogo: true,
        text: 'Your Brand',
        position: 'bottom-right',
        scale: 10,
        opacity: 70,
    },
};

const WelcomeScreen = ({ mode, onUpload }: { mode: 'image' | 'video' | 'edit', onUpload: (file: File) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in h-full">
            <div className="w-full max-w-lg">
                 <Icon name="wand" className="w-24 h-24 text-primary mx-auto mb-4" />
                 <h2 className="text-4xl font-bold tracking-tight">AI Image Generation Studio</h2>
                 <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">Generate new, stylized e-commerce and marketing images from a single product photo.</p>
                 <FileUpload onFileUpload={onUpload} label={t('uploadPhoto')}/>
            </div>
        </div>
    );
};


interface ProductGenerationPageProps {
    initialMode: 'image' | 'video' | 'edit';
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

const Dropdown: React.FC<{ value: string; onChange: (val: string) => void; options: readonly string[]; disabled?: boolean; label: keyof typeof import('../lib/translations').translations.en }> = ({ value, onChange, options, disabled, label }) => {
    const { t } = useTranslation();
    return (
    <div>
        <Label>{t(label)}</Label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {options.map(opt => <option key={opt} value={opt}>{t(opt as any) || opt}</option>)}
        </select>
    </div>
)};


export const ProductGenerationPage: React.FC<ProductGenerationPageProps> = (props) => {
    const { initialMode, history, onToggleFavorite, onRestore, addHistoryItem, deleteHistoryItem, restoredState, clearRestoredState } = props;
    const { t } = useTranslation();

    const getInitialGenerationMode = (): GenerationMode => {
        if (initialMode === 'video') return 'video';
        return 'product';
    };

    // === CORE STATE ===
    const [settings, setSettings] = useState<GenerationSettings>({ ...DEFAULT_SETTINGS, generationMode: getInitialGenerationMode() });
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
    
    // === UI/EDITOR STATE ===
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [isStartOverModalOpen, setIsStartOverModalOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<EditorMode>('view');
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

    // === DATA STATE ===
    const [brandKits, setBrandKits] = useState<BrandKit[]>([DEFAULT_BRAND_KIT]);
    const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>(DEFAULT_BRAND_KIT.id);
    const activeBrandKit = useMemo(() => brandKits.find(kit => kit.id === activeBrandKitId), [brandKits, activeBrandKitId]);
    const [marketingCopy, setMarketingCopy] = useState<MarketingCopy | null>(null);
    const [palette, setPalette] = useState<string[] | undefined>(undefined);
    const [sceneTemplates, setSceneTemplates] = useState<SceneTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    // === STATE RESTORATION ===
     useEffect(() => {
        if (restoredState && restoredState.source.page === 'product-generation') {
            const { payload } = restoredState;
            setSettings(payload.settings);
            setProductImagePreview(payload.productImagePreview);
            setProductImageNoBg(payload.productImageNoBg);
             if (payload.productImagePreview) {
                fetch(payload.productImagePreview).then(res => res.blob()).then(blob => {
                    const file = new File([blob], "restored-image.png", { type: blob.type });
                    setProductImage(file);
                });
            }
            const items: GeneratedItem[] = (payload.generatedImages || []).map((img: string, i: number) => ({
                id: nanoid(),
                src: img,
                prompt: payload.settings.prompt, // simplified assumption
                videoUrl: payload.generatedVideoUrl && i === 0 ? payload.generatedVideoUrl : undefined,
                isLoading: false,
            }));
            setGeneratedItems(items);
            setTextOverlays(payload.textOverlays || []);
            setSelectedImageIndex(null); // Go back to gallery view
            clearRestoredState();
        }
    }, [restoredState, clearRestoredState]);


    // === HANDLERS & LOGIC ===
    const resetState = (keepModeAndImage = false) => {
        const currentMode = settings.generationMode;
        setSettings(DEFAULT_SETTINGS);
        if (keepModeAndImage) {
             setSettings(s => ({ ...s, generationMode: currentMode }));
        } else {
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
        setSceneTemplates([]);
    };
    
    const handleStartOver = () => {
        resetState();
        setIsStartOverModalOpen(false);
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
    
    const generateAndSetSceneTemplates = useCallback(async () => {
        if (settings.generationMode === 'product' && settings.productDescription && !promptGenerationMessage) {
            setIsLoadingTemplates(true);
            setSceneTemplates([]);
            try {
                const templates = await geminiService.generateSceneTemplates(settings.productDescription);
                setSceneTemplates(templates);
            } catch (e) {
                console.error("Failed to generate scene templates", e);
            } finally {
                setIsLoadingTemplates(false);
            }
        }
    }, [settings.productDescription, settings.generationMode, promptGenerationMessage]);

    useEffect(() => {
        generateAndSetSceneTemplates();
    }, [generateAndSetSceneTemplates]);


    const generateAndSetPrompt = useCallback(() => {
        if (!settings.productDescription || settings.editedPrompt !== null) return;

        const preset = PRESETS.find(p => p.id === settings.selectedPresetId);
        let newPrompt = `A professional product photograph of ${settings.productDescription}`;

        switch (settings.generationMode) {
            case 'product':
                newPrompt += `, set against a complementary background. The lighting is ${settings.lightingStyle.toLowerCase()}. The camera perspective is a ${settings.cameraPerspective.toLowerCase()}.`;
                break;
            case 'video':
                newPrompt += `. The video should be ${settings.videoLength.toLowerCase()} and feature ${settings.cameraMotion.toLowerCase()} camera movement.`;
                break;
            case 'mockup':
                newPrompt = `A realistic mockup of ${settings.productDescription} on a ${settings.mockupType}.`;
                break;
            case 'social':
                const template = SOCIAL_MEDIA_TEMPLATES.find(t => t.id === settings.selectedSocialTemplateId);
                newPrompt = `A social media post for ${template?.platform || 'social media'} featuring ${settings.productDescription}.`;
                break;
        }

        if (preset) {
            newPrompt += ` The style is ${preset.promptFragment}.`;
        }

        setSettings(s => ({ ...s, prompt: newPrompt }));
    }, [settings.productDescription, settings.generationMode, settings.lightingStyle, settings.cameraPerspective, settings.videoLength, settings.cameraMotion, settings.mockupType, settings.selectedSocialTemplateId, settings.selectedPresetId, settings.editedPrompt]);
    
    useEffect(() => {
        generateAndSetPrompt();
    }, [generateAndSetPrompt]);

    const handleSelectSceneTemplate = (template: SceneTemplate) => {
        setSettings(s => ({
            ...s,
            prompt: template.prompt,
            editedPrompt: template.prompt,
            lightingStyle: template.lighting,
            cameraPerspective: template.perspective,
            selectedPresetId: null
        }));
    };

    const handleUpdateSingleImage = (newImageBase64: string) => {
        if (selectedImageIndex === null) return;
        const finalImage = `data:image/png;base64,${newImageBase64}`;
        setGeneratedItems(items => items.map((item, index) => index === selectedImageIndex ? {...item, src: finalImage} : item));
    };

    const handleEnhancePrompt = async () => {
        setIsEnhancingPrompt(true); setError(null);
        try {
            const currentPrompt = settings.editedPrompt ?? settings.prompt;
            const enhanced = await geminiService.enhancePrompt(currentPrompt);
            setSettings(s => ({ ...s, editedPrompt: enhanced }));
        } catch(e) { setError(e instanceof Error ? e.message : 'Failed to enhance prompt.'); } 
        finally { setIsEnhancingPrompt(false); }
    };

    const runActionForSelectedIndex = async (action: () => Promise<string | void>, loadingMsg: string, errorMsg: string) => {
        if (selectedImageIndex === null || !selectedItem?.src) return;
        setIsLoading(true); setLoadingMessage(loadingMsg); setError(null);
        try {
            const result = await action();
            if (typeof result === 'string') {
                handleUpdateSingleImage(result);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : errorMsg);
        } finally {
            setIsLoading(false); setLoadingMessage(''); setEditorMode('view');
        }
    };

    const handleMagicEdit = (imageWithMask: string, prompt: string) => runActionForSelectedIndex(() => geminiService.magicEditImage(imageWithMask, prompt), t('loadingMagicEdit'), "Magic Edit failed.");
    const handleRemoveObject = (imageWithMask: string) => runActionForSelectedIndex(() => geminiService.removeObject(imageWithMask), t('loadingRemovingObject'), "Object removal failed.");
    const handleEnhanceImage = () => runActionForSelectedIndex(() => geminiService.enhanceImage(selectedItem!.src!.split(',')[1], selectedItem!.prompt), t('loadingEnhancingImage'), "Enhancement failed.");
    const handleExpandImage = (direction: 'up'|'down'|'left'|'right') => runActionForSelectedIndex(() => geminiService.expandImage(selectedItem!.src!.split(',')[1], selectedItem!.prompt, direction), t('loadingExpandingImage', { direction }), "Expansion failed.");
    
    const handleGenerateCopy = async (regenerate = false) => {
        if (selectedImageIndex === null || !selectedItem?.src) return;
        if (!regenerate) setIsCopyModalOpen(true);
        setMarketingCopy(null); setIsLoading(true); setLoadingMessage(t('loadingGeneratingCopy')); setError(null);
        try {
            const result = await geminiService.generateMarketingCopy(selectedItem!.src.split(',')[1], selectedItem!.prompt);
            setMarketingCopy(result);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to generate copy.");
        } finally {
            setIsLoading(false); setLoadingMessage('');
        }
    };
    
    const handleExtractPalette = async () => {
        if (selectedImageIndex === null || !selectedItem?.src) return;
        setLoadingMessage(t('loadingExtractingPalette'));
        try {
            const result = await geminiService.extractPalette(selectedItem!.src.split(',')[1]);
            setPalette(result);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to extract palette.");
        } finally {
            setLoadingMessage('');
        }
    };

    const handleGenerate = async () => {
        setError(null);
        setIsLoading(true);
        setPalette(undefined);
        setSelectedImageIndex(null);
    
        const currentSettings = settings.editedPrompt ? { ...settings, prompt: settings.editedPrompt } : settings;
    
        try {
            if (currentSettings.generationMode === 'video') {
                if (!productImageNoBg) throw new Error("Product image not ready.");
    
                const placeholder: GeneratedItem = { id: nanoid(), prompt: currentSettings.prompt, isLoading: true };
                setGeneratedItems(prev => [placeholder, ...prev]);
                setLoadingMessage(t('videoLoadingMessage1')); // Simplified
    
                const url = await geminiService.generateVideo(productImageNoBg, currentSettings.prompt);
                
                const finalItem = { ...placeholder, src: productImagePreview!, videoUrl: url, isLoading: false };
                setGeneratedItems(prev => prev.map(item => item.id === placeholder.id ? finalItem : item));
    
                addHistoryItem({
                    source: { page: 'product-generation', appName: t('productGeneration') },
                    thumbnail: { type: 'video', value: url },
                    title: currentSettings.prompt,
                    payload: { settings: currentSettings, productImagePreview, productImageNoBg, generatedVideoUrl: url, textOverlays }
                });
    
            } else {
                if (!productImageNoBg) throw new Error("Product image not ready.");
    
                const placeholders: GeneratedItem[] = Array(currentSettings.numberOfImages).fill(0).map(() => ({
                    id: nanoid(),
                    prompt: currentSettings.prompt,
                    isLoading: true,
                }));
                setGeneratedItems(prev => [...placeholders, ...prev]);
    
                const allPromises = placeholders.map((placeholder, i) => {
                    const seed = currentSettings.seed ? parseInt(currentSettings.seed) + i : null;
                    const generatorFn = currentSettings.generationMode === 'mockup'
                        ? geminiService.generateMockup(productImageNoBg, currentSettings.prompt, currentSettings.mockupType)
                        : geminiService.generateImage(productImageNoBg, currentSettings.prompt, currentSettings.negativePrompt, seed);
                    
                    return generatorFn.then(base64 => {
                        const src = `data:image/png;base64,${base64}`;
                        setGeneratedItems(prev => prev.map(item => 
                            item.id === placeholder.id 
                            ? { ...item, src, isLoading: false } 
                            : item
                        ));
                        return { status: 'fulfilled', value: src };
                    }).catch(err => {
                        setGeneratedItems(prev => prev.filter(item => item.id !== placeholder.id));
                        return { status: 'rejected', reason: err };
                    });
                });
    
                const results = await Promise.all(allPromises);
                
                // FIX: Use a type predicate in the filter to correctly narrow the type for the subsequent map operation.
                const successfulSrcs = results
                    .filter((r): r is { status: 'fulfilled'; value: string } => r.status === 'fulfilled')
                    .map(r => r.value);
    
                if (successfulSrcs.length > 0) {
                    addHistoryItem({
                        source: { page: 'product-generation', appName: t('productGeneration') },
                        thumbnail: { type: 'image', value: successfulSrcs[0] },
                        title: currentSettings.prompt,
                        payload: { settings: currentSettings, productImagePreview, productImageNoBg, generatedImages: successfulSrcs, textOverlays }
                    });
                } else {
                    throw new Error("All image generations failed.");
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };


    const handleDownload = () => {
        if (!selectedItem) return;
        const link = document.createElement('a');
        link.href = selectedItem.videoUrl || selectedItem.src!;
        link.download = `higgsfield-export.${selectedItem.videoUrl ? 'mp4' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // UI COMPONENTS
    const GenerationModeToggle: React.FC = () => {
        const modes = [
            { value: 'product', labelKey: 'modeProduct', icon: 'package' },
            { value: 'video', labelKey: 'modeVideo', icon: 'video' },
            { value: 'mockup', labelKey: 'modeMockup', icon: 'shirt' },
            { value: 'social', labelKey: 'modeSocial', icon: 'users' },
            { value: 'design', labelKey: 'modeDesign', icon: 'pencil' }
        ];
        return (
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
                {modes.map(mode => (
                     <button key={mode.value} onClick={() => setSettings(s => ({ ...s, generationMode: mode.value as GenerationMode, editedPrompt: null, selectedPresetId: null, prompt: '' }))} disabled={isLoading}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex-1 flex items-center justify-center gap-2 ${settings.generationMode === mode.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Icon name={mode.icon} className="w-4 h-4" /> {t(mode.labelKey as any)}
                    </button>
                ))}
            </div>
        );
    };

    if (!productImagePreview) {
        return <WelcomeScreen mode={initialMode} onUpload={handleProductImageUpload} />;
    }

    if (selectedImageIndex !== null) {
        return (
            <div className="h-screen flex flex-col">
                <Canvas
                    productImagePreview={productImagePreview}
                    generatedImages={selectedItem?.src ? [selectedItem.src] : []}
                    generatedVideoUrl={selectedItem?.videoUrl || null}
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
        <div className="grid flex-1 min-h-0 overflow-hidden md:grid-cols-[380px_1fr_350px]">
            {/* Left Sidebar */}
            <div className="bg-card border-r border-border h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     <CollapsibleSection title="Main Asset">
                        <FileUpload 
                            onFileUpload={handleProductImageUpload} 
                            label={t('uploadPhoto')}
                            uploadedFileName={productImage?.name} 
                            onClear={() => setIsStartOverModalOpen(true)}
                            disabled={isLoading || !!promptGenerationMessage}
                            disabledReason={promptGenerationMessage || undefined}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Generation Mode">
                        <GenerationModeToggle />
                    </CollapsibleSection>
                    <CollapsibleSection title="Your Imagination">
                         <div className="relative">
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Prompt</label>
                            <textarea value={settings.editedPrompt ?? settings.prompt} onChange={(e) => setSettings(s => ({ ...s, editedPrompt: e.target.value }))} rows={4} className="w-full bg-background border border-input p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[9rem]"></textarea>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setIsPresetModalOpen(true)} className="flex-1 text-sm h-9 bg-muted hover:bg-accent rounded-md">{t('browsePresets')}</button>
                                <button onClick={handleEnhancePrompt} disabled={isEnhancingPrompt} className="flex-1 text-sm h-9 bg-muted hover:bg-accent rounded-md flex items-center justify-center gap-1">
                                    {isEnhancingPrompt ? <Icon name="spinner" className="animate-spin"/> : <Icon name="wand"/>} {t('enhancePrompt')}
                                </button>
                            </div>
                         </div>
                         {sceneTemplates.length > 0 && settings.generationMode === 'product' && (
                            <SceneSuggestions templates={sceneTemplates} onSelect={handleSelectSceneTemplate} isLoading={isLoadingTemplates} />
                         )}
                    </CollapsibleSection>
                    <CollapsibleSection title="Generation Settings">
                        {settings.generationMode === 'product' && (
                            <div className="space-y-4">
                                <Dropdown label="lighting" options={LIGHTING_STYLES} value={settings.lightingStyle} onChange={(val) => setSettings(s => ({ ...s, lightingStyle: val, editedPrompt: null, prompt: '' }))} />
                                <Dropdown label="perspective" options={CAMERA_PERSPECTIVES} value={settings.cameraPerspective} onChange={(val) => setSettings(s => ({ ...s, cameraPerspective: val, editedPrompt: null, prompt: '' }))} />
                            </div>
                        )}
                        {settings.generationMode === 'video' && (
                            <div className="space-y-4">
                                <Dropdown label="length" options={VIDEO_LENGTHS} value={settings.videoLength} onChange={(val) => setSettings(s => ({ ...s, videoLength: val as any, editedPrompt: null, prompt: '' }))} />
                                <Dropdown label="motion" options={CAMERA_MOTIONS} value={settings.cameraMotion} onChange={(val) => setSettings(s => ({ ...s, cameraMotion: val as any, editedPrompt: null, prompt: '' }))} />
                            </div>
                        )}
                        {settings.generationMode === 'mockup' && (
                            <Dropdown label="mockupType" options={MOCKUP_TYPES} value={settings.mockupType} onChange={(val) => setSettings(s => ({ ...s, mockupType: val, editedPrompt: null, prompt: '' }))} />
                        )}
                         {settings.generationMode === 'social' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('socialMediaTemplate')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SOCIAL_MEDIA_TEMPLATES.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                setSettings(s => ({
                                                    ...s,
                                                    selectedSocialTemplateId: template.id,
                                                    aspectRatio: template.aspectRatio,
                                                    editedPrompt: null,
                                                    selectedPresetId: null,
                                                    prompt: ''
                                                }));
                                            }}
                                            className={`p-3 rounded-lg border-2 text-left transition-colors flex flex-col justify-between h-24 ${
                                                settings.selectedSocialTemplateId === template.id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50 hover:bg-accent'
                                            }`}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{t(template.name as any)}</p>
                                                <p className="text-xs text-muted-foreground">{template.platform}</p>
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-auto pt-2">
                                               <Icon name="aspect-ratio" className="w-3 h-3"/>
                                               <span>{template.aspectRatio}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {settings.generationMode === 'design' && (
                            <div className="text-sm text-muted-foreground text-center p-4 bg-muted rounded-md">
                                {t('designModePromptInfo')}
                            </div>
                        )}
                    </CollapsibleSection>
                </div>
                <div className="p-4 border-t border-border/80">
                     <button onClick={handleGenerate} disabled={isLoading || !productImage} className="w-full text-base font-semibold h-12 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><Icon name="wand" className="w-5 h-5" /> {t('generate')}</>}
                    </button>
                </div>
            </div>
            
            {/* Center Gallery */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                {generatedItems.length > 0 ? (
                    <div className="columns-2 gap-6 space-y-6">
                        {generatedItems.map((item, index) => (
                            <ImageCard 
                                key={item.id} 
                                item={item} 
                                onSelect={() => setSelectedImageIndex(index)} 
                                onDownload={() => {
                                    setSelectedImageIndex(index);
                                    setTimeout(() => handleDownload(), 0);
                                }}
                                onEnhance={() => { setSelectedImageIndex(index); setTimeout(() => handleEnhanceImage(), 0); }}
                                onGenerateCopy={() => { setSelectedImageIndex(index); setTimeout(() => handleGenerateCopy(false), 0); }}
                                onSetEditorMode={(mode) => { setSelectedImageIndex(index); setEditorMode(mode); }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                        <p>Your generated images will appear here.</p>
                    </div>
                )}
            </main>

            {/* Right Sidebar */}
            <div className="bg-card border-l border-border">
                <Tabs tabs={[{key: 'History', label: t('history')}, {key: 'Brand', label: t('brand')}]}>
                    {(activeTab) => (
                        <div className="p-4 h-full">
                            {activeTab === 'History' && <HistoryPanel history={history} onRestore={onRestore} onToggleFavorite={onToggleFavorite} onDelete={deleteHistoryItem} />}
                            {activeTab === 'Brand' && <BrandKitPanel brandKits={brandKits} setBrandKits={setBrandKits} activeBrandKitId={activeBrandKitId} setActiveBrandKitId={setActiveBrandKitId} />}
                        </div>
                    )}
                </Tabs>
            </div>

            {/* Modals */}
            <ConfirmationModal isOpen={isStartOverModalOpen} onClose={() => setIsStartOverModalOpen(false)} onConfirm={handleStartOver} title={t('confirmStartOverTitle')} message={t('confirmStartOverMessage')} />
            <StylePresetModal isOpen={isPresetModalOpen} onClose={() => setIsPresetModalOpen(false)} presets={PRESETS} onSelect={(p) => { setSettings(s => ({ ...s, selectedPresetId: p.id, editedPrompt: null })); setIsPresetModalOpen(false); }} activeMode={settings.generationMode} />
            <MarketingCopyModal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} copy={marketingCopy} onRegenerate={() => handleGenerateCopy(true)} isLoading={isLoading && isCopyModalOpen} />
        </div>
    );
};
