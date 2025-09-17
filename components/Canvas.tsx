
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { AspectRatio, EditorMode, TextOverlay, BrandKit, WatermarkSettings, HistoryItem } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { ColorPalette } from './ColorPalette';
import { ImageComparator } from './ImageComparator';
import { Tooltip } from './Tooltip';

interface CanvasProps {
    productImagePreview: string | null;
    generatedImages: string[];
    generatedVideoUrl: string | null;
    selectedImageIndex: number | null;
    onSelectImage: (index: number) => void;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    onStartOver: () => void;
    onRetry: () => void;
    onEnhance: () => void;
    onMagicEdit: (imageWithMaskBase64: string, prompt: string) => void;
    onRemoveObject: (imageWithMaskBase64: string) => void;
    onExpandImage: (direction: 'up' | 'down' | 'left' | 'right') => void;
    onGenerateCopy: () => void;
    aspectRatio: AspectRatio;
    editorMode: EditorMode;
    setEditorMode: (mode: EditorMode) => void;
    textOverlays: TextOverlay[];
    setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
    brandKit: BrandKit | undefined;
    watermarkSettings: WatermarkSettings;
    currentHistoryItem: HistoryItem | undefined;
    onExtractPalette: () => void;
}

const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl">
        <Icon name="image" className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Your Creations Appear Here</h3>
        <p className="text-sm text-muted-foreground">Upload a product photo and generate an image or video.</p>
    </div>
);

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
        <Icon name="spinner" className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground animate-pulse text-center px-4">{message}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="absolute inset-0 bg-destructive/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl p-4 text-center">
        <div className="bg-destructive/80 p-6 rounded-lg border border-destructive">
            <Icon name="error" className="w-10 h-10 text-destructive-foreground mx-auto mb-3" />
            <h3 className="font-bold text-destructive-foreground">Generation Failed</h3>
            <p className="text-sm text-destructive-foreground/80 mb-4 max-w-xs">{message}</p>
            <button onClick={onRetry} className="bg-destructive-foreground/20 hover:bg-destructive-foreground/30 text-destructive-foreground font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                Try Again
            </button>
        </div>
    </div>
);

const MagicEditControls: React.FC<{ onSubmit: (prompt: string) => void, onCancel: () => void, brushSize: number, setBrushSize: (size: number) => void }> = ({ onSubmit, onCancel, brushSize, setBrushSize }) => {
    const [prompt, setPrompt] = useState('');
    return (
        <div className="absolute bottom-20 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-lg z-40 flex items-center gap-4 animate-fade-in border shadow-lg">
             <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Brush:</label>
                <input type="range" min="10" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-primary"/>
            </div>
            <input 
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your edit (e.g. 'add a flower' or 'remove the scratch')..."
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <button onClick={() => onSubmit(prompt)} disabled={!prompt} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50">Apply</button>
            <button onClick={onCancel} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent h-9 px-4">Cancel</button>
        </div>
    );
};

const RemoveObjectControls: React.FC<{ onApply: () => void, onCancel: () => void, brushSize: number, setBrushSize: (size: number) => void }> = ({ onApply, onCancel, brushSize, setBrushSize }) => (
    <div className="absolute bottom-20 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-lg z-40 flex items-center gap-4 animate-fade-in border shadow-lg">
         <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Brush:</label>
            <input type="range" min="10" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-primary"/>
        </div>
        <p className="flex-1 text-sm text-muted-foreground hidden sm:block">Erase the object you want to remove.</p>
        <button onClick={onApply} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">Apply</button>
        <button onClick={onCancel} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent h-9 px-4">Cancel</button>
    </div>
);

