// This is a new, dedicated page for Character Generation.
// It is a refactored and streamlined version of the 'character' mode from the old ProductGenerationPage.

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { GenerationSettings, BrandKit, HistoryItem, AspectRatio, KeyObject } from '../types';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../App';
// FIX: Changed import from CAMERA_PERSPECTIVES to CAMERA_PERSPECTIVE_OPTIONS and will update usage below.
import { PHOTO_STYLES, CAMERA_ZOOMS, SHOT_TYPES, COLOR_TONES, NEGATIVE_PROMPT_PRESETS, CINEMATIC_LIGHTING_STYLES, CAMERA_PERSPECTIVE_OPTIONS } from '../constants';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';
import { ConfirmationModal } from '../components/ConfirmationModal';

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
        <p className="mt-6 font-semibold text-slate-200 tracking-wide">Summoning Digital Souls...</p>
        <p className="mt-1 text-sm text-slate-400">Rendering alternate realities...</p>
    </div>
);


interface ImageCardProps {
    item: GeneratedItem;
    onSelect: () => void;
    onDownload: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onSelect, onDownload }) => {
    const { t } = useTranslation();
    
    return (
        <div className="break-inside-avoid">
            {item.isLoading || !item.src ? (
                <LoadingCard />
            ) : (
                <>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer" onClick={onSelect}>
                        <img src={item.src} alt={item.prompt} className="w-full h-auto block bg-muted" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
                            <Tooltip text={t('download')}><button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="download" className="w-4 h-4" /></button></Tooltip>
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

const DEFAULT_SETTINGS: GenerationSettings = {
    generationMode: 'character',
    aspectRatio: '9:16',
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
    numberOfImages: 4,
    productDescription: '',
    selectedPresetId: null,
    watermark: { enabled: false, useLogo: true, text: 'Your Brand', position: 'bottom-right', scale: 10, opacity: 70 },
    photoStyle: 'photorealistic',
    cameraZoom: 'medium-shot',
    shotType: 'none',
    colorTone: 'none',
    keyObjects: [],
};

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

interface CharacterPageProps {
    selectedModel: string;
    history: HistoryItem[];
    onToggleFavorite: (id: string) => void;
    onRestore: (item: HistoryItem) => void;
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    deleteHistoryItem: (id: string) => void;
    restoredState: HistoryItem | null;
    clearRestoredState: () => void;
}

export const CharacterPage: React.FC<CharacterPageProps> = (props) => {
    const { addHistoryItem } = props;
    const { t } = useTranslation();

    const [settings, setSettings] = useState<GenerationSettings>({ ...DEFAULT_SETTINGS });
    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [characterDescription, setCharacterDescription] = useState('');
    const [characterRefImage, setCharacterRefImage] = useState<File | null>(null);
    const [sceneDescription, setSceneDescription] = useState('');

    const handleGenerate = async () => {
        setError(null);
        setIsLoading(true);
    
        const selectedStyle = PHOTO_STYLES.find(s => s.id === settings.photoStyle)?.name || settings.photoStyle;
        const selectedLighting = CINEMATIC_LIGHTING_STYLES.find(l => l.id === settings.lightingStyle)?.name;
        const selectedZoom = CAMERA_ZOOMS.find(z => z.id === settings.cameraZoom)?.name;
        const selectedShot = SHOT_TYPES.find(s => s.id === settings.shotType)?.name;
        const selectedTone = COLOR_TONES.find(t => t.id === settings.colorTone)?.name;

        const cinematicPrompt = [
            selectedStyle,
            selectedLighting,
            settings.cameraPerspective,
            selectedZoom,
            selectedShot,
            selectedTone
        ].filter(p => p && p !== 'None').join(', ');
        
        let keyObjectsPrompt = '';
        if (settings.keyObjects.length > 0) {
            const objectNames = settings.keyObjects.map(o => o.name).filter(Boolean);
            if (objectNames.length > 0) {
                keyObjectsPrompt = ` The scene should also include these objects: ${objectNames.join(', ')}.`;
            }
        }

        const fullPrompt = `${characterDescription}, ${sceneDescription}, ${cinematicPrompt}${keyObjectsPrompt}${settings.negativePrompt ? `. Negative prompt: do not include ${settings.negativePrompt}.` : ''}`;

        try {
            const placeholders: GeneratedItem[] = Array(settings.numberOfImages).fill(0).map(() => ({ id: nanoid(), prompt: fullPrompt, isLoading: true }));
            setGeneratedItems(placeholders);

            const results = await geminiService.generateCharacterImages(fullPrompt, selectedStyle, characterRefImage, settings.keyObjects);
            
            const newItems: GeneratedItem[] = results.map((base64, index) => ({
                id: placeholders[index]?.id || nanoid(),
                src: `data:image/png;base64,${base64}`,
                prompt: fullPrompt,
                isLoading: false,
            }));

            setGeneratedItems(newItems);
            
            addHistoryItem({
                source: { page: 'character', appName: t('character') },
                thumbnail: { type: 'image', value: newItems[0].src! },
                title: fullPrompt,
                payload: { settings, generatedItems: newItems, characterDescription, sceneDescription }
            });

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            setGeneratedItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (src: string) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = `higgsfield-character.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const aspectRatios: { id: AspectRatio; icon: string }[] = [{ id: '1:1', icon: 'aspect-ratio-1-1' }, { id: '9:16', icon: 'aspect-ratio-9-16' }, { id: '16:9', icon: 'aspect-ratio-16-9' }, { id: '4:3', icon: 'aspect-ratio-4-3' }, { id: '3:4', icon: 'aspect-ratio-3-4' }];
    const numImages: GenerationSettings['numberOfImages'][] = [1, 2, 3, 4];

    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="bg-card border-b md:border-b-0 md:border-r border-border md:w-[380px] flex-shrink-0 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Icon name="users"/> Soul ID Studio</h2>
                    <p className="text-sm text-muted-foreground mt-1">Create and visualize consistent characters.</p>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                    <CollapsibleSection title="Character Definition" defaultOpen={true}>
                        <div>
                            <Label>Reference Image (Optional)</Label>
                            <FileUpload 
                                onFileUpload={setCharacterRefImage} 
                                label="Upload character reference"
                                uploadedFileName={characterRefImage?.name}
                                onClear={() => setCharacterRefImage(null)}
                            />
                        </div>
                        <div>
                            <Label>Character Description</Label>
                            <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)}
                                placeholder="e.g., A grizzled space pirate with a robotic eye and a leather jacket..."
                                className="w-full bg-background border border-input rounded-md p-2 text-sm min-h-[100px] resize-none"
                            />
                        </div>
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
                    <CollapsibleSection title="Cinematic Controls">
                        <IconGridSelector gridCols="grid-cols-3" label="Lighting Style" options={CINEMATIC_LIGHTING_STYLES} value={settings.lightingStyle} onChange={(v) => setSettings(s => ({...s, lightingStyle: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Photo Style" options={PHOTO_STYLES} value={settings.photoStyle} onChange={(v) => setSettings(s => ({...s, photoStyle: v}))} />
                        <IconGridSelector gridCols="grid-cols-3" label="Camera Perspective" options={CAMERA_PERSPECTIVE_OPTIONS} value={settings.cameraPerspective} onChange={(v) => setSettings(s => ({ ...s, cameraPerspective: v }))} />
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
                            <textarea value={settings.negativePrompt} onChange={(e) => setSettings(s => ({...s, negativePrompt: e.target.value}))}
                                placeholder="e.g., blurry, deformed, text, watermark..."
                                className="w-full bg-background border border-input rounded-md p-2 text-sm min-h-[80px] resize-none"
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
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6 relative">
                            <h3 className="font-bold">Generation Failed</h3>
                            <p className="text-sm">{error}</p>
                            <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1"><Icon name="close" className="w-4 h-4"/></button>
                        </div>
                    )}
                    {generatedItems.length > 0 ? (
                        <div className="columns-2 gap-4">
                            {generatedItems.map((item) => (
                                <ImageCard 
                                    key={item.id} 
                                    item={item} 
                                    onSelect={() => {}} 
                                    onDownload={() => handleDownload(item.src!)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8 animate-fade-in">
                            <Icon name="users" className="w-24 h-24 text-primary/20" />
                            <h2 className="text-2xl font-bold mt-4 text-foreground">Character Studio</h2>
                            <p className="max-w-sm mt-2">Design your character in the left panel, then describe the scene you want to see them in below to bring them to life.</p>
                        </div>
                    )}
                </div>

                 <div className="flex-shrink-0 px-4 pb-4 mt-auto">
                    <div className="max-w-3xl mx-auto">
                         <div className="bg-card border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
                            <textarea
                                value={sceneDescription}
                                onChange={(e) => setSceneDescription(e.target.value)}
                                placeholder="Describe the scene... e.g., 'standing on a rainy neon-lit street of a futuristic city'"
                                className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground px-2 resize-none"
                                rows={1}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !characterDescription || !sceneDescription}
                                className="bg-primary text-primary-foreground h-10 px-6 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-opacity"
                            >
                                {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <>Generate <Icon name="wand" className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};