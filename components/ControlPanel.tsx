
import React, { useState } from 'react';
import { GenerationSettings, BrandKit } from '../types';
import { ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_PERSPECTIVES, VIDEO_LENGTHS, CAMERA_MOTIONS, MOCKUP_TYPES, SOCIAL_MEDIA_TEMPLATES, NEGATIVE_PROMPT_PRESETS } from '../constants';
import { Icon } from './Icon';
import { FileUpload } from './FileUpload';
import { useTranslation } from '../App';

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

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`border-b border-border/80 ${className}`}>
        {children}
    </div>
);

const AccordionSection: React.FC<{ titleKey: keyof typeof import('../lib/translations').translations.en; children: React.ReactNode; defaultOpen?: boolean }> = ({ titleKey, children, defaultOpen = false }) => {
    const { t } = useTranslation();
    return (
        <details className="group" open={defaultOpen}>
            <summary className="font-semibold text-foreground px-4 py-3 cursor-pointer list-none flex items-center justify-between hover:bg-muted/50">
                <span>{t(titleKey)}</span>
                <Icon name="chevron-down" className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 pt-2 space-y-4 bg-muted/20">
                {children}
            </div>
        </details>
    );
};

const GenerationModeToggle: React.FC<Pick<ControlPanelProps, 'settings' | 'setSettings' | 'isLoading'>> = ({ settings, setSettings, isLoading }) => {
    const { t } = useTranslation();
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
                 <button
                    key={mode.value}
                    onClick={() => setSettings(s => ({ ...s, generationMode: mode.value as GenerationSettings['generationMode'], editedPrompt: null, selectedPresetId: null, prompt: '' }))}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex-1 flex items-center justify-center gap-2 ${settings.generationMode === mode.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Icon name={mode.icon} className="w-4 h-4" />
                    {t(mode.labelKey as any)}
                </button>
            ))}
        </div>
    );
};

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; disabled?: boolean; label: keyof typeof import('../lib/translations').translations.en }> = ({ value, onChange, options, disabled, label }) => {
    const { t } = useTranslation();
    return (
    <div>
        <Label>{t(label)}</Label>
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {options.map(opt => <option key={opt} value={opt}>{t(opt as any)}</option>)}
        </select>
    </div>
)};

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
        <div className="w-9 h-5 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
);

const Input: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; disabled?: boolean; type?: string }> = (props) => (
    <input
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
);

