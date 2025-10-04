import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { Presentation } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | Presentation;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (topic: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [topic, setTopic] = useState('');
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(topic);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name="arrow-left" className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-lg font-semibold">{t('presentation-generator-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('presentation-generator-desc')}</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('presentationTopic')}</label>
                 <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('presentationTopicPlaceholder')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={!topic || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5" />
                <span>{t('generatePresentation')}</span>
            </button>
        </div>
    );
};


const AIPresentationGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleInitialGenerate = async (topic: string) => {
        const initialPrompt = `Generate a 5-slide presentation on the topic: "${topic}". Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
            mainTitle: "string", slides: [{ slideNumber: 1, title: "string", content: ["string"], imagePrompt: "string" }]
        })}`;
        
        setMessages([{ id: nanoid(), role: 'user', content: `Topic: ${topic}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are a presentation expert. Your goal is to generate and refine presentation outlines. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const presentation = JSON.parse(jsonString) as Presentation;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: presentation }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate presentation.");
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
            const presentation = JSON.parse(jsonString) as Presentation;
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: presentation }]);
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
            const result = message.content as Presentation;
            return (
                 <div className="animate-fade-in space-y-6 self-start max-w-3xl w-full">
                     <div className="text-center">
                        <h2 className="text-3xl font-bold text-primary">{result.mainTitle}</h2>
                    </div>
                    {result.slides.map((slide) => (
                         <div key={slide.slideNumber} className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl text-foreground">{slide.slideNumber}. {slide.title}</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {slide.content.map((point, i) => <li key={i}>{point}</li>)}
                                </ul>
                            </div>
                            <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm font-semibold text-foreground mb-2">{t('imageSuggestion')}</p>
                                <p className="text-sm italic text-muted-foreground">"{slide.imagePrompt}"</p>
                            </div>
                         </div>
                    ))}
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
                        <div className="m-auto text-center text-muted-foreground"><Icon name="sparkles" className="w-16 h-16 mx-auto" /><p>Your presentation outline will appear here.</p></div>
                    )}
                    {messages.map(msg => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg)}</div>)}
                    {isLoading && <div className="self-start"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div ref={scrollRef} />
                </div>
                
                {messages.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t">
                        <div className="relative">
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Refine your presentation... (e.g., 'make slide 3 more detailed')" className="flex h-12 w-full rounded-md border border-input bg-background ps-4 pe-12 text-sm" disabled={isLoading}/>
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Icon name="send" className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIPresentationGenerator;