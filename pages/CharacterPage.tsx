
import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Icon } from '../components/Icon';
import { FileUpload } from '../components/FileUpload';
import { HistoryItem } from '../types';
import { Tabs } from '../components/Tabs';
import { HistoryPanel } from '../components/HistoryPanel';
import { BrandKitPanel } from '../components/BrandKitPanel';

// --- Local Components & Data for this page ---

interface GeneratedImage {
    id: string;
    src: string;
    prompt: string;
}

const placeholder1 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2EzNjUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0cHgiIGZpbGw9IiNmMmYyZjIiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=`;
const placeholder2 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDg0MjZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0cHgiIGZpbGw9IiNmMmYyZjIiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=`;
const placeholder3 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2Q1MjhlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0cHgiIGZpbGw9IiNmMmYyZjIiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=`;
const placeholder4 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTY1YjZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0cHgiIGZpbGw9IiNmMmYyZjIiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=`;

const initialGeneratedImages: GeneratedImage[] = [
    {
        id: nanoid(),
        src: placeholder1,
        prompt: 'A distinguished English teacher, his exact facial features, hair, and overall appearance matching the reference image. He is standing in a well-lit, classic classroom setting.',
    },
    {
        id: nanoid(),
        src: placeholder2,
        prompt: 'A close-up portrait of the same English teacher, with a soft, scholarly smile. The background is a blurred bookshelf filled with classic literature.',
    },
    {
        id: nanoid(),
        src: placeholder3,
        prompt: 'The teacher writing a quote from Shakespeare on a chalkboard in a vintage, sun-drenched classroom.',
    },
    {
        id: nanoid(),
        src: placeholder4,
        prompt: 'A different angle of the teacher in the classroom, looking thoughtfully out a large arched window as if contemplating a lesson.',
    },
];

const ImageCard = ({ image }: { image: GeneratedImage }) => {
    return (
        <div className="break-inside-avoid">
            <div className="group relative overflow-hidden rounded-lg cursor-pointer">
                <img src={image.src} alt={image.prompt} className="w-full h-auto block" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
                    <div className="flex items-center gap-1.5">
                        <button className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="expand" className="w-4 h-4" /></button>
                        <button className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="redo" className="w-4 h-4" /></button>
                        <button className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="wand" className="w-4 h-4" /></button>
                        <button className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="search" className="w-4 h-4" /></button>
                        <button className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 backdrop-blur-sm"><Icon name="download" className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-start mt-2 gap-2">
                <p className="text-muted-foreground text-xs">{image.prompt}</p>
                <button className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                    <Icon name="copy" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};


const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    return (
        <details className="group border border-border rounded-lg bg-card overflow-hidden" open={defaultOpen}>
            <summary className="font-semibold text-foreground px-4 py-3 cursor-pointer list-none flex items-center justify-between hover:bg-muted/50 transition-colors">
                <span>{title}</span>
                <Icon name="chevron-down" className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 pt-2 border-t border-border bg-background">
                {children}
            </div>
        </details>
    );
};

