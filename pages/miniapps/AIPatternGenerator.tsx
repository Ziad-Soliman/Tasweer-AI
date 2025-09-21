import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AIPatternGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [description, setDescription] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!description) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const images = await geminiService.generateSeamlessPattern(description);
            setResults(images.map(base64 => `data:image/png;base64,${base64}`));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate patterns.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('pattern-generator-title')}
            description={t('pattern-generator-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg flex flex-col gap-4">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t('patternDescription')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('patternDescriptionPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!description || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 self-start"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('generating') : t('generatePattern')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                {isLoading && (
                    <div className="text-center text-muted-foreground"><Icon name="spinner" className="w-8 h-8 animate-spin mx-auto" /><p className="mt-2">{t('generating')}...</p></div>
                )}

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-6 border-t pt-8">
                         <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedPatterns')}</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {results.map((src, index) => (
                                <div key={index}>
                                    <div className="p-2 bg-muted rounded-lg border">
                                        <div className="text-sm text-center mb-2 text-muted-foreground">{t('previewSeamlessness')}</div>
                                        <div 
                                            className="w-full aspect-square rounded"
                                            style={{ backgroundImage: `url(${src})`, backgroundSize: '50%' }}
                                        />
                                    </div>
                                    <img src={src} alt={`Pattern tile ${index + 1}`} className="w-24 h-24 object-cover bg-muted rounded-lg border mt-2 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIPatternGenerator;
