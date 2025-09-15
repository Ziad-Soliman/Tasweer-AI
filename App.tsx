import React, { useState, useEffect, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { AspectRatio, GenerationSettings, HistoryItem, Theme, EditorMode, BrandKit, TextOverlay } from './types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES } from './constants';
import * as geminiService from './services/geminiService';
import { ThemeToggle } from './components/ThemeToggle';
import { ConfirmationModal } from './components/ConfirmationModal';

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

const getInitialBrandKit = (): BrandKit => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedKit = window.localStorage.getItem('brand-kit');
        if (storedKit) {
            return JSON.parse(storedKit);
        }
    }
    return { logo: null, primaryColor: '#6366F1', font: 'Inter' };
};

const App: React.FC = () => {
    // Core state
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [styleImage, setStyleImage] = useState<File | null>(null);
    
    // Settings state
    const [settings, setSettings] = useState<GenerationSettings>(() => {
        const initial: GenerationSettings = {
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            styleKeywords: '',
            watermark: { enabled: false, text: '', position: 'bottom-right', scale: 5, opacity: 70, useLogo: false }
        };
        return initial;
    });

    const [styleSuggestions, setStyleSuggestions] = useState<string[]>([]);
    
    // Output state
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    
    // UI/App state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [editorMode, setEditorMode] = useState<EditorMode>('view');
    const [brandKit, setBrandKit] = useState<BrandKit>(getInitialBrandKit);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Derived state for the final prompt
    const finalPrompt = settings.editedPrompt ?? settings.prompt;

    const resetForNewProduct = () => {
        setStyleImage(null);
        setGeneratedImages([]);
        setSelectedImageIndex(null);
        setError(null);
        setTextOverlays([]);
        setSettings(s => ({
            ...s,
            aspectRatio: '1:1',
            lightingStyle: LIGHTING_STYLES[0],
            cameraPerspective: CAMERA_PERSPECTIVES[0],
            prompt: '',
            editedPrompt: null,
            negativePrompt: '',
            seed: '',
            numberOfImages: 1,
            productDescription: '',
            styleKeywords: ''
        }));
        setStyleSuggestions([]);
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

            setLoadingMessage('Getting style ideas...');
            const suggestions = await geminiService.generateStyleSuggestions(description);
            setStyleSuggestions(suggestions);

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
            setSettings(s => ({ ...s, styleKeywords: keywords }));
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

        const prompt = `Professional product photography of ${settings.productDescription}${perspectiveClause}${lightingClause}${styleClause}.`;
        setSettings(s => ({ ...s, prompt }));
    }, [settings.productDescription, settings.styleKeywords, settings.lightingStyle, settings.cameraPerspective, settings.editedPrompt]);

    // Main generate function
    const handleGenerate = async () => {
        if (!productImage || !finalPrompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
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
            
            // Add to history
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
    
    // In-painting
    const handleInpaint = async (imageWithMaskBase64: string, inpaintPrompt: string) => {
        if (selectedImageIndex === null) return;

        setIsLoading(true);
        setError(null);
        setLoadingMessage('In-painting image...');

        try {
            const inpaintedImageBase64 = await geminiService.inpaintImage(imageWithMaskBase64, inpaintPrompt);
            const finalImage = `data:image/png;base64,${inpaintedImageBase64}`;
            
            const updatedImages = [...generatedImages];
            updatedImages[selectedImageIndex] = finalImage;
            setGeneratedImages(updatedImages);

            const latestHistoryItem = history[0];
            if (latestHistoryItem) {
                const updatedHistoryImages = [...latestHistoryItem.images];
                updatedHistoryImages[selectedImageIndex] = finalImage;
                const updatedHistoryItem = { ...latestHistoryItem, images: updatedHistoryImages };
                setHistory(prev => [updatedHistoryItem, ...prev.slice(1)]);
            }

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during in-painting.');
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
                const updatedHistoryImages = [...latestHistoryItem.images];
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
        setGeneratedImages(historyItem.images);
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
        window.localStorage.setItem('brand-kit', JSON.stringify(brandKit));
    }, [brandKit]);

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
        <div className="min-h-screen flex flex-col items-center p-2 sm:p-4 lg:p-6 font-sans">
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmStartOver}
                title="Are you sure?"
                message="This will clear your current product, all generated images, and the session history. This action cannot be undone."
            />
            <header className="w-full max-w-screen-2xl mx-auto mb-4 flex justify-between items-center">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
                        ProductGenius AI
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Generate stunning product shots in seconds.</p>
                </div>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </header>
            <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                <div className="lg:col-span-4 xl:col-span-3">
                    <ControlPanel
                        onProductImageUpload={handleProductImageUpload}
                        onClearProductImage={handleStartOver}
                        onStyleImageUpload={handleStyleImageUpload}
                        onClearStyleImage={() => { setStyleImage(null); setSettings(s => ({ ...s, styleKeywords: '' }))}}
                        settings={settings}
                        setSettings={setSettings}
                        styleSuggestions={styleSuggestions}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        productImage={productImage}
                        styleImage={styleImage}
                        history={history}
                        onRevertToHistory={handleRevertToHistory}
                        onToggleFavorite={handleToggleFavorite}
                        finalPrompt={finalPrompt}
                        brandKit={brandKit}
                        setBrandKit={setBrandKit}
                    />
                </div>
                <div className="lg:col-span-8 xl:col-span-9 flex min-h-[60vh] lg:min-h-0">
                    <Canvas
                        productImagePreview={productImagePreview}
                        generatedImages={generatedImages}
                        selectedImageIndex={selectedImageIndex}
                        onSelectImage={setSelectedImageIndex}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        error={error}
                        onStartOver={handleStartOver}
                        onRetry={handleGenerate}
                        onEnhance={handleEnhance}
                        onInpaint={handleInpaint}
                        aspectRatio={settings.aspectRatio}
                        editorMode={editorMode}
                        setEditorMode={setEditorMode}
                        textOverlays={textOverlays}
                        setTextOverlays={setTextOverlays}
                        brandKit={brandKit}
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
