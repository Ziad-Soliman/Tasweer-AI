
import React, { useState } from 'react';
import { GenerationSettings, HistoryItem, BrandKit, SceneTemplate, StyleTemplate } from '../types';
import { ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS, STYLE_TEMPLATES, NEGATIVE_PROMPT_PRESETS, MOCKUP_TYPES } from '../constants';
import { FileUpload } from './FileUpload';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { Tabs } from './Tabs';
import { HistoryPanel } from './HistoryPanel';
import { BrandKitPanel } from './BrandKitPanel';

interface ControlPanelProps {
    onProductImageUpload: (file: File) => void;
    onClearProductImage: () => void;
    onStyleImageUpload: (file: File) => void;
    onClearStyleImage: () => void;
    
    settings: GenerationSettings;
    setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
    finalPrompt: string;

    sceneTemplates: SceneTemplate[];
    onGenerate: () => void;
    onEnhancePrompt: () => void;
    isLoading: boolean;
    isEnhancingPrompt: boolean;
    productImage: File | null;
    styleImage: File | null;
    
    history: HistoryItem[];
    onRevertToHistory: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
    
    brandKits: BrandKit[];
    setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
    activeBrandKitId: string | null;
    setActiveBrandKitId: React.Dispatch<React.SetStateAction<string | null>>;
    activeBrandKit: BrandKit | undefined;

