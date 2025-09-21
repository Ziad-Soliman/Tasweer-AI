import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AIVideoGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setResultUrl(null);
        
        const videoLoadingMessages = [
            t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'),
            t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'), t('videoLoadingMessage7')
        ];
        let messageIndex = 0;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
            setLoadingMessage(videoLoadingMessages[messageIndex]);
        }, 5000);

        try {
            const url = await geminiService.generateVideoFromText(prompt);
            setResultUrl(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate video.");
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <MiniAppLayout
            title={t('video-generator-title')}
            description={t('video-generator-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg flex flex-col gap-4">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t('videoPrompt')}</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('videoPromptPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!prompt || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 self-start"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="video" className="w-5 h-5" /> )}
                        <span>{isLoading ? loadingMessage : t('generateVideo')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                {resultUrl && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('result')}</h3>
                        <video src={resultUrl} controls autoPlay loop className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" />
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIVideoGenerator;
