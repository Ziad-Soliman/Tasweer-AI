import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { ProductNameSuggestion } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const ProductNamer: React.FC<MiniAppProps> = ({ onBack }) => {
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [results, setResults] = useState<ProductNameSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!description) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const names = await geminiService.generateProductNames(description, keywords);
            setResults(names);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate names.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('product-namer-title')}
            description={t('product-namer-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('productDescription')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., A smart water bottle that tracks hydration and glows to remind you to drink."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                     <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('keywordsOptional')}</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder={t('keywordsPlaceholder')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!description || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('generatingNames') : t('generateNames')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                         <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedNames')}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {results.map((item, index) => (
                                <div key={index} className="bg-card border p-4 rounded-lg">
                                    <h4 className="font-semibold text-primary">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default ProductNamer;
