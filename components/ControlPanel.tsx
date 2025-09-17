import React from 'react';
import { GenerationSettings, BrandKit } from '../types';
import { ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS, MOCKUP_TYPES, SOCIAL_MEDIA_TEMPLATES } from '../constants';
import { Icon } from './Icon';
import { FileUpload } from './FileUpload';

interface ControlPanelProps {
    onProductImageUpload: (file: File) => void;
    onClearProductImage: () => void;
    
    settings: GenerationSettings;
    setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;

    isLoading: boolean;
    isGeneratingPrompt: boolean;
    promptGenerationMessage: string;
    productImage: File | null;
    
    activeBrandKit: BrandKit | undefined;
}

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <label className={`block text-sm font-medium text-foreground mb-1.5 ${className}`}>{children}</label>
);

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => (
    <details className="border-b border-border/80 group" open={defaultOpen}>
        <summary className="font-semibold text-foreground cursor-pointer list-none flex justify-between items-center p-4">
            <span>{title}</span>
            <Icon name="chevron-down" className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-4 pt-0 space-y-4">
            {children}
        </div>
    </details>
);

const GenerationModeToggle: React.FC<Pick<ControlPanelProps, 'settings' | 'setSettings' | 'isLoading'>> = ({ settings, setSettings, isLoading }) => {
    const modes = [
        { value: 'product', label: 'Product' },
        { value: 'video', label: 'Video' },
        { value: 'mockup', label: 'Mockup' },
        { value: 'social', label: 'Social' },
        { value: 'design', label: 'Design' }
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
            {modes.map(mode => (
                 <button
                    key={mode.value}
                    onClick={() => setSettings(s => ({ ...s, generationMode: mode.value as GenerationSettings['generationMode'], editedPrompt: null }))}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex-1 ${settings.generationMode === mode.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {mode.label}
                </button>
            ))}
        </div>
    );
};

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; disabled?: boolean; label: string }> = ({ value, onChange, options, disabled, label }) => (
    <div>
        <Label>{label}</Label>
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ToggleGroup: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
}> = ({ options, value, onValueChange, disabled }) => {
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onValueChange(option.value)}
                    disabled={disabled}
                    className={`w-full inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${value === option.value ? 'bg-background text-foreground shadow-sm' : ''}`}
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

const Input: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; disabled?: boolean; type?: string }> = (props) => (
    <input
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
);

const AdvancedSettingsPanel: React.FC<Pick<ControlPanelProps, 'settings' | 'setSettings' | 'isLoading' | 'activeBrandKit'>> = ({ settings, setSettings, isLoading, activeBrandKit }) => {
    const { watermark } = settings;
    const updateWatermark = (updates: Partial<GenerationSettings['watermark']>) => {
        setSettings(s => ({ ...s, watermark: { ...s.watermark, ...updates } }));
    };
    
    return (
        <div className="space-y-4">
            <div>
                <Label>Seed</Label>
                <Input type="number" value={settings.seed} onChange={(e) => setSettings(s=>({...s, seed: e.target.value}))}
                    placeholder="Any number for reproducible results" disabled={isLoading} />
            </div>
             <div className="border-t pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="mb-0">Enable Watermark</Label>
                    <Switch checked={watermark.enabled} onCheckedChange={enabled => updateWatermark({ enabled })} id="enable-watermark" />
                </div>
                {watermark.enabled && (
                    <div className="space-y-3 animate-fade-in">
                        <ToggleGroup value={watermark.useLogo ? 'logo' : 'text'} onValueChange={(val) => updateWatermark({ useLogo: val === 'logo' })} options={[{value: 'text', label: 'Text'}, {value: 'logo', label: 'Logo'}]} disabled={!activeBrandKit?.logo} />
                        {!watermark.useLogo && ( <Input value={watermark.text} onChange={e => updateWatermark({ text: e.target.value })} placeholder="Your brand name" /> )}
                    </div>
                )}
            </div>
        </div>
    );
};


