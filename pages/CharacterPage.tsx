// This page now contains two modes:
// 1. CharacterGenerationUI: The classic UI for creating characters from scratch.
// 2. CharacterConsistencyUI: The new UI for generating consistent character images.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { HistoryItem, KeyObject, AspectRatio, GenerationSettings } from '../types';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../App';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';
import { SceneSuggestions } from '../components/SceneSuggestions';
import { NEGATIVE_PROMPT_PRESETS, CINEMATIC_LIGHTING_STYLES, CAMERA_PERSPECTIVE_OPTIONS } from '../constants';


const PROMPT_CATEGORIES = [
  {
    name: 'POPULAR POSES',
    prompts: [
      'subject facing fully forward, neutral stance, direct eye contact',
      'subject turned 3/4 to the left, body angled, face toward camera',
      'subject turned 3/4 to the right, body angled, face toward camera',
      'action pose, dynamic movement, blurred background',
      'relaxed sitting pose, casual posture',
      'contrapposto pose, natural weight shift',
    ],
  },
  {
    name: 'CAMERA ANGLES',
    prompts: [
      'camera at eye level, neutral perspective, balanced composition',
      'camera positioned above subject, looking down, dramatic perspective',
      'camera below subject looking up, powerful heroic angle',
      'dutch angle, tilted frame, sense of unease',
      'profile shot, side view of the subject',
    ],
  },
  {
    name: 'HEAD POSITIONS',
    prompts: [
      'head tilted 30° left, engaging asymmetrical pose',
      'head tilted 30° right, charming asymmetrical angle',
      'chin raised confidently, strong jawline emphasized',
      'looking over shoulder, mysterious glance',
      'head bowed slightly, contemplative mood',
    ],
  },
  {
    name: 'EXPRESSIONS',
    prompts: [
      'subtle Mona Lisa smile, mysterious and warm',
      'authentic Duchenne smile, eyes crinkling naturally',
      'asymmetrical confident smirk, one corner of mouth raised',
      'neutral, stoic expression, intense gaze',
      'joyful laughter, open mouth smile',
      'wistful, melancholic expression',
    ],
  },
];

interface CharacterPageProps {
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    restoredState: HistoryItem | null;
}

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <label className={`block text-sm font-medium text-muted-foreground mb-1.5 ${className}`}>{children}</label>
);

const SelectControl: React.FC<{ icon: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ icon, label, value, onChange, children }) => (
    <div className="flex items-center justify-between gap-4 py-2 px-1">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Icon name={icon} className="w-5 h-5" />
            <span>{label}</span>
        </div>
        <div className="relative">
            <select value={value} onChange={onChange} className="bg-input border border-border rounded-md pl-3 pr-8 py-1.5 text-sm w-40 truncate appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                {children}
            </select>
            <Icon name="chevron-down" className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
    </div>
);

const characterModes: {id: 'generation' | 'consistency', name: string, icon: string}[] = [
    {id: 'generation', name: 'Generation', icon: 'users'},
    {id: 'consistency', name: 'Consistency', icon: 'copy'},
];

const ActionButton: React.FC<{ icon: string; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
    <button className="bg-zinc-900 border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-colors group">
        <Icon name={icon} className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
        <h4 className="font-semibold text-foreground">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </button>
);