const Switch = ({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const Dropdown = ({ label, options, value, onChange }: { label:string, options: string[], value: string, onChange: (value: string) => void }) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em 1.2em'}}>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// Data for controls
const aspectRatios = [{ id: '16:9', icon: 'aspect-ratio-16-9' }, { id: '1:1', icon: 'aspect-ratio-1-1' }, { id: '9:16', icon: 'aspect-ratio-9-16' }, { id: '4:3', icon: 'aspect-ratio-4-3' }, { id: '3:4', icon: 'aspect-ratio-3-4' }];
const numImages = ['1', '2', '3', '4'];
const lightingStyles = [
    { id: 'none', name: 'None', icon: 'circle-slash' }, { id: 'cinematic', name: 'Cinematic', icon: 'cinematic-lighting' }, { id: 'film-noir', name: 'Film Noir', icon: 'moon' },
    { id: 'natural', name: 'Natural Light', icon: 'sun' }, { id: 'morning', name: 'Morning', icon: 'sunrise' }, { id: 'daylight', name: 'Bright Daylight', icon: 'sun-high' },
    { id: 'golden-hour', name: 'Golden Hour', icon: 'sunset' }, { id: 'blue-hour', name: 'Blue Hour', icon: 'moon-stars' }, { id: 'night', name: 'Night Cinematic', icon: 'video' },
    { id: 'high-key', name: 'High Key', icon: 'high-key' }, { id: 'low-key', name: 'Low Key', icon: 'low-key' }, { id: 'horror', name: 'Horror Dim', icon: 'horror-dim' },
    { id: 'cyberpunk', name: 'Neon Cyberpunk', icon: 'neon-cyberpunk' }, { id: 'candlelight', name: 'Candlelight', icon: 'flame' }, { id: 'flashlight', name: 'Flashlight', icon: 'flashlight' }
];
const photoStyles = ['Photorealistic', 'Cinematic', 'Anime', 'Digital Art', '3D Render'];
const cameraZooms = ['None', 'Close-up shot', 'Medium shot', 'Full shot', 'Extreme close-up'];
const cameraPerspectives = ['None', 'Eye-level', 'Low-angle', 'High-angle', 'Birds-eye-view'];
const shotTypes = ['None', 'Wide shot', 'Cowboy shot', 'Two-shot', 'Point-of-view'];
const colorTones = ['None', 'Vibrant', 'Muted', 'Warm', 'Cool', 'Black and White'];

interface CharacterPageProps {
    history: HistoryItem[];
    onToggleFavorite: (id: string) => void;
    onRestore: (item: HistoryItem) => void;
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    deleteHistoryItem: (id: string) => void;
}

export const CharacterPage: React.FC<CharacterPageProps> = (props) => {
    const [characters, setCharacters] = useState([{ id: nanoid(), name: 'Character 1', image: null }, { id: nanoid(), name: 'Character 2', image: null }]);
    const [objects, setObjects] = useState([{ id: nanoid(), name: 'Object 1', image: null }]);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [numImage, setNumImage] = useState('1');
    const [lighting, setLighting] = useState('cinematic');
    const [generatedImages, setGeneratedImages] = useState(initialGeneratedImages);

    
    // Brand Kit state (mocked)
    const [brandKits, setBrandKits] = useState<any[]>([{ id: 'default', name: 'Default' }]);
    const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>('default');

    const addCharacter = () => setCharacters(prev => [...prev, { id: nanoid(), name: `Character ${prev.length + 1}`, image: null }]);
    const removeCharacter = (id: string) => setCharacters(prev => prev.filter(c => c.id !== id));
    
    const addObject = () => setObjects(prev => [...prev, { id: nanoid(), name: `Object ${prev.length + 1}`, image: null }]);
    const removeObject = (id: string) => setObjects(prev => prev.filter(o => o.id !== id));

    return (
        <div className="grid flex-1 min-h-0 overflow-hidden md:grid-cols-[380px_1fr_350px]">
            <div className="bg-card border-r border-border h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <CollapsibleSection title="Main Characters">
                        <div className="grid grid-cols-2 gap-4">
                            {characters.map(char => (
                                <div key={char.id} className="p-2 border border-border rounded-lg bg-background space-y-2 relative group">
                                    <input type="text" defaultValue={char.name} className="w-full bg-transparent text-sm font-semibold border-b border-border focus:outline-none focus:border-primary p-1"/>
                                    <div className="aspect-square w-full">
                                        <FileUpload onFileUpload={() => {}} label="Click or drag" />
                                    </div>
                                    <button onClick={() => removeCharacter(char.id)} className="absolute top-1 right-1 p-1 bg-destructive/80 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon name="trash" className="w-3.5 h-3.5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addCharacter} className="mt-4 w-full text-sm font-medium h-10 px-4 py-2 bg-muted hover:bg-accent rounded-md flex items-center justify-center gap-2 transition-colors">
                            <Icon name="plus" className="w-4 h-4" /> Add Character
                        </button>
                    </CollapsibleSection>

                    <CollapsibleSection title="Your Imagination">
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Scene Description</label>
                                <textarea defaultValue="A detective on a rain-slicked street..." rows={3} className="w-full bg-background border border-input p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[6rem] pr-16"></textarea>
                                <div className="absolute top-8 right-2 flex flex-col gap-1.5">
                                    <button className="p-1.5 rounded-md hover:bg-muted"><Icon name="save" className="w-4 h-4 text-muted-foreground"/></button>
                                    <button className="p-1.5 rounded-md hover:bg-muted"><Icon name="trash" className="w-4 h-4 text-muted-foreground"/></button>
                                </div>
                            </div>
                            <Switch checked={true} onChange={() => {}} label="Automatic Cinematic Description" />
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Image Reference">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Scene Location</label>
                                <input type="text" placeholder="e.g., A neon-lit alley..." className="w-full bg-background border border-input p-2 rounded-md text-sm h-10 mb-2"/>
                                <FileUpload onFileUpload={() => {}} label="Click or drag" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Style Reference</label>
                                <input type="text" placeholder="e.g., A vibrant oil painting" className="w-full bg-background border border-input p-2 rounded-md text-sm h-10 mb-2"/>
                                <FileUpload onFileUpload={() => {}} label="Click or drag" />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Key Objects & Props">
                        <div className="space-y-3">
                           {objects.map(obj => (
                             <div key={obj.id} className="p-2 border border-border rounded-lg bg-background space-y-2 group">
                                <div className="flex items-center gap-2">
                                     <input type="text" defaultValue={obj.name} className="w-full bg-transparent text-sm font-semibold p-1 focus:outline-none border-b border-transparent focus:border-primary"/>
                                     <button onClick={() => removeObject(obj.id)} className="p-1 bg-destructive/80 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon name="trash" className="w-3.5 h-3.5"/>
                                    </button>
                                </div>
                                <FileUpload onFileUpload={() => {}} label="Click or drag & drop to upload" />
                             </div>
                           ))}
                        </div>
                         <button onClick={addObject} className="mt-4 w-full text-sm font-medium h-10 px-4 py-2 bg-muted hover:bg-accent rounded-md flex items-center justify-center gap-2 transition-colors">
                            <Icon name="plus" className="w-4 h-4" /> Add Object
                        </button>
                    </CollapsibleSection>

                    <CollapsibleSection title="Cinematic Controls">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Aspect Ratio</label>
                                <div className="flex justify-between gap-2">
                                    {aspectRatios.map(ar => (
                                        <button key={ar.id} onClick={() => setAspectRatio(ar.id)} className={`flex-1 p-2 rounded-md border-2 transition-colors ${aspectRatio === ar.id ? 'border-primary bg-primary/10' : 'border-input hover:border-muted-foreground'}`}>
                                            <Icon name={ar.icon} className={`mx-auto h-6 ${aspectRatio === ar.id ? 'text-primary' : 'text-muted-foreground'}`}/>
                                            <span className="text-xs text-muted-foreground mt-1 block">{ar.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Number of Images</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {numImages.map(num => (
                                        <button key={num} onClick={() => setNumImage(num)} className={`p-3 rounded-md border-2 text-center transition-colors ${numImage === num ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-input hover:border-muted-foreground'}`}>
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Lighting Style</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {lightingStyles.map(ls => (
                                        <button key={ls.id} onClick={() => setLighting(ls.id)} className={`p-2 rounded-md border-2 text-center transition-colors ${lighting === ls.id ? 'border-primary bg-primary/10' : 'border-input hover:border-muted-foreground'}`}>
                                            <Icon name={ls.icon} className={`mx-auto h-6 mb-1 ${lighting === ls.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="text-[10px] leading-tight block text-muted-foreground">{ls.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <Dropdown label="Photo Style" options={photoStyles} value={'Photorealistic'} onChange={()=>{}} />
                               <Dropdown label="Camera Zoom" options={cameraZooms} value={'None'} onChange={()=>{}} />
                               <Dropdown label="Camera Perspective" options={cameraPerspectives} value={'None'} onChange={()=>{}} />
                               <Dropdown label="Shot Type" options={shotTypes} value={'None'} onChange={()=>{}} />
                            </div>
                             <Dropdown label="Color & Tone" options={colorTones} value={'None'} onChange={()=>{}} />
                        </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection title="Generated Cinematic Prompt">
                        <Switch checked={false} onChange={() => {}} label="Generated Cinematic Prompt" />
                    </CollapsibleSection>
                </div>
                <div className="p-4 border-t border-border/80">
                     <button className="w-full text-base font-semibold h-12 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center gap-2 transition-colors">
                        <Icon name="wand" className="w-5 h-5" /> Generate
                    </button>
                </div>
            </div>
            
             <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                <div className="columns-2 gap-6 space-y-6">
                    {generatedImages.map(image => (
                        <ImageCard key={image.id} image={image} />
                    ))}
                </div>
            </main>

            <div className="bg-card border-l border-border">
                <Tabs tabs={[{key: 'History', label: 'History'}, {key: 'Brand', label: 'Brand'}]}>
                    {(activeTab) => (
                        <div className="p-4 h-full">
                            {activeTab === 'History' && <HistoryPanel history={props.history} onRestore={props.onRestore} onToggleFavorite={props.onToggleFavorite} onDelete={props.deleteHistoryItem} />}
                            {activeTab === 'Brand' && <BrandKitPanel brandKits={brandKits} setBrandKits={setBrandKits} activeBrandKitId={activeBrandKitId} setActiveBrandKitId={setActiveBrandKitId} />}
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    );
};
