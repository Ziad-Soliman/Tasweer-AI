import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AIQRCodeGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [url, setUrl] = useState('');
    const [prompt, setPrompt] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!url || !prompt) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const images = await geminiService.generateArtisticQRCode(url, prompt);
            setResults(images.map(base64 => `data:image/png;base64,${base64}`));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate QR codes.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('qr-code-generator-title')}
            description={t('qr-code-generator-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('websiteURL')}</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('artisticPrompt')}</label>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('artisticPromptPlaceholder')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!url || !prompt || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="qrcode" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('generating') : t('generateQRCode')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {isLoading && (
                    <div className="text-center text-muted-foreground">
                        <Icon name="spinner" className="w-8 h-8 animate-spin mx-auto" />
                        <p className="mt-2">{t('generating')}...</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedDesigns')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {results.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`QR Code concept ${index + 1}`}
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

export default AIQRCodeGenerator;
