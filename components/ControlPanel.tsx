import React, { useState } from 'react';
import { GenerationSettings, HistoryItem, BrandKit } from '../types';
import { ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_PERSPECTIVES } from '../constants';
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

    styleSuggestions: string[];
    onGenerate: () => void;
    isLoading: boolean;
    productImage: File | null;
    styleImage: File | null;
    
    history: HistoryItem[];
    onRevertToHistory: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
    
    brandKit: BrandKit;
    setBrandKit: React.Dispatch<React.SetStateAction<BrandKit>>;
}

const Section: React.FC<{ title: string; children: React.ReactNode; step?: number; }> = ({ title, children, step }) => (
    <div className="bg-gray-500/10 dark:bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center">
            {step && <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white mr-2 text-xs">{step}</span>}
            {title}
        </h3>
        {children}
    </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; disabled?: boolean }> = ({ label, value, onChange, options, disabled }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const WatermarkPanel: React.FC<{ settings: GenerationSettings; setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>; brandKit: BrandKit; }> = ({ settings, setSettings, brandKit }) => {
    const { watermark } = settings;
    const updateWatermark = (updates: Partial<GenerationSettings['watermark']>) => {
        setSettings(s => ({ ...s, watermark: { ...s.watermark, ...updates } }));
    };

    return (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700 mt-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Watermark</label>
                    <Tooltip text="Automatically add a text or logo watermark to your final image upon download.">
                        <Icon name="info" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    </Tooltip>
                </div>
                 <label htmlFor="enable-watermark" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="enable-watermark" className="sr-only peer" checked={watermark.enabled} onChange={e => updateWatermark({ enabled: e.target.checked })} />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {watermark.enabled && (
                <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => updateWatermark({ useLogo: false })} className={`text-xs p-2 rounded-md transition-colors ${!watermark.useLogo ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Text</button>
                        <button onClick={() => updateWatermark({ useLogo: true })} disabled={!brandKit.logo} className={`text-xs p-2 rounded-md transition-colors ${watermark.useLogo ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>Logo</button>
                    </div>
                    {!watermark.useLogo && (
                         <input type="text" value={watermark.text} onChange={e => updateWatermark({ text: e.target.value })}
                            className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Your brand name" />
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Position</label>
                         <select value={watermark.position} onChange={e => updateWatermark({ position: e.target.value as GenerationSettings['watermark']['position']})} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="top-left">Top Left</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-right">Top Right</option>
                            <option value="middle-left">Middle Left</option>
                            <option value="middle-center">Middle Center</option>
                            <option value="middle-right">Middle Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-right">Bottom Right</option>
                         </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Scale ({watermark.scale}%)</label>
                            <input type="range" min="1" max="25" value={watermark.scale} onChange={e => updateWatermark({ scale: Number(e.target.value)})} className="w-full"/>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Opacity ({watermark.opacity}%)</label>
                            <input type="range" min="10" max="100" value={watermark.opacity} onChange={e => updateWatermark({ opacity: Number(e.target.value)})} className="w-full"/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const GeneratorControls: React.FC<Omit<ControlPanelProps, 'history' | 'onRevertToHistory' | 'onToggleFavorite'>> = ({
    onProductImageUpload, onClearProductImage, onStyleImageUpload, onClearStyleImage,
    settings, setSettings, finalPrompt, styleSuggestions, onGenerate, isLoading,
    productImage, styleImage, brandKit
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const isPromptEdited = settings.editedPrompt !== null;

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

    return (
        <div className="flex flex-col space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Section title="Upload Product" step={1}>
                    <FileUpload onFileUpload={onProductImageUpload} label="Upload Product Photo" uploadedFileName={productImage?.name} onClear={productImage ? onClearProductImage : undefined} />
                </Section>
                <Section title="Style Reference (Optional)" step={2}>
                     <FileUpload onFileUpload={onStyleImageUpload} label="Upload Style Photo" uploadedFileName={styleImage?.name} onClear={styleImage ? onClearStyleImage : undefined} />
                </Section>
            </div>

            <Section title="Customize Scene" step={3}>
                <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setSettings(s => ({...s, aspectRatio: value}))}
                                        className={`text-xs p-2 rounded-md transition-colors truncate ${settings.aspectRatio === value ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                        disabled={isLoading} title={label}>
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Number of Images</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 4].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setSettings(s => ({...s, numberOfImages: num as 1 | 4}))}
                                        className={`text-xs p-2 rounded-md transition-colors ${settings.numberOfImages === num ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                        disabled={isLoading}>
                                        {num} Image{num > 1 ? 's' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Select label="Lighting Style" value={settings.lightingStyle} onChange={(e) => setSettings(s=>({...s, lightingStyle: e.target.value, editedPrompt: null}))} options={LIGHTING_STYLES} disabled={isLoading || isPromptEdited} />
                    <Select label="Camera Perspective" value={settings.cameraPerspective} onChange={(e) => setSettings(s=>({...s, cameraPerspective: e.target.value, editedPrompt: null}))} options={CAMERA_PERSPECTIVES} disabled={isLoading || isPromptEdited} />
                    <button onClick={handleSurpriseMe} disabled={isLoading} className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Icon name="dice" className="w-4 h-4"/> Surprise Me!
                    </button>
                    {styleSuggestions.length > 0 && !isPromptEdited && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">✨ Style Suggestions</label>
                            <div className="flex flex-wrap gap-2">
                                {styleSuggestions.map((suggestion, index) => (
                                    <button key={index} onClick={() => setSettings(s=>({...s, editedPrompt: suggestion}))} className="text-xs text-left bg-gray-200 dark:bg-gray-700/80 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600/80 transition-colors px-3 py-1.5 rounded-full" title={suggestion}>
                                        {suggestion.substring(0, 40) + (suggestion.length > 40 ? '...' : '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Final Prompt" step={4}>
                 <div className="relative">
                    <textarea value={finalPrompt || 'Prompt will appear here...'} onChange={(e) => setSettings(s=>({...s, editedPrompt: e.target.value}))}
                        className="w-full h-24 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-xs text-gray-600 dark:text-gray-300 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe the image you want to create..." disabled={isLoading || !productImage} />
                    {isPromptEdited && (
                        <button onClick={() => setSettings(s=>({...s, editedPrompt: null}))} className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" aria-label="Reset prompt to auto-generated">
                            <Icon name="restart" className="w-4 h-4" />
                        </button>
                    )}
                 </div>
                 <div className="mt-3">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>
                    {showAdvanced && (
                        <div className="mt-2 space-y-3 animate-fade-in">
                            <div>
                               <div className="flex items-center space-x-1 mb-1">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Negative Prompt</label>
                                    <Tooltip text="Describe what you DON'T want in the image. Helps remove unwanted elements.">
                                        <Icon name="info" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                    </Tooltip>
                                </div>
                                <input type="text" value={settings.negativePrompt} onChange={(e) => setSettings(s=>({...s, negativePrompt: e.target.value}))}
                                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="e.g., text, watermarks, ugly" disabled={isLoading || !productImage} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-1 mb-1">
                                   <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Seed</label>
                                   <Tooltip text="A number for reproducible images. Same seed + same prompt = similar result.">
                                        <Icon name="info" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                    </Tooltip>
                                </div>
                                <input type="number" value={settings.seed} onChange={(e) => setSettings(s=>({...s, seed: e.target.value}))}
                                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Any number for reproducible results" disabled={isLoading || !productImage} />
                            </div>
                             <WatermarkPanel settings={settings} setSettings={setSettings} brandKit={brandKit} />
                        </div>
                    )}
                 </div>
            </Section>
        </div>
    );
};


export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { onGenerate, isLoading, productImage, settings, history } = props;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 sm:p-2 flex flex-col h-full shadow-lg">
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
                                brandKit={props.brandKit}
                                setBrandKit={props.setBrandKit}
                            />
                        }
                        
                         <div className="mt-auto pt-4">
                            <button
                                onClick={onGenerate}
                                disabled={isLoading || !productImage}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                title="Generate (Ctrl+G)"
                            >
                                {isLoading ? (
                                     <><Icon name="spinner" className="animate-spin mr-2" /> Generating...</>
                                ) : (
                                     <><Icon name="sparkles" className="mr-2" /> Generate Image{settings.numberOfImages > 1 ? 's' : ''}</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    );
};
