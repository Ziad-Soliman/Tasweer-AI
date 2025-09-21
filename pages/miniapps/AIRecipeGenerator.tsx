import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat, Part } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { Recipe } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | Recipe;
}

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (data: { imageFile?: File, ingredientsText?: string, restrictions: string }) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [ingredientsText, setIngredientsText] = useState('');
    const [restrictions, setRestrictions] = useState('');
    const [inputMethod, setInputMethod] = useState<'image' | 'text'>('text');
    const { t } = useTranslation();

    const handleSubmit = () => {
        onGenerate({
            imageFile: inputMethod === 'image' ? imageFile : undefined,
            ingredientsText: inputMethod === 'text' ? ingredientsText : undefined,
            restrictions
        });
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name="arrow-left" className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-lg font-semibold">{t('recipe-generator-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('recipe-generator-desc')}</p>
                </div>
            </div>
            
             <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('inputMethod')}</label>
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
                   <button onClick={() => setInputMethod('text')} className={`w-full h-full text-sm ${inputMethod === 'text' ? 'bg-background text-foreground shadow-sm rounded-sm' : ''}`}>{t('text')}</button>
                   <button onClick={() => setInputMethod('image')} className={`w-full h-full text-sm ${inputMethod === 'image' ? 'bg-background text-foreground shadow-sm rounded-sm' : ''}`}>{t('image')}</button>
                </div>
                {inputMethod === 'text' ? (
                    <textarea value={ingredientsText} onChange={e => setIngredientsText(e.target.value)} placeholder={t('listIngredientsPlaceholder')} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"/>
                ) : (
                     <FileUpload onFileUpload={setImageFile} label={t('uploadIngredientsPhoto')} uploadedFileName={imageFile?.name}/>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-foreground">{t('dietaryRestrictions')}</label>
                <input type="text" value={restrictions} onChange={(e) => setRestrictions(e.target.value)} placeholder={t('dietaryRestrictionsPlaceholder')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/>
            </div>
            <button
                onClick={handleSubmit}
                disabled={(!imageFile && !ingredientsText) || isLoading}
                className="mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5" />
                <span>{t('findRecipe')}</span>
            </button>
        </div>
    );
};

const AIRecipeGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleInitialGenerate = async (data: { imageFile?: File, ingredientsText?: string, restrictions: string }) => {
        let userMessage = `Ingredients: ${data.ingredientsText || data.imageFile?.name || 'from image'}`;
        if (data.restrictions) userMessage += `\nRestrictions: ${data.restrictions}`;
        setMessages([{ id: nanoid(), role: 'user', content: userMessage }]);
        
        setIsLoading(true);
        setError(null);
        
        try {
            const parts: Part[] = [];
            let promptText = `Generate a creative recipe. Your response MUST be a JSON object that follows this schema: ${JSON.stringify({ recipeName: "string", description: "string", prepTime: "string", cookTime: "string", servings: "string", ingredients: ["string"], instructions: ["string"] })}`;
            if (data.imageFile) {
                parts.push(await fileToGenerativePart(data.imageFile));
                promptText += ` The image contains the available ingredients.`;
            } else {
                promptText += ` The available ingredients are: ${data.ingredientsText}.`;
            }
            if (data.restrictions) promptText += ` Dietary restrictions: ${data.restrictions}.`;
            parts.push({ text: promptText });

            const systemInstruction = `You are a creative chef. Your goal is to generate and refine recipes. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            
            // FIX: The argument to sendMessage must be an object with a `message` property.
            const response = await chatRef.current.sendMessage({ message: parts });
            const jsonString = response.text.trim();
            const recipe = JSON.parse(jsonString) as Recipe;
            
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: recipe }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate recipe.");
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
            const recipe = JSON.parse(jsonString) as Recipe;
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: recipe }]);
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
            const recipe = message.content as Recipe;
            return (
                <div className="bg-card border p-6 rounded-lg self-start max-w-3xl animate-fade-in">
                    <h2 className="text-2xl font-bold text-primary mb-2">{recipe.recipeName}</h2>
                    <p className="text-muted-foreground italic mb-4">{recipe.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
                        <span><strong>{t('prepTime')}:</strong> {recipe.prepTime}</span>
                        <span><strong>{t('cookTime')}:</strong> {recipe.cookTime}</span>
                        <span><strong>{t('servings')}:</strong> {recipe.servings}</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="font-semibold text-lg mb-2">{t('ingredients')}</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                             <h3 className="font-semibold text-lg mb-2">{t('instructions')}</h3>
                             <ol className="list-decimal list-inside space-y-2 text-sm">
                                {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                             </ol>
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
                        <div className="m-auto text-center text-muted-foreground"><Icon name="sparkles" className="w-16 h-16 mx-auto" /><p>Your generated recipe will appear here.</p></div>
                    )}
                    {messages.map(msg => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg)}</div>)}
                    {isLoading && <div className="self-start"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div ref={scrollRef} />
                </div>
                
                {messages.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t">
                        <div className="relative">
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Refine your recipe... (e.g., 'Can I use chicken thighs instead?')" className="flex h-12 w-full rounded-md border border-input bg-background ps-4 pe-12 text-sm" disabled={isLoading}/>
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Icon name="send" className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIRecipeGenerator;