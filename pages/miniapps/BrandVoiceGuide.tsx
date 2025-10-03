import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { BrandVoiceGuide as BrandVoiceGuideType } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | BrandVoiceGuideType;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (brandDescription: string, targetAudience: string, values: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [brandDescription, setBrandDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [values, setValues] = useState('');
    const { t } = useTranslation();
    
    const handleSubmit = () => {
        onGenerate(brandDescription, targetAudience, values);
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
                    <h2 className="text-lg font-semibold">{t('brand-voice-guide-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('brand-voice-guide-desc')}</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('description')}</label>
                <textarea
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    placeholder="e.g., We sell eco-friendly, handmade soaps for sensitive skin."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20 resize-none"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Eco-conscious millennials, new mothers"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('brandValues')}</label>
                <input
                    type="text"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    placeholder={t('brandValuesPlaceholder')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={!brandDescription || !targetAudience || !values || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5" />
                <span>{t('generateBrandVoice')}</span>
            </button>
        </div>
    );
};


const BrandVoiceGuide: React.FC<MiniAppProps> = ({ onBack }) => {
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

    const handleInitialGenerate = async (brandDescription: string, targetAudience: string, values: string) => {
        const initialPrompt = `Generate a brand voice and tone guide based on the following information.
        Brand Description: "${brandDescription}"
        Target Audience: "${targetAudience}"
        Brand Values/Keywords: "${values}"
        The guide should include a catchy name for the voice, a description, key characteristics, a "Do's and Don'ts" matrix, and two specific examples of the voice in action.
        Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
            voiceName: "string", description: "string", characteristics: ["string"],
            messagingMatrix: { do: ["string"], dont: ["string"] },
            exampleCopy: [{ scenario: "string", copy: "string" }]
        })}`;
        
        setMessages([{ id: nanoid(), role: 'user', content: `Brand: ${brandDescription}\nAudience: ${targetAudience}\nValues: ${values}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are an expert brand strategist. Your goal is to generate and refine brand voice guides. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            // FIX: The argument to sendMessage must be an object with a `message` property.
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const guide = JSON.parse(jsonString) as BrandVoiceGuideType;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: guide }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate guide.");
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
            const guide = JSON.parse(jsonString) as BrandVoiceGuideType;

            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: guide }]);
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
            const result = message.content as BrandVoiceGuideType;
            return (
                 <div className="bg-card border p-4 rounded-lg space-y-4 self-start max-w-2xl">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-primary">{t('voiceProfile', { name: result.voiceName })}</h2>
                        <p className="text-muted-foreground mt-1 text-sm">{result.description}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t('characteristics')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {result.characteristics.map(char => (
                                <span key={char} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">{char}</span>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-green-500 flex items-center gap-2"><Icon name="check" /> {t('do')}</h3>
                            <ul className="space-y-1 text-xs list-disc list-inside">
                                {result.messagingMatrix.do.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-destructive flex items-center gap-2"><Icon name="close" /> {t('dont')}</h3>
                            <ul className="space-y-1 text-xs list-disc list-inside">
                                {result.messagingMatrix.dont.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t('examplesInAction')}</h3>
                        <div className="space-y-3">
                            {result.exampleCopy.map(ex => (
                                <div key={ex.scenario}>
                                    <p className="font-semibold text-xs text-primary">{ex.scenario}</p>
                                    <blockquote className="border-s-2 border-border ps-2 mt-1 text-xs italic text-muted-foreground">"{ex.copy}"</blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
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
                            <Icon name="brand" className="w-16 h-16 mx-auto" />
                            <p>Your brand voice guide will appear here.</p>
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
                                placeholder="Refine your guide... (e.g., 'Give me another example for social media')"
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

export default BrandVoiceGuide;