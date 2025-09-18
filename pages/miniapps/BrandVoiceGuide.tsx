import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { BrandVoiceGuide as BrandVoiceGuideType } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const BrandVoiceGuide: React.FC<MiniAppProps> = ({ onBack }) => {
    const [brandDescription, setBrandDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [values, setValues] = useState('');
    const [result, setResult] = useState<BrandVoiceGuideType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!brandDescription || !targetAudience || !values) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const guide = await geminiService.generateBrandVoiceGuide(brandDescription, targetAudience, values);
            setResult(guide);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate guide.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('brand-voice-guide-title')}
            description={t('brand-voice-guide-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('description')}</label>
                        <textarea
                            value={brandDescription}
                            onChange={(e) => setBrandDescription(e.target.value)}
                            placeholder="e.g., We sell eco-friendly, handmade soaps for sensitive skin."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20 resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="e.g., Eco-conscious millennials, new mothers"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('brandValues')}</label>
                        <input
                            type="text"
                            value={values}
                            onChange={(e) => setValues(e.target.value)}
                            placeholder={t('brandValuesPlaceholder')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!brandDescription || !targetAudience || !values || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('definingVoice') : t('generateBrandVoice')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {result && (
                    <div className="animate-fade-in space-y-6 border-t pt-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-primary">{t('voiceProfile', { name: result.voiceName })}</h2>
                            <p className="text-muted-foreground mt-2">{result.description}</p>
                        </div>
                        
                        <div className="bg-card border p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3 text-foreground">{t('characteristics')}</h3>
                             <div className="flex flex-wrap gap-2">
                                {result.characteristics.map(char => (
                                    <span key={char} className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full">{char}</span>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-card border p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-green-500 flex items-center gap-2"><Icon name="check" /> {t('do')}</h3>
                                <ul className="space-y-2 text-sm list-disc list-inside">
                                    {result.messagingMatrix.do.map(item => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-card border p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-destructive flex items-center gap-2"><Icon name="close" /> {t('dont')}</h3>
                                <ul className="space-y-2 text-sm list-disc list-inside">
                                    {result.messagingMatrix.dont.map(item => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                         <div className="bg-card border p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3 text-foreground">{t('examplesInAction')}</h3>
                            <div className="space-y-4">
                                {result.exampleCopy.map(ex => (
                                    <div key={ex.scenario}>
                                        <p className="font-semibold text-sm text-primary">{ex.scenario}</p>
                                        <blockquote className="border-s-4 border-border ps-4 mt-1 text-sm italic text-muted-foreground">"{ex.copy}"</blockquote>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default BrandVoiceGuide;
