import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { ComicPanel } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | ComicPanel[];
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (story: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [story, setStory] = useState('');
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(story);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name="arrow-left" className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-lg font-semibold">{t('comic-creator-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('comic-creator-desc')}</p>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('storyIdea')}</label>
                <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder={t('storyIdeaPlaceholder')} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-32 resize-none"/>
            </div>
            <button
                onClick={handleSubmit}
                disabled={!story || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5" />
                <span>{t('generateComic')}</span>
            </button>
        </div>
    );
};

const AIComicCreator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageGenStates, setImageGenStates] = useState<Record<string, {isLoading: boolean, error: string | null}>>({});
    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleGeneratePanelImage = async (panelIndex: number, imagePrompt: string) => {
        const key = `${messages.length - 1}-${panelIndex}`;
        setImageGenStates(prev => ({ ...prev, [key]: {isLoading: true, error: null} }));
        try {
            const imageBase64 = await geminiService.generateComicPanelImage(imagePrompt);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model' && Array.isArray(lastMessage.content)) {
                    (lastMessage.content as ComicPanel[])[panelIndex].imageUrl = `data:image/png;base64,${imageBase64}`;
                }
                return newMessages;
            });
        } catch (e) {
            setImageGenStates(prev => ({ ...prev, [key]: {isLoading: false, error: "Image generation failed."} }));
        } finally {
            setImageGenStates(prev => ({ ...prev, [key]: {isLoading: false, error: null} }));
        }
    };
    
    const handleInitialGenerate = async (story: string) => {
        const initialPrompt = `Based on the story "${story}", create a 4-panel comic strip script. Your response MUST be a JSON array that follows this schema: ${JSON.stringify([{ panel: 1, imagePrompt: "string", dialogue: "string", narration: "string" }])}`;
        setMessages([{ id: nanoid(), role: 'user', content: `Story: ${story}` }]);
        setIsLoading(true);
        setError(null);
        try {
            const systemInstruction = `You are a comic book writer. Your goal is to generate and refine 4-panel comic scripts. Always respond with a valid JSON array of objects matching the schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const panels = JSON.parse(jsonString) as ComicPanel[];
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: panels }]);
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
            const panels = JSON.parse(jsonString) as ComicPanel[];
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: panels }]);
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

        if (Array.isArray(message.content)) {
            const panels = message.content as ComicPanel[];
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 self-start w-full">
                    {panels.map((panel, index) => {
                        const key = `${messageIndex}-${index}`;
                        const { isLoading: isImageLoading } = imageGenStates[key] || {};
                        return (
                             <div key={panel.panel} className="bg-card border rounded-lg overflow-hidden flex flex-col">
                                <div className="aspect-square bg-muted flex items-center justify-center relative">
                                   {panel.imageUrl ? (
                                        <img src={panel.imageUrl} alt={`Panel ${panel.panel}`} className="w-full h-full object-cover" />
                                   ) : (
                                        <button onClick={() => handleGeneratePanelImage(index, panel.imagePrompt)} disabled={isImageLoading} className="z-10 inline-flex items-center gap-2 bg-background/70 text-foreground px-3 py-1.5 rounded-full hover:bg-background disabled:opacity-50">
                                             {isImageLoading ? <Icon name="spinner" className="w-4 h-4 animate-spin"/> : <Icon name="camera" className="w-4 h-4"/>}
                                            Generate Image
                                        </button>
                                   )}
                                   <p className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1 rounded font-mono">{panel.imagePrompt}</p>
                                </div>
                                <div className="p-4 text-sm flex-1 flex flex-col">
                                    <h4 className="font-bold text-primary">{t('panel')} {panel.panel}</h4>
                                    {panel.narration && <p className="text-muted-foreground mt-1 text-xs italic bg-muted p-2 rounded">"{panel.narration}"</p>}
                                    {panel.dialogue && <p className="text-foreground mt-2 flex-1">💬 {panel.dialogue}</p>}
                                </div>
                            </div>
                        );
                    })}
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
                        <div className="m-auto text-center text-muted-foreground"><Icon name="sparkles" className="w-16 h-16 mx-auto" /><p>Your comic script will appear here.</p></div>
                    )}
                    {messages.map((msg, idx) => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg, idx)}</div>)}
                    {isLoading && <div className="self-start"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div ref={scrollRef} />
                </div>
                {messages.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t">
                        <div className="relative">
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Refine your comic... (e.g., 'change the dialogue in panel 2')" className="flex h-12 w-full rounded-md border border-input bg-background ps-4 pe-12 text-sm" disabled={isLoading}/>
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Icon name="send" className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIComicCreator;