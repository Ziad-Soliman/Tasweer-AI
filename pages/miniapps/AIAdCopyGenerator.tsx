import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { AdCopyVariant } from '../../types';
import { useTranslation } from '../../App';
import { Tooltip } from '../../components/Tooltip';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | AdCopyVariant[];
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (productDescription: string, targetAudience: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate(productDescription, targetAudience);
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
                    <h2 className="text-lg font-semibold">{t('ad-copy-generator-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('ad-copy-generator-desc')}</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('productInfo')}</label>
                <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder={t('productInfoPlaceholder')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder={t('targetAudiencePlaceholder')}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={!productDescription || !targetAudience || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="pencil" className="w-5 h-5" />
                <span>{t('generateAdCopy')}</span>
            </button>
        </div>
    );
};

const AdCopyCard: React.FC<{ variant: AdCopyVariant }> = ({ variant }) => {
    const { t } = useTranslation();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    
    return (
        <div className="bg-card border p-4 rounded-lg">
            <h4 className="font-semibold text-primary">{variant.style}</h4>
            <div className="mt-2 space-y-3">
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('headline')}:</strong> {variant.headline}</p>
                    <Tooltip text={copiedField === 'headline' ? t('copy')! : t('copy')}><button onClick={() => handleCopy(variant.headline, 'headline')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'headline' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('body')}:</strong> {variant.body}</p>
                    <Tooltip text={copiedField === 'body' ? t('copy')! : t('copy')}><button onClick={() => handleCopy(variant.body, 'body')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'body' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
                <div className="flex items-start gap-2">
                    <p className="text-sm flex-1"><strong className="text-muted-foreground">{t('cta')}:</strong> {variant.callToAction}</p>
                    <Tooltip text={copiedField === 'cta' ? t('copy')! : t('copy')}><button onClick={() => handleCopy(variant.callToAction, 'cta')} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copiedField === 'cta' ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
            </div>
        </div>
    );
};


const AIAdCopyGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
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

    const handleInitialGenerate = async (productDescription: string, targetAudience: string) => {
        const initialPrompt = `Generate 3 distinct ad copy variations for a product.
        Product Description: "${productDescription}"
        Target Audience: "${targetAudience}"
        
        The variations should have different styles:
        1. A "Punchy & Direct" style
        2. A "Professional & Persuasive" style
        3. A "Humorous & Witty" style
        
        Your response MUST be a JSON array that follows this schema: ${JSON.stringify([{ style: "string", headline: "string", body: "string", callToAction: "string" }])}`;

        setMessages([{ id: nanoid(), role: 'user', content: `Product: ${productDescription}\nAudience: ${targetAudience}` }]);
        setIsLoading(true);
        setError(null);

        try {
            const systemInstruction = `You are an expert marketing copywriter. Your goal is to generate and refine ad copy variants. Always respond with a valid JSON array of objects matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const variants = JSON.parse(jsonString) as AdCopyVariant[];
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: variants }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate ad copy.");
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
            const variants = JSON.parse(jsonString) as AdCopyVariant[];

            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: variants }]);
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
            const variants = message.content as AdCopyVariant[];
            return (
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4 self-start w-full">
                    {variants.map((variant) => (
                        <AdCopyCard key={variant.style} variant={variant} />
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
                            <Icon name="pencil" className="w-16 h-16 mx-auto" />
                            <p>Your generated ad copy will appear here.</p>
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
                                placeholder="Refine your ad copy... (e.g., 'make the humorous one shorter')"
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

export default AIAdCopyGenerator;
