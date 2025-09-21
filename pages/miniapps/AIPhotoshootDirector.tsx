import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { PhotoshootConcept, PhotoshootScene } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | PhotoshootConcept;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (productDescription: string, brandStyle: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [productDescription, setProductDescription] = useState('');
    const [brandStyle, setBrandStyle] = useState('Modern & Minimalist');
    const { t } = useTranslation();

    const brandStyles = ['Modern & Minimalist', 'Earthy & Natural', 'Luxurious & Elegant', 'Youthful & Vibrant', 'Tech & Futuristic', 'Vintage & Nostalgic'];

    const handleSubmit = () => {
        onGenerate(productDescription, brandStyle);
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
                    <h2 className="text-lg font-semibold">{t('photoshoot-director-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('photoshoot-director-desc')}</p>
                </div>
            </div>
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
                onClick={handleSubmit}
                disabled={!productDescription || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="camera" className="w-5 h-5" />
                <span>{t('generatePhotoshoot')}</span>
            </button>
        </div>
    );
};


const AIPhotoshootDirector: React.FC<MiniAppProps> = ({ onBack }) => {
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
    
    const handleGenerateMoodboardImages = async () => {
        const lastMessageIndex = messages.length - 1;
        const lastMessage = messages[lastMessageIndex];
        if (lastMessage.role !== 'model' || typeof lastMessage.content !== 'object') return;
        
        const key = `${lastMessageIndex}-moodboard`;
        setImageGenStates(prev => ({...prev, [key]: {isLoading: true, error: null}}));
        
        try {
            const concept = lastMessage.content as PhotoshootConcept;
            const imageUrls = await geminiService.generateMoodboardImage(concept.moodboardDescription);
            const finalImageUrls = imageUrls.map(base64 => `data:image/png;base64,${base64}`);

            setMessages(prev => {
                const newMessages = [...prev];
                const messageToUpdate = newMessages[lastMessageIndex];
                if (messageToUpdate.role === 'model' && typeof messageToUpdate.content === 'object') {
                    (messageToUpdate.content as PhotoshootConcept).moodboardImageUrls = finalImageUrls;
                }
                return newMessages;
            });
        } catch(e) {
            setImageGenStates(prev => ({...prev, [key]: {isLoading: false, error: "Image generation failed."}}));
        } finally {
            setImageGenStates(prev => ({...prev, [key]: {isLoading: false, error: null}}));
        }
    };

    const handleGenerateSceneImage = async (sceneIndex: number, scene: PhotoshootScene) => {
        const lastMessageIndex = messages.length - 1;
        const key = `${lastMessageIndex}-scene-${sceneIndex}`;
        setImageGenStates(prev => ({...prev, [key]: {isLoading: true, error: null}}));

        try {
            const imageUrl = await geminiService.generateSceneImage(scene);
            setMessages(prev => {
                const newMessages = [...prev];
                const messageToUpdate = newMessages[lastMessageIndex];
                if (messageToUpdate.role === 'model' && typeof messageToUpdate.content === 'object') {
                    (messageToUpdate.content as PhotoshootConcept).scenes[sceneIndex].imageUrl = `data:image/png;base64,${imageUrl}`;
                }
                return newMessages;
            });
        } catch(e) {
            setImageGenStates(prev => ({...prev, [key]: {isLoading: false, error: "Image generation failed."}}));
        } finally {
            setImageGenStates(prev => ({...prev, [key]: {isLoading: false, error: null}}));
        }
    };


    const handleInitialGenerate = async (productDescription: string, brandStyle: string) => {
        const initialPrompt = `Create a detailed and creative photoshoot concept for a product.
        Product: "${productDescription}"
        Brand Style: "${brandStyle}"
        The concept should include a title, a moodboard description, a 5-color palette with hex codes and names, and details for two distinct scenes (title, description, lighting, props, camera angle).
        Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
            conceptTitle: "string", moodboardDescription: "string",
            colorPalette: [{ hex: "string", name: "string" }],
            scenes: [{ title: "string", description: "string", lighting: "string", props: ["string"], cameraAngle: "string" }]
        })}`;

        setMessages([{ id: nanoid(), role: 'user', content: `Product: ${productDescription}\nStyle: ${brandStyle}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are an expert AI Photoshoot Director. Your goal is to generate and refine photoshoot concepts. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const concept = JSON.parse(jsonString) as PhotoshootConcept;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: concept }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate concept.");
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
            const concept = JSON.parse(jsonString) as PhotoshootConcept;

            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: concept }]);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to get response.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (message: Message, messageIndex: number) => {
        if (message.role === 'user') {
            return <div className="bg-primary/10 p-4 rounded-lg self-end max-w-xl"><p className="whitespace-pre-wrap">{message.content as string}</p></div>;
        }

        if (typeof message.content === 'object') {
            const result = message.content as PhotoshootConcept;
            const moodboardKey = `${messageIndex}-moodboard`;
            const {isLoading: isMoodboardLoading} = imageGenStates[moodboardKey] || {};
            return (
                 <div className="animate-fade-in space-y-4 bg-card border p-4 rounded-lg self-start max-w-3xl">
                    <h2 className="text-xl font-bold text-primary text-center">{result.conceptTitle}</h2>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">{t('moodboard')}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{result.moodboardDescription}</p>
                        {result.moodboardImageUrls ? (
                             <div className="grid grid-cols-2 gap-2">
                                {result.moodboardImageUrls.map((url, i) => <img key={i} src={url} className="w-full rounded" />)}
                            </div>
                        ) : (
                            <button onClick={handleGenerateMoodboardImages} disabled={isMoodboardLoading} className="text-sm inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-accent disabled:opacity-50">
                                {isMoodboardLoading ? <Icon name="spinner" className="w-4 h-4 animate-spin"/> : <Icon name="image" className="w-4 h-4"/>}
                                Generate Moodboard Images
                            </button>
                        )}
                        <h4 className="font-semibold text-md my-3">{t('colorPalette')}</h4>
                        <div className="flex flex-wrap gap-3">
                            {result.colorPalette.map(color => (
                                <div key={color.hex} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.hex }} />
                                    <p className="text-xs font-medium">{color.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {result.scenes.map((scene, index) => {
                        const sceneKey = `${messageIndex}-scene-${index}`;
                        const { isLoading: isSceneLoading } = imageGenStates[sceneKey] || {};
                        return(
                         <div key={index} className="border-t pt-4">
                            <h3 className="font-semibold text-lg mb-2 text-primary">{`${t('scene')} ${index + 1}: ${scene.title}`}</h3>
                            <p className="text-muted-foreground text-sm mb-3 italic">{scene.description}</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div><strong className="text-foreground">{t('lightingScene')}</strong> {scene.lighting}</div>
                                <div><strong className="text-foreground">{t('cameraAngle')}</strong> {scene.cameraAngle}</div>
                                <div><strong className="text-foreground">{t('props')}</strong> <ul className="list-disc list-inside ms-2 text-xs"> {scene.props.map(p => <li key={p}>{p}</li>)}</ul></div>
                                <div className="flex flex-col items-center justify-center">
                                {scene.imageUrl ? <img src={scene.imageUrl} className="w-full rounded"/> : (
                                    <button onClick={() => handleGenerateSceneImage(index, scene)} disabled={isSceneLoading} className="text-sm w-full inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-accent disabled:opacity-50">
                                        {isSceneLoading ? <Icon name="spinner" className="w-4 h-4 animate-spin"/> : <Icon name="camera" className="w-4 h-4"/>}
                                        Generate Scene Image
                                    </button>
                                )}
                                </div>
                            </div>
                         </div>
                    )})}
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
                            <Icon name="camera" className="w-16 h-16 mx-auto" />
                            <p>Your generated photoshoot concept will appear here.</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg, idx)}</div>)}
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
                                placeholder="Refine your concept... (e.g., 'make the color palette warmer')"
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

export default AIPhotoshootDirector;