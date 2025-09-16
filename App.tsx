
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { AspectRatio, GenerationSettings, HistoryItem, Theme, EditorMode, BrandKit, TextOverlay, SceneTemplate, MarketingCopy, VideoLength, CameraMotion } from './types';
// Fix: Corrected typo LIGHTING_STYYLES to LIGHTING_STYLES.
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS } from './constants';
import * as geminiService from './services/geminiService';
import { ThemeToggle } from './components/ThemeToggle';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Icon } from './components/Icon';
import { Tooltip } from './components/Tooltip';

// Helper function to get initial theme
const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('color-theme');
        if (typeof storedPrefs === 'string' && (storedPrefs === 'light' || storedPrefs === 'dark')) {
            return storedPrefs;
        }
        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) {
            return 'dark';
        }
    }
    return 'dark'; // default
};

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
                    <p className="flex-1 text-sm bg-secondary text-secondary-foreground p-3 rounded-md whitespace-pre-wrap font-mono">{value}</p>
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


const App: React.FC = () => {
    // Core state
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [styleImage, setStyleImage] = useState<File | null>(null);
    
    // Settings state
    const [settings, setSettings] = useState<GenerationSettings>(() => {
        const initial: GenerationSettings = {
            generationMode: 'image',
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            videoLength: VIDEO_LENGTHS[0],
            cameraMotion: CAMERA_MOTIONS[0],
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            styleKeywords: '',
            selectedStyleTemplateName: null,
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
        setStyleImage(null);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setError(null);
        setTextOverlays([]);
        setSettings(s => ({
            ...s,
            generationMode: 'image',
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            videoLength: VIDEO_LENGTHS[0],
            cameraMotion: CAMERA_MOTIONS[0],
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            styleKeywords: '',
            selectedStyleTemplateName: null,
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
    
    // Style image analysis
    const handleStyleImageUpload = useCallback(async (file: File) => {
        setStyleImage(file);
        setError(null);
        setIsLoading(true);
        setLoadingMessage('Analyzing style reference...');
        try {
            const keywords = await geminiService.describeStyle(file);
            setSettings(s => ({ ...s, styleKeywords: keywords, selectedStyleTemplateName: null }));
        } catch (e) {
            setError('Failed to get style keywords.');
            console.error(e);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    // Effect to auto-generate the prompt from settings
    useEffect(() => {
        if (!settings.productDescription || settings.editedPrompt !== null) {
            return;
        }

        const lightingClause = LIGHTING_STYLES.includes(settings.lightingStyle) ? `, lit with ${settings.lightingStyle.toLowerCase()}` : '';
        const perspectiveClause = CAMERA_PERSPECTIVES.includes(settings.cameraPerspective) ? `, ${settings.cameraPerspective.toLowerCase()}` : '';
        const styleClause = settings.styleKeywords ? `, in the style of ${settings.styleKeywords}` : '';

        const modeClause = settings.generationMode === 'video'
            ? `A ${settings.videoLength.split(' ')[0].toLowerCase()}-long video with ${settings.cameraMotion.toLowerCase()} camera movement`
            : 'Professional product photography';

        const prompt = `${modeClause} of ${settings.productDescription}${perspectiveClause}${lightingClause}${styleClause}.`;
        setSettings(s => ({ ...s, prompt }));
    }, [
        settings.productDescription, 
        settings.styleKeywords, 
        settings.lightingStyle, 
        settings.cameraPerspective, 
        settings.editedPrompt,
        settings.generationMode,
        settings.videoLength,
        settings.cameraMotion,
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
                 return geminiService.generateImage(productWithoutBg, finalPrompt, styleImage, settings.negativePrompt, currentSeed);
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
    
    // Main generate function
    const handleGenerate = async () => {
        if (settings.generationMode === 'video') {
            await handleVideoGeneration();
        } else {
            await handleImageGeneration();
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
            const finalImage = `data:image/png;base64,${inpaintedImageBase64}`;
            
            const updatedImages = [...generatedImages];
            updatedImages[selectedImageIndex] = finalImage;
            setGeneratedImages(updatedImages);

            const latestHistoryItem = history[0];
            if (latestHistoryItem) {
                const updatedHistoryImages = [...(latestHistoryItem.images || [])];
                updatedHistoryImages[selectedImageIndex] = finalImage;
                const updatedHistoryItem = { ...latestHistoryItem, images: updatedHistoryImages };
                setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
            }

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during Magic Edit.');
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
            const finalImage = `data:image/png;base64,${enhancedImageBase64}`;

            const updatedImages = [...generatedImages];
            updatedImages[selectedImageIndex] = finalImage;
            setGeneratedImages(updatedImages);

            const latestHistoryItem = history[0];
            if (latestHistoryItem) {
                const updatedHistoryImages = [...(latestHistoryItem.images || [])];
                updatedHistoryImages[selectedImageIndex] = finalImage;
                const updatedHistoryItem = { ...latestHistoryItem, images: updatedHistoryImages };
                setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
            }

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
    
    // Save text overlays to history
    useEffect(() => {
        if (!history.length) return;
        const latestHistoryItem = history[0];
        if (latestHistoryItem.textOverlays !== textOverlays) {
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


    return (
        <div className="min-h-screen flex flex-col font-sans">
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
            <header className="w-full mx-auto p-4 border-b">
                 <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                             <Icon name="sparkles" className="w-5 h-5 text-white"/>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">
                            ProductGenius AI
                        </h1>
                    </div>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                 </div>
            </header>
            <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 p-4">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <ControlPanel
                        onProductImageUpload={handleProductImageUpload}
                        onClearProductImage={handleStartOver}
                        onStyleImageUpload={handleStyleImageUpload}
                        onClearStyleImage={() => setStyleImage(null)}
                        settings={settings}
                        setSettings={setSettings}
                        sceneTemplates={sceneTemplates}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        productImage={productImage}
                        styleImage={styleImage}
                        history={history}
                        onRevertToHistory={handleRevertToHistory}
                        onToggleFavorite={handleToggleFavorite}
                        finalPrompt={finalPrompt}
                        brandKits={brandKits}
                        setBrandKits={setBrandKits}
                        activeBrandKitId={activeBrandKitId}
                        setActiveBrandKitId={setActiveBrandKitId}
                        activeBrandKit={activeBrandKit}
                    />
                </aside>
                <div className="lg:col-span-8 xl:col-span-9 flex min-h-[60vh] lg:min-h-0">
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
                    />
                </div>
            </main>
        </div>
    );
};

export default App;