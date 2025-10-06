import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { FileUpload } from '../components/FileUpload';
import { ImageComparator } from '../components/ImageComparator';
import * as geminiService from '../services/geminiService';
import { ToggleSwitch } from '../components/ToggleSwitch';

type SkinRetouchMode = 'Standard' | 'Detailed' | 'Heavy';
type MakeupStyle = 'Natural' | 'SmokyEye' | 'BoldLip' | 'NoMakeup';
type LightingStyle = 'Studio' | 'Rembrandt' | 'GoldenHour' | 'Neon';

const skinRetouchModes: { id: SkinRetouchMode; name: string; icon: string }[] = [
    { id: 'Standard', name: 'Standard Retouch', icon: 'sparkles' },
    { id: 'Detailed', name: 'Detailed Enhancement', icon: 'wand' },
    { id: 'Heavy', name: 'Heavy Retouch', icon: 'user-circle' },
];

const makeupStyles: { id: MakeupStyle; name: string; icon: string }[] = [
    { id: 'Natural', name: 'Natural Glow', icon: 'sun' },
    { id: 'SmokyEye', name: 'Smoky Eye', icon: 'moon' },
    { id: 'BoldLip', name: 'Bold Lip', icon: 'sparkles' },
    { id: 'NoMakeup', name: 'No-Makeup Look', icon: 'leaf' },
];

