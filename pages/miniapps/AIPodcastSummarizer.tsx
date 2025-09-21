import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Chat } from '@google/genai';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { PodcastShowNotes } from '../../types';
import { useTranslation } from '../../App';
import { FileUpload } from '../../components/FileUpload';

interface MiniAppProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string | PodcastShowNotes;
}

const Controls: React.FC<{
    onBack: () => void;
    onGenerate: (transcript: string) => void;
    isLoading: boolean;
}> = ({ onBack, onGenerate, isLoading }) => {
    const [transcript, setTranscript] = useState('');
    const { t } = useTranslation();

    const handleFileChange = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setTranscript(e.target?.result as string);
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name="arrow-left" className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-lg font-semibold">{t('podcast-summarizer-title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('podcast-summarizer-desc')}</p>
                </div>
            </div>
            <div className="flex flex-col gap-4 flex-1">
                <label className="block text-sm font-medium text-foreground">{t('podcastTranscript')}</label>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={t('podcastTranscriptPlaceholder')} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 resize-none"/>
                <div className="text-center text-sm text-muted-foreground">or</div>
                <FileUpload onFileUpload={handleFileChange} label={t('uploadTranscript')} />
            </div>
            <button onClick={() => onGenerate(transcript)} disabled={!transcript || isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2">
                <Icon name="mic" className="w-5 h-5" />
                <span>{t('generateNotes')}</span>
            </button>
        </div>
    );
};

const AIPodcastSummarizer: React.FC<MiniAppProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleInitialGenerate = async (transcript: string) => {
        const initialPrompt = `Generate a complete set of show notes from this transcript. Your response MUST be a JSON object that follows this schema: ${JSON.stringify({
            title: "string", summary: "string", timestamps: [{ time: "string", topic: "string" }],
            socialPosts: [{ platform: "string", post: "string" }]
        })}\n\nTranscript: "${transcript}"`;
        
        setMessages([{ id: nanoid(), role: 'user', content: 'Transcript uploaded.' }]);
        setIsLoading(true);
        setError(null);
        try {
            const systemInstruction = `You are a podcast producer. Your goal is to generate and refine show notes from transcripts. Always respond with a valid JSON object matching the requested schema.`;
            chatRef.current = geminiService.startChat('gemini-2.5-flash', [], systemInstruction);
            const response = await chatRef.current.sendMessage({ message: initialPrompt });
            const jsonString = response.text.trim();
            const notes = JSON.parse(jsonString) as PodcastShowNotes;
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: notes }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate show notes.");
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
            const notes = JSON.parse(jsonString) as PodcastShowNotes;
            setMessages(prev => [...prev, { id: nanoid(), role: 'model', content: notes }]);
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
            const result = message.content as PodcastShowNotes;
            return (
                <div className="bg-card border p-6 rounded-lg self-start max-w-3xl animate-fade-in w-full">
                    <h2 className="text-2xl font-bold text-primary mb-2">{result.title}</h2>
                    <h3 className="font-semibold text-lg mb-2 mt-4">{t('summary')}</h3>
                    <p className="text-muted-foreground">{result.summary}</p>
                    <h3 className="font-semibold text-lg mb-2 mt-4">{t('keyMoments')}</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {result.timestamps.map(ts => <li key={ts.time}><strong>{ts.time}</strong> - {ts.topic}</li>)}
                    </ul>
                    <h3 className="font-semibold text-lg mb-2 mt-4">{t('socialPosts')}</h3>
                    <div className="space-y-4">
                        {result.socialPosts.map(p => (
                            <div key={p.platform} className="bg-muted p-4 rounded-md">
                                <p className="font-semibold text-sm">{p.platform}</p>
                                <p className="text-sm whitespace-pre-wrap">{p.post}</p>
                            </div>
                        ))}
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
                        <div className="m-auto text-center text-muted-foreground"><Icon name="mic" className="w-16 h-16 mx-auto" /><p>Your generated show notes will appear here.</p></div>
                    )}
                    {messages.map(msg => <div key={msg.id} className="flex flex-col">{renderMessageContent(msg)}</div>)}
                    {isLoading && <div className="self-start"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div ref={scrollRef} />
                </div>
                {messages.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t">
                        <div className="relative">
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Refine your notes... (e.g., 'write another tweet about the first key moment')" className="flex h-12 w-full rounded-md border border-input bg-background ps-4 pe-12 text-sm" disabled={isLoading}/>
                            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Icon name="send" className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIPodcastSummarizer;
