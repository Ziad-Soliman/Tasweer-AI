
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { GenerationSettings, BrandKit, HistoryItem, EditorMode, TextOverlay, MarketingCopy, Preset, GenerationMode } from '../types';
import { ControlPanel } from '../components/ControlPanel';
import { Canvas } from '../components/Canvas';
import { Tabs } from '../components/Tabs';
import { HistoryPanel } from '../components/HistoryPanel';
import { BrandKitPanel } from '../components/BrandKitPanel';
import { PromptBar } from '../components/PromptBar';
import { StylePresetModal } from '../components/StylePresetModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MarketingCopyModal } from '../components/MarketingCopyModal';
import * as geminiService from '../services/geminiService';
import { PRESETS } from '../constants/presets';
import { useTranslation } from '../App';
import { NEGATIVE_PROMPT_PRESETS, SOCIAL_MEDIA_TEMPLATES } from '../constants';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';

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
    
    const StepCard = ({ icon, step, title, description }: { icon: string, step: string, title: string, description: string }) => (
         <div className="flex flex-col items-center p-4 rounded-lg">
            <div className="relative w-full aspect-video rounded-lg bg-card flex items-center justify-center p-4 border border-border">
                <Icon name={icon} className="w-16 h-16 text-primary" />
                <span className="absolute top-2 left-2 text-2xl font-bold text-foreground/20">{step}</span>
            </div>
            <h3 className="font-semibold mt-4">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    );

    // Video-specific welcome screen
    if (mode === 'video') {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in">
                <Icon name="video" className="w-24 h-24 text-primary mb-4" />
                <h1 className="text-4xl font-bold tracking-tight">Control Every Camera Move</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Animate your scenes with precision and style. Get full cinematic control over how the camera moves to enhance emotion, rhythm, and storytelling.
                </p>
                 <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    <StepCard icon="move" step="01" title="Choose motion" description="Select a Motion to define how your image will move" />
                    <StepCard icon="upload" step="02" title="Add Image" description="Upload an image to start your animation" />
                    <StepCard icon="video" step="03" title="Get video" description="Click generate to create your final animated video!" />
                </div>
            </div>
        );
    }

    // Default for Image/Edit
    return (
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in">
            <div className="w-full max-w-lg">
                 <Icon name="wand" className="w-24 h-24 text-primary mx-auto mb-4" />
                 <h2 className="text-4xl font-bold tracking-tight">AI Image Generation Studio</h2>
                 <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">Generate new, stylized e-commerce and marketing images from a single product photo.</p>
                 <FileUpload onFileUpload={onUpload} label={t('uploadPhoto')}/>
            </div>
             <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <StepCard icon="upload" step="01" title="Upload Photo" description="Start by uploading a photo of your product." />
                <StepCard icon="pencil" step="02" title="Describe Scene & Style" description="Use the controls and prompt to describe the perfect scene." />
                <StepCard icon="sparkles" step="03" title="Generate Image" description="Let the AI create stunning, professional visuals for you." />
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
    restoredState: HistoryItem | null;
    clearRestoredState: () => void;
}

