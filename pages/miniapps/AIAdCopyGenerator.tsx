import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { AdCopyVariant } from '../../types';
import { useTranslation } from '../../App';
import { Tooltip } from '../../components/Tooltip';
import { FileUpload } from '../../components/FileUpload';

interface MiniAppProps {
    onBack: () => void;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (productDescription: string, targetAudience: string, imageFile: File | null) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(productDescription, targetAudience, imageFile);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack} 
                    className="p-2 rounded-md hover:bg-accent text-muted-foreground"
                    aria-label={t('backToMiniApps')}
                >
                <Icon name="arrow-left" className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold">{t('ad-copy-generator-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('ad-copy-generator-desc')}</p>
                </div>
            </div>
            
             <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('productImageOptional')}</label>
                <FileUpload onFileUpload={setImageFile} label={t('uploadProductPhoto')} uploadedFileName={imageFile?.name} />
            </div>

            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('productInfo')}</label>
                <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder={t('productInfoPlaceholder')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder={t('targetAudiencePlaceholder')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={(!imageFile && !productDescription) || !targetAudience || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="pencil" className="w-5 h-5" />
                <span>{t('generateAdCopy')}</span>
            </button>
        </div>
    );
};

const AdCopyCard: React.FC<{ variant: AdCopyVariant }> = ({ variant }) => {
    const { t } = useTranslation();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    
    return (
        <div className="bg-card border p-4 rounded-lg">
            <h4 className="font-semibold text-primary">{variant.style}</h4>
            <div className="mt-2 space-y-3">
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('headline')}:</strong> {variant.headline}</p>
                    <Tooltip text={copiedField === 'headline' ? t('copied')! : t('copy')}><button onClick={() => handleCopy(variant.headline, 'headline')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'headline' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('body')}:</strong> {variant.body}</p>
                    <Tooltip text={copiedField === 'body' ? t('copied')! : t('copy')}><button onClick={() => handleCopy(variant.body, 'body')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'body' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('cta')}:</strong> {variant.callToAction}</p>
                    <Tooltip text={copiedField === 'cta' ? t('copied')! : t('copy')}><button onClick={() => handleCopy(variant.callToAction, 'cta')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'cta' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
            </div>
        </div>
    );
};


const AIAdCopyGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [results, setResults] = useState<AdCopyVariant[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async (productDescription: string, targetAudience: string, imageFile: File | null) => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const variants = await geminiService.generateAdCopyVariants(productDescription, targetAudience, imageFile);
            setResults(variants);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate ad copy.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <MiniAppLayout controls={<Controls onBack={onBack} onGenerate={handleGenerate} isLoading={isLoading} />}>
            <div className="h-full flex flex-col p-4 overflow-y-auto">
                    {!results && !isLoading && (
                        <div className="m-auto text-center text-muted-foreground">
                            <Icon name="pencil" className="w-16 h-16 mx-auto" />
                            <p>Your generated ad copy will appear here.</p>
                        </div>
                    )}
                    {isLoading && <div className="m-auto"><Icon name="spinner" className="w-8 h-8 animate-spin text-primary" /></div>}
                    {error && <p className="m-auto text-sm text-destructive">{error}</p>}
                    
                    {results && (
                        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4 w-full animate-fade-in">
                            {results.map((variant) => (
                                <AdCopyCard key={variant.style} variant={variant} />
                            ))}
                        </div>
                    )}
            </div>
        </MiniAppLayout>
    );
};

export default AIAdCopyGenerator;