const ExpandControls: React.FC<{ onExpand: (direction: 'up' | 'down' | 'left' | 'right') => void }> = ({ onExpand }) => {
    const buttonClass = "absolute bg-background/70 backdrop-blur-md p-2 rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 z-30";
    const iconClass = "w-6 h-6";

    return (
        <>
            <Tooltip text="Expand Up"><button onClick={() => onExpand('up')} className={`${buttonClass} top-2 left-1/2 -translate-x-1/2`}><Icon name="arrow-up" className={iconClass} /></button></Tooltip>
            <Tooltip text="Expand Down"><button onClick={() => onExpand('down')} className={`${buttonClass} bottom-2 left-1/2 -translate-x-1/2`}><Icon name="arrow-down" className={iconClass} /></button></Tooltip>
            <Tooltip text="Expand Left"><button onClick={() => onExpand('left')} className={`${buttonClass} left-2 top-1/2 -translate-y-1/2`}><Icon name="arrow-left" className={iconClass} /></button></Tooltip>
            <Tooltip text="Expand Right"><button onClick={() => onExpand('right')} className={`${buttonClass} right-2 top-1/2 -translate-y-1/2`}><Icon name="arrow-right" className={iconClass} /></button></Tooltip>
        </>
    );
};

const IconButton: React.FC<{onClick: () => void; label: string; title: string; children: React.ReactNode;}> = ({ onClick, label, title, children }) => (
    <Tooltip text={title}>
        <button onClick={onClick} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 w-10 bg-background/80 hover:bg-accent backdrop-blur-sm" aria-label={label}>
            {children}
        </button>
    </Tooltip>
);