export const ProductGenerationPage: React.FC<ProductGenerationPageProps> = (props) => {
    const { initialMode, history, onToggleFavorite, onRestore, addHistoryItem, restoredState, clearRestoredState } = props;
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

    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const selectedImage = useMemo(() => (selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null), [selectedImageIndex, generatedImages]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [promptGenerationMessage, setPromptGenerationMessage] = useState('');
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // === UI/EDITOR STATE ===
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isWorkspaceVisible, setIsWorkspaceVisible] = useState(true);
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

    // === RESPONSIVENESS ===
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarVisible(false);
                setIsWorkspaceVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // === STATE RESTORATION ===
     useEffect(() => {
        if (restoredState && restoredState.source.page === 'product-generation') {
            const { payload } = restoredState;
            setSettings(payload.settings);
            setProductImagePreview(payload.productImagePreview);
            setProductImageNoBg(payload.productImageNoBg);
            // Must create a File object from the preview to allow re-generation
             if (payload.productImagePreview) {
                fetch(payload.productImagePreview)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "restored-image.png", { type: blob.type });
                        setProductImage(file);
                    });
            }
            const restoredImages = payload.generatedImages || [];
            setGeneratedImages(restoredImages);
            setGeneratedVideoUrl(payload.generatedVideoUrl || null);
            setTextOverlays(payload.textOverlays || []);
            setSelectedImageIndex(restoredImages.length > 1 ? null : 0);
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
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setIsLoading(false);
        setLoadingMessage('');
        setError(null);
        setEditorMode('view');
        setTextOverlays([]);
        setMarketingCopy(null);
        setPalette(undefined);
    };
    
    const handleStartOver = () => {
        resetState();
        setIsStartOverModalOpen(false);
    };

    const handleProductImageUpload = async (file: File) => {
        resetState(true);
        setProductImage(file);
        const previewUrl = URL.createObjectURL(file);
        setProductImagePreview(previewUrl);
        
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

    const handleUpdateSingleImage = (newImageBase64: string) => {
        if (selectedImageIndex === null) return;
        const finalImage = `data:image/png;base64,${newImageBase64}`;
        const newImages = [...generatedImages];
        newImages[selectedImageIndex] = finalImage;
        setGeneratedImages(newImages);
    };

    // === API-backed Feature Handlers ===
    const handleEnhancePrompt = async () => {
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const currentPrompt = settings.editedPrompt ?? settings.prompt;
            const enhanced = await geminiService.enhancePrompt(currentPrompt);
            setSettings(s => ({ ...s, editedPrompt: enhanced }));
        } catch(e) {
            setError(e instanceof Error ? e.message : 'Failed to enhance prompt.');
        } finally {
            setIsEnhancingPrompt(false);
        }
    };
    
    const handleMagicEdit = async (imageWithMaskBase64: string, prompt: string) => {
        setIsLoading(true);
        setLoadingMessage(t('loadingMagicEdit'));
        setError(null);
        try {
            const result = await geminiService.magicEditImage(imageWithMaskBase64, prompt);
            handleUpdateSingleImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Magic Edit failed.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };

    const handleRemoveObject = async (imageWithMaskBase64: string) => {
        setIsLoading(true);
        setLoadingMessage(t('loadingRemovingObject'));
        setError(null);
        try {
            const result = await geminiService.removeObject(imageWithMaskBase64);
            handleUpdateSingleImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Object removal failed.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };
    
    const handleEnhanceImage = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        setLoadingMessage(t('loadingEnhancingImage'));
        setError(null);
        try {
            const base64 = selectedImage.split(',')[1];
            const result = await geminiService.enhanceImage(base64, settings.prompt);
            handleUpdateSingleImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Enhancement failed.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleExpandImage = async (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!selectedImage) return;
        setIsLoading(true);
        setLoadingMessage(t('loadingExpandingImage', { direction }));
        setError(null);
        try {
            const base64 = selectedImage.split(',')[1];
            const result = await geminiService.expandImage(base64, settings.prompt, direction);
            handleUpdateSingleImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Expansion failed.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setEditorMode('view');
        }
    };
    
    const handleGenerateCopy = async (regenerate = false) => {
        if (!selectedImage) return;
        if (!regenerate) setIsCopyModalOpen(true);
        setMarketingCopy(null);
        setIsLoading(true);
        setLoadingMessage(t('loadingGeneratingCopy'));
        setError(null);
        try {
            const base64 = selectedImage.split(',')[1];
            const result = await geminiService.generateMarketingCopy(base64, settings.prompt);
            setMarketingCopy(result);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to generate copy.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleExtractPalette = async () => {
        if (!selectedImage) return;
        setLoadingMessage(t('loadingExtractingPalette')); // Use loading message for quick feedback
        try {
            const base64 = selectedImage.split(',')[1];
            const result = await geminiService.extractPalette(base64);
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
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setPalette(undefined);

        const currentSettings = settings.editedPrompt ? { ...settings, prompt: settings.editedPrompt } : settings;
        
        try {
            let historyThumbnail: HistoryItem['thumbnail'] = { type: 'icon', value: 'sparkles' };
            let finalGeneratedImages: string[] = [];
            let finalGeneratedVideoUrl: string | null = null;
            
            switch (currentSettings.generationMode) {
                case 'product':
                case 'mockup':
                case 'social':
                case 'design':
                    if (!productImageNoBg) throw new Error("Product image not ready.");
                    setLoadingMessage(t('loadingGeneratingImages', { count: currentSettings.numberOfImages }));
                    
                    const imagePromises = Array(currentSettings.numberOfImages).fill(0).map((_, i) => {
                        const seed = currentSettings.seed ? parseInt(currentSettings.seed) + i : null;
                        if (currentSettings.generationMode === 'mockup') {
                            return geminiService.generateMockup(productImageNoBg, currentSettings.prompt, currentSettings.mockupType);
                        }
                        return geminiService.generateImage(productImageNoBg, currentSettings.prompt, currentSettings.negativePrompt, seed);
                    });

                    const results = await Promise.all(imagePromises);
                    finalGeneratedImages = results.map(base64 => `data:image/png;base64,${base64}`);
                    setGeneratedImages(finalGeneratedImages);
                    setSelectedImageIndex(finalGeneratedImages.length > 1 ? null : 0);
                    historyThumbnail = { type: 'image', value: finalGeneratedImages[0] };
                    break;
                
                case 'video':
                    if (!productImageNoBg) throw new Error("Product image not ready.");
                    const videoLoadingMessages = [t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'), t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'), t('videoLoadingMessage7')];
                    let messageIndex = 0;
                    setLoadingMessage(videoLoadingMessages[messageIndex]);
                    const intervalId = setInterval(() => {
                        messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
                        setLoadingMessage(videoLoadingMessages[messageIndex]);
                    }, 5000);

                    const url = await geminiService.generateVideo(productImageNoBg, currentSettings.prompt);
                    clearInterval(intervalId);
                    setGeneratedVideoUrl(url);
                    finalGeneratedVideoUrl = url;
                    historyThumbnail = { type: 'video', value: url };
                    break;
            }

            addHistoryItem({
                source: { page: 'product-generation', appName: t('productGeneration') },
                thumbnail: historyThumbnail,
                title: currentSettings.prompt,
                payload: {
                    settings: currentSettings,
                    productImagePreview,
                    productImageNoBg,
                    generatedImages: finalGeneratedImages,
                    generatedVideoUrl: finalGeneratedVideoUrl,
                    textOverlays,
                }
            });

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    if (!productImagePreview) {
        return <div className="flex-1 flex flex-col"><WelcomeScreen mode={initialMode} onUpload={handleProductImageUpload} /></div>;
    }


    return (
        <div className={`grid flex-1 min-h-0 overflow-hidden transition-all duration-300 md:grid-cols-[auto_1fr_auto]`}>
            <div className={`transition-all duration-300 overflow-hidden ${isSidebarVisible ? 'w-[350px]' : 'w-0'}`}>
                <ControlPanel 
                    settings={settings}
                    setSettings={setSettings}
                    onProductImageUpload={handleProductImageUpload}
                    onClearProductImage={() => setIsStartOverModalOpen(true)}
                    isLoading={isLoading}
                    isGeneratingPrompt={!!promptGenerationMessage}
                    promptGenerationMessage={promptGenerationMessage}
                    productImage={productImage}
                    activeBrandKit={activeBrandKit}
                />
            </div>

            <div className="flex flex-col relative bg-transparent min-w-0 h-full">
                 <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="absolute top-1/2 -start-3 -translate-y-1/2 z-30 w-6 h-16 bg-card border-y border-e border-border/80 rounded-r-lg flex items-center justify-center hover:bg-accent transition-colors">
                    <Icon name={isSidebarVisible ? 'arrow-left' : 'arrow-right'} className="w-4 h-4" />
                 </button>
                <Canvas
                    productImagePreview={productImagePreview}
                    generatedImages={generatedImages}
                    generatedVideoUrl={generatedVideoUrl}
                    selectedImageIndex={selectedImageIndex}
                    onSelectImage={setSelectedImageIndex}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                    onRetry={handleGenerate}
                    onStartOver={() => setIsStartOverModalOpen(true)}
                    aspectRatio={settings.aspectRatio}
                    editorMode={editorMode}
                    setEditorMode={setEditorMode}
                    textOverlays={textOverlays}
                    setTextOverlays={setTextOverlays}
                    brandKit={activeBrandKit}
                    watermarkSettings={settings.watermark}
                    palette={palette}
                    onExtractPalette={handleExtractPalette}
                    onEnhance={handleEnhanceImage}
                    onMagicEdit={handleMagicEdit}
                    onRemoveObject={handleRemoveObject}
                    onExpandImage={handleExpandImage}
                    onGenerateCopy={() => handleGenerateCopy(false)}
                />
                <PromptBar
                    prompt={settings.editedPrompt ?? settings.prompt}
                    onPromptChange={(p) => setSettings(s => ({ ...s, editedPrompt: p }))}
                    onGenerate={handleGenerate}
                    onBrowsePresets={() => setIsPresetModalOpen(true)}
                    onEnhancePrompt={handleEnhancePrompt}
                    isGenerating={isLoading}
                    isEnhancingPrompt={isEnhancingPrompt}
                    isImageUploaded={!!productImage}
                />
                <button onClick={() => setIsWorkspaceVisible(!isWorkspaceVisible)} className="absolute top-1/2 -end-3 -translate-y-1/2 z-30 w-6 h-16 bg-card border-y border-s border-border/80 rounded-l-lg flex items-center justify-center hover:bg-accent transition-colors">
                    <Icon name={isWorkspaceVisible ? 'arrow-right' : 'arrow-left'} className="w-4 h-4" />
                </button>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${isWorkspaceVisible ? 'w-[350px]' : 'w-0'}`}>
                 <Tabs tabs={[{key: 'History', label: t('history')}, {key: 'Brand', label: t('brand')}]}>
                    {(activeTab) => (
                        <div className="p-4 h-full">
                            {activeTab === 'History' && <HistoryPanel history={history} onRestore={onRestore} onToggleFavorite={onToggleFavorite} />}
                            {activeTab === 'Brand' && <BrandKitPanel brandKits={brandKits} setBrandKits={setBrandKits} activeBrandKitId={activeBrandKitId} setActiveBrandKitId={setActiveBrandKitId} />}
                        </div>
                    )}
                </Tabs>
            </div>
            
            <ConfirmationModal 
                isOpen={isStartOverModalOpen}
                onClose={() => setIsStartOverModalOpen(false)}
                onConfirm={handleStartOver}
                title={t('confirmStartOverTitle')}
                message={t('confirmStartOverMessage')}
            />
            <StylePresetModal 
                isOpen={isPresetModalOpen}
                onClose={() => setIsPresetModalOpen(false)}
                presets={PRESETS}
                onSelect={(preset) => {
                    setSettings(s => ({ ...s, selectedPresetId: preset.id, editedPrompt: null }));
                    setIsPresetModalOpen(false);
                }}
                activeMode={settings.generationMode}
            />
             <MarketingCopyModal 
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                copy={marketingCopy}
                onRegenerate={() => handleGenerateCopy(true)}
                isLoading={isLoading && isCopyModalOpen}
            />
        </div>
    );
};