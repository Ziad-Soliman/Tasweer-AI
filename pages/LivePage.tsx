import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { Icon } from '../components/Icon';
import { useTranslation } from '../App';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { nanoid } from 'nanoid';
import { Tooltip } from '../components/Tooltip';

// --- Audio Helper Functions (outside component) ---

let nextStartTime = 0;
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

const blobToBase64 = (blob: globalThis.Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });


// --- Gemini API Configuration ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const creativePersonas = {
    'Art Director': {
        icon: 'palette',
        systemInstruction: "You are a world-class Art Director. Analyze the user's video feed for visual aesthetics. Call `highlightArea` to draw attention to specific parts of the composition when providing critiques on composition, lighting, and balance. Use `extractColorPalette` to identify and show the dominant colors in the scene. Be insightful and provide actionable feedback.",
    },
    'UX/UI Designer': {
        icon: 'sliders',
        systemInstruction: "You are a senior UX/UI Designer. The user is showing you a mockup or a live interface. Analyze it for user experience and interface design principles. Call `critiqueUX` to point out potential issues with usability, accessibility, and visual hierarchy. Your feedback should be constructive and user-centered.",
    },
    'Filmmaker': {
        icon: 'video',
        systemInstruction: "You are an experienced Filmmaker. Analyze the live scene as if you are looking through a camera lens. Call `identifyShot` to identify the shot type, camera angle, and lighting setup. In your spoken response, offer suggestions to make the shot more cinematic.",
    },
    'Storyteller': {
        icon: 'pencil',
        systemInstruction: "You are a creative Storyteller. Look at the people, objects, and environment in the video feed. Call `generateStoryIdea` to create compelling story hooks, character descriptions, or plot points based on what you see. Be imaginative and inspiring.",
    },
     'Copywriter': {
        icon: 'feather',
        systemInstruction: "You are an expert copywriter. Listen to the user's speech via transcription. Your job is to refine their spoken ideas into polished, compelling copy. When you have a good snippet, call the `suggestCopy` function. Also, analyze visual elements for branding opportunities.",
    },
    'Brand Strategist': {
        icon: 'target',
        systemInstruction: "You are a Brand Strategist. Analyze logos, products, and marketing materials in the video feed. Call `analyzeBrandIdentity` to critique logo effectiveness, brand voice, and consistency. In your spoken response, give high-level strategic advice.",
    },
    'Presentation Coach': {
        icon: 'presentation',
        systemInstruction: "You are a world-class presentation coach. Analyze the user's speech and body language. If you detect filler words or notice their pacing is too fast or slow, call `analyzeSpeechPacing`. If you notice issues with their posture like slouching, call `analyzePosture`. Provide encouraging and constructive feedback.",
    },
    'Fashion Stylist': {
        icon: 'hanger',
        systemInstruction: "You are a high-fashion stylist with an impeccable eye. Analyze the user's appearance and environment. Based on what you see, call `suggestOutfit` to propose a complete, curated outfit for a specific occasion (e.g., business meeting, casual brunch, evening gala). Be descriptive and justify your choices.",
    },
    'Web Developer': {
        icon: 'code',
        systemInstruction: "You are a senior Frontend Developer. The user is showing you a design mockup. Identify key UI components (buttons, forms, cards, etc.). Call `generateCodeSnippet` to provide boilerplate HTML and CSS for a component you identify. Keep the code clean and modern.",
    },
    'Print Consultant': {
        icon: 'file-text',
        systemInstruction: "You are a Print Production Consultant. Analyze the layout shown in the video feed for print-readiness. Look for potential issues with typography, alignment, and spacing that would be problematic in a physical print. Call `analyzePrintLayout` with your feedback.",
    },
    'Game Designer': {
        icon: 'gamepad',
        systemInstruction: "You are a creative Game Designer. Analyze the environment for game potential. Identify objects that could be interactive and call `suggestInteractiveObject` with your ideas. When you see a person, call `generateNPCDialogue` to give them a line of dialogue. Look for environmental storytelling cues.",
    },
    'AR/VR Developer': {
        icon: 'cube',
        systemInstruction: "You are a Spatial Computing Developer. Analyze the video feed to identify flat surfaces suitable for AR content. Call `identifyARPlane` to highlight these planes. If the user makes a gesture, suggest a potential AR/VR interaction for it in your spoken response.",
    },
    'Sound Designer': {
        icon: 'audio-waveform',
        systemInstruction: "You are a professional Sound Designer. Analyze the visual mood and context of the scene. Call `suggestAmbiance` with a list of sound effects that would create a fitting soundscape. Listen for distinct sounds and identify potential foley effects.",
    },
    'Interior Designer': {
        icon: 'armchair',
        systemInstruction: "You are a professional Interior Designer. Analyze the user's room via the video feed. Provide insightful feedback on layout, lighting, and decor. Use `changeWallColor` to suggest new wall colors and `suggestFurniture` to recommend furniture pieces for specific areas and styles.",
    },
    'Fitness Coach': {
        icon: 'dumbbell',
        systemInstruction: "You are an encouraging Fitness Coach. Watch the user's exercise form. Provide real-time, constructive feedback. Use the `analyzeExerciseForm` function to deliver structured analysis of their technique, highlighting areas for improvement to ensure safety and effectiveness.",
    },
};

