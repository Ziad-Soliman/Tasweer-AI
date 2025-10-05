import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useTranslation } from '../App';
import * as geminiService from '../services/geminiService';

const WelcomeScreen = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in p-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                 <Icon name="video" className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-foreground">AI Video Studio</h1>
            <p className="text-muted-foreground mt-2 max-w-md">{t('video-generator-desc')}</p>
        </div>
    );
}

export const VideoPage = ({ selectedModel }: { selectedModel: string }) => {
    const { t } = useTranslation();
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);
        
        const videoLoadingMessages = [
            t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'),
            t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'), t('videoLoadingMessage7')
        ];
        let messageIndex = 0;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
            setLoadingMessage(videoLoadingMessages[messageIndex]);
        }, 8000);

        try {
            const url = await geminiService.generateVideoFromText(prompt);
            setGeneratedVideo(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    return (
        <main className="flex-1 flex flex-col justify-center items-center p-4 relative">
            {!generatedVideo && !isLoading && !error ? (
                <WelcomeScreen />
            ) : (
                <div className="w-full max-w-3xl animate-fade-in">
                    {isLoading && (
                         <div className="aspect-video bg-card/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                            <Icon name="spinner" className="w-10 h-10 text-primary animate-spin"/>
                            <p className="mt-4 font-semibold text-foreground">{loadingMessage}</p>
                            <p className="text-sm text-muted-foreground">This can take a few minutes...</p>
                         </div>
                    )}
                    {generatedVideo && (
                        <div className="aspect-video bg-card rounded-lg overflow-hidden shadow-2xl">
                            <video src={generatedVideo} controls autoPlay loop className="w-full h-full" />
                        </div>
                    )}
                    {error && (
                        <div className="aspect-video bg-destructive/10 border border-destructive text-destructive rounded-lg flex flex-col items-center justify-center p-4">
                            <Icon name="error" className="w-8 h-8 mb-2" />
                            <h3 className="font-bold">Generation Failed</h3>
                            <p className="text-sm max-w-md text-center">{error}</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl z-30 px-4">
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg shadow-2xl p-2 flex items-center gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic shot of a majestic whale breaching the ocean at sunset"
                        className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground px-2"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="bg-primary text-primary-foreground h-10 px-6 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-opacity"
                    >
                        {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <>Generate <Icon name="wand" className="w-4 h-4" /></>}
                    </button>
                </div>
            </div>
        </main>
    );
};