import React from 'react';
import { nanoid } from 'nanoid';
import { BrandKit } from '../types';
import { FONT_OPTIONS } from '../constants';
import { FileUpload } from './FileUpload';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

interface BrandKitPanelProps {
    brandKits: BrandKit[];
    setBrandKits: React.Dispatch<React.SetStateAction<BrandKit[]>>;
    activeBrandKitId: string | null;
    setActiveBrandKitId: React.Dispatch<React.SetStateAction<string | null>>;
}

const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-muted-foreground mb-1.5">{children}</label>
);

const Input: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; id?: string; }> = (props) => (
    <input
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
);

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; id?: string; 'aria-label'?: string }> = (props) => (
     <select
        {...props}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
        {props.children}
    </select>
);


export const BrandKitPanel: React.FC<BrandKitPanelProps> = ({ brandKits, setBrandKits, activeBrandKitId, setActiveBrandKitId }) => {
    
    const activeKit = brandKits.find(k => k.id === activeBrandKitId);

    const updateActiveKit = (updates: Partial<Omit<BrandKit, 'id'>>) => {
        if (!activeBrandKitId) return;
        setBrandKits(kits => kits.map(kit => 
            kit.id === activeBrandKitId ? { ...kit, ...updates } : kit
        ));
    };

    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateActiveKit({ logo: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleClearLogo = () => {
        updateActiveKit({ logo: null });
    };

    const handleAddKit = () => {
        const newKit: BrandKit = {
            id: nanoid(),
            name: `New Kit ${brandKits.length + 1}`,
            logo: null,
            primaryColor: '#cccccc',
            font: 'Inter'
        };
        setBrandKits(kits => [...kits, newKit]);
        setActiveBrandKitId(newKit.id);
    };

    const handleDeleteKit = () => {
        if (!activeKit || brandKits.length <= 1) {
            alert("You cannot delete the last brand kit.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${activeKit.name}"?`)) {
            const remainingKits = brandKits.filter(k => k.id !== activeBrandKitId);
            setBrandKits(remainingKits);
            setActiveBrandKitId(remainingKits.length > 0 ? remainingKits[0].id : null);
        }
    };

    if (!activeKit) {
        return (
            <div className="text-center p-4">
                <p>No brand kit selected.</p>
                <button onClick={handleAddKit} className="mt-2 text-sm text-primary">Create a new Brand Kit</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Label>Brand Kit Presets</Label>
                <div className="flex items-center gap-2">
                    <Select
                        value={activeBrandKitId || ''}
                        onChange={(e) => setActiveBrandKitId(e.target.value)}
                        aria-label="Select Brand Kit Preset"
                    >
                        {brandKits.map(kit => <option key={kit.id} value={kit.id}>{kit.name}</option>)}
                    </Select>
                    <Tooltip text="Add New Preset">
                        <button onClick={handleAddKit} className="h-10 w-10 shrink-0 flex items-center justify-center bg-secondary hover:bg-accent rounded-md" aria-label="Add New Brand Kit Preset"><Icon name="sparkles" className="w-5 h-5"/></button>
                    </Tooltip>
                    <Tooltip text="Delete Preset">
                        <button onClick={handleDeleteKit} disabled={brandKits.length <= 1} className="h-10 w-10 shrink-0 flex items-center justify-center bg-secondary hover:bg-accent rounded-md disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Delete Selected Brand Kit Preset"><Icon name="trash" className="w-5 h-5"/></button>
                    </Tooltip>
                </div>
            </div>

            <div>
                <Label htmlFor="kit-name">Preset Name</Label>
                <Input
                    id="kit-name"
                    value={activeKit.name}
                    onChange={(e) => updateActiveKit({ name: e.target.value })}
                />
            </div>
            
            <div>
                <Label>Brand Logo</Label>
                <FileUpload 
                    onFileUpload={handleLogoUpload}
                    label="Upload Logo (PNG)"
                    uploadedFileName={activeKit.logo ? 'logo.png' : undefined}
                    onClear={activeKit.logo ? handleClearLogo : undefined}
                />
                 {activeKit.logo && (
                    <div className="mt-2 p-2 bg-muted rounded-md flex justify-center items-center">
                        <img src={activeKit.logo} alt="Brand Logo Preview" className="max-h-16" />
                    </div>
                 )}
            </div>

            <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3">
                    <input 
                        id="primary-color"
                        type="color"
                        value={activeKit.primaryColor}
                        onChange={(e) => updateActiveKit({ primaryColor: e.target.value })}
                        className="p-0 h-10 w-10 block bg-transparent border border-input cursor-pointer rounded-lg"
                        title="Select brand color"
                    />
                    <Input 
                        value={activeKit.primaryColor}
                        onChange={(e) => updateActiveKit({ primaryColor: e.target.value })}
                        aria-label="Primary color hex value"
                    />
                </div>
            </div>

             <div>
                <Label htmlFor="brand-font">Brand Font</Label>
                 <Select
                    id="brand-font"
                    value={activeKit.font}
                    onChange={(e) => updateActiveKit({ font: e.target.value })}
                >
                    {FONT_OPTIONS.map(font => <option key={font} value={font} style={{fontFamily: font}}>{font}</option>)}
                </Select>
            </div>
        </div>
    );
};