    customStyleTemplates: StyleTemplate[];
    onSaveCustomStyle: (name: string) => void;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-card text-card-foreground border rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{ title: string; step?: number }> = ({ title, step }) => (
    <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
            {step && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground mr-2 text-xs font-bold">{step}</span>}
            {title}
        </h3>
    </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${className}`}>{children}</label>
);

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; disabled?: boolean }> = ({ value, onChange, options, disabled }) => (
    <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

const Input: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; disabled?: boolean; type?: string }> = (props) => (
    <input
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
);

const Textarea: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; disabled?: boolean }> = (props) => (
    <textarea
        {...props}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
);

const ToggleGroup: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
}> = ({ options, value, onValueChange, disabled }) => {
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onValueChange(option.value)}
                    disabled={disabled}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${value === option.value ? 'bg-background text-foreground shadow-sm' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

const Switch: React.FC<{ checked: boolean; onCheckedChange: (checked: boolean) => void; id: string }> = ({ checked, onCheckedChange, id }) => (
     <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={e => onCheckedChange(e.target.checked)} />
        <div className="w-9 h-5 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
);

const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between py-3 text-sm font-medium text-primary">
                {title}
                <Icon name={isOpen ? 'close' : 'sparkles'} className="w-4 h-4 transition-transform" style={{transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'}}/>
            </button>
            {isOpen && <div className="overflow-hidden transition-all animate-accordion-down">{children}</div>}
        </div>
    );
};


const WatermarkPanel: React.FC<{ settings: GenerationSettings; setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>; brandKit: BrandKit | undefined; }> = ({ settings, setSettings, brandKit }) => {
    const { watermark } = settings;
    const updateWatermark = (updates: Partial<GenerationSettings['watermark']>) => {
        setSettings(s => ({ ...s, watermark: { ...s.watermark, ...updates } }));
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Label>Watermark</Label>
                    <Tooltip text="Automatically add a text or logo watermark to your final image upon download.">
                        <Icon name="info" className="w-3.5 h-3.5 text-muted-foreground" />
                    </Tooltip>
                </div>
                <Switch checked={watermark.enabled} onCheckedChange={enabled => updateWatermark({ enabled })} id="enable-watermark" />
            </div>

            {watermark.enabled && (
                <div className="space-y-3 animate-fade-in">
                    <ToggleGroup
                        value={watermark.useLogo ? 'logo' : 'text'}
                        onValueChange={(val) => updateWatermark({ useLogo: val === 'logo' })}
                        options={[{value: 'text', label: 'Text'}, {value: 'logo', label: 'Logo'}]}
                        disabled={!brandKit?.logo}
                    />
                    {!watermark.useLogo && (
                         <Input value={watermark.text} onChange={e => updateWatermark({ text: e.target.value })}
                            placeholder="Your brand name" />
                    )}
                    <div>
                        <Label>Position</Label>
                         <Select value={watermark.position} onChange={e => updateWatermark({ position: e.target.value as GenerationSettings['watermark']['position']})} options={['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Scale ({watermark.scale}%)</Label>
                            <input type="range" min="1" max="25" value={watermark.scale} onChange={e => updateWatermark({ scale: Number(e.target.value)})} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"/>
                        </div>
                         <div>
                            <Label>Opacity ({watermark.opacity}%)</Label>
                            <input type="range" min="10" max="100" value={watermark.opacity} onChange={e => updateWatermark({ opacity: Number(e.target.value)})} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SceneTemplates: React.FC<{ templates: SceneTemplate[], onSelect: (template: SceneTemplate) => void, disabled: boolean }> = ({ templates, onSelect, disabled }) => {
    if (templates.length === 0) return null;
    
    return (
        <div>
            <Label>✨ AI Scene Templates</Label>
            <div className="grid grid-cols-2 gap-3">
                {templates.map((template, index) => (
                    <button 
                        key={index} 
                        onClick={() => onSelect(template)} 
                        disabled={disabled}
                        className="text-left bg-muted hover:bg-accent ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-3 rounded-lg disabled:opacity-50"
                    >
                        <p className="font-semibold text-xs text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1" title={template.prompt}>
                            {template.prompt.substring(0, 40) + (template.prompt.length > 40 ? '...' : '')}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

const StyleTemplates: React.FC<{
    selectedTemplateName: string | null;
    onSelect: (template: StyleTemplate) => void;
    onDeselect: () => void;
    disabled: boolean;
    customTemplates: StyleTemplate[];
}> = ({ selectedTemplateName, onSelect, onDeselect, disabled, customTemplates }) => {

    const renderTemplate = (template: StyleTemplate) => {
        const isSelected = selectedTemplateName === template.name;
        return (
            <button
                key={template.name}
                onClick={() => (isSelected ? onDeselect() : onSelect(template))}
                disabled={disabled}
                className={`relative text-left p-2.5 rounded-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden h-16
                    ${isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-inset ring-transparent hover:ring-primary/50'}`
                }
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-70 group-hover:opacity-90 transition-opacity`}></div>
                <div className="relative flex items-center gap-2">
                    <Icon name={template.icon} className={`w-5 h-5 ${template.name === 'Minimalist' || template.name === 'Vintage Film' ? 'text-gray-800' : 'text-white'}`} />
                    <p className={`font-semibold text-xs truncate ${template.name === 'Minimalist' || template.name === 'Vintage Film' ? 'text-gray-900' : 'text-white'}`}>
                        {template.name}
                    </p>
                </div>
            </button>
        )
    }

    return (
        <div>
            <Label>🎨 Style Presets</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_TEMPLATES.map(renderTemplate)}
            </div>

            {customTemplates.length > 0 && (
                <>
                    <Label className="mt-4">My Styles</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {customTemplates.map(renderTemplate)}
                    </div>
                </>
            )}
        </div>
    );
};

const GeneratorControls: React.FC<Omit<ControlPanelProps, 'history' | 'onRevertToHistory' | 'onToggleFavorite' | 'brandKits' | 'setBrandKits' | 'activeBrandKitId' | 'setActiveBrandKitId'>> = ({
    onProductImageUpload, onClearProductImage, onStyleImageUpload, onClearStyleImage,
    settings, setSettings, finalPrompt, sceneTemplates, onGenerate, isLoading,
    productImage, styleImage, activeBrandKit, onEnhancePrompt, isEnhancingPrompt,
    customStyleTemplates, onSaveCustomStyle
}) => {
    
    const isPromptEdited = settings.editedPrompt !== null;
    const [isSavingStyle, setIsSavingStyle] = useState(false);
    const [newStyleName, setNewStyleName] = useState('');

    const handleSaveStyle = () => {
        if (newStyleName.trim()) {
            onSaveCustomStyle(newStyleName.trim());
            setIsSavingStyle(false);
            setNewStyleName('');
        }
    };


    const handleSurpriseMe = () => {
        const randomLighting = LIGHTING_STYLES[Math.floor(Math.random() * LIGHTING_STYLES.length)];
        const randomPerspective = CAMERA_PERSPECTIVES[Math.floor(Math.random() * CAMERA_PERSPECTIVES.length)];
        setSettings(s => ({
            ...s,
            lightingStyle: randomLighting,
            cameraPerspective: randomPerspective,
            editedPrompt: null, // Allow prompt to be regenerated
        }));
    };

    const handleSelectTemplate = (template: SceneTemplate) => {
        setSettings(s => ({
            ...s,
            editedPrompt: template.prompt,
            lightingStyle: LIGHTING_STYLES.includes(template.lighting) ? template.lighting : s.lightingStyle,
            cameraPerspective: CAMERA_PERSPECTIVES.includes(template.perspective) ? template.perspective : s.cameraPerspective,
        }));
    };

    const handleSelectStyleTemplate = (template: StyleTemplate) => {
        setSettings(s => ({
            ...s,
            styleKeywords: template.keywords,
            selectedStyleTemplateName: template.name,
        }));
        // If a style image was present, clear it, as the template takes precedence.
        if (styleImage) {
            onClearStyleImage();
        }
    };

    const handleDeselectStyleTemplate = () => {
        setSettings(s => ({
            ...s,
            styleKeywords: '', // Clear keywords when deselecting
            selectedStyleTemplateName: null,
        }));
    };
    
    const handleAddNegativePreset = (preset: string) => {
        setSettings(s => {
            const current = s.negativePrompt.split(',').map(p => p.trim()).filter(Boolean);
            if (current.includes(preset)) {
                return s; // Already there
            }
            const newPrompt = [...current, preset].join(', ');
            return { ...s, negativePrompt: newPrompt };
        });
    };

    return (
        <div className="flex flex-col space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="flex flex-col">
                    <CardHeader title={(settings.generationMode === 'social' || settings.generationMode === 'design') ? "Upload Reference Design" : "Upload Product"} step={1}/>
                    <CardContent className="flex-1 flex items-center justify-center">
                        <FileUpload onFileUpload={onProductImageUpload} label={(settings.generationMode === 'social' || settings.generationMode === 'design') ? "Upload Reference Design" : "Upload Product Photo"} uploadedFileName={productImage?.name} onClear={productImage ? onClearProductImage : undefined} />
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader title="Style Reference" step={2}/>
                    <CardContent className="flex-1 flex flex-col items-center justify-center gap-2">
                         <FileUpload 
                            onFileUpload={onStyleImageUpload} 
                            label="Upload Style Photo" 
                            uploadedFileName={styleImage?.name} 
                            onClear={styleImage ? () => {
                                onClearStyleImage();
                                setSettings(s => ({...s, styleKeywords: ''}));
                            } : undefined}
                            disabled={!!settings.selectedStyleTemplateName || ['mockup', 'social', 'design'].includes(settings.generationMode)}
                            disabledReason={settings.selectedStyleTemplateName ? 'Style preset selected' : 'Not applicable for this mode'}
                        />
                        {isSavingStyle ? (
                             <div className="w-full flex items-center gap-2 animate-fade-in mt-2">
                                <Input value={newStyleName} onChange={e => setNewStyleName(e.target.value)} placeholder="Preset name..." />
                                <Tooltip text="Save">
                                    <button onClick={handleSaveStyle} className="p-2 h-10 w-10 shrink-0 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"><Icon name="check" className="w-4 h-4" /></button>
                                </Tooltip>
                                <Tooltip text="Cancel">
                                    <button onClick={() => setIsSavingStyle(false)} className="p-2 h-10 w-10 shrink-0 flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-accent"><Icon name="close" className="w-4 h-4" /></button>
                                </Tooltip>
                             </div>
                         ) : styleImage && settings.styleKeywords && (
                             <button onClick={() => setIsSavingStyle(true)} className="text-xs font-medium text-primary hover:opacity-80 disabled:opacity-50 flex items-center gap-1 animate-fade-in mt-1">
                                <Icon name="star" className="w-3 h-3" /> Save as Preset
                             </button>
                         )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader title="Customize Scene" step={3}/>
                <CardContent className="space-y-4">
                     <div>
                        <Label>Mode</Label>
                        <ToggleGroup
                            value={settings.generationMode}
                            onValueChange={(mode) => setSettings(s => ({ ...s, generationMode: mode as GenerationSettings['generationMode'], editedPrompt: null }))}
                            options={[{value: 'product', label: 'Product'}, {value: 'video', label: 'Video'}, {value: 'mockup', label: 'Mockup'}, {value: 'social', label: 'Social'}, {value: 'design', label: 'Design'}]}
                            disabled={isLoading}
                        />
                    </div>

                    {settings.generationMode === 'product' && (
                        <div className="animate-fade-in space-y-4">
                            <p className="text-center text-xs text-muted-foreground -mt-2">Upload a style photo OR select a preset below.</p>
                            <StyleTemplates
                                selectedTemplateName={settings.selectedStyleTemplateName}
                                onSelect={handleSelectStyleTemplate}
                                onDeselect={handleDeselectStyleTemplate}
                                disabled={isLoading || !!styleImage}
                                customTemplates={customStyleTemplates}
                            />
                            <div><Label>Lighting Style</Label><Select value={settings.lightingStyle} onChange={(e) => setSettings(s=>({...s, lightingStyle: e.target.value, editedPrompt: null}))} options={LIGHTING_STYLES} disabled={isLoading || isPromptEdited} /></div>
                            <div><Label>Camera Perspective</Label><Select value={settings.cameraPerspective} onChange={(e) => setSettings(s=>({...s, cameraPerspective: e.target.value, editedPrompt: null}))} options={CAMERA_PERSPECTIVES} disabled={isLoading || isPromptEdited} /></div>
                            <button onClick={handleSurpriseMe} disabled={isLoading} className="w-full text-sm text-primary hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
                                <Icon name="dice" className="w-4 h-4"/> Surprise Me!
                            </button>
                            <SceneTemplates templates={sceneTemplates} onSelect={handleSelectTemplate} disabled={isLoading} />
                        </div>
                    )}
                     
                    {settings.generationMode === 'video' && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                             <div><Label>Video Length</Label><Select value={settings.videoLength} onChange={(e) => setSettings(s => ({ ...s, videoLength: e.target.value as GenerationSettings['videoLength'], editedPrompt: null }))} options={VIDEO_LENGTHS} disabled={isLoading} /></div>
                             <div><Label>Camera Motion</Label><Select value={settings.cameraMotion} onChange={(e) => setSettings(s => ({ ...s, cameraMotion: e.target.value as GenerationSettings['cameraMotion'], editedPrompt: null }))} options={CAMERA_MOTIONS} disabled={isLoading} /></div>
                        </div>
                    )}

                    {settings.generationMode === 'mockup' && (
                         <div className="animate-fade-in">
                            <Label>Mockup Type</Label>
                            <Select value={settings.mockupType} onChange={(e) => setSettings(s => ({ ...s, mockupType: e.target.value, editedPrompt: null }))} options={MOCKUP_TYPES} disabled={isLoading} />
                         </div>
                    )}

                    {settings.generationMode === 'social' && (
                        <div className="animate-fade-in text-center p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                The AI will use the logo from your active brand kit to create a new post design.
                            </p>
                            {!activeBrandKit?.logo && (
                                <p className="text-sm text-destructive mt-2 font-semibold">
                                    Warning: No logo found in your active brand kit. Please add one in the 'Brand' tab.
                                </p>
                            )}
                        </div>
                    )}

                    {settings.generationMode === 'design' && (
                        <div className="animate-fade-in text-center p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                The AI will generate a creative alternative based on your reference design.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label>Aspect Ratio</Label>
                            <ToggleGroup
                                value={settings.aspectRatio}
                                onValueChange={(val) => setSettings(s => ({...s, aspectRatio: val as GenerationSettings['aspectRatio']}))}
                                options={ASPECT_RATIOS.map(ar => ({value: ar.value, label: ar.value}))}
                                disabled={isLoading}
                            />
                        </div>
                        {settings.generationMode === 'product' && (
                            <div>
                                <Label>Number of Images</Label>
                                <ToggleGroup
                                    value={String(settings.numberOfImages)}
                                    onValueChange={(val) => setSettings(s => ({...s, numberOfImages: Number(val) as 1 | 4}))}
                                    options={[{value: '1', label: '1'}, {value: '4', label: '4'}]}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Final Prompt" step={4} />
                 <CardContent>
                    <div className="relative">
                        <Textarea value={finalPrompt || 'Prompt will appear here...'} onChange={(e) => setSettings(s=>({...s, editedPrompt: e.target.value}))}
                            placeholder="Describe the image you want to create..." disabled={isLoading || !productImage} />
                        
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                             {isPromptEdited && (
                                <Tooltip text="Reset to auto-generated prompt">
                                    <button onClick={() => setSettings(s=>({...s, editedPrompt: null}))} className="p-1.5 rounded-md text-muted-foreground hover:bg-accent" aria-label="Reset prompt">
                                        <Icon name="restart" className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            )}
                             <Tooltip text="Enhance prompt with AI">
                                <button onClick={onEnhancePrompt} disabled={isEnhancingPrompt || !finalPrompt} className="p-1.5 rounded-md text-muted-foreground hover:bg-accent disabled:opacity-50" aria-label="Enhance prompt">
                                    <Icon name={isEnhancingPrompt ? 'spinner' : 'wand'} className={`w-4 h-4 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                 </CardContent>
                 <Accordion title="Advanced Options">
                    <div className="px-4 pb-4 space-y-4">
                        <div>
                            <div className="flex items-center space-x-1 mb-1.5">
                                <Label>Negative Prompt</Label>
                                <Tooltip text="Describe what you DON'T want in the image. Helps remove unwanted elements.">
                                    <Icon name="info" className="w-3.5 h-3.5 text-muted-foreground" />
                                </Tooltip>
                            </div>
                            <Input type="text" value={settings.negativePrompt} onChange={(e) => setSettings(s=>({...s, negativePrompt: e.target.value}))}
                                placeholder="e.g., text, watermarks, ugly" disabled={isLoading || !productImage} />
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {NEGATIVE_PROMPT_PRESETS.map(preset => (
                                    <button 
                                        key={preset} 
                                        onClick={() => handleAddNegativePreset(preset)} 
                                        className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        title={`Add "${preset}" to negative prompt`}
                                    >
                                        + {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-1 mb-1.5">
                                <Label>Seed</Label>
                                <Tooltip text="A number for reproducible images. Same seed + same prompt = similar result.">
                                    <Icon name="info" className="w-3.5 h-3.5 text-muted-foreground" />
                                </Tooltip>
                            </div>
                            <Input type="number" value={settings.seed} onChange={(e) => setSettings(s=>({...s, seed: e.target.value}))}
                                placeholder="Any number for reproducible results" disabled={isLoading || !productImage} />
                        </div>
                         <WatermarkPanel settings={settings} setSettings={setSettings} brandKit={activeBrandKit} />
                    </div>
                </Accordion>
            </Card>
        </div>
    );
};


export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { onGenerate, isLoading, productImage, settings, history } = props;
    const isVideoMode = settings.generationMode === 'video';
    const isMockupMode = settings.generationMode === 'mockup';
    const isSocialMode = settings.generationMode === 'social';
    const isDesignMode = settings.generationMode === 'design';

    return (
        <Card className="flex flex-col h-full">
            <Tabs tabs={['Generate', `History (${history.length})`, 'Brand']}>
                {(activeTab) => (
                    <div className="p-1 sm:p-4 flex-1 flex flex-col">
                        {activeTab === 'Generate' && <GeneratorControls {...props} />}
                        {activeTab === `History (${history.length})` && 
                            <HistoryPanel 
                                history={history}
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
                        
                         <div className="mt-auto pt-4">
                            <button
                                onClick={onGenerate}
                                disabled={isLoading || !productImage}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
                                title="Generate (Ctrl+G)"
                            >
                                {isLoading ? (
                                     <><Icon name="spinner" className="animate-spin mr-2" /> Generating...</>
                                ) : isVideoMode ? (
                                    <><Icon name="video" className="mr-2 w-5 h-5" /> Generate Video</>
                                ) : isMockupMode ? (
                                    <><Icon name="sparkles" className="mr-2"/> Generate Mockup</>
                                ) : isSocialMode ? (
                                    <><Icon name="sparkles" className="mr-2"/> Generate Post</>
                                ) : isDesignMode ? (
                                    <><Icon name="sparkles" className="mr-2"/> Generate Design</>
                                ) : (
                                    <><Icon name="sparkles" className="mr-2" /> Generate Product Image{settings.numberOfImages > 1 ? 's' : ''}</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Tabs>
        </Card>
    );
};
