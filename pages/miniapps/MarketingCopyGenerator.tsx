import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat, Part } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { MarketingCopy } from '../../types';
import { useTranslation } from '../../App';
import { Tooltip } from '../../components/Tooltip';
import { FileUpload } from '../../components/FileUpload';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | MarketingCopy;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (imageFile: File, prompt: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const { t } = useTranslation();

    const handleSubmit = () => {
        if (!imageFile) return;
        onGenerate(imageFile, prompt);
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
                    <h2 className="text-lg font-semibold">{t('marketing-copy-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('marketing-copy-desc')}</p>
                </div>
            </div>
            
            <FileUpload onFileUpload={setImageFile} label={t('uploadProductPhoto')} uploadedFileName={imageFile?.name} />
            
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('optionalDescribeStyle')}</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Focus on luxury and exclusivity."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!imageFile || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="pencil" className="w-5 h-5" />
                <span>{t('generateCopy')}</span>
            </button>
        </div>
    );
};


const MarketingCopyGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
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

    const handleInitialGenerate = async (imageFile: File, prompt: string) => {
        const userMessageContent = `Image: ${imageFile.name}${prompt ? `\nPrompt: ${prompt}`: ''}`;
        setMessages([{ id: nanoid(), role: 'user', content: userMessageContent }]);
        setIsLoading(true);
        setError(null);

        try {
            const imagePart = await geminiService.fileToGenerativePart(imageFile);
            const textPart = { text: `This is a product photo. ${prompt ? `The user added this context: "${prompt}".` : ''} Based on this image, generate compelling marketing copy. Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
                productName: "string", tagline: "string", description: "string",
                socialMediaPost: "string", socialMediaPostArabic: "string"
            })}`};

            const systemInstruction = `You are an expert marketing copywriter. Your goal is to generate and refine marketing copy based on product images. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            const response = await chatRef.current.sendMessage({ message: [imagePart, textPart] });
            const jsonString = response.text.trim();
            const copy = JSON.parse(jsonString) as MarketingCopy;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: copy }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate copy.");
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
            const copy = JSON.parse(jsonString) as MarketingCopy;
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: copy }]);
        } catch(e) {
            setError(e instanceof Error ? e.message : "Failed to get response.");
        } finally {
            setIsLoading(false);
        }
    };

    const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="grid gap-2">
                 <label className="text-sm font-medium leading-none text-muted-foreground">{label}</label>
                <div className="flex items-center space-x-2">
                    <p dir="auto" className="flex-1 text-sm bg-secondary text-secondary-foreground p-3 rounded-md whitespace-pre-wrap font-mono">{value}</p>
                    <Tooltip text={copied ? t('copied')! : t('copy')}><button onClick={handleCopy} className="p-2 rounded-md bg-secondary hover:bg-accent text-muted-foreground"><Icon name={copied ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
                </div>
            </div>
        );
    };

    const renderMessageContent = (message: Message) => {
        if (message.role === 'user') {
            return <div className="bg-primary/10 p-4 rounded-lg self-end max-w-xl"><p className="whitespace-pre-wrap">{message.content as string}</p></div>;
        }

        if (typeof message.content === 'object') {
            const copy = message.content as MarketingCopy;
            return (
                <div className="animate-fade-in space-y-4 border bg-card p-4 rounded-lg self-start max-w-2xl">
                    <CopyField label={t('productName')} value={copy.productName} />
                    <CopyField label={t('tagline')} value={copy.tagline} />
                    <CopyField label={t('description')} value={copy.description} />
                    <CopyField label={t('socialMediaPost')} value={copy.socialMediaPost} />
                    <CopyField label={t('socialMediaPostArabic')} value={copy.socialMediaPostArabic} />
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
                            <p>Your generated marketing copy will appear here.</p>
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
                                placeholder="Refine your copy... (e.g., 'make the tagline shorter')"
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

export default MarketingCopyGenerator;