const lightingStyles: { id: LightingStyle; name: string; icon: string }[] = [
    { id: 'Studio', name: 'Studio Softbox', icon: 'camera' },
    { id: 'Rembrandt', name: 'Rembrandt', icon: 'moon' },
    { id: 'GoldenHour', name: 'Golden Hour', icon: 'sun' },
    { id: 'Neon', name: 'Neon Glow', icon: 'sparkles' },
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


export const SkinEditorPage: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{file: File, preview: string} | null>(null);
    const [imageHistory, setImageHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [activeAccordion, setActiveAccordion] = useState<string | null>('skin');
    
    // Control States
    const [skinRetouchMode, setSkinRetouchMode] = useState<SkinRetouchMode>('Standard');
    const [selectedMakeup, setSelectedMakeup] = useState<MakeupStyle | null>(null);
    const [whitenTeeth, setWhitenTeeth] = useState(false);
    const [brightenEyes, setBrightenEyes] = useState(false);
    const [selectedLighting, setSelectedLighting] = useState<LightingStyle | null>(null);

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
        runEnhancement(prompt, 'Retouching Skin...');
    };

    const handleApplyMakeup = () => {
        if (!selectedMakeup) return;
        let prompt = `Apply a photorealistic '${makeupStyles.find(m => m.id === selectedMakeup)?.name}' makeup style to the person in the image. `;
        switch (selectedMakeup) {
            case 'Natural': prompt += "Focus on subtle foundation, light blush, neutral eyeshadow, and a nude lipstick. Enhance the natural features."; break;
            case 'SmokyEye': prompt += "Create a dramatic smoky eye with blended dark eyeshadows, eyeliner, and mascara. Keep the lips neutral."; break;
            case 'BoldLip': prompt += "Apply a bold, saturated red lipstick as the main feature. Keep eye makeup minimal and the skin clean."; break;
            case 'NoMakeup': prompt += "Apply a 'no-makeup' makeup look. Even out the skin tone, add a hint of natural color to cheeks and lips, and groom the eyebrows. The result should look like naturally perfect skin."; break;
        }
        runEnhancement(prompt, 'Applying Makeup...');
    };
    
    const handleApplyFeatures = () => {
        const prompts = [];
        if (whitenTeeth) prompts.push("subtly whiten teeth");
        if (brightenEyes) prompts.push("brighten the eyes to make them more vibrant");
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
        }
        runEnhancement(prompt, 'Adjusting Lighting...');
    };

    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0 animate-fade-in">
            <aside className="bg-card border-b md:border-b-0 md:border-r border-border md:w-[380px] flex-shrink-0 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Pro Skin Editor</h2>
                        <p className="text-sm text-muted-foreground mt-1">Advanced portrait enhancement tools.</p>
                    </div>
                    <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">Reset</button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {!originalImage ? (
                        <div className="p-4"><FileUpload onFileUpload={handleFileUpload} label="Upload a portrait image"/></div>
                    ) : (
                        <>
                            <AccordionSection title="Skin Retouching" icon="sparkles" isOpen={activeAccordion === 'skin'} onToggle={() => setActiveAccordion(activeAccordion === 'skin' ? null : 'skin')}>
                                <div className="grid grid-cols-1 gap-2">
                                    {skinRetouchModes.map(mode => (
                                        <button key={mode.id} onClick={() => setSkinRetouchMode(mode.id)} className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors h-14 flex items-center justify-start gap-3 ${skinRetouchMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                            <Icon name={mode.icon} className="w-5 h-5" />
                                            {mode.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleApplySkin} disabled={isLoading} className="w-full h-10 bg-primary/20 text-primary rounded-md font-semibold disabled:opacity-50">Apply</button>
                            </AccordionSection>

                            <AccordionSection title="AI Makeup" icon="wand" isOpen={activeAccordion === 'makeup'} onToggle={() => setActiveAccordion(activeAccordion === 'makeup' ? null : 'makeup')}>
                                <div className="grid grid-cols-2 gap-2">
                                    {makeupStyles.map(style => (
                                        <button key={style.id} onClick={() => setSelectedMakeup(style.id)} className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors h-14 flex flex-col items-center justify-center gap-1 ${selectedMakeup === style.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                            <Icon name={style.icon} className="w-5 h-5" />
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleApplyMakeup} disabled={isLoading || !selectedMakeup} className="w-full h-10 bg-primary/20 text-primary rounded-md font-semibold disabled:opacity-50">Apply</button>
                            </AccordionSection>
                            
                            <AccordionSection title="Feature Enhancement" icon="user-circle" isOpen={activeAccordion === 'features'} onToggle={() => setActiveAccordion(activeAccordion === 'features' ? null : 'features')}>
                                <div className="flex justify-between items-center"><label>Whiten Teeth</label><ToggleSwitch checked={whitenTeeth} onChange={setWhitenTeeth} label="Whiten Teeth" /></div>
                                <div className="flex justify-between items-center"><label>Brighten Eyes</label><ToggleSwitch checked={brightenEyes} onChange={setBrightenEyes} label="Brighten Eyes" /></div>
                                <button onClick={handleApplyFeatures} disabled={isLoading || (!whitenTeeth && !brightenEyes)} className="w-full h-10 bg-primary/20 text-primary rounded-md font-semibold disabled:opacity-50">Apply</button>
                            </AccordionSection>

                             <AccordionSection title="AI Relighting" icon="sun" isOpen={activeAccordion === 'lighting'} onToggle={() => setActiveAccordion(activeAccordion === 'lighting' ? null : 'lighting')}>
                                <div className="grid grid-cols-2 gap-2">
                                    {lightingStyles.map(style => (
                                        <button key={style.id} onClick={() => setSelectedLighting(style.id)} className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors h-14 flex flex-col items-center justify-center gap-1 ${selectedLighting === style.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                            <Icon name={style.icon} className="w-5 h-5" />
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleApplyLighting} disabled={isLoading || !selectedLighting} className="w-full h-10 bg-primary/20 text-primary rounded-md font-semibold disabled:opacity-50">Apply</button>
                            </AccordionSection>
                        </>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative bg-zinc-950">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Icon name="spinner" className="w-8 h-8 animate-spin text-primary" />
                        <span>{loadingMessage || 'Processing...'}</span>
                    </div>
                ) : imageHistory.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-full h-full max-w-[calc(100vh-8rem)]">
                            <ImageComparator baseImage={previousImage!} newImage={currentImage!} />
                        </div>
                        <div className="absolute top-3 left-3 z-30 flex gap-2">
                             <button onClick={handleUndo} disabled={imageHistory.length <= 1} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 w-10 bg-background/80 hover:bg-accent backdrop-blur-sm disabled:opacity-50"><Icon name="undo" /></button>
                             <button onClick={handleRedo} disabled={redoStack.length === 0} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 w-10 bg-background/80 hover:bg-accent backdrop-blur-sm disabled:opacity-50"><Icon name="redo" /></button>
                        </div>
                        <div className="absolute top-3 right-3 z-30">
                            <button onClick={() => {}} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 w-10 bg-background/80 hover:bg-accent backdrop-blur-sm"><Icon name="download" /></button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Icon name="user-circle" className="w-24 h-24 mx-auto text-primary/20" />
                        <h2 className="text-2xl font-bold mt-4 text-foreground">AI Pro Skin Editor</h2>
                        <p className="max-w-sm mt-2">Upload a portrait to begin. Use powerful AI tools to retouch skin, apply makeup, enhance features, and relight your photos.</p>
                    </div>
                )}
                 {error && <div className="absolute bottom-4 bg-destructive/20 text-destructive p-3 rounded-md text-sm">{error}</div>}
            </main>
        </div>
    );
};
