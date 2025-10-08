

import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { VideoAdScript, VideoAdScene } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | VideoAdScript;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (productDescription: string, targetAudience: string, platform: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [platform, setPlatform] = useState('TikTok');
    const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts'];
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(productDescription, targetAudience, platform);
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
                    <h2 className="text-lg font-semibold">{t('video-ad-scripter-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('video-ad-scripter-desc')}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('productDescription')}</label>
                <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g., Aura Aromatics, a line of all-natural essential oil diffusers."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20 resize-none"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals interested in wellness"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('platform')}</label>
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <button
                onClick={handleSubmit}
                disabled={!productDescription || !targetAudience || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="video" className="w-5 h-5" />
                <span>{t('generateVideoScript')}</span>
            </button>
        </div>
    );
};


const VideoAdScripter: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageGenStates, setImageGenStates] = useState<Record<string, {isLoading: boolean, error: string | null}>>({});

    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleGenerateSceneImage = async (messageId: string, sceneNumber: number, visual: string) => {
        const key = `${messageId}-${sceneNumber}`;
        setImageGenStates(prev => ({ ...prev, [key]: {isLoading: true, error: null} }));

        try {
            const imageBase64 = await geminiService.generateVideoSceneImage(visual);
            setMessages(prev => {
                return prev.map(msg => {
                    if (msg.id === messageId && msg.role === 'model' && typeof msg.content === 'object') {
                        const newContent = { ...(msg.content as VideoAdScript) };
                        const sceneIndex = newContent.scenes.findIndex(s => s.sceneNumber === sceneNumber);
                        if (sceneIndex !== -1) {
                            newContent.scenes[sceneIndex].imageUrl = `data:image/png;base64,${imageBase64}`;
                        }
                        return { ...msg, content: newContent };
                    }
                    return msg;
                });
            });
        } catch (e) {
             setImageGenStates(prev => ({ ...prev, [key]: {isLoading: false, error: "Failed to generate image."} }));
        } finally {
            setImageGenStates(prev => ({ ...prev, [key]: {isLoading: false, error: null} }));
        }
    };


    const handleInitialGenerate = async (productDescription: string, targetAudience: string, platform: string) => {
        const initialPrompt = `Create a short, engaging video ad script for a product.
        Product: "${productDescription}"
        Target Audience: "${targetAudience}"
        Platform: "${platform}"
        Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
            title: "string", platform: "string", targetAudience: "string", hook: "string",
            scenes: [{ sceneNumber: 1, visual: "string", voiceover: "string", onScreenText: "string", duration: "string" }],
            callToAction: "string", musicSuggestion: "string"
        })}`;
        
        setMessages([{ id: nanoid(), role: 'user', content: `Product: ${productDescription}\nAudience: ${targetAudience}\nPlatform: ${platform}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are an expert video ad scriptwriter. Your goal is to generate and refine punchy, effective video scripts for social media. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const script = JSON.parse(jsonString) as VideoAdScript;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: script }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate script.");
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || !chatRef.current) return;
        const newUserMessage: Message = { id: nanoid(), role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatRef.current.sendMessage({ message: userInput });
            const jsonString = response.text.trim();
            const script = JSON.parse(jsonString) as VideoAdScript;

            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: script }]);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to get response.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (message: Message) => {
        if (message.role === 'user') {
            return <div className="bg-primary/10 p-4 rounded-lg self-end max-w-xl"><p className="whitespace-pre-wrap">{message.content as string}</p></div>;
        }

        if (typeof message.content === 'object') {
            const result = message.content as VideoAdScript;
            return (
                <div className="bg-card border rounded-lg p-4 font-mono text-sm self-start max-w-2xl w-full">
                    <h2 className="text-md font-bold text-primary mb-2 uppercase">{result.title}</h2>
                    <p><strong className="text-muted-foreground">PLATFORM:</strong> {result.platform}</p>
                    <p className="mb-2"><strong className="text-muted-foreground">AUDIENCE:</strong> {result.targetAudience}</p>
                    <p className="border-t pt-2 mt-2"><strong className="text-muted-foreground">HOOK (0-2s):</strong> {result.hook}</p>
                    
                    <div className="border-t mt-2 pt-2 space-y-4">
                        {result.scenes.map(scene => {
                            const key = `${message.id}-${scene.sceneNumber}`;
                            const { isLoading: isImageLoading, error: imageError } = imageGenStates[key] || { isLoading: false, error: null };
                            return(
                            <div key={scene.sceneNumber} className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <p><strong className="text-muted-foreground">SCENE {scene.sceneNumber} ({scene.duration})</strong></p>
                                    <p><strong className="text-primary/80">VISUAL:</strong> {scene.visual}</p>
                                    <p><strong className="text-primary/80">V.O.:</strong> {scene.voiceover || " (None)"}</p>
                                    <p><strong className="text-primary/80">TEXT:</strong> {scene.onScreenText || " (None)"}</p>
                                </div>
                                <div className="col-span-1 flex flex-col items-center justify-center">
                                    {scene.imageUrl ? (
                                        <img src={scene.imageUrl} className="w-full aspect-[9/16] object-cover rounded bg-muted" />
                                    ) : (
                                        <button onClick={() => handleGenerateSceneImage(message.id, scene.sceneNumber, scene.visual)} disabled={isImageLoading} className="w-full aspect-[9/16] bg-muted hover:bg-accent rounded flex flex-col items-center justify-center text-xs text-muted-foreground text-center p-1 disabled:opacity-50">
                                            {isImageLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <><Icon name="camera" className="w-5 h-5 mb-1"/> Generate Scene</>}
                                        </button>
                                    )}
                                    {imageError && <p className="text-xs text-destructive mt-1">{imageError}</p>}
                                </div>
                            </div>
                        )})}
                    </div>

                    <p className="border-t pt-2 mt-2"><strong className="text-muted-foreground">MUSIC:</strong> {result.musicSuggestion}</p>
                    <p className="mt-1"><strong className="text-muted-foreground">C.T.A.:</strong> {result.callToAction}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <MiniAppLayout controls={<Controls onBack={onBack} onGenerate={handleInitialGenerate} isLoading={isLoading && messages.length < 2} />}>
            <div className="h-full flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-4 flex flex-col pb-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="m-auto text-center text-muted-foreground">
                            <Icon name="video" className="w-16 h-16 mx-auto" />
                            <p>Your generated video script will appear here.</p>
                        </div>
                    )}
                    {messages.map((msg) => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg)}</div>)}
                    {isLoading && <div className="self-start"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div ref={scrollRef} />
                </div>
                {messages.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t">
                        <div className="relative">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Refine your script... (e.g., 'make the hook shorter')"
                                className="flex h-12 w-full rounded-md border border-input bg-background ps-4 pe-12 text-sm"
                                disabled={isLoading}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
                                <Icon name="send" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default VideoAdScripter;