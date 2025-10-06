import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { FileUpload } from '../components/FileUpload';
import { ImageComparator } from '../components/ImageComparator';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../App';

type UpscaleType = 'Portrait' | 'Image' | 'Quick';
type Mode = 'Fast' | 'Professional';

const upscaleTypes: { id: UpscaleType; nameKey: keyof typeof import('../lib/translations').translations.en; icon: string }[] = [
    { id: 'Portrait', nameKey: 'portraitDetailer', icon: 'user-circle' },
    { id: 'Image', nameKey: 'imageUpscaler', icon: 'image' },
    { id: 'Quick', nameKey: 'quickUpscaler', icon: 'sparkles' },
];

const modes: { id: Mode; nameKey: keyof typeof import('../lib/translations').translations.en; icon?: string }[] = [
    { id: 'Fast', nameKey: 'fast' },
    { id: 'Professional', nameKey: 'professional', icon: 'lock' },
];

const ActionButton: React.FC<{ icon: string; titleKey: keyof typeof import('../lib/translations').translations.en; subtitleKey?: keyof typeof import('../lib/translations').translations.en }> = ({ icon, titleKey, subtitleKey }) => {
    const { t } = useTranslation();
    return (
        <button className="bg-zinc-900 border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-colors group">
            <Icon name={icon} className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <h4 className="font-semibold text-foreground">{t(titleKey)}</h4>
            {subtitleKey && <p className="text-xs text-muted-foreground mt-1">{t(subtitleKey)}</p>}
        </button>
    );
};

export const UpscalerPage = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [upscaleType, setUpscaleType] = useState<UpscaleType>('Portrait');
    const [mode, setMode] = useState<Mode>('Fast');
    const [isPortrait, setIsPortrait] = useState(true);
    const { t } = useTranslation();

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setResultImage(null);
        setError(null);
    };

    const handleUpscale = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(imageFile);
            });

            const resultBase64 = await geminiService.upscaleImage(base64Image, upscaleType, isPortrait, mode);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during upscaling.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setResultImage(null);
        setIsLoading(false);
        setError(null);
    };
    
    return (
        <div className="flex flex-1 flex-col md:flex-row min-h-0">
            {/* Left Panel - Controls */}
            <aside className="w-full md:w-96 bg-card/50 backdrop-blur-md border-b md:border-r md:border-b-0 border-border/50 flex-shrink-0 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">{t('upscalerTitle')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('upscalerDesc')}</p>
                </div>

                <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-semibold text-md mb-2">{t('image')}</h3>
                        <FileUpload onFileUpload={handleFileUpload} label={t('uploadAnImage')} uploadedFileName={imageFile?.name} onClear={handleReset}/>
                        <p className="text-xs text-muted-foreground mt-2">{t('upscalerRecommendation')}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-md mb-2">{t('upscaleType')}</h3>
                         <div className="grid grid-cols-3 gap-2">
                            {upscaleTypes.map(type => (
                                <button key={type.id} onClick={() => setUpscaleType(type.id)} className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors h-14 flex flex-col items-center justify-center gap-1 text-center ${upscaleType === type.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                    <Icon name={type.icon} className="w-5 h-5" />
                                    {t(type.nameKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                     <div>
                        <h3 className="font-semibold text-md mb-2">{t('mode')}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {modes.map(m => (
                                <button key={m.id} onClick={() => setMode(m.id)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors h-11 flex items-center justify-center gap-2 ${mode === m.id ? 'bg-primary text-primary-foreground' : 'bg-input hover:bg-muted'}`}>
                                    {m.icon && <Icon name={m.icon} className="w-4 h-4" />}
                                    {t(m.nameKey)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input id="is-portrait" type="checkbox" checked={isPortrait} onChange={e => setIsPortrait(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="is-portrait" className="ms-2 block text-sm text-muted-foreground">{t('isPortraitPrompt')}</label>
                    </div>

                </div>
                
                 <div className="p-4 border-t mt-auto space-y-3">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Icon name="info" className="w-4 h-4" /> {t('creditsCost')}</span>
                    </div>
                    <button onClick={handleUpscale} disabled={isLoading || !imageFile} className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {isLoading ? <Icon name="spinner" className="w-6 h-6 animate-spin" /> : t('upscaleImage')}
                    </button>
                </div>
            </aside>

            {/* Right Panel - Preview */}
            <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                <h2 className="text-xl font-semibold">{t('outputPreview')}</h2>
                 <div className="relative flex-1 border border-border rounded-lg flex items-center justify-center min-h-[300px] p-4">
                    {isLoading && <Icon name="spinner" className="w-10 h-10 animate-spin text-primary" />}
                    {error && <p className="text-destructive p-4 text-center">{error}</p>}
                    {!isLoading && !error && resultImage && imagePreview && (
                         <div className="w-full h-full">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                    )}
                    {!isLoading && !error && !resultImage && imagePreview && (
                        <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
                    )}
                    {!isLoading && !error && !imagePreview && (
                        <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Icon name="image" className="w-10 h-10" />
                            <p>{t('upscalerPlaceholder')}</p>
                        </div>
                    )}
                 </div>
                 <div className={`grid grid-cols-4 gap-4 ${!resultImage && 'opacity-30 pointer-events-none'}`}>
                     <ActionButton icon="sparkles" titleKey="fixSkin" />
                     <ActionButton icon="video" titleKey="generateVideo" />
                     <ActionButton icon="move" titleKey="animate" />
                     <ActionButton icon="download" titleKey="download" />
                 </div>
            </main>
        </div>
    );
};