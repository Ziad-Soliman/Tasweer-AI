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
        <p className="mt-6 font-semibold text-foreground tracking-wide">Summoning Digital Souls...</p>
        <p className="mt-1 text-sm text-muted-foreground">Rendering alternate realities...</p>
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
        <div className="break-inside-avoid mb-4">
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
    const { addHistoryItem, selectedModel } = props;
    const { t } = useTranslation();
    const numImages: GenerationSettings['numberOfImages'][] = [1, 2, 3, 4];
    const [settings, setSettings] = useState<GenerationSettings>({ ...DEFAULT_SETTINGS });
    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [characterDescription, setCharacterDescription] = useState('');
    const [characterRefImage, setCharacterRefImage] = useState<File | null>(null);
    const [sceneDescription, setSceneDescription] = useState('');

    const handleAddKeyObject = () => {
        setSettings(s => ({ ...s, keyObjects: [...s.keyObjects, { id: nanoid(), name: '', image: null }] }));
    };
    const handleUpdateKeyObject = (id: string, updates: Partial<KeyObject>) => {
        setSettings(s => ({...s, keyObjects: s.keyObjects.map(o => o.id === id ? { ...o, ...updates } : o)}));
    };
    const handleRemoveKeyObject = (id: string) => {
        setSettings(s => ({ ...s, keyObjects: s.keyObjects.filter(o => o.id !== id) }));
    };


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

            const results = await geminiService.generateCharacterImages(fullPrompt, selectedStyle, characterRefImage, settings.keyObjects, settings.numberOfImages);
            
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
    
    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="bg-card border-b md:border-b-0 md:border-r border-border md:w-[380px] flex-shrink-0 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">AI Character Generation</h2>
                        <p className="text-sm text-muted-foreground mt-1">Create stunning AI-generated characters</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
                     <div>
                        <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground"><Icon name="user-circle" className="w-4 h-4 text-muted-foreground" /> Character</Label>
                        <FileUpload 
                            onFileUpload={setCharacterRefImage} 
                            label="Upload character reference"
                            uploadedFileName={characterRefImage?.name}
                            onClear={() => setCharacterRefImage(null)}
                        />
                        <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)}
                            placeholder="e.g., A grizzled space pirate with a robotic eye and a leather jacket..."
                            className="w-full bg-input border border-border rounded-md p-2 text-sm min-h-[100px] resize-none mt-2"
                        />
                    </div>

                    <div>
                        <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground"><Icon name="image" className="w-4 h-4 text-muted-foreground" /> Scene</Label>
                        <textarea value={sceneDescription} onChange={(e) => setSceneDescription(e.target.value)}
                            placeholder="Describe the scene... e.g., 'standing on a rainy neon-lit street of a futuristic city'"
                            className="w-full bg-input border border-border rounded-md p-2 text-sm min-h-[100px] resize-none"
                        />
                    </div>
                    
                    <div>
                         <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground"><Icon name="sparkles" className="w-4 h-4 text-muted-foreground" /> Key Objects</Label>
                        <div className="space-y-2">
                             {settings.keyObjects.map(obj => (
                                <div key={obj.id} className="flex items-center gap-2">
                                    <input type="text" placeholder="Object name" value={obj.name} onChange={e => handleUpdateKeyObject(obj.id, { name: e.target.value })} className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm"/>
                                    <FileUpload onFileUpload={file => handleUpdateKeyObject(obj.id, { image: file })} label="Img" />
                                    <button onClick={() => handleRemoveKeyObject(obj.id)} className="p-1 text-muted-foreground hover:text-destructive"><Icon name="close" className="w-4 h-4"/></button>
                                </div>
                             ))}
                        </div>
                        <button onClick={handleAddKeyObject} className="text-xs font-semibold text-primary mt-2">+ Add Object</button>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Advanced Mode</p>
                        <div className="bg-card border border-border rounded-lg p-2 space-y-2">
                            <SelectControl icon="cube" label="AI Model" value={selectedModel} onChange={() => {}} children={<option>{selectedModel}</option>} />
                            <SelectControl icon="aspect-ratio" label="Aspect Ratio" value={settings.aspectRatio} onChange={e => setSettings(s => ({...s, aspectRatio: e.target.value as AspectRatio}))}>
                                {(['9:16', '1:1', '16:9', '4:3', '3:4'] as AspectRatio[]).map(r => <option key={r} value={r}>{r}</option>)}
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
                             <SelectControl icon="zoom-in" label="Zoom" value={settings.cameraZoom} onChange={e => setSettings(s => ({...s, cameraZoom: e.target.value}))}>
                                {CAMERA_ZOOMS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                             <SelectControl icon="scan-user" label="Shot Type" value={settings.shotType} onChange={e => setSettings(s => ({...s, shotType: e.target.value}))}>
                                {SHOT_TYPES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                            <SelectControl icon="palette" label="Color Tone" value={settings.colorTone} onChange={e => setSettings(s => ({...s, colorTone: e.target.value}))}>
                                {COLOR_TONES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                            <div className="p-2">
                                <Label>Negative Prompt</Label>
                                <input type="text" value={settings.negativePrompt} onChange={(e) => setSettings(s => ({...s, negativePrompt: e.target.value}))} placeholder={t('addNegativePrompt')} className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-sm"/>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="p-4 border-t mt-auto">
                    <button onClick={handleGenerate} disabled={isLoading || !characterDescription || !sceneDescription} className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><Icon name="sparkles" className="w-5 h-5" /> Generate Portrait</>}
                    </button>
                </div>
            </div>
            
            {/* Center Content */}
            <main className="flex-1 flex flex-col min-h-0 bg-background/95">
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6 relative">
                            <h3 className="font-bold">Generation Failed</h3>
                            <p className="text-sm">{error}</p>
                            <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1"><Icon name="close" className="w-4 h-4"/></button>
                        </div>
                    )}
                    {generatedItems.length > 0 ? (
                        <div className="columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
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
                            <p className="max-w-sm mt-2">Design your character and describe a scene in the left panel to bring them to life.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
