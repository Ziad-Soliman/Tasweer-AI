import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from '../components/FileUpload';
import { Icon } from '../components/Icon';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../App';
import { ImageComparator } from '../components/ImageComparator';

export const EditPage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [brushSize, setBrushSize] = useState(40);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setResultImage(null);
        setError(null);
    };

    useEffect(() => {
        if (!imagePreview || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imagePreview;
        img.onload = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const { width, height } = parent.getBoundingClientRect();
                const aspectRatio = img.width / img.height;
                let newWidth = width;
                let newHeight = width / aspectRatio;

                if (newHeight > height) {
                    newHeight = height;
                    newWidth = height * aspectRatio;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                
                canvas.style.width = `${newWidth}px`;
                canvas.style.height = `${newHeight}px`;

                ctx.drawImage(img, 0, 0);
            }
        }
    }, [imagePreview]);

    const getBrushPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0] : null;
        const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing.current = true;
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        canvasRef.current?.getContext('2d')?.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        const pos = getBrushPos(canvasRef.current, e);
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const handleApply = async () => {
        if (!canvasRef.current || !prompt) return;
        setIsLoading(true);
        setError(null);
        try {
            const imageWithMask = canvasRef.current.toDataURL('image/png').split(',')[1];
            const resultBase64 = await geminiService.magicEditImage(imageWithMask, prompt);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Magic Edit failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
            {!imagePreview ? (
                <div className="m-auto flex flex-col items-center text-center max-w-md">
                    <Icon name="edit" className="w-24 h-24 text-primary/50" />
                    <h1 className="text-4xl font-bold mt-4">Draw to Edit</h1>
                    <p className="text-muted-foreground mt-2">Upload an image, mask an area, and describe your changes to transform your pictures with AI.</p>
                    <div className="w-full mt-8">
                        <FileUpload onFileUpload={handleFileUpload} label={t('uploadToEdit')} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 items-center w-full max-w-4xl">
                    <div className="w-full">
                        {resultImage && imagePreview ? (
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        ) : (
                            <div 
                                className="relative w-full max-w-2xl mx-auto flex items-center justify-center"
                                style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2 - 1}" fill="rgba(255,255,255,0.5)" stroke="black" stroke-width="1"/></svg>') ${brushSize/2} ${brushSize/2}, auto`}}
                            >
                                <img src={imagePreview} alt="Original" className="max-w-full max-h-[60vh] object-contain opacity-40 rounded-lg" />
                                <canvas 
                                    ref={canvasRef} 
                                    className="absolute inset-0 m-auto"
                                    onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw}
                                    onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw}
                                />
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-2xl p-4 bg-card border rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('magicEditBrush')}</label>
                            <input type="range" min="10" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-primary"/>
                        </div>
                        <input
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder={t('magicEditorPrompt')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
                            disabled={isLoading}
                        />
                        <button onClick={handleApply} disabled={!prompt || isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 w-full md:w-auto">
                            {isLoading ? (<Icon name="spinner" className="animate-spin w-5 h-5" />) : (<Icon name="sparkles" className="w-5 h-5" />)}
                            {t('magicEditApply')}
                        </button>
                    </div>
                     {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
            )}
        </div>
    );
};