type Persona = keyof typeof creativePersonas;

// --- Function Declarations ---
const allFunctionDeclarations: FunctionDeclaration[] = [
    { name: 'analyzeComposition', parameters: { type: Type.OBJECT, properties: { critique: { type: Type.STRING }, dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['critique', 'dominantColors'] } },
    { name: 'critiqueUX', parameters: { type: Type.OBJECT, properties: { issues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { element: { type: Type.STRING }, feedback: { type: Type.STRING } }, required: ['element', 'feedback'] } } }, required: ['issues'] } },
    { name: 'identifyShot', parameters: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, angle: { type: Type.STRING }, lighting: { type: Type.STRING } }, required: ['type', 'angle', 'lighting'] } },
    { name: 'generateStoryIdea', parameters: { type: Type.OBJECT, properties: { plot: { type: Type.STRING }, characters: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['plot'] } },
    { name: 'generateCodeSnippet', parameters: { type: Type.OBJECT, properties: { component: { type: Type.STRING }, language: { type: Type.STRING }, code: { type: Type.STRING } }, required: ['component', 'language', 'code'] } },
    { name: 'analyzePrintLayout', parameters: { type: Type.OBJECT, properties: { feedback: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['feedback'] } },
    { name: 'identifyARPlane', parameters: { type: Type.OBJECT, properties: { points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] } } }, required: ['points'] } },
    { name: 'suggestInteractiveObject', parameters: { type: Type.OBJECT, properties: { object: { type: Type.STRING }, interaction: { type: Type.STRING } }, required: ['object', 'interaction'] } },
    { name: 'generateNPCDialogue', parameters: { type: Type.OBJECT, properties: { character: { type: Type.STRING }, dialogue: { type: Type.STRING } }, required: ['character', 'dialogue'] } },
    { name: 'suggestAmbiance', parameters: { type: Type.OBJECT, properties: { sounds: { type: Type.ARRAY, items: { type: Type.STRING } }, mood: { type: Type.STRING } }, required: ['sounds', 'mood'] } },
    { name: 'suggestCopy', parameters: { type: Type.OBJECT, properties: { original: { type: Type.STRING }, refined: { type: Type.STRING }, style: { type: Type.STRING } }, required: ['original', 'refined', 'style'] } },
    { name: 'analyzeBrandIdentity', parameters: { type: Type.OBJECT, properties: { critique: { type: Type.STRING }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['critique', 'suggestions'] } },
    { name: 'highlightArea', parameters: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, width: { type: Type.NUMBER }, height: { type: Type.NUMBER }, label: { type: Type.STRING } }, required: ['x', 'y', 'width', 'height'] } },
    { name: 'analyzeSpeechPacing', parameters: { type: Type.OBJECT, properties: { pace: { type: Type.STRING }, fillerWords: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['pace'] } },
    { name: 'analyzePosture', parameters: { type: Type.OBJECT, properties: { feedback: { type: Type.STRING } }, required: ['feedback'] } },
    { name: 'suggestOutfit', parameters: { type: Type.OBJECT, properties: { occasion: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, reasoning: { type: Type.STRING } }, required: ['occasion', 'items', 'reasoning'] } },
    { name: 'changeWallColor', parameters: { type: Type.OBJECT, properties: { color_hex: { type: Type.STRING }, wall: { type: Type.STRING } }, required: ['color_hex', 'wall'] } },
    { name: 'suggestFurniture', parameters: { type: Type.OBJECT, properties: { placement_area: { type: Type.STRING }, furniture_item: { type: Type.STRING }, style: { type: Type.STRING } }, required: ['placement_area', 'furniture_item', 'style'] } },
    { name: 'analyzeExerciseForm', parameters: { type: Type.OBJECT, properties: { exercise_name: { type: Type.STRING }, feedback: { type: Type.STRING }, corrections: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['exercise_name', 'feedback', 'corrections'] } },
];


// --- Component Types ---
type ConversationState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
type VideoSource = 'camera' | 'display';
type InsightType = 'composition' | 'palette' | 'ux' | 'shot' | 'story' | 'code' | 'print' | 'game' | 'ambiance' | 'copy' | 'brand' | 'speech' | 'posture' | 'outfit' | 'interior' | 'fitness';
interface AIInsight {
    id: string;
    type: InsightType;
    data: any;
    persona: Persona;
}
interface ARPlane {
    id: string;
    points: string; // SVG points string
}

// --- Main Component ---
export const LivePage = () => {
    const { t } = useTranslation();
    const [conversationState, setConversationState] = useState<ConversationState>('idle');
    const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activePersona, setActivePersona] = useState<Persona>('Art Director');
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [arPlanes, setArPlanes] = useState<ARPlane[]>([]);
    const [isVisualContextEnabled, setIsVisualContextEnabled] = useState(true);
    const [transcriptions, setTranscriptions] = useState<{ id: string, role: 'user' | 'model', text: string }[]>([]);
    const [highlightBox, setHighlightBox] = useState<{ x: number, y: number, width: number, height: number, label: string } | null>(null);
    const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);


    // Refs
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIntervalRef = useRef<number | null>(null);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const transcriptionScrollRef = useRef<HTMLDivElement>(null);
    const personaDropdownRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        transcriptionScrollRef.current?.scrollTo({ top: transcriptionScrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [transcriptions]);

    useEffect(() => {
        if (highlightBox) {
            const timer = setTimeout(() => setHighlightBox(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [highlightBox]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (personaDropdownRef.current && !personaDropdownRef.current.contains(event.target as Node)) {
                setIsPersonaDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const stopConversation = useCallback((shouldRestart = false) => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        setConversationState('idle');
        setVideoSource(null);
        nextStartTime = 0;
        sources.clear();

        if (!shouldRestart) {
             setAiInsights([]);
             setArPlanes([]);
             setTranscriptions([]);
             setHighlightBox(null);
        }
    }, []);

    const startConversation = useCallback(async (sourceType: VideoSource) => {
        if (conversationState !== 'idle' && conversationState !== 'error') return;
        
        stopConversation(true);
        setVideoSource(sourceType);
        setConversationState('connecting');
        setError(null);
        setAiInsights([]);
        setArPlanes([]);
        setTranscriptions([]);
        setHighlightBox(null);

        try {
            let stream: MediaStream;
            if (sourceType === 'camera') {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } else { // 'display'
                const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                
                let audioStream: MediaStream;
                try {
                    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                } catch (micError) {
                    // Stop the display stream if we can't get mic audio, as the API needs it.
                    displayStream.getTracks().forEach(track => track.stop());
                    if (micError instanceof Error && (micError.name === 'NotAllowedError' || micError.name === 'PermissionDeniedError')) {
                        throw new Error(t('liveCameraError'));
                    }
                    throw micError;
                }
                
                const videoTrack = displayStream.getVideoTracks()[0];
                const audioTrack = audioStream.getAudioTracks()[0];

                if (!videoTrack) {
                    audioStream.getTracks().forEach(track => track.stop());
                    throw new Error("Could not find a video track from the screen share.");
                }
                if (!audioTrack) {
                    displayStream.getTracks().forEach(track => track.stop());
                    throw new Error("Could not find an audio track from the microphone.");
                }

                stream = new MediaStream([videoTrack, audioTrack]);
                videoTrack.onended = () => stopConversation();
            }

            mediaStreamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConversationState('listening');
                        const inputAudioContext = inputAudioContextRef.current!;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (e) => sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) }));
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);

                        if (isVisualContextEnabled && videoRef.current && canvasRef.current) {
                            const videoEl = videoRef.current;
                            const canvasEl = canvasRef.current;
                            const ctx = canvasEl.getContext('2d');
                            if (!ctx) return;
                            
                            frameIntervalRef.current = window.setInterval(() => {
                                if (videoEl.readyState < videoEl.HAVE_METADATA) return;
                                canvasEl.width = videoEl.videoWidth;
                                canvasEl.height = videoEl.videoHeight;
                                ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                                canvasEl.toBlob(
                                    async (blob) => {
                                        if (blob) {
                                            const base64Data = await blobToBase64(blob);
                                            sessionPromiseRef.current?.then((session) => {
                                                session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' }});
                                            });
                                        }
                                    }, 'image/jpeg', 0.5
                                );
                            }, 1000); // 1 FPS
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         const outputAudioContext = outputAudioContextRef.current;
                         if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data && outputAudioContext) {
                            setConversationState('speaking');
                            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const sourceNode = outputAudioContext.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContext.destination);
                            sourceNode.addEventListener('ended', () => { sources.delete(sourceNode); if (sources.size === 0) setConversationState('listening'); });
                            sourceNode.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(sourceNode);
                        }

                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
                            setTranscriptions(prev => {
                                const newHistory = [];
                                if (userInput) newHistory.push({ id: nanoid(), role: 'user', text: userInput });
                                if (modelOutput) newHistory.push({ id: nanoid(), role: 'model', text: modelOutput });
                                return [...prev, ...newHistory].slice(-50);
                            });
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                let insightType: InsightType | null = null;
                                let insightData: any = null;

                                switch (fc.name) {
                                    case 'analyzeComposition': 
                                        insightType = 'composition';
                                        insightData = { critique: fc.args.critique };
                                        setAiInsights(prev => [{ id: nanoid(), type: 'palette', data: { colors: fc.args.dominantColors }, persona: activePersona }, { id: nanoid(), type: insightType, data: insightData, persona: activePersona }, ...prev].slice(0, 20));
                                        break;
                                    case 'critiqueUX': insightType = 'ux'; insightData = { issues: fc.args.issues }; break;
                                    case 'identifyShot': insightType = 'shot'; insightData = fc.args; break;
                                    case 'generateStoryIdea': insightType = 'story'; insightData = fc.args; break;
                                    case 'generateCodeSnippet': insightType = 'code'; insightData = fc.args; break;
                                    case 'analyzePrintLayout': insightType = 'print'; insightData = { feedback: fc.args.feedback }; break;
                                    case 'suggestInteractiveObject': 
                                    case 'generateNPCDialogue': insightType = 'game'; insightData = { ...fc.args, type: fc.name }; break;
                                    case 'suggestAmbiance': insightType = 'ambiance'; insightData = fc.args; break;
                                    case 'suggestCopy': insightType = 'copy'; insightData = fc.args; break;
                                    case 'analyzeBrandIdentity': insightType = 'brand'; insightData = fc.args; break;
                                    case 'highlightArea':
                                        const { x, y, width, height, label } = fc.args;
                                        if (x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 1 && y + height <= 1) {
                                            setHighlightBox({ x, y, width, height, label });
                                        }
                                        break;
                                    case 'analyzeSpeechPacing': insightType = 'speech'; insightData = fc.args; break;
                                    case 'analyzePosture': insightType = 'posture'; insightData = fc.args; break;
                                    case 'suggestOutfit': insightType = 'outfit'; insightData = fc.args; break;
                                    case 'changeWallColor':
                                    case 'suggestFurniture': insightType = 'interior'; insightData = { ...fc.args, type: fc.name }; break;
                                    case 'analyzeExerciseForm': insightType = 'fitness'; insightData = fc.args; break;
                                    case 'identifyARPlane':
                                        const plane: ARPlane = { id: fc.id, points: fc.args.points.map((p: any) => `${p.x * 100},${p.y * 100}`).join(' ') };
                                        setArPlanes(prev => [...prev, plane]);
                                        setTimeout(() => setArPlanes(prev => prev.filter(p => p.id !== plane.id)), 5000);
                                        break;
                                }

                                if(insightType && insightData) {
                                    setAiInsights(prev => [{ id: nanoid(), type: insightType, data: insightData, persona: activePersona }, ...prev].slice(0, 20));
                                }
                                
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({ functionResponses: { id : fc.id, name: fc.name, response: { result: "ok" } } });
                                });
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => { setError(`An error occurred: ${e.message}`); setConversationState('error'); stopConversation(); },
                    onclose: () => stopConversation(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: creativePersonas[activePersona].systemInstruction,
                    tools: [{ functionDeclarations: allFunctionDeclarations }],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) {
            let errorMessage = 'An unknown error occurred. Please check your device and browser settings.';
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = `Permission to access your ${sourceType} or microphone was denied. Please grant permission in your browser settings and try again.`;
                } else {
                    errorMessage = `Could not start session: ${err.message}`;
                }
            }
            setError(errorMessage);
            setConversationState('error');
        }
    }, [activePersona, stopConversation, conversationState, isVisualContextEnabled, t]);

    useEffect(() => {
        if (conversationState !== 'idle' && conversationState !== 'error' && conversationState !== 'connecting' && videoSource) {
            stopConversation(true);
            setTimeout(() => startConversation(videoSource), 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePersona]);

    useEffect(() => () => stopConversation(), [stopConversation]);

    if (!videoSource) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6 animate-fade-in">
                <div className="z-10">
                    <h1 className="text-5xl font-bold tracking-tighter text-foreground">{t('liveStudioTitle')}</h1>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">{t('liveStudioDesc')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 z-10">
                    <button onClick={() => startConversation('camera')} className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center gap-3 text-lg hover:bg-primary/90 transition-colors">
                        <Icon name="camera" className="w-6 h-6"/> {t('useCamera')}
                    </button>
                    <button onClick={() => startConversation('display')} className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold flex items-center gap-3 text-lg hover:bg-accent transition-colors">
                        <Icon name="desktop" className="w-6 h-6"/> {t('shareScreen')}
                    </button>
                </div>
                {error && <p className="text-destructive mt-4">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full text-foreground p-4 gap-4">
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 z-10">
                {/* Left Column */}
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="relative z-10 bg-card/50 backdrop-blur-md border border-border/50 rounded-lg p-3 space-y-2">
                        <h3 className="text-lg font-semibold">{t('activePersona')}</h3>
                         <div ref={personaDropdownRef} className="relative">
                            <button onClick={() => setIsPersonaDropdownOpen(o => !o)} className="w-full px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap bg-primary text-primary-foreground flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Icon name={creativePersonas[activePersona].icon} className="w-4 h-4" />
                                    {t(activePersona.replace(/\s/g, '') as any) || activePersona}
                                </div>
                                <Icon name="chevron-down" className="w-4 h-4" />
                            </button>
                            {isPersonaDropdownOpen && (
                                <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-20 animate-fade-in p-1">
                                    {Object.entries(creativePersonas).map(([id, {icon, systemInstruction}]) => (
                                        <button
                                            key={id}
                                            onClick={() => { setActivePersona(id as Persona); setIsPersonaDropdownOpen(false); }}
                                            className="w-full text-left p-2 rounded-md hover:bg-muted text-sm flex items-center gap-2"
                                            title={systemInstruction}
                                        >
                                            <Icon name={icon} className="w-4 h-4 text-muted-foreground" />
                                            <span>{t(id.replace(/\s/g, '') as any) || id}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-muted-foreground text-xs">{creativePersonas[activePersona].systemInstruction}</p>
                    </div>

                    <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-lg flex flex-col flex-1 min-h-0">
                        <h3 className="text-md font-semibold p-3 border-b border-border/50">{t('liveTranscription')}</h3>
                        <div ref={transcriptionScrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                            {transcriptions.length === 0 && <p className="text-muted-foreground text-center pt-4">{t('transcriptionPlaceholder')}</p>}
                            {transcriptions.map(t => (
                                <div key={t.id} className="animate-fade-in">
                                    <strong className={t.role === 'user' ? 'text-blue-400' : 'text-primary'}>{t.role === 'user' ? t('yourTurn') : t('aiTurn')}:</strong> {t.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                    <div className="relative w-full aspect-video bg-black/30 rounded-lg overflow-hidden shadow-2xl border border-border/50">
                        <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-contain transform -scale-x-100" />
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {arPlanes.map(p => (
                                <polygon key={p.id} points={p.points} fill="hsla(var(--primary-rgb), 0.2)" stroke="hsl(var(--primary))" strokeWidth="0.3" className="animate-fade-in" />
                            ))}
                            {highlightBox && (
                                <g className="animate-fade-in">
                                    <rect 
                                        x={highlightBox.x * 100}
                                        y={highlightBox.y * 100}
                                        width={highlightBox.width * 100}
                                        height={highlightBox.height * 100}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="0.5"
                                        className="animate-glow"
                                    />
                                    {highlightBox.label && (
                                        <text
                                            x={highlightBox.x * 100 + 1}
                                            y={highlightBox.y * 100 + 3}
                                            fill="white"
                                            fontSize="2"
                                            className="font-semibold"
                                            style={{textShadow: '0 0 2px black'}}
                                        >
                                            {highlightBox.label}
                                        </text>
                                    )}
                                </g>
                            )}
                        </svg>
                        <div className="absolute top-3 right-3 p-2 bg-black/30 rounded-full backdrop-blur-sm">
                            <AIStatusOrb state={conversationState} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 gap-4 min-h-0 bg-card/50 backdrop-blur-md border border-border/50 rounded-lg">
                        <div className="p-4 border-b border-border/50 flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5 text-primary"/> {t('aiInsights')}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{t('enableVisualContext')}</span>
                                <ToggleSwitch checked={isVisualContextEnabled} onChange={setIsVisualContextEnabled} label={t('enableVisualContext')} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {aiInsights.length === 0 && <p className="text-muted-foreground text-center pt-10">{t('insightsPlaceholder')}</p>}
                            {aiInsights.map(insight => <InsightCard key={insight.id} insight={insight} />)}
                        </div>
                        <div className="p-4 border-t border-border/50">
                            <button 
                                onClick={() => stopConversation()} 
                                className={`w-full rounded-md font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 px-8 py-3 shadow-lg ring-1 ring-white/20 bg-red-600`}
                            >
                                <Icon name={'mic'} className={`w-6 h-6`} />
                                {t('endSession')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InsightCard: React.FC<{insight: AIInsight}> = ({ insight }) => {
    const { type, data, persona } = insight;
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const renderContent = () => {
        switch (type) {
            case 'composition': return <p className="text-sm italic">"{data.critique}"</p>;
            case 'palette': return (
                <div className="flex gap-2 flex-wrap">
                    {data.colors.map((c: string) => <div key={c} className="w-6 h-6 rounded-full border-2 border-border" style={{backgroundColor: c}} title={c} />)}
                </div>
            );
            case 'ux': return <ul className="space-y-2 text-sm">{data.issues.map((i: any, idx: number) => <li key={idx}><strong>{i.element}:</strong> {i.feedback}</li>)}</ul>;
            case 'shot': return <p className="text-sm"><strong>Type:</strong> {data.type}, <strong>Angle:</strong> {data.angle}, <strong>Lighting:</strong> {data.lighting}</p>;
            case 'story': return <p className="text-sm"><strong>Plot:</strong> {data.plot}</p>;
            case 'code': return (
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <p className="text-xs font-semibold">{data.component} ({data.language})</p>
                         <Tooltip text={copied ? t('copied') : t('copyCode')}>
                             <button onClick={() => handleCopy(data.code)} className="p-1 text-muted-foreground hover:text-foreground"><Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5"/></button>
                         </Tooltip>
                    </div>
                    <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto"><code>{data.code}</code></pre>
                </div>
            );
            case 'print': return <ul className="space-y-1 text-sm list-disc list-inside">{data.feedback.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>;
            case 'game': return <p className="text-sm"><strong>{data.object || data.character}:</strong> "{data.interaction || data.dialogue}"</p>;
            case 'ambiance': return <p className="text-sm"><strong>Mood: {data.mood}</strong> - {data.sounds.join(', ')}</p>;
            case 'copy': return (
                <div>
                    <p className="text-xs font-semibold mb-1">Style: {data.style}</p>
                    <div className="text-xs p-2 bg-black/20 rounded"><strong>Original:</strong> {data.original}</div>
                    <div className="text-xs p-2 bg-primary/20 rounded mt-1"><strong>Refined:</strong> {data.refined}</div>
                </div>
            );
            case 'brand': return (
                <div>
                    <p className="text-sm italic">"{data.critique}"</p>
                    <ul className="text-xs list-disc list-inside mt-2 space-y-1">{data.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
            );
            case 'speech':
                const hasFillers = data.fillerWords && data.fillerWords.length > 0;
                return <div className="text-sm space-y-1"><p><strong>Pace:</strong> {data.pace}</p>{hasFillers && <p><strong>Fillers:</strong> {data.fillerWords.join(', ')}</p>}</div>;
            case 'posture': return <p className="text-sm italic">"{data.feedback}"</p>;
            case 'outfit': return (
                <div>
                    <p className="text-sm font-semibold mb-1">Outfit for: {data.occasion}</p>
                    <ul className="text-xs list-disc list-inside space-y-1">{data.items.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                    <p className="text-xs italic mt-2 text-muted-foreground">"{data.reasoning}"</p>
                </div>
            );
            case 'interior':
                if (data.type === 'changeWallColor') {
                    return <div className="flex items-center gap-2 text-sm"><p>Suggesting <strong>{data.wall}</strong> in</p><div className="w-5 h-5 rounded-full border border-border" style={{backgroundColor: data.color_hex}}></div><code>{data.color_hex}</code></div>
                }
                return <p className="text-sm"><strong>Suggesting {data.style} {data.furniture_item}</strong> for the {data.placement_area}.</p>
            case 'fitness':
                return (
                    <div>
                        <p className="text-sm font-semibold mb-1">{data.exercise_name} Form</p>
                        <p className="text-sm italic">"{data.feedback}"</p>
                        <ul className="text-xs list-disc list-inside mt-2 space-y-1">{data.corrections.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
                    </div>
                )
            default: return <p>{JSON.stringify(data)}</p>;
        }
    }
    
    return (
        <div className="bg-muted/50 p-3 rounded-lg animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Icon name={creativePersonas[persona].icon} className="w-3.5 h-3.5" /> {type}</p>
            </div>
            {renderContent()}
        </div>
    )
}

const AIStatusOrb: React.FC<{state: ConversationState}> = ({state}) => (
    <div className="w-8 h-8 relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-primary/50 transition-all duration-500 ${state === 'speaking' ? 'animate-ping opacity-100' : 'opacity-0'}`} style={{animationDuration: '1.5s'}}></div>
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${state === 'listening' ? 'bg-primary' : (state === 'speaking') ? 'bg-primary animate-pulse' : 'bg-primary/50'}`}></div>
    </div>
)