const DropdownMenu: React.FC<{ onSelect: (format: 'png' | 'jpeg') => void; children: React.ReactNode }> = ({ onSelect, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={() => setIsOpen(o => !o)}>{children}</div>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-popover text-popover-foreground rounded-md shadow-lg z-20 animate-fade-in border">
                    <button onClick={() => { onSelect('png'); setIsOpen(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-accent rounded-t-md">Save as PNG</button>
                    <button onClick={() => { onSelect('jpeg'); setIsOpen(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-accent rounded-b-md">Save as JPG</button>
                </div>
            )}
        </div>
    );
};

const InlineTextToolbar: React.FC<{ overlay: TextOverlay, onUpdate: (id: string, updates: Partial<TextOverlay>) => void, onDelete: (id: string) => void, brandKit: BrandKit | undefined }> = ({ overlay, onUpdate, onDelete, brandKit }) => (
    <div className="bg-background/70 backdrop-blur-md p-2 rounded-full flex gap-1 border shadow-lg animate-fade-in">
        <input type="color" value={overlay.color} onChange={e => onUpdate(overlay.id, { color: e.target.value })} className="p-0 h-9 w-9 bg-transparent rounded-full cursor-pointer border-none"/>
        <Tooltip text="Use brand color">
            <button onClick={() => onUpdate(overlay.id, { color: brandKit?.primaryColor || '#FFFFFF' })} className="p-2 h-9 w-9 text-foreground bg-secondary rounded-full hover:bg-accent"><Icon name="brand" className="w-4 h-4" style={{color: brandKit?.primaryColor}} /></button>
        </Tooltip>
        <div className="flex items-center gap-2 px-2">
            <Icon name="text-size" className="w-5 h-5 text-muted-foreground" />
            <input type="range" min="1" max="15" step="0.5" value={overlay.fontSize} onChange={e => onUpdate(overlay.id, { fontSize: Number(e.target.value)})} className="w-24 accent-primary"/>
        </div>
        <button onClick={() => onDelete(overlay.id)} className="p-2 h-9 w-9 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full"><Icon name="trash" className="w-5 h-5"/></button>
    </div>
);

export const Canvas: React.FC<CanvasProps> = ({
    productImagePreview, generatedImages, generatedVideoUrl, selectedImageIndex, onSelectImage,
    isLoading, loadingMessage, error, onStartOver, onRetry, onEnhance, onMagicEdit, onRemoveObject, onExpandImage, onGenerateCopy,
    aspectRatio, editorMode, setEditorMode, textOverlays, setTextOverlays, brandKit,
    watermarkSettings, currentHistoryItem, onExtractPalette
}) => {
    const aspectMap: Record<AspectRatio, string> = { '1:1': 'aspect-square', '4:5': 'aspect-[4/5]', '16:9': 'aspect-video' };
    const hasContent = productImagePreview || generatedImages.length > 0 || generatedVideoUrl;
    const selectedImage = selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null;
    const isVideoMode = !!generatedVideoUrl;

    const [brushSize, setBrushSize] = useState(40);
    const [showComparison, setShowComparison] = useState(false);
    
    const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(null);

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);

    const handleDownloadImage = (format: 'png' | 'jpeg') => {
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
                if (watermarkSettings.useLogo && brandKit?.logo) {
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
                    ctx.font = `bold ${fontSize}px ${brandKit?.font || 'Inter'}`;
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

    const handleDownloadVideo = () => {
        if (!generatedVideoUrl) return;
        const link = document.createElement('a');
        link.href = generatedVideoUrl;
        link.download = `ProductGenius_Video.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const applyTextAndFinalizeDownload = (canvas: HTMLCanvasElement, format: 'png' | 'jpeg') => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalAlpha = 1; // Reset alpha for text overlays
        
        textOverlays.forEach(overlay => {
            const containerWidth = overlay.width / 100 * canvas.width;
            const fontSize = canvas.height * (overlay.fontSize / 100);
            
            ctx.save();
            ctx.translate(overlay.x / 100 * canvas.width, overlay.y / 100 * canvas.height);
            ctx.rotate(overlay.rotation * Math.PI / 180);
            
            ctx.font = `${fontSize}px ${overlay.fontFamily}`;
            ctx.fillStyle = overlay.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Basic text wrapping
            const words = overlay.text.split(' ');
            let line = '';
            let y = 0;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > containerWidth && n > 0) {
                    ctx.fillText(line, 0, y);
                    line = words[n] + ' ';
                    y += fontSize;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 0, y);
            
            ctx.restore();
        });

        const link = document.createElement('a');
        link.download = `ProductGenius_Image.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        if ((editorMode !== 'magic-edit' && editorMode !== 'remove-object') || !canvasRef.current || !imageRef.current || !selectedImage) return;
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
        if (editorMode !== 'text') {
            setActiveTextOverlayId(null);
        }
    }, [editorMode]);
    
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if ((editorMode !== 'magic-edit' && editorMode !== 'remove-object') || !canvasRef.current) return;
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

    const handleMagicEditSubmit = (prompt: string) => {
        if(!canvasRef.current) return;
        const imageWithMaskBase64 = canvasRef.current.toDataURL('image/png').split(',')[1];
        onMagicEdit(imageWithMaskBase64, prompt);
    };
    
    const handleRemoveObjectSubmit = () => {
        if(!canvasRef.current) return;
        const imageWithMaskBase64 = canvasRef.current.toDataURL('image/png').split(',')[1];
        onRemoveObject(imageWithMaskBase64);
    };

    // Text Overlay Handlers
    const handleAddText = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editorMode !== 'text' || !imageContainerRef.current) return;
        // Prevent adding text when clicking on an existing overlay
        if ((e.target as HTMLElement).closest('.text-overlay-wrapper')) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newText: TextOverlay = {
            id: crypto.randomUUID(),
            text: 'Your Text Here',
            x, y,
            color: brandKit?.primaryColor || '#FFFFFF',
            fontSize: 5,
            fontFamily: brandKit?.font || 'Inter',
            rotation: 0,
            width: 30, // Default width
        };
        setTextOverlays(prev => [...prev, newText]);
        setActiveTextOverlayId(newText.id);
    };

    const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
        setTextOverlays(overlays => overlays.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const deleteOverlay = (id: string) => {
        setTextOverlays(overlays => overlays.filter(o => o.id !== id));
        setActiveTextOverlayId(null);
    };
    
    const activeOverlay = textOverlays.find(o => o.id === activeTextOverlayId);
    const isMaskingMode = editorMode === 'magic-edit' || editorMode === 'remove-object';

    return (
        <div className="bg-card border rounded-xl p-2 sm:p-4 flex flex-col items-center justify-center relative w-full h-full shadow-sm">
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            {error && <ErrorDisplay message={error} onRetry={onRetry} />}

            {!hasContent && !isLoading && <Placeholder />}
            
            {hasContent && (
                <div className="flex flex-col w-full h-full items-center justify-between">
                    <div className={`relative w-full flex-1 flex items-center justify-center min-h-0`}>
                        <div ref={imageContainerRef} onMouseDown={handleAddText} className={`relative transition-all duration-300 w-full h-full max-w-full max-h-full ${aspectMap[aspectRatio]} ${editorMode === 'text' ? 'cursor-text' : ''}`}>
                             <div className="w-full h-full" onClick={() => editorMode === 'text' && setActiveTextOverlayId(null)}>
                                {showComparison && productImagePreview && !isVideoMode ? (
                                    <ImageComparator baseImage={productImagePreview} newImage={selectedImage || ''} />
                                ) : isVideoMode ? (
                                    <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />
                                ) : selectedImage ? (
                                    <>
                                        <img ref={imageRef} src={selectedImage} alt={`AI Generated Product ${selectedImageIndex! + 1}`} className={`w-full h-full object-contain rounded-lg transition-opacity ${isMaskingMode ? 'opacity-30' : 'opacity-100'}`} />
                                        {isMaskingMode && (
                                            <canvas ref={canvasRef}
                                                className="absolute top-0 left-0 w-full h-full"
                                                onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw}
                                                onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw}
                                                style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2 - 1}" fill="rgba(255,255,255,0.5)" stroke="black" stroke-width="1"/></svg>') ${brushSize/2} ${brushSize/2}, auto`}}
                                            />
                                        )}
                                        {textOverlays.map(overlay => (
                                            <InteractiveTextOverlay
                                                key={overlay.id}
                                                overlay={overlay}
                                                containerRef={imageContainerRef}
                                                isActive={activeTextOverlayId === overlay.id}
                                                onActivate={() => setActiveTextOverlayId(overlay.id)}
                                                onUpdate={updateTextOverlay}
                                                onDelete={deleteOverlay}
                                                brandKit={brandKit}
                                                isTextMode={editorMode === 'text'}
                                            />
                                        ))}
                                    </>
                                ) : productImagePreview && (
                                    <img src={productImagePreview} alt="Uploaded Product" className="w-full h-full object-contain rounded-lg" />
                                )}
                             </div>
                            
                            {(selectedImage || generatedVideoUrl) && !isLoading && !showComparison && (
                                <>
                                 {!isVideoMode && <EditorToolbar mode={editorMode} setMode={setEditorMode} />}
                                 <div className="absolute top-4 right-4 flex gap-2">
                                    {!isVideoMode && <IconButton onClick={() => setShowComparison(true)} label="Compare with Original" title="Compare with Original"><Icon name="compare" /></IconButton>}
                                    {!isVideoMode && <IconButton onClick={onEnhance} label="Enhance Image" title="Enhance Image"><Icon name="wand" /></IconButton>}
                                    {!isVideoMode && <IconButton onClick={onGenerateCopy} label="Generate Marketing Copy" title="Generate Marketing Copy"><Icon name="pencil" /></IconButton>}
                                    
                                    {isVideoMode ? (
                                        <IconButton onClick={handleDownloadVideo} label="Download Video" title="Download Video"><Icon name="download" /></IconButton>
                                    ) : (
                                        <DropdownMenu onSelect={handleDownloadImage}>
                                             <IconButton onClick={() => {}} label="Download Image" title="Download Image"><Icon name="download" /></IconButton>
                                        </DropdownMenu>
                                    )}
                                    <IconButton onClick={onStartOver} label="Start Over" title="Start Over"><Icon name="restart" /></IconButton>
                                  </div>
                                </>
                            )}
                             {showComparison && (
                                <IconButton onClick={() => setShowComparison(false)} label="Exit Comparison" title="Exit Comparison"><Icon name="close" /></IconButton>
                             )}
                            {editorMode === 'magic-edit' && <MagicEditControls onSubmit={handleMagicEditSubmit} onCancel={() => setEditorMode('view')} brushSize={brushSize} setBrushSize={setBrushSize} />}
                            {editorMode === 'remove-object' && <RemoveObjectControls onApply={handleRemoveObjectSubmit} onCancel={() => setEditorMode('view')} brushSize={brushSize} setBrushSize={setBrushSize} />}
                            {editorMode === 'expand' && <ExpandControls onExpand={onExpandImage} />}

                        </div>
                    </div>
                    
                    <div className="w-full flex-shrink-0 pt-4 flex justify-between items-end gap-4">
                        <div className="flex-1">
                            {generatedImages.length > 1 && !isVideoMode && (
                                <div className="flex justify-center items-center gap-3">
                                    {generatedImages.map((img, index) => (
                                        <button key={index} onClick={() => onSelectImage(index)}
                                            className={`w-20 h-20 rounded-md overflow-hidden transition-all duration-200 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${selectedImageIndex === index ? 'ring-2 ring-primary scale-105' : 'ring-1 ring-border hover:ring-primary/50'}`}>
                                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                         {currentHistoryItem && !isVideoMode && (
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

const InteractiveTextOverlay: React.FC<{
    overlay: TextOverlay;
    containerRef: React.RefObject<HTMLDivElement>;
    isActive: boolean;
    onActivate: () => void;
    onUpdate: (id: string, updates: Partial<TextOverlay>) => void;
    onDelete: (id: string) => void;
    brandKit: BrandKit | undefined;
    isTextMode: boolean;
}> = ({ overlay, containerRef, isActive, onActivate, onUpdate, onDelete, brandKit, isTextMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<{ type: 'drag' | 'resize' | 'rotate', startX: number, startY: number, initialOverlay: TextOverlay } | null>(null);

    const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize' | 'rotate') => {
        if (!isTextMode) return;
        e.stopPropagation();
        onActivate();
        actionRef.current = { type, startX: e.clientX, startY: e.clientY, initialOverlay: overlay };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!actionRef.current || !containerRef.current) return;
        const { type, startX, startY, initialOverlay } = actionRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        
        const dx = (e.clientX - startX) / rect.width * 100;
        const dy = (e.clientY - startY) / rect.height * 100;

        if (type === 'drag') {
            onUpdate(overlay.id, { x: initialOverlay.x + dx, y: initialOverlay.y + dy });
        } else if (type === 'rotate') {
             const centerX = initialOverlay.x / 100 * rect.width + rect.left;
             const centerY = initialOverlay.y / 100 * rect.height + rect.top;
             const startAngle = Math.atan2(startY - centerY, startX - centerX);
             const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
             const angleDiff = (currentAngle - startAngle) * 180 / Math.PI;
             onUpdate(overlay.id, { rotation: initialOverlay.rotation + angleDiff });
        } else if (type === 'resize') {
            const newWidth = initialOverlay.width + dx;
            onUpdate(overlay.id, { width: Math.max(5, newWidth) }); // Min width 5%
        }
    };
    
    const handleMouseUp = () => {
        actionRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleDoubleClick = () => {
        if (!isTextMode) return;
        setIsEditing(true);
        setTimeout(() => textRef.current?.focus(), 0);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (textRef.current) {
            onUpdate(overlay.id, { text: textRef.current.innerText });
        }
    };

    return (
        <div
            className="text-overlay-wrapper absolute"
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                width: `${overlay.width}%`,
                transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                cursor: isTextMode ? (isEditing ? 'text' : 'move') : 'default',
                pointerEvents: isTextMode ? 'auto' : 'none',
            }}
        >
            {isActive && isTextMode && (
                <div
                    className="absolute bottom-full left-1/2 mb-2 z-30"
                    style={{ transform: `translateX(-50%) rotate(${-overlay.rotation}deg)` }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <InlineTextToolbar
                        overlay={overlay}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        brandKit={brandKit}
                    />
                </div>
            )}
            <div
                ref={textRef}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={handleBlur}
                className="w-full h-full text-center outline-none"
                style={{
                    color: overlay.color,
                    fontSize: `clamp(8px, ${overlay.fontSize}vh, 200px)`,
                    fontFamily: overlay.fontFamily,
                    lineHeight: 1.2,
                }}
            >
                {overlay.text}
            </div>
            {isActive && isTextMode && (
                <>
                    <div className="absolute -inset-1 border-2 border-dashed border-primary pointer-events-none" />
                    <div 
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-background rounded-full cursor-alias flex items-center justify-center shadow-lg border-2 border-primary"
                        style={{ transform: `translateX(-50%) rotate(${-overlay.rotation}deg)` }}
                        onMouseDown={e => handleMouseDown(e, 'rotate')}
                    >
                         <Icon name="rotate-cw" className="w-3 h-3 text-primary" />
                    </div>
                    <div 
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary rounded-sm cursor-se-resize border-2 border-background shadow-md"
                        onMouseDown={e => handleMouseDown(e, 'resize')}
                    />
                </>
            )}
        </div>
    );
};