const NegativePromptInput: React.FC<{ value: string; onChange: (value: string) => void; disabled?: boolean; }> = ({ value, onChange, disabled }) => {
    const prompts = value ? value.split(',').map(p => p.trim()).filter(Boolean) : [];
    const [inputValue, setInputValue] = useState('');
    const { t } = useTranslation();

    const addPrompt = (prompt: string) => {
        const newPrompt = prompt.trim();
        if (newPrompt && !prompts.includes(newPrompt)) {
            onChange([...prompts, newPrompt].join(', '));
        }
    };

    const removePrompt = (promptToRemove: string) => {
        onChange(prompts.filter(p => p !== promptToRemove).join(', '));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addPrompt(inputValue);
            setInputValue('');
        }
    };

    return (
        <div>
            <div className="p-2 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                <div className="flex flex-wrap gap-1.5">
                    {prompts.map(p => (
                        <div key={p} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-sm">
                            <span>{p}</span>
                            <button onClick={() => removePrompt(p)} disabled={disabled} className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed" aria-label={`Remove ${p}`}>
                                <Icon name="close" className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('addNegativePrompt')}
                        className="flex-1 bg-transparent focus:outline-none text-sm min-w-[120px]"
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {NEGATIVE_PROMPT_PRESETS.filter(p => !prompts.includes(p)).map(p => (
                    <button 
                        key={p} 
                        onClick={() => addPrompt(p)} 
                        disabled={disabled} 
                        className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-accent hover:text-foreground transition-colors"
                    >
                        + {p}
                    </button>
                ))}
            </div>
        </div>
    );
};


const AdvancedSettingsPanel: React.FC<Pick<ControlPanelProps, 'settings' | 'setSettings' | 'isLoading' | 'activeBrandKit'>> = ({ settings, setSettings, isLoading, activeBrandKit }) => {
    const { watermark } = settings;
    const { t } = useTranslation();
    const updateWatermark = (updates: Partial<GenerationSettings['watermark']>) => {
        setSettings(s => ({ ...s, watermark: { ...s.watermark, ...updates } }));
    };
    
    return (
         <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground list-none flex items-center justify-between">
                <span>{t('advanced')}</span>
                <Icon name="chevron-down" className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-4">
                 <div>
                    <Label>{t('negativePrompt')}</Label>
                    <NegativePromptInput
                        value={settings.negativePrompt}
                        onChange={(value) => setSettings(s => ({...s, negativePrompt: value}))}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label>{t('seed')}</Label>
                    <Input type="number" value={settings.seed} onChange={(e) => setSettings(s=>({...s, seed: e.target.value}))}
                        placeholder={t('seedPlaceholder')} disabled={isLoading} />
                </div>
                 <div className="border-t border-border pt-4 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="mb-0">{t('enableWatermark')}</Label>
                        <Switch checked={watermark.enabled} onCheckedChange={enabled => updateWatermark({ enabled })} id="enable-watermark" />
                    </div>
                    {watermark.enabled && (
                        <div className="space-y-3 animate-fade-in">
                            <ToggleGroup value={watermark.useLogo ? 'logo' : 'text'} onValueChange={(val) => updateWatermark({ useLogo: val === 'logo' })} options={[{value: 'text', label: t('watermarkText')}, {value: 'logo', label: t('watermarkLogo')}]} disabled={!activeBrandKit?.logo} />
                            {!watermark.useLogo && ( <Input value={watermark.text} onChange={e => updateWatermark({ text: e.target.value })} placeholder={t('watermarkPlaceholder')} /> )}
                        </div>
                    )}
                </div>
            </div>
        </details>
    );
};


export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { settings, setSettings, isLoading, isGeneratingPrompt, promptGenerationMessage, onProductImageUpload, onClearProductImage, productImage } = props;
    const { t } = useTranslation();
    const isPromptEdited = settings.editedPrompt !== null;

    return (
         <div className="h-full flex flex-col bg-card border-r border-border">
            <div className="p-4 border-b border-border/80 flex items-center h-[65px]">
                <h2 className="text-lg font-semibold">{t('controls')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Section className="p-4">
                     <FileUpload 
                        onFileUpload={onProductImageUpload} 
                        label={t('uploadPhoto')}
                        uploadedFileName={productImage?.name} 
                        onClear={onClearProductImage}
                        disabled={isLoading || isGeneratingPrompt}
                        disabledReason={isGeneratingPrompt ? promptGenerationMessage : undefined}
                    />
                </Section>
                <Section className="p-4">
                    <GenerationModeToggle {...props} />
                </Section>
                 <AccordionSection titleKey="settings" defaultOpen>
                    {settings.generationMode === 'product' && (
                        <>
                            <Select label="lighting" value={settings.lightingStyle} onChange={(e) => setSettings(s=>({...s, lightingStyle: e.target.value, editedPrompt: null, prompt: ''}))} options={LIGHTING_STYLES} disabled={isLoading || isPromptEdited} />
                            <Select label="perspective" value={settings.cameraPerspective} onChange={(e) => setSettings(s=>({...s, cameraPerspective: e.target.value, editedPrompt: null, prompt: ''}))} options={CAMERA_PERSPECTIVES} disabled={isLoading || isPromptEdited} />
                        </>
                    )}
                    {settings.generationMode === 'video' && (
                        <>
                            <Select label="length" value={settings.videoLength} onChange={(e) => setSettings(s => ({ ...s, videoLength: e.target.value as GenerationSettings['videoLength'], editedPrompt: null, prompt: '' }))} options={VIDEO_LENGTHS} disabled={isLoading} />
                            <Select label="motion" value={settings.cameraMotion} onChange={(e) => setSettings(s => ({ ...s, cameraMotion: e.target.value as GenerationSettings['cameraMotion'], editedPrompt: null, prompt: '' }))} options={CAMERA_MOTIONS} disabled={isLoading} />
                        </>
                    )}
                    {settings.generationMode === 'mockup' && (
                        <Select label="mockupType" value={settings.mockupType} onChange={(e) => setSettings(s => ({ ...s, mockupType: e.target.value, editedPrompt: null, prompt: '' }))} options={MOCKUP_TYPES} disabled={isLoading} />
                    )}
                     {settings.generationMode === 'social' && (
                        <div className="space-y-2">
                            <Label>{t('socialMediaTemplate')}</Label>
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
                 </AccordionSection>
                 <AccordionSection titleKey="output">
                    <div>
                        <Label>{t('aspectRatio')}</Label>
                        <ToggleGroup value={settings.aspectRatio} onValueChange={(val) => setSettings(s => ({...s, aspectRatio: val as GenerationSettings['aspectRatio']}))} options={ASPECT_RATIOS.map(ar => ({value: ar.value, label: t(ar.labelKey as any)}))} disabled={isLoading || settings.generationMode === 'social'}/>
                    </div>
                    {settings.generationMode === 'product' && (
                        <div>
                            <Label>{t('numberOfImages')}</Label>
                            <ToggleGroup value={String(settings.numberOfImages)} onValueChange={(val) => setSettings(s => ({...s, numberOfImages: Number(val) as 1 | 4}))} options={[{value: '1', label: '1'}, {value: '4', label: '4'}]} disabled={isLoading} />
                        </div>
                    )}
                     <AdvancedSettingsPanel {...props} />
                </AccordionSection>
            </div>
        </div>
    );
};