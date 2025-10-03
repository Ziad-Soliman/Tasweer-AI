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
    selectedSocialTemplateId: null,
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

    // === CORE STATE ===
    const [settings, setSettings] = useState<GenerationSettings>({ ...DEFAULT_SETTINGS, generationMode: initialMode === 'video' ? 'video' : 'product' });
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

    // === HANDLERS & LOGIC ===
    const resetState = () => {
        setSettings(DEFAULT_SETTINGS);
        setProductImage(null);
        setProductImagePreview(null);
        setProductImageNoBg(null);
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
        resetState();
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

    const handleGenerate = async () => {
        setError(null);
        setIsLoading(true);
        setGeneratedImages([]);
        setGeneratedVideoUrl(null);
        setSelectedImageIndex(null);
        setPalette(undefined);

        const currentSettings = settings.editedPrompt ? { ...settings, prompt: settings.editedPrompt } : settings;
        
        try {
            // FIX: Explicitly type `historyThumbnail` to prevent type widening from `let` which causes a type error on assignment.
            let historyThumbnail: HistoryItem['thumbnail'] = { type: 'icon', value: 'sparkles' };
            
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
                        // Default to standard image generation for product, social, design
                        return geminiService.generateImage(productImageNoBg, currentSettings.prompt, currentSettings.negativePrompt, seed);
                    });

                    const results = await Promise.all(imagePromises);
                    const finalImages = results.map(base64 => `data:image/png;base64,${base64}`);
                    setGeneratedImages(finalImages);
                    setSelectedImageIndex(0);
                    historyThumbnail = { type: 'image', value: finalImages[0] };
                    break;
                
                case 'video':
                    if (!productImageNoBg) throw new Error("Product image not ready.");
                    // video loading message carousel
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
                    generatedImages: generatedImages,
                    generatedVideoUrl: generatedVideoUrl,
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
    
    // ... other handlers for enhance, magic edit, etc.

    return (
        <main className="grid grid-cols-[350px_1fr_350px] h-full overflow-hidden">
            <div className={`transition-all duration-300 ${isSidebarVisible ? 'w-[350px]' : 'w-0'} overflow-hidden`}>
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

            <div className="flex flex-col relative bg-background">
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
                    onExtractPalette={() => {}} // TODO
                    onEnhance={() => {}} // TODO
                    onMagicEdit={() => {}} // TODO
                    onRemoveObject={() => {}} // TODO
                    onExpandImage={() => {}} // TODO
                    onGenerateCopy={() => setIsCopyModalOpen(true)}
                />
                <PromptBar
                    prompt={settings.editedPrompt ?? settings.prompt}
                    onPromptChange={(p) => setSettings(s => ({ ...s, editedPrompt: p }))}
                    negativePrompt={settings.negativePrompt}
                    onNegativePromptChange={(p) => setSettings(s => ({ ...s, negativePrompt: p }))}
                    onGenerate={handleGenerate}
                    onBrowsePresets={() => setIsPresetModalOpen(true)}
                    onEnhancePrompt={() => {}} // TODO
                    isGenerating={isLoading}
                    isImageUploaded={!!productImage}
                    numberOfImages={settings.numberOfImages}
                />
            </div>

            <div className={`transition-all duration-300 ${isWorkspaceVisible ? 'w-[350px]' : 'w-0'} overflow-hidden bg-card border-l`}>
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
                onRegenerate={() => {}}
                isLoading={isLoading}
            />
        </main>
    );
};