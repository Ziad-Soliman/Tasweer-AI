import React, { useState } from 'react';
import { Icon } from '../components/Icon';

const LogoIcon = () => (
    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <path d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75z" stroke="url(#logo-gradient)" stroke-width="1.5" />
    </svg>
);


const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <LogoIcon />
        <h1 className="text-5xl font-bold tracking-tighter text-foreground mt-4">HIGGSFIELD VIDEO</h1>
        <p className="text-muted-foreground mt-2">Create stunning videos from text or images</p>
    </div>
);

const BottomBar = ({ onGenerate, isLoading, selectedModel }: { onGenerate: (prompt: string) => void, isLoading: boolean, selectedModel: string }) => {
    const [prompt, setPrompt] = useState('');

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl z-30 px-4">
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg shadow-2xl p-2 flex items-center gap-2">
                <button className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-muted rounded-md hover:bg-accent transition-colors">
                    <Icon name="plus" className="w-5 h-5 text-muted-foreground" />
                </button>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to create"
                    className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground"
                />
                <button
                    onClick={() => onGenerate(prompt)}
                    disabled={isLoading || !prompt}
                    className="bg-primary text-primary-foreground h-10 px-6 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-opacity"
                >
                    {isLoading ? (
                        <Icon name="spinner" className="w-5 h-5 animate-spin" />
                    ) : (
                       <>
                        Generate <Icon name="wand" className="w-4 h-4" />
                       </>
                    )}
                </button>
            </div>
        </div>
    );
};


export const VideoPage = ({ selectedModel }: { selectedModel: string }) => {
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);
        try {
            // Placeholder for video generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In a real app, you would set the URL from the API response
            setGeneratedVideo('placeholder');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <main className="flex-1 flex flex-col justify-center items-center p-4 pt-16">
            {!generatedVideo && !isLoading ? (
                <WelcomeScreen />
            ) : (
                <div className="w-full max-w-3xl">
                    {isLoading && (
                         <div className="aspect-video bg-card rounded-lg flex items-center justify-center animate-pulse">
                            <Icon name="spinner" className="w-8 h-8 text-muted-foreground animate-spin"/>
                         </div>
                    )}
                    {generatedVideo && (
                        <div className="aspect-video bg-card rounded-lg overflow-hidden animate-fade-in flex items-center justify-center">
                            <p className="text-muted-foreground">Video generation placeholder</p>
                        </div>
                    )}
                    {error && <p className="text-destructive text-center mt-4">{error}</p>}
                </div>
            )}
            <BottomBar onGenerate={handleGenerate} isLoading={isLoading} selectedModel={selectedModel} />
        </main>
    );
};
