

import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { FileUpload } from '../components/FileUpload';
import { ImageComparator } from '../components/ImageComparator';
import * as geminiService from '../services/geminiService';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Tooltip } from '../components/Tooltip';

type SkinRetouchMode = 'Standard' | 'Detailed' | 'Heavy';
type MakeupStyle = 'Natural' | 'Glamour' | 'SmokyEye' | 'BoldLip' | 'Goth' | 'Vintage' | 'NoMakeup' | 'KBeauty' | 'MensGrooming';
type LightingStyle = 'Studio' | 'Rembrandt' | 'GoldenHour' | 'Neon' | 'BeautyDish' | 'Spotlight';
type PresetID = 'CoverModel' | 'NaturalBeauty' | 'Dramatic' | 'CorporateHeadshot' | 'VintageFilm';

const skinRetouchModes: { id: SkinRetouchMode; name: string; icon: string }[] = [
    { id: 'Standard', name: 'Standard Retouch', icon: 'sparkles' },
    { id: 'Detailed', name: 'Detailed Enhancement', icon: 'search' },
    { id: 'Heavy', name: 'Heavy Retouch', icon: 'user-circle' },
];

const makeupStyles: { id: MakeupStyle; name: string; icon: string }[] = [
    { id: 'Natural', name: 'Natural Glow', icon: 'sun' },
    { id: 'Glamour', name: 'Glamour', icon: 'star' },
    { id: 'SmokyEye', name: 'Smoky Eye', icon: 'moon' },
    { id: 'BoldLip', name: 'Bold Lip', icon: 'sparkles' },
    { id: 'Goth', name: 'Goth', icon: 'moon-stars' },
    { id: 'Vintage', name: 'Vintage Pin-up', icon: 'history' },
    { id: 'NoMakeup', name: 'No-Makeup Look', icon: 'leaf' },
    { id: 'KBeauty', name: 'K-Beauty Glass Skin', icon: 'sparkles' },
    { id: 'MensGrooming', name: "Men's Grooming", icon: 'user-circle' },
];

const lightingStyles: { id: LightingStyle; name: string; icon: string }[] = [
    { id: 'Studio', name: 'Studio Softbox', icon: 'camera' },
    { id: 'Rembrandt', name: 'Rembrandt', icon: 'moon' },
    { id: 'GoldenHour', name: 'Golden Hour', icon: 'sun' },
    { id: 'Neon', name: 'Neon Glow', icon: 'sparkles' },
    { id: 'BeautyDish', name: 'Beauty Dish', icon: 'camera' },
    { id: 'Spotlight', name: 'Spotlight', icon: 'sun' },
];

const presets: { id: PresetID, name: string; icon: string, description: string }[] = [
    { id: 'CoverModel', name: 'Cover Model', icon: 'star-filled', description: 'Flawless skin, glamour makeup, and studio lighting.' },
    { id: 'NaturalBeauty', name: 'Natural Beauty', icon: 'leaf', description: 'Subtle retouching, realistic skin, and warm lighting.' },
    { id: 'Dramatic', name: 'Dramatic Look', icon: 'moon', description: 'High-contrast lighting, smoky eyes, and sculpted features.' },
    { id: 'CorporateHeadshot', name: 'Corporate Headshot', icon: 'user-square', description: 'Clean, professional look with even lighting and subtle enhancements.' },
    { id: 'VintageFilm', name: 'Vintage Film', icon: 'history', description: 'Adds realistic film grain, warm color grading, and a soft focus effect.' },
];


const AccordionSection: React.FC<{ title: string; icon: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, icon, children, isOpen, onToggle }) => {
    return (
        <div className="border-b border-border">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-3 text-left hover:bg-muted/50">
                <span className="font-semibold flex items-center gap-2"><Icon name={icon} className="w-5 h-5 text-primary"/> {title}</span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="w-5 h-5 text-muted-foreground"/>
            </button>
            {isOpen && <div className="p-3 pt-0 animate-fade-in space-y-4">{children}</div>}
        </div>
    )
};

const ActionButton: React.FC<{ icon: string; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
    <button className="bg-zinc-900 border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-colors group">
        <Icon name={icon} className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
        <h4 className="font-semibold text-foreground">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </button>
);

