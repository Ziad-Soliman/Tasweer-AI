import React, { useState, useRef } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import { useTranslation } from '../../App';
import * as geminiService from '../../services/geminiService';
import { ImageComparator } from '../../components/ImageComparator';
import { PHOTO_STYLES } from '../../constants';
import { SketchCanvas, SketchCanvasRef } from '../../components/SketchCanvas';
import { FileUpload } from '../../components/FileUpload';

interface MiniAppProps {
    onBack: () => void;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: () => void;
    isLoading: boolean;
    prompt: string;
    setPrompt: (p: string) => void;
    style: string;
    setStyle: (s: string) => void;
    brushColor: string;
    setBrushColor: (c: string) => void;
    brushSize: number;
    setBrushSize: (s: number) => void;
    onFileUpload: (file: File) => void;
    referenceImageFile: File | null;
    sketchCanvasRef: React.RefObject<SketchCanvasRef>;
}> = (props) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button onClick={props.onBack} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name="arrow-left" className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-lg font-semibold">{t('sketch-to-image-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('sketch-to-image-desc')}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Reference Image (Optional)</h3>
                <FileUpload onFileUpload={props.onFileUpload} label="Upload reference image" uploadedFileName={props.referenceImageFile?.name} />
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Drawing Tools</h3>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground">Color</label>
                    <input type="color" value={props.brushColor} onChange={(e) => props.setBrushColor(e.target.value)} className="p-0 h-8 w-8 bg-transparent border-none cursor-pointer rounded-lg"/>
                </div>
                <div>
                    <label className="text-sm text-muted-foreground">Brush Size</label>
                    <input type="range" min="2" max="50" value={props.brushSize} onChange={(e) => props.setBrushSize(Number(e.target.value))} className="w-full accent-primary mt-1"/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => props.sketchCanvasRef.current?.undo()} className="text-sm p-2 rounded-md bg-secondary hover:bg-accent flex items-center justify-center gap-2"><Icon name="undo" className="w-4 h-4" /> Undo</button>
                    <button onClick={() => props.sketchCanvasRef.current?.redo()} className="text-sm p-2 rounded-md bg-secondary hover:bg-accent flex items-center justify-center gap-2"><Icon name="redo" className="w-4 h-4" /> Redo</button>
                    <button onClick={() => props.sketchCanvasRef.current?.clear()} className="text-sm p-2 rounded-md bg-secondary hover:bg-accent flex items-center justify-center gap-2"><Icon name="trash" className="w-4 h-4" /> Clear</button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">AI Prompt</h3>
                <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <textarea value={props.prompt} onChange={(e) => props.setPrompt(e.target.value)} placeholder={t('sketchPrompt')} className="w-full bg-background border-input rounded-md p-2 text-sm min-h-[100px] resize-none mt-1"/>
                </div>
                <div>
                    <label className="text-sm text-muted-foreground">Style</label>
                    <select value={props.style} onChange={(e) => props.setStyle(e.target.value)} className="h-10 w-full rounded-md border-input bg-background px-3 py-2 text-sm mt-1">
                        {PHOTO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <button onClick={props.onGenerate} disabled={props.isLoading || !props.prompt} className="mt-auto h-12 bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {props.isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <><Icon name="sparkles" className="w-5 h-5" /> {t('generateFromSketch')}</>}
            </button>
        </div>
    );
};

const SketchToImage: React.FC<MiniAppProps> = ({ onBack }) => {
    const [brushColor, setBrushColor] = useState('#FFFFFF');
    const [brushSize, setBrushSize] = useState(10);
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Photorealistic');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [comparisonBase, setComparisonBase] = useState<string | null>(null);
    const sketchCanvasRef = useRef<SketchCanvasRef>(null);

    const handleFileUpload = (file: File) => {
        setReferenceImageFile(file);
        setReferenceImagePreview(URL.createObjectURL(file));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!sketchCanvasRef.current || !prompt) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        
        try {
            const sketchBase64 = await sketchCanvasRef.current.exportAsBase64();
            if (!sketchBase64 && !referenceImageFile) {
                setError("Please draw something or upload a reference image.");
                setIsLoading(false);
                return;
            }

            const referenceImageBase64 = referenceImageFile ? await fileToBase64(referenceImageFile) : null;
            
            if (referenceImagePreview) {
                 const canvas = document.createElement('canvas');
                 const ctx = canvas.getContext('2d')!;
                 const bg = new Image();
                 bg.src = referenceImagePreview;
                 await new Promise(res => bg.onload = res);
                 canvas.width = bg.width;
                 canvas.height = bg.height;
                 ctx.drawImage(bg, 0, 0);
                 if (sketchBase64) {
                    const sketchImg = new Image();
                    sketchImg.src = `data:image/png;base64,${sketchBase64}`;
                    await new Promise(res => sketchImg.onload = res);
                    // Draw sketch on top, fitting it to the background image dimensions
                    ctx.drawImage(sketchImg, 0, 0, bg.width, bg.height);
                 }
                 setComparisonBase(canvas.toDataURL());
            } else if (sketchBase64) {
                 setComparisonBase(`data:image/png;base64,${sketchBase64}`);
            }

            const fullPrompt = `${prompt}, in a ${style} style`;
            const resultBase64 = await geminiService.sketchToImage(sketchBase64 || "", fullPrompt, referenceImageBase64);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate image.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <MiniAppLayout 
            controls={
                <Controls
                    onBack={onBack} onGenerate={handleGenerate} isLoading={isLoading}
                    prompt={prompt} setPrompt={setPrompt}
                    style={style} setStyle={setStyle}
                    brushColor={brushColor} setBrushColor={setBrushColor}
                    brushSize={brushSize} setBrushSize={setBrushSize}
                    onFileUpload={handleFileUpload} referenceImageFile={referenceImageFile}
                    sketchCanvasRef={sketchCanvasRef}
                />
            }
        >
             <div className="h-full flex flex-col p-4 items-center justify-center">
                {error && <p className="absolute top-4 text-sm text-destructive">{error}</p>}
                 <div className="w-full h-full max-w-3xl aspect-video relative">
                    {resultImage && comparisonBase ? (
                         <ImageComparator baseImage={comparisonBase} newImage={resultImage} />
                    ) : (
                        <SketchCanvas ref={sketchCanvasRef} brushColor={brushColor} brushSize={brushSize} backgroundImage={referenceImagePreview}/>
                    )}
                </div>
            </div>
        </MiniAppLayout>
    );
};

export default SketchToImage;
