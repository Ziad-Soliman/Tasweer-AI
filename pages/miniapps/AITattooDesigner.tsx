import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AITattooDesigner: React.FC<MiniAppProps> = ({ onBack }) => {
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('Fine Line');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const tattooStyles = ['Fine Line', 'Geometric', 'Watercolor', 'Tribal', 'Neo Traditional', 'Minimalist', 'Sketch'];

    const handleGenerate = async () => {
        if (!description) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const images = await geminiService.generateTattooDesigns(description, style);
            setResults(images.map(base64 => `data:image/png;base64,${base64}`));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate designs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('tattoo-designer-title')}
            description={t('tattooDesignerDesc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('tattooIdea')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('tattooIdeaPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('tattooStyle')}</label>
                         <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {tattooStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!description || isLoading}
                        className="md:col-start-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 self-end"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('designing') : t('designTattoo')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {isLoading && (
                    <div className="text-center text-muted-foreground">
                        <Icon name="spinner" className="w-8 h-8 animate-spin mx-auto" />
                        <p className="mt-2">{t('designing')}...</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedConcepts')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {results.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Tattoo concept ${index + 1}`}
                                    className="w-full aspect-square object-contain bg-muted rounded-lg border"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AITattooDesigner;
