import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';

interface SketchCanvasProps {
    brushColor: string;
    brushSize: number;
    backgroundImage?: string | null;
}

export interface SketchCanvasRef {
    clear: () => void;
    undo: () => void;
    redo: () => void;
    exportAsBase64: () => Promise<string | null>;
}

export const SketchCanvas = forwardRef<SketchCanvasRef, SketchCanvasProps>(({ brushColor, brushSize, backgroundImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveState = useCallback(() => {
        if (!contextRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const parent = canvas.parentElement;
        if (parent) {
            const { width, height } = parent.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            contextRef.current = context;

            if (historyIndex === -1) {
                saveState();
            }
        }
    }, [saveState, historyIndex]);

// FIX: Replaced the `getCoords` function with a more robust, type-safe version
// that correctly handles both React SyntheticEvents and native browser events.
    const getCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let eventSource: MouseEvent | Touch;
        if ('nativeEvent' in e) { // It's a React SyntheticEvent
            eventSource = e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0] : e.nativeEvent as MouseEvent;
        } else { // It's a native event
            eventSource = e instanceof TouchEvent ? e.touches[0] : e as MouseEvent;
        }

        if (!eventSource) return {x: 0, y: 0};

        return {
            x: eventSource.clientX - rect.left,
            y: eventSource.clientY - rect.top,
        };
    };


    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const context = contextRef.current;
        if (!context) return;
        const { x, y } = getCoords(e);
        context.beginPath();
        context.moveTo(x, y);
        context.strokeStyle = brushColor;
        context.lineWidth = brushSize;
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        const context = contextRef.current;
        if (!context || !isDrawing) return;
        context.closePath();
        setIsDrawing(false);
        saveState();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !contextRef.current) return;
        const { x, y } = getCoords(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };
    
    const restoreState = (state: ImageData) => {
        if (!contextRef.current || !canvasRef.current) return;
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.putImageData(state, 0, 0);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            saveState();
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            restoreState(history[newIndex]);
        }
    };
    
    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            restoreState(history[newIndex]);
        }
    };
    
    const isCanvasEmpty = (canvas: HTMLCanvasElement): boolean => {
         const context = canvas.getContext('2d');
        if (!context) return true;
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        return !pixelBuffer.some(color => (color & 0xff000000) !== 0);
    };

    const exportAsBase64 = (): Promise<string | null> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current;
            if (canvas && !isCanvasEmpty(canvas)) {
                 resolve(canvas.toDataURL('image/png').split(',')[1]);
            } else {
                 resolve(null);
            }
        });
    };
    
    useImperativeHandle(ref, () => ({ clear, undo, redo, exportAsBase64 }));

    return (
        <div className="w-full h-full relative bg-card">
            {backgroundImage && (
                <img src={backgroundImage} alt="Reference" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
            )}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseOut={finishDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={finishDrawing}
                onTouchMove={draw}
                className="absolute top-0 left-0 w-full h-full cursor-crosshair"
            />
        </div>
    );
});