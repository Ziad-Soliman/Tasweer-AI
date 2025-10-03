import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { ProductNameSuggestion } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | ProductNameSuggestion[];
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (description: string, keywords: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(description, keywords);
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
                    <h2 className="text-lg font-semibold">{t('product-namer-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('product-namer-desc')}</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('productDescription')}</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., A smart water bottle that tracks hydration and glows to remind you to drink."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('keywordsOptional')}</label>
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={t('keywordsPlaceholder')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={!description || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5" />
                <span>{t('generateNames')}</span>
            </button>
        </div>
    );
};

const ProductNamer: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInitialGenerate = async (description: string, keywords: string) => {
        const initialPrompt = `Generate 5 creative and brandable product names for the following product. For each name, provide a short reasoning.
        Product Description: "${description}"
        Keywords to incorporate: "${keywords}"
        Your response MUST be a JSON array that follows this schema: ${JSON.stringify([{ name: "string", reasoning: "string" }])}`;

        setMessages([{ id: nanoid(), role: 'user', content: `Product: ${description}\nKeywords: ${keywords}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are a branding expert specializing in product naming. Your goal is to generate and refine product names. Always respond with a valid JSON array of objects matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            // FIX: The argument to sendMessage must be an object with a `message` property.
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const names = JSON.parse(jsonString) as ProductNameSuggestion[];
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: names }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate names.");
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
            // FIX: The argument to sendMessage must be an object with a `message` property.
            const response = await chatRef.current.sendMessage({ message: userInput });
            const jsonString = response.text.trim();
            const names = JSON.parse(jsonString) as ProductNameSuggestion[];

            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: names }]);
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

        if (Array.isArray(message.content)) {
            const names = message.content as ProductNameSuggestion[];
            return (
                <div className="grid md:grid-cols-2 gap-4 self-start w-full max-w-2xl">
                    {names.map((item, index) => (
                        <div key={index} className="bg-card border p-4 rounded-lg">
                            <h4 className="font-semibold text-primary">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
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
                        <div className="m-auto text-center text-muted-foreground">
                            <Icon name="sparkles" className="w-16 h-16 mx-auto" />
                            <p>Your generated product names will appear here.</p>
                        </div>
                    )}
                    {messages.map(msg => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg)}</div>)}
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
                                placeholder="Refine your names... (e.g., 'give me 5 more options')"
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

export default ProductNamer;