import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const LogoIdeator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('Minimalist');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const logoStyles = ['Minimalist', 'Geometric', 'Abstract', 'Vintage', 'Corporate', 'Playful', 'Luxury'];

    const handleGenerate = async () => {
        if (!companyName || !description) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const prompt = `${style} logo concept for a company named '${companyName}'. The company is about: ${description}.`;
            const images = await geminiService.generateLogoConcepts(prompt, 4);
            setResults(images.map(base64 => `data:image/png;base64,${base64}`));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate logos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('logo-ideator-title')}
            description={t('logo-ideator-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('companyName')}</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={t('companyNamePlaceholder')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('logoStyle')}</label>
                         <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {logoStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('descriptionKeywords')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('logoDescPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!companyName || !description || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('ideating') : t('generateLogoConcepts')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedConcepts')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {results.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Logo concept ${index + 1}`}
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

export default LogoIdeator;
