import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { AspectRatio, EditorMode, TextOverlay, BrandKit, WatermarkSettings, HistoryItem } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { ColorPalette } from './ColorPalette';
import { ImageComparator } from './ImageComparator';

interface CanvasProps {
    productImagePreview: string | null;
    generatedImages: string[];
    selectedImageIndex: number | null;
    onSelectImage: (index: number) => void;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    onStartOver: () => void;
    onRetry: () => void;
    onEnhance: () => void;
    onInpaint: (imageWithMaskBase64: string, prompt: string) => void;
    aspectRatio: AspectRatio;
    editorMode: EditorMode;
    setEditorMode: (mode: EditorMode) => void;
    textOverlays: TextOverlay[];
    setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
    brandKit: BrandKit;
    watermarkSettings: WatermarkSettings;
    currentHistoryItem: HistoryItem | undefined;
    onExtractPalette: () => void;
}

const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-500 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
        <Icon name="image" className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Your Images Appear Here</h3>
        <p className="text-sm">Upload a product photo to get started.</p>
    </div>
);

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
        <Icon name="spinner" className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="mt-4 text-lg font-semibold text-gray-200">{message}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl p-4 text-center">
         <Icon name="error" className="w-10 h-10 text-red-300 mb-3" />
        <h3 className="font-bold text-red-200">Generation Failed</h3>
        <p className="text-sm text-red-300 mb-4 max-w-xs">{message}</p>
        <button onClick={onRetry} className="bg-red-500/50 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            Try Again
        </button>
    </div>
);

const InpaintControls: React.FC<{ onSubmit: (prompt: string) => void, onCancel: () => void, brushSize: number, setBrushSize: (size: number) => void }> = ({ onSubmit, onCancel, brushSize, setBrushSize }) => {
    const [prompt, setPrompt] = useState('');
    return (
        <div className="absolute bottom-20 left-4 right-4 bg-gray-900/80 backdrop-blur-md p-3 rounded-lg z-40 flex items-center gap-4 animate-fade-in">
             <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300">Brush:</label>
                <input type="range" min="10" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24"/>
            </div>
            <input 
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe what to add in the erased area..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button onClick={() => onSubmit(prompt)} disabled={!prompt} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50">Apply</button>
            <button onClick={onCancel} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Cancel</button>
        </div>
    );
};

const TextEditor: React.FC<{ overlay: TextOverlay, updateOverlay: (id: string, updates: Partial<TextOverlay>) => void, deleteOverlay: (id: string) => void, brandKit: BrandKit }> = ({ overlay, updateOverlay, deleteOverlay, brandKit }) => {
    return (
        <div className="absolute bottom-20 left-4 right-4 bg-gray-900/80 backdrop-blur-md p-3 rounded-lg z-40 flex items-center gap-4 animate-fade-in">
            <input type="text" value={overlay.text} onChange={e => updateOverlay(overlay.id, { text: e.target.value })} className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Your text here..."/>
            <input type="color" value={overlay.color} onChange={e => updateOverlay(overlay.id, { color: e.target.value })} className="p-1 h-9 w-9 bg-gray-700 rounded-md cursor-pointer"/>
            <button onClick={() => updateOverlay(overlay.id, { color: brandKit.primaryColor })} className="p-2 h-9 text-white text-xs bg-gray-700 rounded-md" title="Use brand color"><Icon name="brand" className="w-4 h-4" style={{color: brandKit.primaryColor}} /></button>
            <div className="flex items-center gap-2">
                <Icon name="text-size" className="w-5 h-5 text-gray-300" />
                <input type="range" min="1" max="15" step="0.5" value={overlay.fontSize} onChange={e => updateOverlay(overlay.id, { fontSize: Number(e.target.value)})} className="w-24"/>
            </div>
            <button onClick={() => deleteOverlay(overlay.id)} className="p-2 bg-red-600/50 hover:bg-red-600 text-white rounded-md"><Icon name="trash" className="w-5 h-5"/></button>
        </div>
    );
};