export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { settings, setSettings, isLoading, onProductImageUpload, onClearProductImage, productImage } = props;
    const isPromptEdited = settings.editedPrompt !== null;

    return (
         <div className="h-full flex flex-col bg-card">
            <div className="p-4 border-b border-border/80 flex items-center h-[65px]">
                <h2 className="text-lg font-semibold">Controls</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Section title="Upload" defaultOpen={true}>
                    <FileUpload 
                        onFileUpload={onProductImageUpload} 
                        label="Upload Photo" 
                        uploadedFileName={productImage?.name} 
                        onClear={onClearProductImage}
                    />
                </Section>
                <Section title="Generation Mode" defaultOpen={true}>
                    <GenerationModeToggle {...props} />
                </Section>
                 <Section title="Settings" defaultOpen={true}>
                    {settings.generationMode === 'product' && (
                        <>
                            <Select label="Lighting" value={settings.lightingStyle} onChange={(e) => setSettings(s=>({...s, lightingStyle: e.target.value, editedPrompt: null}))} options={LIGHTING_STYLES} disabled={isLoading || isPromptEdited} />
                            <Select label="Perspective" value={settings.cameraPerspective} onChange={(e) => setSettings(s=>({...s, cameraPerspective: e.target.value, editedPrompt: null}))} options={CAMERA_PERSPECTIVES} disabled={isLoading || isPromptEdited} />
                        </>
                    )}
                    {settings.generationMode === 'video' && (
                        <>
                            <Select label="Length" value={settings.videoLength} onChange={(e) => setSettings(s => ({ ...s, videoLength: e.target.value as GenerationSettings['videoLength'], editedPrompt: null }))} options={VIDEO_LENGTHS} disabled={isLoading} />
                            <Select label="Motion" value={settings.cameraMotion} onChange={(e) => setSettings(s => ({ ...s, cameraMotion: e.target.value as GenerationSettings['cameraMotion'], editedPrompt: null }))} options={CAMERA_MOTIONS} disabled={isLoading} />
                        </>
                    )}
                    {settings.generationMode === 'mockup' && (
                        <Select label="Mockup Type" value={settings.mockupType} onChange={(e) => setSettings(s => ({ ...s, mockupType: e.target.value, editedPrompt: null }))} options={MOCKUP_TYPES} disabled={isLoading} />
                    )}
                     {settings.generationMode === 'social' && (
                        <div className="space-y-2">
                            <Label>Social Media Template</Label>
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
                                            }));
                                        }}
                                        className={`p-3 rounded-lg border-2 text-left transition-colors flex flex-col justify-between h-24 ${
                                            settings.selectedSocialTemplateId === template.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50 hover:bg-accent'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{template.name}</p>
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
                            Use the prompt bar at the bottom to guide the AI for this mode.
                        </div>
                    )}
                 </Section>
                 <Section title="Output">
                    <div>
                        <Label>Aspect Ratio</Label>
                        <ToggleGroup value={settings.aspectRatio} onValueChange={(val) => setSettings(s => ({...s, aspectRatio: val as GenerationSettings['aspectRatio']}))} options={ASPECT_RATIOS.map(ar => ({value: ar.value, label: ar.label}))} disabled={isLoading || settings.generationMode === 'social'}/>
                    </div>
                    {settings.generationMode === 'product' && (
                        <div>
                            <Label>Number of Images</Label>
                            <ToggleGroup value={String(settings.numberOfImages)} onValueChange={(val) => setSettings(s => ({...s, numberOfImages: Number(val) as 1 | 4}))} options={[{value: '1', label: '1'}, {value: '4', label: '4'}]} disabled={isLoading} />
                        </div>
                    )}
                </Section>
                <Section title="Advanced" defaultOpen={false}>
                    <AdvancedSettingsPanel {...props} />
                </Section>
            </div>
        </div>
    );
};