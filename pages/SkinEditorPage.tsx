import React, { useState, useMemo, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { FileUpload } from '../components/FileUpload';
import { ImageComparator } from '../components/ImageComparator';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Tooltip } from '../components/Tooltip';

type EnhancementType = 'Face' | 'Body';
type EnhancementMode = 'Standard' | 'Detailed' | 'Heavy';

const initialPreservedAreas = {
    skin: true, nose: true, mouth: true, upperLip: true, lowerLip: true,
    eyeGeneral: true, leftEye: true, rightEye: true, leftBrow: true, rightBrow: true,
};

const ToggleButtonGroup = ({ options, selected, onSelect, columns = 2 }: { options: string[], selected: string, onSelect: (value: string) => void, columns?: number }) => (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map(opt => (
            <button key={opt} onClick={() => onSelect(opt)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors h-11 ${selected === opt ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                {opt}
            </button>
        ))}
    </div>
);

const SliderControl = ({ label, value, min, max, step, onChange, minLabel, maxLabel }: { label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void, minLabel: string, maxLabel: string }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <span className="text-sm font-mono text-primary">{value.toFixed(2)}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

const PreserveAreaToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between bg-input rounded-md px-3 py-2">
        <span className="text-sm text-foreground">{label}</span>
        <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
);

const IconButton: React.FC<{onClick: (e: React.MouseEvent) => void; label: string; title: string; children: React.ReactNode;}> = ({ onClick, label, title, children }) => (
    <Tooltip text={title}>
        <button onClick={onClick} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 w-10 bg-background/80 hover:bg-accent backdrop-blur-sm" aria-label={label}>
            {children}
        </button>
    </Tooltip>
);

const ResultActions = ({ onDownload, onUpscale, onUpscalePortrait, onGenerateVideo, onAnimate }: { onDownload: () => void, onUpscale: () => void, onUpscalePortrait: () => void, onGenerateVideo: () => void, onAnimate: () => void }) => (
    <div className="absolute top-3 right-3 flex gap-2 z-30">
        <IconButton onClick={(e) => { e.stopPropagation(); onUpscale(); }} label="Upscale Image" title="Upscale Image"><Icon name="expand" /></IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); onUpscalePortrait(); }} label="Upscale Portrait" title="Upscale Portrait"><Icon name="user-circle" /></IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); onGenerateVideo(); }} label="Generate Video" title="Generate Video"><Icon name="video" /></IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); onAnimate(); }} label="Animate" title="Animate"><Icon name="sparkles" /></IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); onDownload(); }} label="Download" title="Download"><Icon name="download" /></IconButton>
    </div>
);