export const SkinEditorPage: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{file: File, preview: string} | null>(null);
    const [imageHistory, setImageHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [activeAccordion, setActiveAccordion] = useState<string | null>('presets');
    
    // Control States
    const [skinRetouchMode, setSkinRetouchMode] = useState<SkinRetouchMode>('Standard');
    const [selectedMakeup, setSelectedMakeup] = useState<MakeupStyle | null>(null);
    const [whitenTeeth, setWhitenTeeth] = useState(false);
    const [brightenEyes, setBrightenEyes] = useState(false);
    const [selectedLighting, setSelectedLighting] = useState<LightingStyle | null>(null);
    const [sculptingOptions, setSculptingOptions] = useState({ defineJawline: false, enhanceCheekbones: false, slimNose: false, lipPlumping: false, eyeWidening: false });
    const [eyeColor, setEyeColor] = useState('#4682B4'); // steelblue
    const [isEyeColorActive, setIsEyeColorActive] = useState(false);
    const [hairStylePrompt, setHairStylePrompt] = useState('');
    const [backgroundPrompt, setBackgroundPrompt] = useState('');

    const currentImage = imageHistory[imageHistory.length - 1] || null;
    const previousImage = imageHistory[imageHistory.length - 2] || originalImage?.preview || null;

    useEffect(() => {
        // Cleanup blob URLs on unmount
        return () => {
            if (originalImage) URL.revokeObjectURL(originalImage.preview);
            imageHistory.forEach(URL.revokeObjectURL);
            redoStack.forEach(URL.revokeObjectURL);
        };
    }, [originalImage, imageHistory, redoStack]);

    const handleFileUpload = (file: File) => {
        handleReset();
        const preview = URL.createObjectURL(file);
        setOriginalImage({ file, preview });
        setImageHistory([preview]);
    };

    const handleReset = () => {
        if (originalImage) URL.revokeObjectURL(originalImage.preview);
        imageHistory.forEach(URL.revokeObjectURL);
        redoStack.forEach(URL.revokeObjectURL);
        setOriginalImage(null);
        setImageHistory([]);
        setRedoStack([]);
        setIsLoading(false);
        setError(null);
        setSkinRetouchMode('Standard');
        setSelectedMakeup(null);
        setWhitenTeeth(false);
        setBrightenEyes(false);
        setSelectedLighting(null);
        setSculptingOptions({ defineJawline: false, enhanceCheekbones: false, slimNose: false, lipPlumping: false, eyeWidening: false });
        setIsEyeColorActive(false);
        setEyeColor('#4682B4');
        setHairStylePrompt('');
        setBackgroundPrompt('');
        setActiveAccordion('presets');
    };
    
    const handleUndo = () => {
        if (imageHistory.length > 1) {
            const lastImage = imageHistory[imageHistory.length - 1];
            setRedoStack(prev => [lastImage, ...prev]);
            setImageHistory(prev => prev.slice(0, -1));
        }
    };
    
    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextImage = redoStack[0];
            setImageHistory(prev => [...prev, nextImage]);
            setRedoStack(prev => prev.slice(1));
        }
    };

    const runEnhancement = async (prompt: string, loadingMsg: string) => {
        if (!currentImage) return;

        setIsLoading(true);
        setLoadingMessage(loadingMsg);
        setError(null);

        try {
            const base64Image = await fetch(currentImage).then(r => r.blob()).then(blob => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));

            const resultBase64 = await geminiService.editPortrait(base64Image, prompt);
            const resultUrl = `data:image/png;base64,${resultBase64}`;
            
            setImageHistory(prev => [...prev, resultUrl]);
            setRedoStack([]);

        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleApplySkin = () => {
        let prompt = '';
        switch (skinRetouchMode) {
            case 'Detailed': prompt = 'Enhance the skin in this portrait. Focus on improving skin texture, reducing blemishes, and evening out skin tone while maintaining a very natural and realistic look. Add subtle, photorealistic details.'; break;
            case 'Heavy': prompt = 'Perform a significant retouching of the skin. Smooth out imperfections, remove most blemishes, and create a flawless, magazine-cover look. The result should be polished but still look like a real person.'; break;
            default: prompt = 'Gently retouch the skin to reduce minor blemishes and even out the skin tone. The result should be natural and preserve the original skin texture as much as possible.'; break;
        }
        runEnhancement(prompt, 'Smoothing Skin...');
    };

    const handleApplySkinRealism = () => {
        const prompt = "Enhance the skin texture in this portrait. Add realistic pores, fine lines, and subtle imperfections to make the skin look more natural and detailed. Do not smooth the skin; focus on adding texture.";
        runEnhancement(prompt, 'Adding Skin Details...');
    }

    const handleApplyMakeup = () => {
        if (!selectedMakeup) return;
        let prompt = `Apply a photorealistic '${makeupStyles.find(m => m.id === selectedMakeup)?.name}' makeup style to the person in the image. `;
        switch (selectedMakeup) {
            case 'Natural': prompt += "Focus on subtle foundation, light blush, neutral eyeshadow, and a nude lipstick. Enhance the natural features."; break;
            case 'Glamour': prompt += "Create a glamorous look with flawless foundation, contouring, shimmering eyeshadow, winged eyeliner, and a glossy lip."; break;
            case 'SmokyEye': prompt += "Create a dramatic smoky eye with blended dark eyeshadows, eyeliner, and mascara. Keep the lips neutral."; break;
            case 'BoldLip': prompt += "Apply a bold, saturated red lipstick as the main feature. Keep eye makeup minimal and the skin clean."; break;
            case 'Goth': prompt += "Create a goth makeup look with pale foundation, heavy dark eyeliner, dark eyeshadow, and a black or deep purple lipstick."; break;
            case 'Vintage': prompt += "Create a vintage pin-up makeup look with classic winged eyeliner, bold red lips, and defined eyebrows."; break;
            case 'NoMakeup': prompt += "Apply a 'no-makeup' makeup look. Even out the skin tone, add a hint of natural color to cheeks and lips, and groom the eyebrows. The result should look like naturally perfect skin."; break;
            case 'KBeauty': prompt += "Create a K-Beauty 'glass skin' look, focusing on dewy, luminous skin, gradient lips, and very natural, straight eyebrows."; break;
            case 'MensGrooming': prompt += "Apply subtle men's grooming. Even out skin tone, reduce redness and shine, subtly define eyebrows and facial hair, and make the subject look well-rested and professional without looking like makeup."; break;
        }
        runEnhancement(prompt, 'Applying Makeup...');
    };
    
    const handleApplyFeatures = () => {
        const prompts = [];
        if (whitenTeeth) prompts.push("subtly whiten teeth");
        if (brightenEyes) prompts.push("brighten the eyes to make them more vibrant");
        if (isEyeColorActive) prompts.push(`change the eye color to ${eyeColor}`);
        if (prompts.length === 0) return;
        const prompt = `Perform the following enhancements on the portrait: ${prompts.join(' and ')}. Keep all changes natural and photorealistic.`;
        runEnhancement(prompt, 'Enhancing Features...');
    };
    
    const handleApplyLighting = () => {
        if (!selectedLighting) return;
        let prompt = `Realistically relight this portrait with a professional lighting setup. `;
        switch (selectedLighting) {
            case 'Studio': prompt += "Use a large softbox for soft, flattering, and even light with minimal shadows, like in a professional photo studio."; break;
            case 'Rembrandt': prompt += "Use a dramatic 'Rembrandt' lighting style, creating a triangle of light on the cheek opposite the light source."; break;
            case 'GoldenHour': prompt += "Simulate the warm, soft, glowing light of the golden hour just after sunrise or before sunset."; break;
            case 'Neon': prompt += "Use vibrant, colorful neon lights to create a moody, cyberpunk-inspired lighting effect with strong pink and blue tones."; break;
            case 'BeautyDish': prompt += "Use a classic 'beauty dish' light source, creating a focused, clean light with soft, flattering shadows directly in front of and slightly above the subject."; break;
            case 'Spotlight': prompt += "Simulate a single, hard theatrical spotlight on the subject against a very dark or black background, creating high drama and sharp shadows."; break;
        }
        runEnhancement(prompt, 'Adjusting Lighting...');
    };
// FIX: The file was corrupted and this function was incomplete. It has been restored.
    const handleApplySculpting = () => {
        const prompts = [];
        if (sculptingOptions.defineJawline) prompts.push("subtly define and sharpen the jawline");
        if (sculptingOptions.enhanceCheekbones) prompts.push("enhance and lift the cheekbones for more definition");
        if (sculptingOptions.slimNose) prompts.push("subtly slim the nose");
        if (sculptingOptions.lipPlumping) prompts.push("add subtle volume to the lips");
        if (sculptingOptions.eyeWidening) prompts.push("slightly widen the eyes");
        if (prompts.length === 0) return;
        const prompt = `Perform the following facial sculpting enhancements: ${prompts.join(', ')}. Keep all changes natural and photorealistic.`;
        runEnhancement(prompt, 'Sculpting Features...');
    };

    const handleApplyHair = () => {
        if (!hairStylePrompt) return;
        const prompt = `Change the hair style to: ${hairStylePrompt}. Keep the person's face and identity the same.`;
        runEnhancement(prompt, 'Styling Hair...');
    };

    const handleApplyBackground = () => {
        if (!backgroundPrompt) return;
        const prompt = `Change the background to: ${backgroundPrompt}. Keep the person in the foreground unchanged.`;
        runEnhancement(prompt, 'Changing Background...');
    };

    return (
        <div className="flex flex-1 flex-col md:flex-row min-h-0">
            {/* Left Panel - Controls */}
            <aside className="w-full md:w-96 bg-card/50 backdrop-blur-md border-b md:border-r md:border-b-0 border-border/50 flex-shrink-0 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Portrait Studio</h2>
                        <p className="text-sm text-muted-foreground mt-1">Fine-tune portraits with powerful AI tools.</p>
                    </div>
                    <Tooltip text="Reset All">
                        <button onClick={handleReset} className="p-2 rounded-md hover:bg-accent text-muted-foreground">
                            <Icon name="restart" className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {!originalImage ? (
                         <div className="p-4">
                            <FileUpload onFileUpload={handleFileUpload} label="Upload a clear portrait" />
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {/* Presets */}
                            <AccordionSection title="Presets" icon="star" isOpen={activeAccordion === 'presets'} onToggle={() => setActiveAccordion(activeAccordion === 'presets' ? null : 'presets')}>
                                <div className="grid grid-cols-2 gap-2">
                                    {presets.map(p => (
                                        <button key={p.id} onClick={() => {}} className="bg-muted/50 p-2 rounded-md text-left hover:bg-accent text-xs">
                                            <Icon name={p.icon} className="w-5 h-5 mb-1"/>
                                            <p className="font-semibold">{p.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </AccordionSection>
                            
                            {/* Skin */}
                            <AccordionSection title="Skin Retouch" icon="sparkles" isOpen={activeAccordion === 'skin'} onToggle={() => setActiveAccordion(activeAccordion === 'skin' ? null : 'skin')}>
                                <div className="grid grid-cols-3 gap-2">
                                    {skinRetouchModes.map(mode => (
                                        <button key={mode.id} onClick={() => setSkinRetouchMode(mode.id)} className={`px-2 py-1 rounded-md text-xs font-semibold h-14 flex flex-col items-center justify-center gap-1 text-center ${skinRetouchMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                            <Icon name={mode.icon} className="w-4 h-4"/>
                                            {mode.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleApplySkin} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30">Apply Skin Retouch</button>
                                <button onClick={handleApplySkinRealism} className="w-full text-sm p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent">Add Skin Realism</button>
                            </AccordionSection>
                            
                            {/* Features */}
                            <AccordionSection title="Facial Features" icon="user-circle" isOpen={activeAccordion === 'features'} onToggle={() => setActiveAccordion(activeAccordion === 'features' ? null : 'features')}>
                                <div className="flex justify-between items-center"><label>Whiten Teeth</label><ToggleSwitch checked={whitenTeeth} onChange={setWhitenTeeth} label="Whiten Teeth" /></div>
                                <div className="flex justify-between items-center"><label>Brighten Eyes</label><ToggleSwitch checked={brightenEyes} onChange={setBrightenEyes} label="Brighten Eyes" /></div>
                                <div className="flex justify-between items-center">
                                    <label>Change Eye Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={eyeColor} onChange={e => setEyeColor(e.target.value)} disabled={!isEyeColorActive} className="p-0 h-6 w-6 bg-transparent border-none cursor-pointer rounded-md disabled:opacity-50"/>
                                        <ToggleSwitch checked={isEyeColorActive} onChange={setIsEyeColorActive} label="Change Eye Color" />
                                    </div>
                                </div>
                                <button onClick={handleApplyFeatures} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30">Apply Feature Edits</button>
                            </AccordionSection>
                            
                            {/* Makeup */}
                            <AccordionSection title="Makeup" icon="wand" isOpen={activeAccordion === 'makeup'} onToggle={() => setActiveAccordion(activeAccordion === 'makeup' ? null : 'makeup')}>
                                 <div className="grid grid-cols-3 gap-2">
                                    {makeupStyles.map(style => (
                                        <button key={style.id} onClick={() => setSelectedMakeup(style.id)} className={`px-2 py-1 rounded-md text-xs font-semibold h-14 flex flex-col items-center justify-center gap-1 text-center ${selectedMakeup === style.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                            <Icon name={style.icon} className="w-4 h-4"/>
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleApplyMakeup} disabled={!selectedMakeup} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 disabled:opacity-50">Apply Makeup</button>
                            </AccordionSection>
                            
                            {/* Sculpting */}
                             <AccordionSection title="Face Sculpt" icon="user-square" isOpen={activeAccordion === 'sculpting'} onToggle={() => setActiveAccordion(activeAccordion === 'sculpting' ? null : 'sculpting')}>
                                 <div className="flex justify-between items-center"><label>Define Jawline</label><ToggleSwitch checked={sculptingOptions.defineJawline} onChange={c => setSculptingOptions(s => ({...s, defineJawline: c}))} label="Define Jawline" /></div>
                                 <div className="flex justify-between items-center"><label>Enhance Cheekbones</label><ToggleSwitch checked={sculptingOptions.enhanceCheekbones} onChange={c => setSculptingOptions(s => ({...s, enhanceCheekbones: c}))} label="Enhance Cheekbones" /></div>
                                 <div className="flex justify-between items-center"><label>Slim Nose</label><ToggleSwitch checked={sculptingOptions.slimNose} onChange={c => setSculptingOptions(s => ({...s, slimNose: c}))} label="Slim Nose" /></div>
                                 <div className="flex justify-between items-center"><label>Lip Plumping</label><ToggleSwitch checked={sculptingOptions.lipPlumping} onChange={c => setSculptingOptions(s => ({...s, lipPlumping: c}))} label="Lip Plumping" /></div>
                                 <div className="flex justify-between items-center"><label>Widen Eyes</label><ToggleSwitch checked={sculptingOptions.eyeWidening} onChange={c => setSculptingOptions(s => ({...s, eyeWidening: c}))} label="Widen Eyes" /></div>
                                <button onClick={handleApplySculpting} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30">Apply Sculpting</button>
                            </AccordionSection>
                            
                            {/* Hair */}
                            <AccordionSection title="Hair Style" icon="user-circle" isOpen={activeAccordion === 'hair'} onToggle={() => setActiveAccordion(activeAccordion === 'hair' ? null : 'hair')}>
                                <textarea value={hairStylePrompt} onChange={e => setHairStylePrompt(e.target.value)} placeholder="e.g., long curly blonde hair" className="w-full bg-input border-border rounded-md p-2 text-sm min-h-[70px] resize-none" />
                                <button onClick={handleApplyHair} disabled={!hairStylePrompt} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 disabled:opacity-50">Apply Hair Style</button>
                            </AccordionSection>

                            {/* Background */}
                            <AccordionSection title="Background" icon="image" isOpen={activeAccordion === 'background'} onToggle={() => setActiveAccordion(activeAccordion === 'background' ? null : 'background')}>
                                <textarea value={backgroundPrompt} onChange={e => setBackgroundPrompt(e.target.value)} placeholder="e.g., a blurred cityscape at night" className="w-full bg-input border-border rounded-md p-2 text-sm min-h-[70px] resize-none" />
                                <button onClick={handleApplyBackground} disabled={!backgroundPrompt} className="w-full text-sm p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 disabled:opacity-50">Change Background</button>
                            </AccordionSection>
                        </div>
                    )}
                </div>
            </aside>
            <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Output Preview</h2>
                    <div className="flex items-center gap-2">
                        <Tooltip text="Undo"><button onClick={handleUndo} disabled={imageHistory.length <= 1} className="p-2 rounded-md hover:bg-zinc-800 disabled:opacity-50"><Icon name="undo" /></button></Tooltip>
                        <Tooltip text="Redo"><button onClick={handleRedo} disabled={redoStack.length === 0} className="p-2 rounded-md hover:bg-zinc-800 disabled:opacity-50"><Icon name="redo" /></button></Tooltip>
                    </div>
                </div>

                 <div className="relative flex-1 border border-border rounded-lg flex items-center justify-center min-h-[300px] p-4">
                    {isLoading && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-white"><Icon name="spinner" className="w-8 h-8 animate-spin"/>{loadingMessage}</div>}
                    {error && <p className="text-destructive p-4 text-center">{error}</p>}
                    {!isLoading && !error && currentImage && (
                        <div className="w-full h-full">
                            <ImageComparator baseImage={previousImage || currentImage} newImage={currentImage} />
                        </div>
                    )}
                    {!isLoading && !error && !originalImage && (
                        <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Icon name="user-circle" className="w-10 h-10" />
                            <p>Upload a portrait to begin editing</p>
                        </div>
                    )}
                 </div>
                 <div className={`grid grid-cols-4 gap-4 ${!currentImage && 'opacity-30 pointer-events-none'}`}>
                     <ActionButton icon="expand" title="Upscale Image" subtitle="General Upscaling" />
                     <ActionButton icon="users" title="Upscale Portrait" subtitle="Optimized for Faces" />
                     <ActionButton icon="move" title="Animate" />
                     <ActionButton icon="download" title="Download" />
                 </div>
            </main>
        </div>
    );
};
