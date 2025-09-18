import React, { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import { FileUpload } from '../../components/FileUpload';
import { Tooltip } from '../../components/Tooltip';
import * as geminiService from '../../services/geminiService';
import { ThumbnailElement, AISuggestions } from '../../types';
import { useTranslation } from '../../App';
import { FONT_OPTIONS } from '../../constants';

interface MiniAppProps {
    onBack: () => void;
}

const NANO_BANANA_YELLOW = '#FDE047';
const NANO_BANANA_BLACK = '#262626';

const TEMPLATES: ThumbnailElement[][] = [
    [
        { id: nanoid(), type: 'background', x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0, backgroundColor: '#1a2a6c' },
        { id: nanoid(), type: 'shape', x: 50, y: 50, width: 100, height: 100, rotation: 0, zIndex: 1, backgroundColor: NANO_BANANA_YELLOW, shapeType: 'ellipse' },
        { id: nanoid(), type: 'text', text: 'BIG NEWS!', x: 50, y: 30, width: 80, height: 20, rotation: -5, zIndex: 2, fontSize: 12, fontFamily: 'Oswald', color: NANO_BANANA_BLACK, fontWeight: 'bold', textAlign: 'center' },
        { id: nanoid(), type: 'text', text: 'You Won\'t Believe This', x: 50, y: 70, width: 90, height: 15, rotation: 0, zIndex: 2, fontSize: 7, fontFamily: 'Inter', color: '#ffffff', fontWeight: 'normal', textAlign: 'center' },
    ],
    [
        { id: nanoid(), type: 'background', x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0, backgroundColor: '#000000' },
        { id: nanoid(), type: 'shape', x: 5, y: 50, width: 4, height: 60, rotation: 0, zIndex: 1, backgroundColor: NANO_BANANA_YELLOW, shapeType: 'rectangle' },
        { id: nanoid(), type: 'text', text: 'VS', x: 50, y: 50, width: 20, height: 15, rotation: 0, zIndex: 2, fontSize: 10, fontFamily: 'Montserrat', color: NANO_BANANA_YELLOW, fontWeight: 'bold', textAlign: 'center' },
        { id: nanoid(), type: 'text', text: 'LEFT SIDE', x: 25, y: 85, width: 40, height: 10, rotation: 0, zIndex: 2, fontSize: 6, fontFamily: 'Inter', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
        { id: nanoid(), type: 'text', text: 'RIGHT SIDE', x: 75, y: 85, width: 40, height: 10, rotation: 0, zIndex: 2, fontSize: 6, fontFamily: 'Inter', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
    ],
    [
        { id: nanoid(), type: 'background', x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0, backgroundColor: '#f0f0f0' },
        { id: nanoid(), type: 'text', text: 'TUTORIAL', x: 50, y: 50, width: 90, height: 30, rotation: 0, zIndex: 2, fontSize: 18, fontFamily: 'Lato', color: NANO_BANANA_BLACK, fontWeight: 'bold', textAlign: 'center' },
        { id: nanoid(), type: 'shape', x: 50, y: 50, width: 50, height: 5, rotation: 0, zIndex: 1, backgroundColor: NANO_BANANA_YELLOW, shapeType: 'rectangle' },
    ]
];

const PropertiesInspector: React.FC<{
    selectedElement: ThumbnailElement | undefined;
    updateElement: (id: string, updates: Partial<ThumbnailElement>) => void;
    deleteElement: (id: string) => void;
}> = ({ selectedElement, updateElement, deleteElement }) => {
    const { t } = useTranslation();
    
    if (!selectedElement) {
        return <p className="text-xs text-muted-foreground">{t('selectElement')}</p>;
    }
    
    const handleUpdate = (prop: keyof ThumbnailElement, value: any) => {
        updateElement(selectedElement.id, { [prop]: value });
    };

    const isBackground = selectedElement.type === 'background';

    return (
        <div className="space-y-4 text-sm">
            {!isBackground && (
                 <>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">X</label><input type="number" value={Math.round(selectedElement.x)} onChange={e => handleUpdate('x', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                        <div><label className="text-xs">Y</label><input type="number" value={Math.round(selectedElement.y)} onChange={e => handleUpdate('y', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">W</label><input type="number" value={Math.round(selectedElement.width)} onChange={e => handleUpdate('width', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                        <div><label className="text-xs">H</label><input type="number" value={Math.round(selectedElement.height)} onChange={e => handleUpdate('height', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                    </div>
                    <div><label className="text-xs">Rotation</label><input type="number" value={Math.round(selectedElement.rotation)} onChange={e => handleUpdate('rotation', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                </>
            )}
           
            {selectedElement.type === 'text' && (
                <>
                    <div><label className="text-xs">Text</label><textarea value={selectedElement.text} onChange={e => handleUpdate('text', e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                    <div><label className="text-xs">Font</label><select value={selectedElement.fontFamily} onChange={e => handleUpdate('fontFamily', e.target.value)} className="w-full mt-1 p-1 bg-muted rounded">{FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}</select></div>
                    <div><label className="text-xs">Size</label><input type="number" value={selectedElement.fontSize} onChange={e => handleUpdate('fontSize', +e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"/></div>
                    <div><label className="text-xs">Color</label><input type="color" value={selectedElement.color} onChange={e => handleUpdate('color', e.target.value)} className="w-full h-8 mt-1 p-0 bg-muted rounded border-none cursor-pointer"/></div>
                    <div><label className="text-xs">Weight</label><select value={selectedElement.fontWeight} onChange={e => handleUpdate('fontWeight', e.target.value)} className="w-full mt-1 p-1 bg-muted rounded"><option>normal</option><option>bold</option></select></div>
                </>
            )}

            {(selectedElement.type === 'shape' || isBackground) && (
                 <div><label className="text-xs">Color</label><input type="color" value={selectedElement.backgroundColor} onChange={e => handleUpdate('backgroundColor', e.target.value)} className="w-full h-8 mt-1 p-0 bg-muted rounded border-none cursor-pointer"/></div>
            )}
            
            {!isBackground && (
                <button onClick={() => deleteElement(selectedElement.id)} className="w-full text-sm p-2 rounded bg-destructive/20 text-destructive hover:bg-destructive/30">{t('delete')}</button>
            )}
        </div>
    );
};


const YouTubeThumbnailGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const [elements, setElements] = useState<ThumbnailElement[]>(TEMPLATES[0]);
    const [history, setHistory] = useState<ThumbnailElement[][]>([TEMPLATES[0]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState('');
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const updateHistory = useCallback((newElements: ThumbnailElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);
    
    const handleSetElements = useCallback((newElements: ThumbnailElement[], skipHistory = false) => {
        setElements(newElements);
        if (!skipHistory) {
            updateHistory(newElements);
        }
    }, [updateHistory]);
    
    const updateElement = (id: string, updates: Partial<ThumbnailElement>) => {
        const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
        handleSetElements(newElements);
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setElements(history[newIndex]);
        }
    };
    
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setElements(history[newIndex]);
        }
    };

    const handleGenerateSuggestions = async (fromImage: boolean) => {
        if (fromImage && !userImageFile) return;
        if (!fromImage && !videoTitle) return;

        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        try {
            const result = fromImage
                ? await geminiService.generateThumbnailSuggestionsFromImage(userImageFile!, videoTitle)
                : await geminiService.generateThumbnailSuggestions(videoTitle);
            setSuggestions(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    const addElement = (newElement: Omit<ThumbnailElement, 'id' | 'zIndex'>) => {
        const zIndex = Math.max(...elements.map(e => e.zIndex), 0) + 1;
        const element: ThumbnailElement = { ...newElement, id: nanoid(), zIndex };
        handleSetElements([...elements, element]);
    };

    const deleteElement = (id: string) => {
        handleSetElements(elements.filter(el => el.id !== id));
        setSelectedElementId(null);
    };
    
    const handleImageUpload = (file: File) => {
        setUserImageFile(file);
    };

    const setUploadedImageAs = (type: 'background' | 'image') => {
        if (!userImageFile) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const src = reader.result as string;
            if (type === 'background') {
                const newBG: ThumbnailElement = { id: nanoid(), type: 'background', x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0, src };
                handleSetElements([...elements.filter(el => el.type !== 'background'), newBG]);
            } else {
                 addElement({ type: 'image', src, x: 50, y: 50, width: 40, height: 30, rotation: 0 });
            }
        };
        reader.readAsDataURL(userImageFile);
    };
    
    const exportThumbnail = async (format: 'png' | 'jpeg') => {
        const canvasContainer = canvasRef.current;
        if (!canvasContainer) return;
        
        setIsLoading(true);
        const mimeType = `image/${format}`;
        const exportWidth = 1280;
        const exportHeight = 720;
    
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsLoading(false);
            return;
        }
    
        const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
        const imageElements = sortedElements.filter(el => el.type === 'image' || (el.type === 'background' && el.src));
        const imagePromises = imageElements.map(el => new Promise<[HTMLImageElement, ThumbnailElement]>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve([img, el]);
            img.onerror = reject;
            img.src = el.src!;
        }));
    
        try {
            const background = sortedElements.find(el => el.type === 'background');
            if (background && background.backgroundColor && !background.src) {
                ctx.fillStyle = background.backgroundColor;
                ctx.fillRect(0, 0, exportWidth, exportHeight);
            }
    
            const loadedImages = await Promise.all(imagePromises);
            
            loadedImages.forEach(([img, el]) => {
                if (el.type === 'background') {
                    ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
                }
            });

            sortedElements.filter(el => el.type === 'shape').forEach(el => {
                if (!el.backgroundColor) return;
                ctx.fillStyle = el.backgroundColor;
                const x = (el.x / 100) * exportWidth;
                const y = (el.y / 100) * exportHeight;
                const w = (el.width / 100) * exportWidth;
                const h = (el.height / 100) * exportHeight;
                if (el.shapeType === 'ellipse') {
                    ctx.beginPath();
                    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 2 * Math.PI);
                    ctx.fill();
                } else {
                    ctx.fillRect(x - w / 2, y - h / 2, w, h);
                }
            });
    
            loadedImages.forEach(([img, el]) => {
                if (el.type === 'image') {
                    const x = (el.x / 100) * exportWidth;
                    const y = (el.y / 100) * exportHeight;
                    const w = (el.width / 100) * exportWidth;
                    const h = (el.height / 100) * exportHeight;
                    ctx.drawImage(img, x - w/2, y - h/2, w, h);
                }
            });
    
            sortedElements.filter(el => el.type === 'text').forEach(el => {
                const fontSize = (el.fontSize! / 100) * exportHeight;
                ctx.font = `${el.fontWeight} ${fontSize}px ${el.fontFamily}`;
                ctx.fillStyle = el.color!;
                ctx.textAlign = el.textAlign!;
                ctx.textBaseline = 'middle';
    
                const x = (el.x / 100) * exportWidth;
                const y = (el.y / 100) * exportHeight;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(el.rotation * Math.PI / 180);
                ctx.fillText(el.text!, 0, 0);
                ctx.restore();
            });
    
            const link = document.createElement('a');
            link.download = `thumbnail.${format}`;
            link.href = canvas.toDataURL(mimeType, 0.95);
            link.click();
    
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export image. One or more images could not be loaded.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <MiniAppLayout title={t('youtube-thumbnail-generator-title')} description={t('youtube-thumbnail-generator-desc')} onBack={onBack}>
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-150px)]">
                {/* Controls Sidebar */}
                <div className="w-full md:w-80 bg-card border rounded-lg p-4 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <h3 className="font-semibold mb-2">{t('templates')}</h3>
                        <div className="grid grid-cols-3 gap-2">
                           {TEMPLATES.map((template, index) => (
                                <button key={index} onClick={() => handleSetElements(template)} className="aspect-video bg-muted rounded hover:ring-2 ring-primary">
                                    <div className="text-xs p-1">Template {index+1}</div>
                                </button>
                           ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">{t('aiSuggestions')}</h3>
                        <div className="space-y-2">
                            <FileUpload onFileUpload={handleImageUpload} label="Upload Reference Image" uploadedFileName={userImageFile?.name} />
                             <input
                                type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                                placeholder={t('videoTitlePlaceholder')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleGenerateSuggestions(false)} disabled={!videoTitle || isLoading} className="w-full text-xs inline-flex items-center justify-center rounded-md font-medium h-9 px-2 bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-50 gap-1">
                                    <Icon name="sparkles" className="w-4 h-4" /> Text
                                </button>
                                <button onClick={() => handleGenerateSuggestions(true)} disabled={!userImageFile || isLoading} className="w-full text-xs inline-flex items-center justify-center rounded-md font-medium h-9 px-2 bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-50 gap-1">
                                    <Icon name="sparkles" className="w-4 h-4" /> Image
                                </button>
                            </div>
                        </div>
                        {suggestions && (
                            <div className="mt-4 space-y-2 text-xs animate-fade-in">
                                <h4 className="font-bold">{t('suggestedTitles')}</h4>
                                {suggestions.titles.map(t => <p key={t} className="bg-muted p-1 rounded">"{t}"</p>)}
                                 <h4 className="font-bold mt-2">{t('suggestedColors')}</h4>
                                <div className="flex gap-1">{suggestions.colorPalette.map(c => <div key={c} style={{backgroundColor: c}} className="w-4 h-4 rounded-full border"/>)}</div>
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">{t('layers')}</h3>
                        <div className="space-y-2">
                            {userImageFile && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setUploadedImageAs('background')} className="text-xs p-2 rounded bg-muted hover:bg-accent">Set as BG</button>
                                    <button onClick={() => setUploadedImageAs('image')} className="text-xs p-2 rounded bg-muted hover:bg-accent">Add as Layer</button>
                                </div>
                            )}
                            <button onClick={() => addElement({ type: 'text', text: 'New Text', x: 50, y: 50, width: 40, height: 10, rotation: 0, fontSize: 8, fontFamily: 'Inter', color: NANO_BANANA_BLACK, fontWeight: 'bold', textAlign: 'center' })} className="w-full text-sm text-left p-2 rounded hover:bg-accent">Add Text</button>
                            <button onClick={() => addElement({ type: 'shape', shapeType: 'rectangle', backgroundColor: NANO_BANANA_YELLOW, x: 50, y: 50, width: 30, height: 20, rotation: 0 })} className="w-full text-sm text-left p-2 rounded hover:bg-accent">Add Rectangle</button>
                            <button onClick={() => addElement({ type: 'shape', shapeType: 'ellipse', backgroundColor: NANO_BANANA_YELLOW, x: 50, y: 50, width: 30, height: 30, rotation: 0 })} className="w-full text-sm text-left p-2 rounded hover:bg-accent">Add Ellipse</button>
                        </div>
                    </div>

                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Top Toolbar */}
                     <div className="flex-shrink-0 bg-card border rounded-lg p-2 flex items-center justify-between">
                         <div className="flex items-center gap-1">
                            <Tooltip text={t('undo')}><button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded hover:bg-accent disabled:opacity-50"><Icon name="undo" className="w-5 h-5"/></button></Tooltip>
                            <Tooltip text={t('redo')}><button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded hover:bg-accent disabled:opacity-50"><Icon name="redo" className="w-5 h-5"/></button></Tooltip>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => exportThumbnail('jpeg')} className="text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-accent">{t('exportJPG')}</button>
                            <button onClick={() => exportThumbnail('png')} className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">{t('exportPNG')}</button>
                         </div>
                     </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-muted rounded-lg flex items-center justify-center p-4 overflow-hidden" onClick={() => setSelectedElementId(null)}>
                        <div ref={canvasRef} className="w-full aspect-video bg-card shadow-lg relative select-none" style={{ transform: 'scale(1)', transformOrigin: 'center' }}>
                            {elements.sort((a,b) => a.zIndex - b.zIndex).map(el => {
                                const [isEditing, setIsEditing] = useState(false);
                                
                                const style: React.CSSProperties = {
                                    position: 'absolute',
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: `${el.width}%`,
                                    height: `${el.height}%`,
                                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                                    zIndex: el.zIndex,
                                };
                                
                                const handleTextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
                                    setIsEditing(false);
                                    updateElement(el.id, { text: e.currentTarget.innerText });
                                };

                                let content;
                                switch (el.type) {
                                    case 'background':
                                        style.backgroundColor = el.backgroundColor;
                                        style.backgroundImage = el.src ? `url(${el.src})` : 'none';
                                        style.backgroundSize = 'cover';
                                        style.backgroundPosition = 'center';
                                        content = <div className="w-full h-full" />;
                                        break;
                                    case 'shape':
                                        style.backgroundColor = el.backgroundColor;
                                        if (el.shapeType === 'ellipse') style.borderRadius = '50%';
                                        content = <div className="w-full h-full" />;
                                        break;
                                    case 'image':
                                        content = <img src={el.src} className="w-full h-full object-cover pointer-events-none" alt="" />;
                                        break;
                                    case 'text':
                                        style.color = el.color;
                                        style.fontFamily = el.fontFamily;
                                        style.fontSize = `${el.fontSize}vh`;
                                        style.fontWeight = el.fontWeight;
                                        style.textAlign = el.textAlign;
                                        content = <div 
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onDoubleClick={() => setIsEditing(true)}
                                            onBlur={handleTextBlur}
                                            className="w-full h-full flex items-center justify-center p-1 box-border outline-none"
                                            style={{cursor: isEditing ? 'text' : 'pointer'}}
                                        >{el.text}</div>;
                                        break;
                                }

                                return <div key={el.id} style={style} className={`absolute ${selectedElementId === el.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-muted' : ''}`} onMouseDown={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}>{content}</div>;
                            })}
                        </div>
                    </div>
                </div>

                {/* Properties Inspector */}
                 <div className="w-full md:w-64 bg-card border rounded-lg p-4 flex-shrink-0 overflow-y-auto">
                    <h3 className="font-semibold mb-2">{t('properties')}</h3>
                    <PropertiesInspector
                        selectedElement={selectedElement}
                        updateElement={updateElement}
                        deleteElement={deleteElement}
                    />
                 </div>
            </div>
        </MiniAppLayout>
    );
};

export default YouTubeThumbnailGenerator;
