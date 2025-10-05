import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Icon } from '../components/Icon';
import { useTranslation } from '../App';

let nextStartTime = 0;
let inputAudioContext: AudioContext;
let outputAudioContext: AudioContext;
const sources = new Set<AudioBufferSourceNode>();

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface TranscriptionTurn {
  id: number;
  user: string;
  model: string;
}

type ConversationState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const LiveAssistPage = () => {
    const [conversationState, setConversationState] = useState<ConversationState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const turnIdCounter = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [transcriptionHistory]);

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContext && inputAudioContext.state !== 'closed') {
            inputAudioContext.close();
        }
        if (outputAudioContext && outputAudioContext.state !== 'closed') {
            outputAudioContext.close();
        }
        
        setConversationState('idle');
        currentInputRef.current = '';
        currentOutputRef.current = '';
    }, []);

    const startConversation = async () => {
        if (conversationState !== 'idle') return;
        setConversationState('connecting');
        setError(null);
        setTranscriptionHistory([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // FIX: Cast window to any to allow access to vendor-prefixed webkitAudioContext for broader browser compatibility.
            inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTime = 0;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConversationState('listening');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setConversationState('speaking');
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const sourceNode = outputAudioContext.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContext.destination);
                            sourceNode.addEventListener('ended', () => {
                                sources.delete(sourceNode);
                                if (sources.size === 0) {
                                    setConversationState('listening');
                                }
                            });
                            sourceNode.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(sourceNode);
                        }

                        if (message.serverContent?.inputTranscription) {
                            currentInputRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscriptionHistory(prev => [...prev, {
                                id: turnIdCounter.current++,
                                user: currentInputRef.current.trim(),
                                model: currentOutputRef.current.trim()
                            }]);
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`An error occurred: ${e.message}`);
                        setConversationState('error');
                        stopConversation();
                    },
                    onclose: () => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'You are a friendly and helpful AI assistant.',
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) {
            setError('Failed to get microphone permissions. Please allow access and try again.');
            setConversationState('error');
        }
    };
    
    useEffect(() => {
        return () => stopConversation(); // Cleanup on unmount
    }, [stopConversation]);

    return (
        <div className="flex flex-col h-full items-center justify-center bg-background text-foreground p-4 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">Live Assist</h1>
            <p className="text-muted-foreground mb-8">Speak directly with your AI assistant.</p>
            
            <div className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center transition-all duration-300 ${conversationState === 'listening' ? 'bg-primary/10' : 'bg-card'}`}>
                <div className={`absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse ${conversationState === 'speaking' ? 'animate-ping' : ''}`} style={{animationDuration: '2s'}}></div>
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full transition-all duration-300 flex items-center justify-center ${conversationState === 'listening' ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon name={conversationState === 'speaking' ? 'audio-waveform' : 'mic'} className={`w-16 h-16 sm:w-20 sm:h-20 transition-colors duration-300 ${conversationState !== 'idle' && conversationState !== 'error' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
            </div>

            <div className="mt-8">
                {conversationState === 'idle' && <button onClick={startConversation} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors">Start Conversation</button>}
                {['connecting', 'listening', 'speaking'].includes(conversationState) && <button onClick={stopConversation} className="px-8 py-4 bg-destructive text-destructive-foreground rounded-full font-semibold text-lg hover:bg-destructive/90 transition-colors">End Conversation</button>}
                {conversationState === 'error' && <button onClick={startConversation} className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg hover:bg-accent transition-colors">Try Again</button>}
            </div>
            
            <div className="w-full max-w-2xl mt-8 text-center text-sm h-24">
                {conversationState === 'connecting' && <p className="animate-pulse">Connecting to assistant...</p>}
                {error && <p className="text-destructive">{error}</p>}
            </div>

            <div className="w-full max-w-3xl flex-1 mt-4 overflow-y-auto p-4 space-y-4">
                {transcriptionHistory.map(turn => (
                    <div key={turn.id}>
                        {turn.user && <div className="p-3 bg-muted rounded-lg text-left mb-2"><strong>You:</strong> {turn.user}</div>}
                        {turn.model && <div className="p-3 bg-primary/10 rounded-lg text-left"><strong>Assist:</strong> {turn.model}</div>}
                    </div>
                ))}
                 <div ref={scrollRef}></div>
            </div>
        </div>
    );
};