export const Canvas: React.FC<CanvasProps> = ({
    productImagePreview, generatedImages, selectedImageIndex, onSelectImage,
    isLoading, loadingMessage, error, onStartOver, onRetry, onEnhance, onInpaint,
    aspectRatio, editorMode, setEditorMode, textOverlays, setTextOverlays, brandKit,
    watermarkSettings, currentHistoryItem, onExtractPalette
}) => {
    const aspectMap: Record<AspectRatio, string> = { '1:1': 'aspect-square', '4:5': 'aspect-[4/5]', '16:9': 'aspect-video' };
    const hasContent = productImagePreview || generatedImages.length > 0;
    const selectedImage = selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null;

    const [isDownloadOpen, setDownloadOpen] = useState(false);
    const [brushSize, setBrushSize] = useState(40);
    const [showComparison, setShowComparison] = useState(false);
    
    const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(null);
    const [draggingState, setDraggingState] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null);

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);

    const handleDownload = (format: 'png' | 'jpeg') => {
        if (!selectedImage) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
    
            if (format === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
    
            ctx.drawImage(img, 0, 0);
    
            // Apply watermark
            if (watermarkSettings.enabled) {
                ctx.globalAlpha = watermarkSettings.opacity / 100;
                if (watermarkSettings.useLogo && brandKit.logo) {
                    const logoImg = new Image();
                    logoImg.src = brandKit.logo;
                    logoImg.onload = () => {
                        const logoWidth = canvas.width * (watermarkSettings.scale / 100);
                        const logoHeight = logoWidth * (logoImg.height / logoImg.width);
                        const { x, y } = getWatermarkPosition(canvas.width, canvas.height, logoWidth, logoHeight, watermarkSettings.position);
                        ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
                        applyTextAndFinalizeDownload(canvas, format);
                    }
                } else {
                    const fontSize = canvas.width * (watermarkSettings.scale / 200);
                    ctx.font = `bold ${fontSize}px ${brandKit.font}`;
                    ctx.fillStyle = getContrastingTextColor(ctx, canvas);
                    const textMetrics = ctx.measureText(watermarkSettings.text);
                    const { x, y } = getWatermarkPosition(canvas.width, canvas.height, textMetrics.width, fontSize, watermarkSettings.position);
                    ctx.fillText(watermarkSettings.text, x, y);
                    applyTextAndFinalizeDownload(canvas, format);
                }
            } else {
                 applyTextAndFinalizeDownload(canvas, format);
            }
        };
        img.src = selectedImage;
    };
    
    const applyTextAndFinalizeDownload = (canvas: HTMLCanvasElement, format: 'png' | 'jpeg') => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalAlpha = 1; // Reset alpha for text overlays
        textOverlays.forEach(overlay => {
            const fontSize = canvas.height * (overlay.fontSize / 100);
            ctx.font = `${fontSize}px ${overlay.fontFamily}`;
            ctx.fillStyle = overlay.color;
            ctx.fillText(overlay.text, overlay.x * canvas.width / 100, overlay.y * canvas.height / 100);
        });

        const link = document.createElement('a');
        link.download = `ProductGenius_Image.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadOpen(false);
    };

    const getWatermarkPosition = (cw: number, ch: number, ww: number, wh: number, pos: WatermarkSettings['position']) => {
        const p = 10; // padding
        let x = 0, y = 0;
        if (pos.includes('left')) x = p;
        if (pos.includes('center')) x = (cw - ww) / 2;
        if (pos.includes('right')) x = cw - ww - p;
        if (pos.includes('top')) y = wh + p;
        if (pos.includes('middle')) y = (ch + wh) / 2;
        if (pos.includes('bottom')) y = ch - p;
        return { x, y };
    };

    const getContrastingTextColor = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        // A simple check at a few points to determine if background is light or dark
        const samplePoints = [ {x: canvas.width * 0.8, y: canvas.height * 0.8}, {x: canvas.width * 0.2, y: canvas.height * 0.2} ];
        let totalLuminance = 0;
        samplePoints.forEach(p => {
            const pixel = ctx.getImageData(p.x, p.y, 1, 1).data;
            totalLuminance += (0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]);
        });
        return (totalLuminance / samplePoints.length) > 128 ? '#000000' : '#FFFFFF';
    };


    useEffect(() => {
        if (editorMode !== 'inpaint' || !canvasRef.current || !imageRef.current || !selectedImage) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedImage;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }

    }, [editorMode, selectedImage]);
    
    useEffect(() => {
        if (editorMode === 'text') {
            setActiveTextOverlayId(null); // Deselect when entering text mode
        }
    }, [editorMode]);
    
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (editorMode !== 'inpaint' || !canvasRef.current) return;
        isDrawing.current = true;
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) ctx.beginPath();
    };

    const getBrushPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0] : null;
        const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getBrushPos(canvas, e);
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'destination-out';
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const handleInpaintSubmit = (prompt: string) => {
        if(!canvasRef.current) return;
        const imageWithMaskBase64 = canvasRef.current.toDataURL('image/png').split(',')[1];
        onInpaint(imageWithMaskBase64, prompt);
    };

    // Text Overlay Handlers
    const handleAddText = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editorMode !== 'text' || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newText: TextOverlay = {
            id: crypto.randomUUID(),
            text: 'Your Text Here',
            x, y,
            color: brandKit.primaryColor,
            fontSize: 5,
            fontFamily: brandKit.font,
        };
        setTextOverlays(prev => [...prev, newText]);
        setActiveTextOverlayId(newText.id);
    };

    const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
        setTextOverlays(overlays => overlays.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const deleteTextOverlay = (id: string) => {
        setTextOverlays(overlays => overlays.filter(o => o.id !== id));
        setActiveTextOverlayId(null);
    };

    const handleTextDragStart = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
        if (!imageContainerRef.current || editorMode !== 'text') return;
        const overlay = textOverlays.find(o => o.id === id);
        if (!overlay) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const initialX = (e.clientX - rect.left) / rect.width * 100;
        const initialY = (e.clientY - rect.top) / rect.height * 100;
        
        setDraggingState({ id, offsetX: overlay.x - initialX, offsetY: overlay.y - initialY });
        setActiveTextOverlayId(id);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggingState || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100 + draggingState.offsetX;
        let y = ((e.clientY - rect.top) / rect.height) * 100 + draggingState.offsetY;
        
        // Clamp position within bounds
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        updateTextOverlay(draggingState.id, { x, y });
    }, [draggingState, textOverlays]);
    
    const handleMouseUp = useCallback(() => {
        setDraggingState(null);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const activeOverlay = textOverlays.find(o => o.id === activeTextOverlayId);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 flex flex-col items-center justify-center relative w-full h-full shadow-lg">
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            {error && <ErrorDisplay message={error} onRetry={onRetry} />}

            {!hasContent && !isLoading && <Placeholder />}
            
            {hasContent && (
                <div className="flex flex-col w-full h-full items-center justify-between">
                    <div className={`relative w-full flex-1 flex items-center justify-center min-h-0`}>
                        <div ref={imageContainerRef} onMouseDown={handleAddText} className={`relative transition-all duration-300 w-full h-full max-w-full max-h-full ${aspectMap[aspectRatio]}`}>
                             <div className="w-full h-full">
                                {showComparison && productImagePreview ? (
                                    <ImageComparator baseImage={productImagePreview} newImage={selectedImage || ''} />
                                ) : selectedImage ? (
                                    <>
                                        <img ref={imageRef} src={selectedImage} alt={`AI Generated Product ${selectedImageIndex! + 1}`} className={`w-full h-full object-contain rounded-lg transition-opacity ${editorMode === 'inpaint' ? 'opacity-30' : 'opacity-100'}`} />
                                        {editorMode === 'inpaint' && (
                                            <canvas ref={canvasRef}
                                                className="absolute top-0 left-0 w-full h-full cursor-none"
                                                onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw}
                                                onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw}
                                                style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2 - 1}" fill="rgba(255,255,255,0.5)" stroke="black" stroke-width="1"/></svg>') ${brushSize/2} ${brushSize/2}, auto`}}
                                            />
                                        )}
                                         {textOverlays.map(overlay => (
                                            <div key={overlay.id}
                                                onMouseDown={e => { e.stopPropagation(); handleTextDragStart(e, overlay.id); }}
                                                className={`absolute select-none p-1 transition-all ${editorMode === 'text' ? 'cursor-move border border-dashed border-indigo-400' : 'cursor-default'} ${activeTextOverlayId === overlay.id ? 'border-indigo-400' : 'border-transparent'}`}
                                                style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: 'translate(-50%, -50%)', color: overlay.color, fontSize: `clamp(8px, ${overlay.fontSize}vh, 200px)`, fontFamily: overlay.fontFamily }}
                                            >
                                                {overlay.text}
                                            </div>
                                         ))}
                                    </>
                                ) : productImagePreview && (
                                    <img src={productImagePreview} alt="Uploaded Product" className="w-full h-full object-contain rounded-lg" />
                                )}
                             </div>
                            
                            {selectedImage && !isLoading && !showComparison && (
                                <>
                                 <EditorToolbar mode={editorMode} setMode={setEditorMode} />
                                 <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => setShowComparison(true)} className="bg-gray-900/70 hover:bg-gray-900 text-white p-2.5 rounded-full backdrop-blur-sm transition-colors" aria-label="Compare with Original" title="Compare with Original"><Icon name="compare" /></button>
                                    <button onClick={onEnhance} className="bg-gray-900/70 hover:bg-gray-900 text-white p-2.5 rounded-full backdrop-blur-sm transition-colors" aria-label="Enhance Image" title="Enhance Image"><Icon name="wand" /></button>
                                    <div className="relative">
                                        <button onClick={() => setDownloadOpen(o => !o)} className="bg-gray-900/70 hover:bg-gray-900 text-white p-2.5 rounded-full backdrop-blur-sm transition-colors" aria-label="Download Image" title="Download Image"><Icon name="download" /></button>
                                        {isDownloadOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-28 bg-gray-900/80 backdrop-blur-md rounded-md shadow-lg z-20 animate-fade-in">
                                                <button onClick={() => handleDownload('png')} className="w-full text-left text-sm text-white px-3 py-2 hover:bg-indigo-600/50 rounded-t-md">Save as PNG</button>
                                                <button onClick={() => handleDownload('jpeg')} className="w-full text-left text-sm text-white px-3 py-2 hover:bg-indigo-600/50 rounded-b-md">Save as JPG</button>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={onStartOver} className="bg-gray-900/70 hover:bg-gray-900 text-white p-2.5 rounded-full backdrop-blur-sm transition-colors" aria-label="Start Over" title="Start Over"><Icon name="restart" /></button>
                                  </div>
                                </>
                            )}
                             {showComparison && (
                                <button onClick={() => setShowComparison(false)} className="absolute top-4 right-4 bg-gray-900/70 hover:bg-gray-900 text-white p-2.5 rounded-full backdrop-blur-sm transition-colors" aria-label="Exit Comparison" title="Exit Comparison"><Icon name="close" /></button>
                             )}
                            {editorMode === 'inpaint' && <InpaintControls onSubmit={handleInpaintSubmit} onCancel={() => setEditorMode('view')} brushSize={brushSize} setBrushSize={setBrushSize} />}
                            {editorMode === 'text' && activeOverlay && <TextEditor overlay={activeOverlay} updateOverlay={updateTextOverlay} deleteOverlay={deleteTextOverlay} brandKit={brandKit} />}
                        </div>
                    </div>
                    
                    <div className="w-full flex-shrink-0 pt-4 flex justify-between items-end gap-4">
                        <div className="flex-1">
                            {generatedImages.length > 1 && (
                                <div className="flex justify-center items-center gap-3">
                                    {generatedImages.map((img, index) => (
                                        <button key={index} onClick={() => onSelectImage(index)}
                                            className={`w-20 h-20 rounded-md overflow-hidden transition-all duration-200 ${selectedImageIndex === index ? 'ring-2 ring-indigo-500 scale-105' : 'ring-2 ring-transparent hover:ring-indigo-600/50'}`}>
                                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                         {currentHistoryItem && (
                            <div className="flex-shrink-0">
                                <ColorPalette palette={currentHistoryItem.palette} onExtract={onExtractPalette} />
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