export const SkinEditorPage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [enhancementType, setEnhancementType] = useState<EnhancementType>('Face');
    const [enhancementMode, setEnhancementMode] = useState<EnhancementMode>('Standard');
    const [skinTexture, setSkinTexture] = useState(0.37);
    const [skinRealism, setSkinRealism] = useState(1.7);
    const [agreeToPractices, setAgreeToPractices] = useState(true);
    const [preservedAreas, setPreservedAreas] = useState(initialPreservedAreas);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedCount = useMemo(() => Object.values(preservedAreas).filter(Boolean).length, [preservedAreas]);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
    };

    const handleReset = () => {
        setEnhancementType('Face');
        setEnhancementMode('Standard');
        setSkinTexture(0.37);
        setSkinRealism(1.7);
        setAgreeToPractices(true);
        setPreservedAreas(initialPreservedAreas);
        setImageFile(null);
        setImagePreview(null);
        setResultImage(null);
        setError(null);
    };
    
    const handleEnhance = () => {
        if (!imagePreview) return;
        setIsLoading(true);
        setError(null);
        // Mock API call
        setTimeout(() => {
            // Using a different image for result to show the comparator works
            setResultImage('https://i.imgur.com/eC29h2B.jpeg');
            setIsLoading(false);
        }, 2500);
    };
    
    return (
        <div className="flex flex-col md:flex-row flex-1 min-h-0 animate-fade-in">
            {/* Left Sidebar */}
            <aside className="bg-card border-b md:border-b-0 md:border-r border-border md:w-[380px] flex-shrink-0 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Skin Editor</h2>
                        <p className="text-sm text-muted-foreground mt-1">Enhance and retouch skin realistically.</p>
                    </div>
                    <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">Reset</button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
                    {/* Input Image */}
                    <div>
                        <h3 className="font-semibold text-md mb-2">Input Image</h3>
                        {imagePreview ? (
                             <div className="relative">
                                <img src={imagePreview} alt="Input" className="w-full aspect-square object-cover rounded-md bg-muted"/>
                                <button onClick={() => {setImageFile(null); setImagePreview(null); setResultImage(null)}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm">
                                    <Icon name="close" className="w-4 h-4" />
                                </button>
                             </div>
                        ) : (
                            <FileUpload onFileUpload={handleFileUpload} label="Upload an image to enhance" />
                        )}
                    </div>
                    
                    {/* Enhancement Controls */}
                    <div className="space-y-4">
                        <ToggleButtonGroup options={['Face', 'Body']} selected={enhancementType} onSelect={(v) => setEnhancementType(v as EnhancementType)} />
                        <div className="p-3 border rounded-md bg-background flex justify-between items-center">
                            <p className="font-semibold text-sm">Face Detection & Cropping <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ms-1">Recommended</span></p>
                            <button className="text-sm font-semibold text-primary">Crop</button>
                        </div>
                        <ToggleButtonGroup options={['Standard', 'Detailed', 'Heavy']} selected={enhancementMode} onSelect={(v) => setEnhancementMode(v as EnhancementMode)} columns={3} />
                        <p className="text-xs text-muted-foreground text-center">Balanced enhancement suitable for most images. Keeps image identity intact.</p>
                        
                        <SliderControl label="Skin Texture Adjuster" value={skinTexture} min={0} max={1} step={0.01} onChange={setSkinTexture} minLabel="Smooth" maxLabel="Detailed" />
                        <SliderControl label="Skin Realism Level" value={skinRealism} min={0} max={3} step={0.1} onChange={setSkinRealism} minLabel="Stylized" maxLabel="Realistic" />
                    </div>

                    {/* Preserve Areas */}
                    <div>
                         <h3 className="font-semibold text-md">Keep Certain Areas Unchanged</h3>
                         <p className="text-sm text-muted-foreground mt-1">Control which facial features will be preserved.</p>
                         <div className="flex items-center gap-4 mt-3 mb-3">
                            <div className="px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full">{selectedCount} selected</div>
                            <button onClick={() => setPreservedAreas(initialPreservedAreas)} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Reset all</button>
                         </div>
                         <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Face</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <PreserveAreaToggle label="Skin" checked={preservedAreas.skin} onChange={c => setPreservedAreas(p => ({...p, skin: c}))} />
                                    <PreserveAreaToggle label="Nose" checked={preservedAreas.nose} onChange={c => setPreservedAreas(p => ({...p, nose: c}))} />
                                    <PreserveAreaToggle label="Mouth" checked={preservedAreas.mouth} onChange={c => setPreservedAreas(p => ({...p, mouth: c}))} />
                                    <PreserveAreaToggle label="Upper Lip" checked={preservedAreas.upperLip} onChange={c => setPreservedAreas(p => ({...p, upperLip: c}))} />
                                    <PreserveAreaToggle label="Lower Lip" checked={preservedAreas.lowerLip} onChange={c => setPreservedAreas(p => ({...p, lowerLip: c}))} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Eyes</h4>
                                 <div className="grid grid-cols-2 gap-2">
                                    <PreserveAreaToggle label="Eye General" checked={preservedAreas.eyeGeneral} onChange={c => setPreservedAreas(p => ({...p, eyeGeneral: c}))} />
                                    <PreserveAreaToggle label="Left Eye" checked={preservedAreas.leftEye} onChange={c => setPreservedAreas(p => ({...p, leftEye: c}))} />
                                    <PreserveAreaToggle label="Right Eye" checked={preservedAreas.rightEye} onChange={c => setPreservedAreas(p => ({...p, rightEye: c}))} />
                                    <PreserveAreaToggle label="Left Brow" checked={preservedAreas.leftBrow} onChange={c => setPreservedAreas(p => ({...p, leftBrow: c}))} />
                                    <PreserveAreaToggle label="Right Brow" checked={preservedAreas.rightBrow} onChange={c => setPreservedAreas(p => ({...p, rightBrow: c}))} />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="p-4 border-t mt-auto space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Icon name="info" className="w-4 h-4" /> Cost: 100.00 Credits</span>
                        <span className="text-muted-foreground">960 × 1020 px</span>
                    </div>
                    <div className="flex items-center">
                        <input id="agree" type="checkbox" checked={agreeToPractices} onChange={e => setAgreeToPractices(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="agree" className="ms-2 block text-sm text-muted-foreground">Yes, I have read the <a href="#" className="font-medium text-primary hover:underline">best practices</a></label>
                    </div>
                    <button onClick={handleEnhance} disabled={isLoading || !imagePreview} className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {isLoading ? <><Icon name="spinner" className="w-5 h-5 animate-spin" /> Enhancing...</> : 'Enhance Face'}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">Use smaller images (512px) for testing. Higher resolution images consume more credits.</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Icon name="spinner" className="w-8 h-8 animate-spin text-primary" />
                        <span>Enhancing image...</span>
                    </div>
                ) : resultImage && imagePreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-full h-full max-w-[calc(100vh-8rem)] aspect-square">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                        <ResultActions
                            onUpscale={() => alert('Upscale Image clicked')}
                            onUpscalePortrait={() => alert('Upscale Portrait clicked')}
                            onGenerateVideo={() => alert('Generate Video clicked')}
                            onAnimate={() => alert('Animate clicked')}
                            onDownload={() => alert('Download clicked')}
                        />
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Icon name="image" className="w-16 h-16 mx-auto" />
                        <p>Your enhanced image will appear here</p>
                    </div>
                )}
            </main>
        </div>
    );
};
