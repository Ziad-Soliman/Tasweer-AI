import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { PhotoshootConcept } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AIPhotoshootDirector: React.FC<MiniAppProps> = ({ onBack }) => {
    const [productDescription, setProductDescription] = useState('');
    const [brandStyle, setBrandStyle] = useState('Modern & Minimalist');
    const [result, setResult] = useState<PhotoshootConcept | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const brandStyles = ['Modern & Minimalist', 'Earthy & Natural', 'Luxurious & Elegant', 'Youthful & Vibrant', 'Tech & Futuristic', 'Vintage & Nostalgic'];

    const handleGenerate = async () => {
        if (!productDescription) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const concept = await geminiService.generatePhotoshootConcept(productDescription, brandStyle);
            setResult(concept);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate concept.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('photoshoot-director-title')}
            description={t('photoshoot-director-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('productDescription')}</label>
                        <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder={t('productDescriptionPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('brandStyle')}</label>
                         <select
                            value={brandStyle}
                            onChange={(e) => setBrandStyle(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {brandStyles.map(style => <option key={style} value={style}>{style}</option>)}
                        </select>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!productDescription || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="camera" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('directing') : t('generatePhotoshoot')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {result && (
                    <div className="animate-fade-in space-y-6 border-t pt-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-primary">{result.conceptTitle}</h2>
                        </div>

                        <div className="bg-card border p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-foreground">{t('moodboard')}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{result.moodboardDescription}</p>
                            <h4 className="font-semibold text-md mb-3 text-foreground">{t('colorPalette')}</h4>
                            <div className="flex flex-wrap gap-3">
                                {result.colorPalette.map(color => (
                                    <div key={color.hex} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color.hex }} />
                                        <div>
                                            <p className="text-sm font-medium">{color.name}</p>
                                            <p className="text-xs text-muted-foreground">{color.hex}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {result.scenes.map((scene, index) => (
                             <div key={index} className="bg-card border p-6 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 text-primary">{`${t('scene')} ${index + 1}: ${scene.title}`}</h3>
                                <p className="text-muted-foreground text-sm mb-4 italic">{scene.description}</p>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div><strong className="text-foreground">{t('lightingScene')}</strong> {scene.lighting}</div>
                                    <div><strong className="text-foreground">{t('cameraAngle')}</strong> {scene.cameraAngle}</div>
                                    <div className="md:col-span-2">
                                        <strong className="text-foreground">{t('props')}</strong>
                                        <ul className="list-disc list-inside ms-2 mt-1">
                                            {scene.props.map(prop => <li key={prop}>{prop}</li>)}
                                        </ul>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIPhotoshootDirector;