export const CharacterPage: React.FC<CharacterPageProps> = (props) => {
    const { addHistoryItem, restoredState } = props;
    const { t } = useTranslation();

    // --- STATE MANAGEMENT ---
    const [characterMode, setCharacterMode] = useState<'generation' | 'consistency'>('consistency');

    // --- SHARED STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- GENERATION MODE STATE ---
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('Fantasy Art');
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
    const [styleRefImageFile, setStyleRefImageFile] = useState<File | null>(null);
    const [keyObjects, setKeyObjects] = useState<KeyObject[]>([]);
    const [keyObjectPreviews, setKeyObjectPreviews] = useState<Record<string, string>>({});
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [numberOfImages, setNumberOfImages] = useState<GenerationSettings['numberOfImages']>(4);
    const [lightingStyle, setLightingStyle] = useState('none');
    const [cameraPerspective, setCameraPerspective] = useState('None');
    const [negativePrompt, setNegativePrompt] = useState(NEGATIVE_PROMPT_PRESETS.join(', '));
    const [sceneSuggestions, setSceneSuggestions] = useState<{name: string, prompt: string}[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const numImages: GenerationSettings['numberOfImages'][] = [1, 2, 3, 4];
    const artStyles = ['Fantasy Art', 'Sci-Fi', 'Cartoon', 'Anime', 'Cyberpunk', 'Steampunk', 'Photorealistic'];
    
    // --- CONSISTENCY MODE STATE ---
    const [consistencyCharacterImageFile, setConsistencyCharacterImageFile] = useState<File | null>(null);
    const [consistencyCharacterImagePreview, setConsistencyCharacterImagePreview] = useState<string | null>(null);
    const [consistencyDescription, setConsistencyDescription] = useState('');
    const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(true);
    const [consistencyPreviewImages, setConsistencyPreviewImages] = useState<string[]>([]);
    const [activeTemplateCategory, setActiveTemplateCategory] = useState(PROMPT_CATEGORIES[0].name);
    const [isEnhancingConsistencyPrompt, setIsEnhancingConsistencyPrompt] = useState(false);
    const [isConsistencyAdvancedExpanded, setIsConsistencyAdvancedExpanded] = useState(false);
    const [consistencySettings, setConsistencySettings] = useState({
        aspectRatio: '3:4' as AspectRatio,
        numberOfImages: 1 as GenerationSettings['numberOfImages'],
        lightingStyle: 'none',
        cameraPerspective: 'None',
        negativePrompt: 'text, watermark, blurry',
        keyObjects: [] as KeyObject[],
    });
    const [consistencyKeyObjectPreviews, setConsistencyKeyObjectPreviews] = useState<Record<string, string>>({});
    
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const consistencyTextareaRef = useRef<HTMLTextAreaElement>(null);

    // --- EFFECTS ---
     useEffect(() => {
        const textarea = descriptionTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [description]);
    
    useEffect(() => {
        const textarea = consistencyTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [consistencyDescription]);

    useEffect(() => {
        if (restoredState?.source.appName === 'Character Generation') {
            const { payload } = restoredState;
            setCharacterMode('generation');
            setDescription(payload.description || '');
            setStyle(payload.style || 'Fantasy Art');
            setGeneratedImages(payload.generatedImages || []);
        } else if (restoredState?.source.appName === 'Character Consistency') {
            const { payload } = restoredState;
            setCharacterMode('consistency');
            setConsistencyDescription(payload.consistencyDescription || '');
            setConsistencyPreviewImages(payload.previewImages || (payload.previewImage ? [payload.previewImage] : []));
            if (payload.consistencySettings) {
                setConsistencySettings(payload.consistencySettings);
            }
        }
    }, [restoredState]);

    useEffect(() => {
        if (consistencyCharacterImageFile) {
            const url = URL.createObjectURL(consistencyCharacterImageFile);
            setConsistencyCharacterImagePreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setConsistencyCharacterImagePreview(null);
    }, [consistencyCharacterImageFile]);

    useEffect(() => {
        const newPreviews: Record<string, string> = {};
        keyObjects.forEach(obj => { if (obj.image) { newPreviews[obj.id] = URL.createObjectURL(obj.image); } });
        setKeyObjectPreviews(newPreviews);
        return () => { Object.values(newPreviews).forEach(URL.revokeObjectURL); };
    }, [keyObjects]);
    
    useEffect(() => {
        const newPreviews: Record<string, string> = {};
        consistencySettings.keyObjects.forEach(obj => {
            if (obj.image) {
                newPreviews[obj.id] = URL.createObjectURL(obj.image);
            }
        });
        setConsistencyKeyObjectPreviews(newPreviews);
        return () => { Object.values(newPreviews).forEach(URL.revokeObjectURL); };
    }, [consistencySettings.keyObjects]);

    // --- HANDLERS ---
    const fetchSuggestions = useCallback(async () => {
        const suggestionBase = characterMode === 'generation' ? description : '';
        if (!suggestionBase) { setSceneSuggestions([]); return; }
        setIsLoadingSuggestions(true);
        try {
            const suggestions = await geminiService.generateSuggestions(suggestionBase, 'character');
            setSceneSuggestions(suggestions);
        } catch (error) { console.error(error); } finally { setIsLoadingSuggestions(false); }
    }, [description, characterMode]);
    
    const handleAddKeyObject = () => setKeyObjects(prev => [...prev, { id: nanoid(), name: '', image: null }]);
    const handleUpdateKeyObject = (id: string, updates: Partial<KeyObject>) => setKeyObjects(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    const handleRemoveKeyObject = (id: string) => setKeyObjects(prev => prev.filter(o => o.id !== id));

    const handleUpdateConsistencySettings = (updates: Partial<typeof consistencySettings>) => {
        setConsistencySettings(prev => ({ ...prev, ...updates }));
    };
    const handleAddConsistencyKeyObject = () => handleUpdateConsistencySettings({ keyObjects: [...consistencySettings.keyObjects, { id: nanoid(), name: '', image: null }] });
    const handleUpdateConsistencyKeyObject = (id: string, updates: Partial<KeyObject>) => handleUpdateConsistencySettings({ keyObjects: consistencySettings.keyObjects.map(o => o.id === id ? { ...o, ...updates } : o) });
    const handleRemoveConsistencyKeyObject = (id: string) => handleUpdateConsistencySettings({ keyObjects: consistencySettings.keyObjects.filter(o => o.id !== id) });


    const handleTemplateClick = (templatePrompt: string) => {
        setConsistencyDescription(prev => {
            const parts = prev.split(',').map(p => p.trim()).filter(Boolean);
            if (parts.includes(templatePrompt)) {
                return parts.filter(p => p !== templatePrompt).join(', ');
            } else {
                return [...parts, templatePrompt].join(', ');
            }
        });
    };

    const handleReset = () => {
        setIsLoading(false);
        setError(null);
        // Reset generation state
        setDescription('');
        setStyle('Fantasy Art');
        setReferenceImageFile(null);
        setStyleRefImageFile(null);
        setKeyObjects([]);
        setGeneratedImages([]);
        setAspectRatio('9:16');
        setNumberOfImages(4);
        setLightingStyle('none');
        setCameraPerspective('None');
        setNegativePrompt(NEGATIVE_PROMPT_PRESETS.join(', '));
        setSceneSuggestions([]);
        // Reset consistency state
        setConsistencyCharacterImageFile(null);
        setConsistencyDescription('');
        setConsistencyPreviewImages([]);
        setConsistencySettings({
            aspectRatio: '3:4',
            numberOfImages: 1,
            lightingStyle: 'none',
            cameraPerspective: 'None',
            negativePrompt: 'text, watermark, blurry',
            keyObjects: [],
        });
    };

    const handleGenerateForGeneration = async () => {
        if (!description) return;
        setIsLoading(true); setError(null); setGeneratedImages([]);
        try {
            const images = await geminiService.generateCharacterImages({
                description, style, referenceImageFile, styleRefImageFile, keyObjects,
                count: numberOfImages, aspectRatio,
                lightingStyle: CINEMATIC_LIGHTING_STYLES.find(s => s.id === lightingStyle)?.name || '',
                cameraPerspective: CAMERA_PERSPECTIVE_OPTIONS.find(s => s.id === cameraPerspective)?.id || '',
                negativePrompt,
            });
            const imageUrls = images.map(base64 => `data:image/png;base64,${base64}`);
            setGeneratedImages(imageUrls);
            
            addHistoryItem({
                source: { page: 'character', appName: 'Character Generation' },
                thumbnail: { type: 'image', value: imageUrls[0] },
                title: `${style} of ${description}`,
                payload: { description, style, generatedImages: imageUrls }
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate concepts.");
        } finally { setIsLoading(false); }
    };
    
     const handleGenerateForConsistency = async () => {
        const finalPrompt = consistencyDescription;
        if (!finalPrompt || !consistencyCharacterImageFile) return;
        setIsLoading(true);
        setError(null);
        setConsistencyPreviewImages([]);
        try {
            const images = await geminiService.generateCharacterImages({
                description: finalPrompt,
                style: 'Photorealistic',
                referenceImageFile: consistencyCharacterImageFile,
                styleRefImageFile: null,
                keyObjects: consistencySettings.keyObjects,
                count: consistencySettings.numberOfImages,
                aspectRatio: consistencySettings.aspectRatio,
                lightingStyle: CINEMATIC_LIGHTING_STYLES.find(s => s.id === consistencySettings.lightingStyle)?.name || '',
                cameraPerspective: CAMERA_PERSPECTIVE_OPTIONS.find(s => s.id === consistencySettings.cameraPerspective)?.id || '',
                negativePrompt: consistencySettings.negativePrompt,
            });
            const imageUrls = images.map(base64 => `data:image/png;base64,${base64}`);
            setConsistencyPreviewImages(imageUrls);

            addHistoryItem({
                source: { page: 'character', appName: 'Character Consistency' },
                thumbnail: { type: 'image', value: imageUrls[0] },
                title: `Consistent character: ${finalPrompt.substring(0, 50)}...`,
                payload: { consistencyDescription: finalPrompt, previewImages: imageUrls, consistencySettings: { ...consistencySettings } }
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate consistent character images.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEnhancePrompt = async () => {
        if (!description) return;
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const enhancedPrompt = await geminiService.enhancePrompt(description);
            setDescription(enhancedPrompt);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enhance prompt.");
        } finally {
            setIsEnhancingPrompt(false);
        }
    };
    
    const handleEnhanceConsistencyPrompt = async () => {
        if (!consistencyDescription) return;
        setIsEnhancingConsistencyPrompt(true);
        setError(null);
        try {
            const enhancedPrompt = await geminiService.enhancePrompt(consistencyDescription);
            setConsistencyDescription(enhancedPrompt);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enhance prompt.");
        } finally {
            setIsEnhancingConsistencyPrompt(false);
        }
    };

    const renderGenerationUI = () => (
        <div className="flex flex-1 flex-col md:flex-row min-h-0">
             <aside className="w-full md:w-96 bg-card border-b md:border-r md:border-b-0 border-border flex-shrink-0 flex flex-col">
                <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                    <div className="p-1 bg-muted rounded-lg grid grid-cols-2 items-center shadow-inner">
                        {characterModes.map(mode => (
                            <button key={mode.id} onClick={() => setCharacterMode(mode.id)} className={`justify-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${characterMode === mode.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                                <Icon name={mode.icon} className="w-4 h-4" />
                                {mode.name}
                            </button>
                        ))}
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <Label className="mb-0">{t('characterDescription')}</Label>
                             <Tooltip text="Enhance prompt with AI">
                                <button onClick={handleEnhancePrompt} disabled={isEnhancingPrompt || !description} className="p-1 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50">
                                    <Icon name="wand" className={`w-4 h-4 ${isEnhancingPrompt ? 'animate-pulse' : ''}`} />
                                </button>
                            </Tooltip>
                        </div>
                        <textarea ref={descriptionTextareaRef} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('characterDescriptionPlaceholder')} className="w-full bg-input border-border rounded-md p-2 text-sm h-28 resize-none" />
                    </div>
                    <FileUpload onFileUpload={setReferenceImageFile} label="Upload Character Reference" uploadedFileName={referenceImageFile?.name} onClear={() => setReferenceImageFile(null)} />
                    <div>
                        <Label>{t('characterStyle')}</Label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-10 bg-input border-border rounded-md px-2 text-sm">{artStyles.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Scene Suggestions</Label>
                            <button onClick={fetchSuggestions} disabled={isLoadingSuggestions || !description} className="text-xs font-semibold text-primary disabled:opacity-50">Get Ideas</button>
                        </div>
                        <SceneSuggestions templates={sceneSuggestions} onSelect={(s) => setDescription(d => `${d}, ${s.prompt}`)} isLoading={isLoadingSuggestions} />
                    </div>
                    <FileUpload onFileUpload={setStyleRefImageFile} label="Upload Style Reference" uploadedFileName={styleRefImageFile?.name} onClear={() => setStyleRefImageFile(null)} />
                    <div className="space-y-2 pt-2">
                        <h3 className="font-semibold text-md text-foreground mb-1">Advanced Controls</h3>
                        <div className="bg-muted/40 rounded-lg divide-y divide-border">
                            <SelectControl icon="aspect-ratio" label="Aspect Ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)}>
                                {(['9:16', '1:1', '16:9', '4:5', '4:3', '3:4'] as AspectRatio[]).map(r => <option key={r} value={r}>{r}</option>)}
                            </SelectControl>
                            <SelectControl icon="image" label={t('numberOfImages')} value={String(numberOfImages)} onChange={e => setNumberOfImages(parseInt(e.target.value, 10) as GenerationSettings['numberOfImages'])}>
                                {numImages.map(num => <option key={num} value={num}>{num}</option>)}
                            </SelectControl>
                            <SelectControl icon="sun" label="Lighting" value={lightingStyle} onChange={e => setLightingStyle(e.target.value)}>
                                {CINEMATIC_LIGHTING_STYLES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                            <SelectControl icon="camera" label="Perspective" value={cameraPerspective} onChange={e => setCameraPerspective(e.target.value)}>
                                {CAMERA_PERSPECTIVE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </SelectControl>
                        </div>
                    </div>
                    <div>
                        <Label>Negative Prompt</Label>
                        <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder={t('addNegativePrompt')} className="w-full bg-input border-border rounded-md p-2 text-sm h-20 resize-none" />
                    </div>
                    <div>
                        <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground">Key Objects</Label>
                        <div className="space-y-3">
                            {keyObjects.map(obj => (
                                <div key={obj.id} className="bg-input/50 p-2 rounded-md space-y-2">
                                    <div className="flex items-center gap-2"><input type="text" placeholder="Object name" value={obj.name} onChange={e => handleUpdateKeyObject(obj.id, { name: e.target.value })} className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-sm"/><button onClick={() => handleRemoveKeyObject(obj.id)} className="p-1 text-muted-foreground hover:text-destructive"><Icon name="close" className="w-4 h-4"/></button></div>
                                    <div className="flex gap-2 items-center">
                                        {keyObjectPreviews[obj.id] && <img src={keyObjectPreviews[obj.id]} alt={obj.name} className="w-12 h-12 object-contain rounded-md border bg-muted flex-shrink-0" />}
                                        <div className="flex-1"><FileUpload onFileUpload={file => handleUpdateKeyObject(obj.id, { image: file })} label="Object Image" uploadedFileName={obj.image?.name} onClear={() => handleUpdateKeyObject(obj.id, { image: null })} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddKeyObject} className="text-xs font-semibold text-primary mt-2">+ Add Object</button>
                    </div>
                </div>
                <div className="p-4 border-t border-border mt-auto">
                    <button onClick={handleGenerateForGeneration} disabled={isLoading || !description} className="w-full h-12 bg-primary text-primary-foreground text-lg rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {isLoading ? <Icon name="spinner" className="w-6 h-6 animate-spin" /> : 'Generate'}
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-4 md:p-6 bg-background overflow-y-auto">
                 {isLoading ? (
                    <div className="h-full flex items-center justify-center"> <Icon name="spinner" className="w-12 h-12 text-primary animate-spin" /> </div>
                 ) : error ? (
                    <div className="h-full flex items-center justify-center text-destructive">{error}</div>
                 ) : generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {generatedImages.map((src, i) => <img key={i} src={src} alt={`Generated character ${i + 1}`} className="w-full h-auto object-cover rounded-lg bg-muted" />)} </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8"><Icon name="users" className="w-20 h-20 text-primary/20 mb-4" /><h2 className="text-2xl font-bold text-foreground">Bring Your Characters to Life</h2><p className="max-w-md mt-2">Use the controls on the left to describe your character, set the style, and generate stunning concept art.</p></div>
                )}
            </main>
        </div>
    );
    
    const renderConsistencyUI = () => {
        const allTemplates = PROMPT_CATEGORIES.flatMap(c => c.prompts);
        const selectedCount = consistencyDescription.split(',').map(p => p.trim()).filter(p => allTemplates.includes(p)).length;

        return (
            <div className="flex flex-1 flex-col md:flex-row min-h-0">
                {/* Left Sidebar */}
                <aside className="w-full md:w-96 bg-card border-b md:border-r md:border-b-0 border-border flex-shrink-0 flex flex-col">
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                        <div className="p-1 bg-muted rounded-lg grid grid-cols-2 items-center shadow-inner">
                            {characterModes.map(mode => (
                                <button key={mode.id} onClick={() => setCharacterMode(mode.id)} className={`justify-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${characterMode === mode.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                                    <Icon name={mode.icon} className="w-4 h-4" />
                                    {mode.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Character Consistency</h2>
                            <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><Icon name="restart" className="w-4 h-4" /> Reset</button>
                        </div>
                        <p className="text-sm text-muted-foreground">Upload a clear portrait of your character to generate consistent images.</p>
                         <FileUpload onFileUpload={setConsistencyCharacterImageFile} label="Upload Character Image" uploadedFileName={consistencyCharacterImageFile?.name} onClear={() => setConsistencyCharacterImageFile(null)} />
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <Label className="mb-0">Description</Label>
                                <Tooltip text="Enhance prompt with AI">
                                    <button onClick={handleEnhanceConsistencyPrompt} disabled={isEnhancingConsistencyPrompt || !consistencyDescription} className="p-1 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50">
                                        <Icon name="wand" className={`w-4 h-4 ${isEnhancingConsistencyPrompt ? 'animate-pulse' : ''}`} />
                                    </button>
                                </Tooltip>
                            </div>
                            <textarea
                                ref={consistencyTextareaRef}
                                value={consistencyDescription}
                                onChange={(e) => setConsistencyDescription(e.target.value)}
                                placeholder="e.g., smiling, in a futuristic city"
                                className="w-full bg-input border-border rounded-md p-2 text-sm h-24 resize-none"
                            />
                        </div>
                        
                        <div className="space-y-2 pt-2">
                            <button onClick={() => setIsConsistencyAdvancedExpanded(!isConsistencyAdvancedExpanded)} className="flex justify-between items-center w-full py-2">
                                <h3 className="font-semibold text-md text-foreground">Advanced Controls</h3>
                                <Icon name={isConsistencyAdvancedExpanded ? 'chevron-up' : 'chevron-down'} className="w-5 h-5 text-muted-foreground" />
                            </button>
                            {isConsistencyAdvancedExpanded && (
                                <div className="bg-muted/40 rounded-lg divide-y divide-border animate-fade-in">
                                    <SelectControl icon="aspect-ratio" label="Aspect Ratio" value={consistencySettings.aspectRatio} onChange={e => handleUpdateConsistencySettings({ aspectRatio: e.target.value as AspectRatio })}>
                                        {(['3:4', '1:1', '16:9', '9:16', '4:5', '4:3'] as AspectRatio[]).map(r => <option key={r} value={r}>{r}</option>)}
                                    </SelectControl>
                                    <SelectControl icon="image" label={t('numberOfImages')} value={String(consistencySettings.numberOfImages)} onChange={e => handleUpdateConsistencySettings({ numberOfImages: parseInt(e.target.value, 10) as GenerationSettings['numberOfImages'] })}>
                                        {numImages.map(num => <option key={num} value={num}>{num}</option>)}
                                    </SelectControl>
                                    <SelectControl icon="sun" label="Lighting" value={consistencySettings.lightingStyle} onChange={e => handleUpdateConsistencySettings({ lightingStyle: e.target.value })}>
                                        {CINEMATIC_LIGHTING_STYLES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </SelectControl>
                                    <SelectControl icon="camera" label="Perspective" value={consistencySettings.cameraPerspective} onChange={e => handleUpdateConsistencySettings({ cameraPerspective: e.target.value })}>
                                        {CAMERA_PERSPECTIVE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </SelectControl>
                                    <div className="p-2">
                                        <Label>Negative Prompt</Label>
                                        <textarea value={consistencySettings.negativePrompt} onChange={e => handleUpdateConsistencySettings({ negativePrompt: e.target.value })} placeholder={t('addNegativePrompt')} className="w-full bg-input border-border rounded-md p-2 text-sm h-20 resize-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="flex items-center gap-2 mb-2 font-semibold text-foreground">Additional Characters / Objects</Label>
                            <div className="space-y-3">
                                {consistencySettings.keyObjects.map(obj => (
                                    <div key={obj.id} className="bg-input/50 p-2 rounded-md space-y-2">
                                        <div className="flex items-center gap-2"><input type="text" placeholder="Object name" value={obj.name} onChange={e => handleUpdateConsistencyKeyObject(obj.id, { name: e.target.value })} className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-sm"/><button onClick={() => handleRemoveConsistencyKeyObject(obj.id)} className="p-1 text-muted-foreground hover:text-destructive"><Icon name="close" className="w-4 h-4"/></button></div>
                                        <div className="flex gap-2 items-center">
                                            {consistencyKeyObjectPreviews[obj.id] && <img src={consistencyKeyObjectPreviews[obj.id]} alt={obj.name} className="w-12 h-12 object-contain rounded-md border bg-muted flex-shrink-0" />}
                                            <div className="flex-1"><FileUpload onFileUpload={file => handleUpdateConsistencyKeyObject(obj.id, { image: file })} label="Object Image" uploadedFileName={obj.image?.name} onClear={() => handleUpdateConsistencyKeyObject(obj.id, { image: null })} /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddConsistencyKeyObject} className="text-xs font-semibold text-primary mt-2">+ Add Character / Object</button>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border mt-auto space-y-3">
                         <button onClick={handleGenerateForConsistency} disabled={isLoading || !consistencyCharacterImageFile || !consistencyDescription} className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                            {isLoading ? <Icon name="spinner" className="w-6 h-6 animate-spin" /> : 'Generate'}
                        </button>
                    </div>
                </aside>
                {/* Right Content Area */}
                <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                     <h2 className="text-xl font-semibold">Output Preview</h2>
                     <div className="relative flex-1 bg-zinc-900 border border-border rounded-lg flex items-center justify-center min-h-[300px] p-4">
                        {isLoading ? <Icon name="spinner" className="w-10 h-10 animate-spin text-primary" />
                            : error ? <p className="text-destructive p-4 text-center">{error}</p>
                            : consistencyPreviewImages.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full overflow-y-auto">
                                    {consistencyPreviewImages.map((src, i) => (
                                        <img key={i} src={src} alt={`Consistent character ${i + 1}`} className="w-full h-auto object-contain rounded-md self-start" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                                    <Icon name="image" className="w-10 h-10" />
                                    <p>Your generated image will appear here</p>
                                </div>
                            )
                        }
                     </div>

                     <div className="grid grid-cols-4 gap-4">
                         <ActionButton icon="expand" title="Upscale Image" subtitle="General Upscaling" />
                         <ActionButton icon="users" title="Upscale Portrait" subtitle="Optimized for Faces" />
                         <ActionButton icon="sparkles" title="Fix Skin" />
                         <ActionButton icon="move" title="Animate" />
                     </div>

                    <div className="w-full bg-zinc-900 rounded-lg border border-border">
                        <div className="flex justify-between items-center cursor-pointer p-3 border-b border-border" onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)}>
                            <h3 className="font-semibold text-foreground flex items-center gap-3">
                                <div className="w-5 h-5 bg-green-900/50 border border-green-500 rounded-sm flex items-center justify-center">
                                    <Icon name="check" className="w-3.5 h-3.5 text-green-400"/>
                                </div>
                                Prompt Templates
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs bg-green-900 border border-green-600 text-green-400 font-bold px-2 py-0.5 rounded-full">{selectedCount} selected</span>
                                <Icon name={isTemplatesExpanded ? 'chevron-up' : 'chevron-down'} className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                        {isTemplatesExpanded && (
                            <div className="animate-fade-in">
                                <div className="flex items-center border-b border-border px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                    {PROMPT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.name}
                                            onClick={() => setActiveTemplateCategory(cat.name)}
                                            className={`shrink-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTemplateCategory === cat.name ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 space-y-2">
                                    {PROMPT_CATEGORIES.find(cat => cat.name === activeTemplateCategory)?.prompts.map(p => {
                                        const isSelected = consistencyDescription.split(',').map(part => part.trim()).includes(p);
                                        return (
                                        <button key={p} onClick={() => handleTemplateClick(p)} className={`w-full text-left text-xs p-2.5 rounded-md flex justify-between items-center transition-colors duration-200 ${isSelected ? 'bg-green-900/50' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                                            <span className={`pe-2 transition-colors ${isSelected ? 'text-green-300' : 'text-foreground/80'}`}>{p}</span>
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center transition-colors ${isSelected ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                                <Icon name={isSelected ? 'check' : 'plus'} className={`w-3.5 h-3.5 transition-all ${isSelected ? 'text-black scale-110' : 'text-muted-foreground'}`} />
                                            </div>
                                        </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {characterMode === 'generation' ? renderGenerationUI() : renderConsistencyUI()}
        </div>
    );
};
