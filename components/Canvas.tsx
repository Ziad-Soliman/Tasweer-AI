import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Icon } from './Icon';
import { AspectRatio, EditorMode, TextOverlay, BrandKit, WatermarkSettings, HistoryItem } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { ColorPalette } from './ColorPalette';
import { ImageComparator } from './ImageComparator';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../App';

interface CanvasProps {
    productImagePreview: string | null;
    generatedImages: string[];
    generatedVideoUrl: string | null;
    selectedImageIndex: number | null;
    onSelectImage: (index: number | null) => void;
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
    palette: string[] | undefined;
    onExtractPalette: () => void;
}

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
        <Icon name="spinner" className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground animate-pulse text-center px-4">{message}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 bg-destructive/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl p-4 text-center">
            <div className="bg-destructive/80 p-6 rounded-lg border border-destructive">
                <Icon name="error" className="w-10 h-10 text-destructive-foreground mx-auto mb-3" />
                <h3 className="font-bold text-destructive-foreground">{t('generationFailed')}</h3>
                <p className="text-sm text-destructive-foreground/80 mb-4 max-w-xs">{message}</p>
                <button onClick={onRetry} className="bg-destructive-foreground/20 hover:bg-destructive-foreground/30 text-destructive-foreground font-semibold px-4 py-2 rounded-md">{t('tryAgain')}</button>
            </div>
        </div>
    );
};

// FIX: Added missing handleDownload function to enable downloading the selected image.
const handleDownload = (src: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// FIX: Reconstructed the Canvas component and added the named export.
export const Canvas: React.FC<CanvasProps> = (props) => {
    const {
        generatedImages, isLoading, loadingMessage, error, onRetry, editorMode, setEditorMode,
        onMagicEdit, onRemoveObject, onExpandImage, onEnhance, onGenerateCopy, onExtractPalette, palette
    } = props;
    const { t } = useTranslation();
    const [compareWith, setCompareWith] = useState<string | null>(null);
    const [magicEditPrompt, setMagicEditPrompt] = useState('');
    const [brushSize, setBrushSize] = useState(40);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    const selectedImage = useMemo(() => generatedImages[0] || null, [generatedImages]);

    useEffect(() => {
        // Reset state when selected image changes
        setCompareWith(null);
        setMagicEditPrompt('');
        if (editorMode !== 'view') setEditorMode('view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImage]);
    
    // Drawing logic
    useEffect(() => {
        if (!selectedImage || !canvasRef.current || (editorMode !== 'magic-edit' && editorMode !== 'remove-object')) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImage;
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
        };
    }, [selectedImage, editorMode]);

    const getBrushPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const touch = e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0] : null;
        const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        isDrawing.current = true;
        const { x, y } = getBrushPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }, [getBrushPos]);

    const stopDrawing = useCallback(() => { isDrawing.current = false; }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        const { x, y } = getBrushPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [brushSize, getBrushPos]);

    const handleMagicApply = () => {
        if (!canvasRef.current) return;
        const imageWithMask = canvasRef.current.toDataURL('image/png').split(',')[1];
        if (editorMode === 'magic-edit' && magicEditPrompt) {
            onMagicEdit(imageWithMask, magicEditPrompt);
        } else if (editorMode === 'remove-object') {
            onRemoveObject(imageWithMask);
        }
    };

    const renderCanvasContent = () => {
        if (compareWith) return <ImageComparator baseImage={compareWith} newImage={selectedImage!} />;

        const isEditing = editorMode === 'magic-edit' || editorMode === 'remove-object';

        return (
            <div className="relative w-full h-full" style={isEditing ? { cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2 - 1}" fill="rgba(255,255,255,0.5)" stroke="black" stroke-width="1"/></svg>') ${brushSize/2} ${brushSize/2}, auto` } : {}}>
                {isEditing && <img src={selectedImage!} alt="background" className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none" />}
                <canvas ref={canvasRef} className={`w-full h-full object-contain ${isEditing ? '' : 'hidden'}`} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} />
                {!isEditing && selectedImage && <img src={selectedImage} alt="Generated result" className="w-full h-full object-contain" />}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-muted relative">
            <div className="flex-1 relative flex items-center justify-center p-8">
                {isLoading && <LoadingOverlay message={loadingMessage} />}
                {error && !isLoading && <ErrorDisplay message={error} onRetry={onRetry} />}
                {!isLoading && !error && selectedImage && renderCanvasContent()}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
                { editorMode === 'magic-edit' || editorMode === 'remove-object' ? (
                    <div className="bg-card/70 backdrop-blur-md p-2 rounded-full flex gap-2 border shadow-lg items-center animate-slide-up-fade">
                        {editorMode === 'magic-edit' && <input type="text" value={magicEditPrompt} onChange={e => setMagicEditPrompt(e.target.value)} placeholder={t('magicEditPlaceholder')} className="bg-transparent text-sm w-64 px-2 outline-none"/>}
                        {editorMode === 'remove-object' && <p className="text-sm px-2 text-muted-foreground">{t('removeObjectInfo')}</p>}
                        <div className="flex items-center gap-1"><label className="text-xs">{t('magicEditBrush')}</label><input type="range" min="10" max="100" value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-20 accent-primary"/></div>
                        <button onClick={handleMagicApply} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-full">{t('magicEditApply')}</button>
                        <button onClick={() => setEditorMode('view')} className="px-3 py-1.5 text-sm rounded-full hover:bg-muted">{t('magicEditCancel')}</button>
                    </div>
                ) : editorMode === 'expand' ? (
                     <div className="bg-card/70 backdrop-blur-md p-2 rounded-full flex gap-1 border shadow-lg animate-slide-up-fade">
                        <Tooltip text={t('expandUp')}><button onClick={() => onExpandImage('up')} className="p-2.5 rounded-full hover:bg-accent"><Icon name="arrow-up" /></button></Tooltip>
                        <Tooltip text={t('expandDown')}><button onClick={() => onExpandImage('down')} className="p-2.5 rounded-full hover:bg-accent"><Icon name="arrow-down" /></button></Tooltip>
                        <Tooltip text={t('expandLeft')}><button onClick={() => onExpandImage('left')} className="p-2.5 rounded-full hover:bg-accent"><Icon name="arrow-left" /></button></Tooltip>
                        <Tooltip text={t('expandRight')}><button onClick={() => onExpandImage('right')} className="p-2.5 rounded-full hover:bg-accent"><Icon name="arrow-right" /></button></Tooltip>
                    </div>
                ) : null}

                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 p-1.5 bg-card/70 backdrop-blur-md rounded-full border shadow-lg">
                        <Tooltip text={t('compareWithOriginal')}><button onClick={() => setCompareWith(compareWith ? null : props.productImagePreview)} className={`p-2.5 rounded-full ${compareWith ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}><Icon name="compare" /></button></Tooltip>
                        <Tooltip text={t('enhance')}><button onClick={onEnhance} className="p-2.5 rounded-full hover:bg-accent"><Icon name="wand" /></button></Tooltip>
                        <Tooltip text={t('generateCopy')}><button onClick={onGenerateCopy} className="p-2.5 rounded-full hover:bg-accent"><Icon name="pencil" /></button></Tooltip>
                        <Tooltip text={t('download')}><button onClick={() => selectedImage && handleDownload(selectedImage)} className="p-2.5 rounded-full hover:bg-accent"><Icon name="download" /></button></Tooltip>
                    </div>
                    <EditorToolbar mode={editorMode} setMode={setEditorMode} />
                    <ColorPalette palette={palette} onExtract={onExtractPalette} />
                </div>
            </div>
        </div>
    );
};
