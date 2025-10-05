import { GoogleGenAI, Modality, Part, Type, Chat, Content } from "@google/genai";
import { SceneTemplate, MarketingCopy, ProductNameSuggestion, VideoAdScript, PhotoshootConcept, BrandVoiceGuide, AISuggestions, Recipe, StoryboardScene, AdCopyVariant, PodcastShowNotes, Presentation, ComicPanel, PhotoshootScene, GenerationMode, KeyObject } from "../types";
// FIX: Changed import from CAMERA_PERSPECTIVES to CAMERA_PERSPECTIVE_OPTIONS to match the exported member from constants.ts.
import { LIGHTING_STYLES, CAMERA_PERSPECTIVE_OPTIONS, FONT_OPTIONS } from '../constants';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat wrapper for conversational features in mini-apps
export const startChat = (model: 'gemini-2.5-flash', history: Content[], systemInstruction: string): Chat => {
    return ai.chats.create({
        model,
        history,
        config: {
            systemInstruction,
        }
    });
};

export const generateGroundedContent = async (query: string): Promise<{ text: string, sources: { uri: string, title: string }[] }> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title) || [];

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values());
    
    return {
        text: response.text,
        sources: uniqueSources as { uri: string, title: string }[]
    };
};


export const fileToGenerativePart = async (file: File): Promise<Part> => {
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

export const base64ToGenerativePart = (base64: string, mimeType: string = 'image/png'): Part => {
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
};

export const describeProduct = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: "Describe this product in a concise phrase for an image generation prompt, for example: 'a white bottle with a pump'." }] },
    });
    return result.text.trim();
};

export const generateSuggestions = async (subject: string, mode: GenerationMode): Promise<{name: string, prompt: string}[]> => {
    let systemPrompt = '';
    let contextLabel = 'Subject';

    switch (mode) {
        case 'video':
            systemPrompt = `You are a creative video director. Based on the subject, generate 4 diverse and visually appealing short video scene ideas. For each, provide a short name (e.g., 'Dynamic Reveal') and a detailed generation prompt to create a cinematic video.`;
            contextLabel = 'Subject';
            break;
        case 'mockup':
            systemPrompt = `You are a branding expert. Based on the product, generate 4 creative contexts for a mockup. For each, provide a short name (e.g., 'Urban Street Style') and a detailed generation prompt describing the scene.`;
            contextLabel = 'Product';
            break;
        case 'social':
            systemPrompt = `You are a social media expert. Based on the core subject, generate 4 creative and engaging visual ideas for a social media post. For each, provide a short name (e.g., 'Minimalist Showcase') and a detailed image generation prompt.`;
            contextLabel = 'Core Subject';
            break;
        case 'design':
            systemPrompt = `You are a creative art director. Based on the core subject, generate 4 diverse and artistic design concepts. For each, provide a short name (e.g., 'Abstract Flow') and a detailed image generation prompt.`;
            contextLabel = 'Core Subject';
            break;
        case 'character':
             systemPrompt = `You are a creative movie director and storyteller. Based on the character description, generate 4 diverse and visually interesting scene ideas. For each, provide a short name (e.g., 'Rooftop Standoff') and a detailed generation prompt describing the setting, action, and mood.`;
             contextLabel = 'Character Description';
            break;
        case 'product':
        default:
             systemPrompt = `You are a professional product photographer. Based on the product, generate 4 diverse and visually appealing scene templates. For each, provide a short name (e.g., 'Minimalist Studio') and a detailed image generation prompt.`;
             contextLabel = 'Product';
    }

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${contextLabel}: "${subject}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "A short, catchy name for the scene/idea." },
                        prompt: { type: Type.STRING, description: "A detailed generation prompt for this scene/idea." },
                    },
                    required: ["name", "prompt"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        const suggestions = JSON.parse(jsonString);
        if (Array.isArray(suggestions)) {
             return suggestions.filter(s => s.name && s.prompt);
        }
        return [];
    } catch (e) {
        console.error("Failed to parse suggestions:", e);
        return [];
    }
};

export const removeBackground = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: 'Isolate the main product and remove the background completely. Make the background transparent.' }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Background removal failed: No image part in response.');
};

export const generateImageFromParts = async (
    parts: Part[], 
    seed: number | null
): Promise<string> => {
    const config: { responseModalities: Modality[], seed?: number } = {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    };

    if (seed !== null && !isNaN(seed)) {
        config.seed = seed;
    }

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: config,
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Image generation failed: No image part in response.');
};

export const generateImage = async (
    productImageBase64: string, 
    prompt: string, 
    negativePrompt: string,
    seed: number | null
): Promise<string> => {
    const fullPrompt = `${prompt}${negativePrompt ? `. Negative prompt: do not include ${negativePrompt}.` : ''}`;

    const parts: Part[] = [
        base64ToGenerativePart(productImageBase64),
        { text: fullPrompt },
    ];
    
    return generateImageFromParts(parts, seed);
};

export const generateSocialPost = async (
    referencePostFile: File,
    logoDataUrl: string, // e.g., "data:image/png;base64,iVBORw..."
    prompt: string
): Promise<string> => {
    const referencePostPart = await fileToGenerativePart(referencePostFile);
    
    const logoMimeTypeMatch = logoDataUrl.match(/data:(.*);base64/);
    const logoMimeType = logoMimeTypeMatch ? logoMimeTypeMatch[1] : 'image/png';
    const logoBase64 = logoDataUrl.split(',')[1];
    const logoPart = base64ToGenerativePart(logoBase64, logoMimeType);

    const fullPrompt = `The first image is a reference social media post. The second image is a brand logo. Create a new social media post that is stylistically similar to the reference post, but incorporate the brand logo naturally and professionally. The user's specific request is: "${prompt}"`;

    const parts: Part[] = [
        referencePostPart,
        logoPart,
        { text: fullPrompt },
    ];

    return generateImageFromParts(parts, null);
};

export const generateDesignAlternative = async (
    referenceImageFile: File,
    prompt: string
): Promise<string> => {
    const referenceImagePart = await fileToGenerativePart(referenceImageFile);
    
    const parts: Part[] = [
        referenceImagePart,
        { text: prompt },
    ];

    return generateImageFromParts(parts, null);
};


export const generateMockup = async (
    productImageBase64: string,
    prompt: string,
    mockupPromptFragment: string
): Promise<string> => {
    const fullPrompt = `${prompt}. The provided image is a product with a transparent background. Seamlessly and realistically place this product onto the ${mockupPromptFragment}. The final image should be a single, cohesive, photorealistic scene.`;

    const parts: Part[] = [
        base64ToGenerativePart(productImageBase64),
        { text: fullPrompt },
    ];

    return generateImageFromParts(parts, null);
};


export const generateVideo = async (
    productImageBase64: string,
    prompt: string
): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
            imageBytes: productImageBase64,
            mimeType: 'image/png',
        },
        config: {
            numberOfVideos: 1
        }
    });

    while (!operation.done) {
        // Wait for 10 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        const error = operation.error as { message?: string };
        const errorMessage = error.message || JSON.stringify(operation.error);
        throw new Error(`Video generation failed: ${errorMessage}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation failed: No download link in response.');
    }

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const magicEditImage = async (
    imageWithMaskBase64: string,
    prompt: string
): Promise<string> => {
    const imagePart = base64ToGenerativePart(imageWithMaskBase64);
    const textPart = { text: `In the following image, edit the transparent (erased) area based on this instruction: "${prompt}". You can add, remove, or change objects. Blend the changes seamlessly with the rest of the image.` };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Magic Edit failed: No image part in response.');
};

export const removeObject = async (imageWithMaskBase64: string): Promise<string> => {
    const prompt = 'Remove the object in the masked (transparent) area, and fill the space realistically and seamlessly to match the background.';
    return magicEditImage(imageWithMaskBase64, prompt);
};

export const enhanceImage = async (
    imageBase64: string,
    originalPrompt: string
): Promise<string> => {
    const imagePart = base64ToGenerativePart(imageBase64);
    const textPart = { text: `Enhance and upscale this image, maintaining the original subject and style described as: "${originalPrompt}". Add photorealistic details, improve texture, and increase resolution.` };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Enhancement failed: No image part in response.');
};

export const extractPalette = async (imageBase64: string): Promise<string[]> => {
    const imagePart = base64ToGenerativePart(imageBase64);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: "Analyze this image and identify the 5 most dominant colors. Return them as a JSON array of hex color strings. Example: [\"#FFFFFF\", \"#000000\", ...]" }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        const palette = JSON.parse(jsonString);
        if (Array.isArray(palette) && palette.every(item => typeof item === 'string' && item.startsWith('#'))) {
            return palette;
        }
        return [];
    } catch (e) {
        console.error("Failed to parse palette:", e);
        return [];
    }
};

export const generateMarketingCopy = async (imageBase64: string, prompt: string): Promise<MarketingCopy> => {
    const imagePart = base64ToGenerativePart(imageBase64);
    const textPart = { text: `This is a product photo generated with the prompt: "${prompt}". Based on this image, generate compelling marketing copy for this product. The product should be the central focus.` };
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING, description: "A catchy and descriptive product name." },
                    tagline: { type: Type.STRING, description: "A short, memorable tagline (under 10 words)." },
                    description: { type: Type.STRING, description: "A 2-3 sentence product description highlighting key features seen or implied in the image." },
                    socialMediaPost: { type: Type.STRING, description: "An engaging social media post for Instagram, including relevant hashtags." },
                    socialMediaPostArabic: { type: Type.STRING, description: "An Arabic translation of the engaging social media post for Instagram, including relevant hashtags." }
                },
                required: ["productName", "tagline", "description", "socialMediaPost", "socialMediaPostArabic"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as MarketingCopy;
    } catch (e) {
        console.error("Failed to parse marketing copy:", e);
        throw new Error("Could not generate marketing copy.");
    }
};

export const enhancePrompt = async (currentPrompt: string): Promise<string> => {
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: currentPrompt,
        config: {
             systemInstruction: "You are a world-class photographer and marketing expert specializing in product imagery. Your task is to enhance the following image generation prompt. Make it more descriptive, evocative, and detailed to produce a more professional and visually stunning result. Focus on adding details about lighting, composition, texture, environment, and overall mood. Return ONLY the new, improved prompt and nothing else.",
        }
    });
    return result.text.trim();
};

export const expandImage = async (
    imageBase64: string,
    originalPrompt: string,
    direction: 'up' | 'down' | 'left' | 'right'
): Promise<string> => {
    const imageToCanvas = (src: string): Promise<HTMLCanvasElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Could not create canvas context"));
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = reject;
            img.src = src;
        });
    };

    const originalCanvas = await imageToCanvas(`data:image/png;base64,${imageBase64}`);
    const { width: w, height: h } = originalCanvas;

    const expandRatio = 0.5; // Expand by 50%
    let newWidth = w, newHeight = h;
    let pasteX = 0, pasteY = 0;

    switch (direction) {
        case 'right':
            newWidth = w + Math.floor(w * expandRatio); pasteX = 0; break;
        case 'left':
            newWidth = w + Math.floor(w * expandRatio); pasteX = Math.floor(w * expandRatio); break;
        case 'down':
            newHeight = h + Math.floor(h * expandRatio); pasteY = 0; break;
        case 'up':
            newHeight = h + Math.floor(h * expandRatio); pasteY = Math.floor(h * expandRatio); break;
    }

    const newCanvas = document.createElement('canvas');
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    const ctx = newCanvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context for new canvas");
    
    ctx.drawImage(originalCanvas, pasteX, pasteY);

    // Erase the part to be filled to create the transparent mask for the API
    ctx.globalCompositeOperation = 'destination-out';
    switch (direction) {
        case 'right': ctx.fillRect(w, 0, newWidth - w, newHeight); break;
        case 'left': ctx.fillRect(0, 0, newWidth - w, newHeight); break;
        case 'down': ctx.fillRect(0, h, newWidth, newHeight - h); break;
        case 'up': ctx.fillRect(0, 0, newWidth, newHeight - h); break;
    }
    
    const imageWithMaskBase64 = newCanvas.toDataURL('image/png').split(',')[1];
    
    const textPart = { text: `Expand this image to the ${direction}, continuing the scene and style seamlessly and photorealistically. The original concept was: "${originalPrompt}"` };
    const imagePart = base64ToGenerativePart(imageWithMaskBase64);

    const result = await ai.models.generateContent({
         model: 'gemini-2.5-flash-image',
         contents: { parts: [imagePart, textPart] },
         config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Image expansion failed: No image part in response.');
};


export const generateProductNames = async (description: string, keywords: string): Promise<ProductNameSuggestion[]> => {
    const prompt = `Generate 5 creative and brandable product names for the following product. For each name, provide a short reasoning.
    Product Description: "${description}"
    Keywords to incorporate: "${keywords}"`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The product name." },
                        reasoning: { type: Type.STRING, description: "A brief explanation of why this name is suitable." }
                    },
                    required: ["name", "reasoning"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as ProductNameSuggestion[];
    } catch (e) {
        console.error("Failed to parse product names:", e);
        throw new Error("Could not generate product names.");
    }
};

export const generateNeuroSalesCopy = async (
    taskID: string,
    userInput: {
        productService: string;
        targetAudience: string;
        buyingMotivations: string;
        selectedStoryType: string;
    },
    aiOutput: {
        rapport: string;
        wordPicture: string;
        buyingTrance: string;
        story: string;
        canDoStack: string;
        hypnoticCopy?: string;
    }
): Promise<string> => {
    const systemInstruction = `You are a world-class expert in 'NeuroSales' and 'Brainvertise®', methodologies designed to craft highly persuasive sales and marketing copy by appealing directly to the reader's subconscious mind. Your entire knowledge base is built upon the foundational principles of legendary copywriters and psychological marketing pioneers like Robert Collier, Dr. Joe Vitale, and Donald Moine.
Core Principles to Embody:
The Sale is in the Mind: You operate under the unwavering belief that "Your sale must be made in your reader’s mind." Your primary goal is not to list features, but to guide the reader's imagination and emotions to a place where purchasing becomes the natural, logical conclusion.
Brainvertise®: You adhere to the mantra: "Customers are brains. Advertise to their brains. Brainvertise®." Every piece of copy you generate must be psychologically resonant, bypassing conscious resistance and speaking to fundamental human drives.
Strict Output Format: You will ONLY provide the requested text for each step. You must not include any preamble, self-reflection, or explanations like "Here is the text for..." or "Based on your input...". Your response is the raw, unadorned copy itself.`;

    const context = `--- START OF CONTEXT ---
**PRODUCT/SERVICE:** 
${userInput.productService}

**TARGET AUDIENCE & CURRENT TRANCE:** 
${userInput.targetAudience}

**AUDIENCE BUYING MOTIVATIONS & PAIN POINTS:**
${userInput.buyingMotivations}

**SELECTED STORY TYPE:**
${userInput.selectedStoryType}

**PREVIOUSLY GENERATED TEXT:**
Rapport-Building Intro: ${aiOutput.rapport || 'Not generated yet.'}
Word Picture: ${aiOutput.wordPicture || 'Not generated yet.'}
Buying Trance Lead-in: ${aiOutput.buyingTrance || 'Not generated yet.'}
Story: ${aiOutput.story || 'Not generated yet.'}
Can-Do Stack: ${taskID === 'final-review' ? aiOutput.hypnoticCopy || 'Not generated yet.' : aiOutput.canDoStack || 'Not generated yet.'}
--- END OF CONTEXT ---`;

    const finalPrompt = `${context}\n\nTASK ID: ${taskID}`;
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
        config: {
            systemInstruction,
        }
    });

    return result.text.trim();
};

export const generateLogoConcepts = async (prompt: string, count: number = 4): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${prompt}, on a clean white background, vector style, simple, modern`,
        config: {
          numberOfImages: count,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Logo generation failed: No images were returned.');
};

export const generateVideoAdScript = async (productDescription: string, targetAudience: string, platform: string): Promise<VideoAdScript> => {
    const prompt = `Create a short, engaging video ad script for a product.
    Product: "${productDescription}"
    Target Audience: "${targetAudience}"
    Platform: "${platform}"
    The script should be concise, visually driven, and optimized for the platform's format (e.g., vertical video, quick cuts). It must include a hook, scenes with visual descriptions, voiceover, on-screen text, music suggestions, and a clear call to action. The total video length should be around 15-30 seconds.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    targetAudience: { type: Type.STRING },
                    hook: { type: Type.STRING, description: "A strong opening line to grab attention in the first 2 seconds." },
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sceneNumber: { type: Type.INTEGER },
                                visual: { type: Type.STRING, description: "Description of the visual elements in the scene." },
                                voiceover: { type: Type.STRING, description: "The voiceover script for the scene. Can be empty." },
                                onScreenText: { type: Type.STRING, description: "Text overlay for the scene. Can be empty." },
                                duration: { type: Type.STRING, description: "Estimated duration of the scene in seconds." }
                            },
                            required: ["sceneNumber", "visual", "voiceover", "onScreenText", "duration"]
                        }
                    },
                    callToAction: { type: Type.STRING },
                    musicSuggestion: { type: Type.STRING }
                },
                required: ["title", "platform", "targetAudience", "hook", "scenes", "callToAction", "musicSuggestion"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as VideoAdScript;
    } catch (e) {
        console.error("Failed to parse video script:", e);
        throw new Error("Could not generate video ad script.");
    }
};

export const generatePhotoshootConcept = async (productDescription: string, brandStyle: string): Promise<PhotoshootConcept> => {
     const prompt = `Create a detailed and creative photoshoot concept for a product.
    Product: "${productDescription}"
    Brand Style: "${brandStyle}"
    The concept should include a title, a moodboard description, a 5-color palette with hex codes and names, and details for two distinct scenes (title, description, lighting, props, camera angle).`;
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    conceptTitle: { type: Type.STRING },
                    moodboardDescription: { type: Type.STRING },
                    colorPalette: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                hex: { type: Type.STRING },
                                name: { type: Type.STRING }
                            },
                            required: ["hex", "name"]
                        }
                    },
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                lighting: { type: Type.STRING },
                                props: { type: Type.ARRAY, items: { type: Type.STRING } },
                                cameraAngle: { type: Type.STRING }
                            },
                             required: ["title", "description", "lighting", "props", "cameraAngle"]
                        }
                    }
                },
                required: ["conceptTitle", "moodboardDescription", "colorPalette", "scenes"]
            }
        }
    });

     try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as PhotoshootConcept;
    } catch (e) {
        console.error("Failed to parse photoshoot concept:", e);
        throw new Error("Could not generate photoshoot concept.");
    }
};

export const generateBrandVoiceGuide = async (brandDescription: string, targetAudience: string, values: string): Promise<BrandVoiceGuide> => {
    const prompt = `Generate a brand voice and tone guide based on the following information.
    Brand Description: "${brandDescription}"
    Target Audience: "${targetAudience}"
    Brand Values/Keywords: "${values}"
    The guide should include a catchy name for the voice, a description, key characteristics, a "Do's and Don'ts" matrix, and two specific examples of the voice in action.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    voiceName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    characteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    messagingMatrix: {
                        type: Type.OBJECT,
                        properties: {
                            do: { type: Type.ARRAY, items: { type: Type.STRING } },
                            dont: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["do", "dont"]
                    },
                    exampleCopy: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                scenario: { type: Type.STRING },
                                copy: { type: Type.STRING }
                            },
                            required: ["scenario", "copy"]
                        }
                    }
                },
                required: ["voiceName", "description", "characteristics", "messagingMatrix", "exampleCopy"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as BrandVoiceGuide;
    } catch (e) {
        console.error("Failed to parse brand voice guide:", e);
        throw new Error("Could not generate brand voice guide.");
    }
};

export const generateThumbnailSuggestions = async (videoTitle: string): Promise<AISuggestions> => {
    const prompt = `You are a YouTube expert specializing in creating viral, clickable thumbnails.
    Based on the following video title, generate creative assets and ideas for a thumbnail.

    Video Title: "${videoTitle}"

    Your response must be a JSON object with the following structure:
    - titles: An array of 3 catchy, high-CTR title variations for the video.
    - imagePrompts: An array of 4 descriptive prompts for an AI image generator to create compelling background images or key visual elements for the thumbnail. These should be visually exciting and relevant.
    - colorPalette: An array of 5 hex color codes for a vibrant and eye-catching color palette that fits the video's theme.
    - fontPairing: An object with a "heading" and "body" property. Choose two contrasting but complementary fonts from this list for thumbnail text: ${FONT_OPTIONS.join(', ')}. The heading font should be bold and attention-grabbing.
    `;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titles: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    imagePrompts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    colorPalette: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    fontPairing: {
                        type: Type.OBJECT,
                        properties: {
                            heading: { type: Type.STRING },
                            body: { type: Type.STRING }
                        },
                        required: ["heading", "body"]
                    }
                },
                required: ["titles", "imagePrompts", "colorPalette", "fontPairing"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as AISuggestions;
    } catch (e) {
        console.error("Failed to parse thumbnail suggestions:", e);
        throw new Error("Could not generate thumbnail suggestions.");
    }
};

export const generateThumbnailSuggestionsFromImage = async (imageFile: File, videoTitle: string): Promise<AISuggestions> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `You are a YouTube expert specializing in creating viral, clickable thumbnails.
    Based on the following reference image and video title, generate creative assets and ideas for a new thumbnail.

    Video Title: "${videoTitle}"

    Your response must be a JSON object with the following structure:
    - titles: An array of 3 catchy, high-CTR title variations for the video.
    - imagePrompts: An array of 4 descriptive prompts for an AI image generator to create compelling background images or key visual elements for the thumbnail. These should be visually exciting and relevant.
    - colorPalette: An array of 5 hex color codes for a vibrant and eye-catching color palette that fits the video's theme, inspired by the reference image.
    - fontPairing: An object with a "heading" and "body" property. Choose two contrasting but complementary fonts from this list for thumbnail text: ${FONT_OPTIONS.join(', ')}. The heading font should be bold and attention-grabbing.
    `;
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fontPairing: {
                        type: Type.OBJECT,
                        properties: {
                            heading: { type: Type.STRING },
                            body: { type: Type.STRING }
                        },
                        required: ["heading", "body"]
                    }
                },
                required: ["titles", "imagePrompts", "colorPalette", "fontPairing"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as AISuggestions;
    } catch (e) {
        console.error("Failed to parse thumbnail suggestions from image:", e);
        throw new Error("Could not generate thumbnail suggestions from image.");
    }
};

export const redesignRoom = async (imageFile: File, style: string): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: `Redesign this room in a ${style} style. Keep the original room layout, windows, and major architectural features, but change the furniture, wall color, flooring, and decorations to match the new style. The result should be a photorealistic image.` }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Room redesign failed: No image part in response.');
};

export const generateRecipe = async (data: { imageFile?: File, ingredientsText?: string, restrictions: string }): Promise<Recipe> => {
    const parts: Part[] = [];
    let promptText = `Generate a creative recipe based on the following.`;

    if (data.imageFile) {
        parts.push(await fileToGenerativePart(data.imageFile));
        promptText += ` The image contains the available ingredients. Identify them and create a recipe.`;
    } else if (data.ingredientsText) {
        promptText += ` The available ingredients are: ${data.ingredientsText}.`;
    }

    if (data.restrictions) {
        promptText += ` Keep in mind these dietary restrictions: ${data.restrictions}.`;
    }
    
    parts.push({ text: promptText });

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recipeName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    prepTime: { type: Type.STRING },
                    cookTime: { type: Type.STRING },
                    servings: { type: Type.STRING },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"]
            }
        }
    });
    
    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as Recipe;
    } catch (e) {
        console.error("Failed to parse recipe:", e);
        throw new Error("Could not generate recipe.");
    }
};

export const generateTattooDesigns = async (description: string, style: string): Promise<string[]> => {
    const prompt = `A ${style} tattoo design of ${description}. The design should be clean, high-contrast line art, suitable for a tattoo stencil, on a plain white background.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Tattoo generation failed: No images were returned.');
};

export const generateCharacterImages = async (options: {
    description: string;
    style: string;
    referenceImageFile?: File | null;
    styleRefImageFile?: File | null;
    keyObjects: KeyObject[];
    count: number;
    aspectRatio: string;
    lightingStyle: string;
    cameraPerspective: string;
    negativePrompt: string;
}): Promise<string[]> => {
    const { description, style, referenceImageFile, styleRefImageFile, keyObjects, count, aspectRatio, lightingStyle, cameraPerspective, negativePrompt } = options;

    const hasImageInputs = referenceImageFile || styleRefImageFile || keyObjects.some(o => o.image);
    
    const promptAdditions = [
        lightingStyle,
        cameraPerspective,
    ].filter(p => p && p !== 'None' && p !== 'none').join(', ');

    if (hasImageInputs) {
        const parts: Part[] = [];
        const promptSegments: string[] = [];

        if (referenceImageFile) {
            parts.push(await fileToGenerativePart(referenceImageFile));
            promptSegments.push("The first image is a reference for the character's appearance.");
        }
        if (styleRefImageFile) {
            parts.push(await fileToGenerativePart(styleRefImageFile));
            promptSegments.push("The next image is a strong reference for the artistic style, color palette, and mood.");
        }

        for (const obj of keyObjects) {
            if (obj.image) {
                parts.push(await fileToGenerativePart(obj.image));
            }
        }

        const objectNames = keyObjects.map(o => o.name).filter(Boolean);
        if (objectNames.length > 0) {
            promptSegments.push(`The scene should also include these objects (provided in the subsequent images): ${objectNames.join(', ')}.`);
        }

        let textPrompt = `Create a ${style} character concept art of ${description}. ${promptAdditions}. Aspect ratio ${aspectRatio}. Full body portrait, dynamic pose, detailed, on a simple grey background.`;
        if (promptSegments.length > 0) {
            textPrompt = `${promptSegments.join(' ')} ${textPrompt}`;
        }
        if (negativePrompt) {
            textPrompt += ` Negative prompt: do not include ${negativePrompt}.`;
        }
        
        parts.push({ text: textPrompt });
        
        const generateOneImage = async (): Promise<string> => {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            const candidate = result.candidates?.[0];
            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        return part.inlineData.data;
                    }
                }
            }
            throw new Error('Character concept generation failed: No image part in response.');
        };

        const generationPromises = Array(count).fill(0).map(() => generateOneImage());
        return await Promise.all(generationPromises);

    } else {
        let prompt = `${style} character concept art of ${description}. ${promptAdditions}. Full body portrait, dynamic pose, detailed, on a simple grey background.`;
        if (negativePrompt) {
            prompt += ` Do not include: ${negativePrompt}.`;
        }

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: count,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });
    
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => img.image.imageBytes);
        }
        
        throw new Error('Character generation failed: No images were returned.');
    }
};

export const generatePackagingDesigns = async (productInfo: string, style: string, packagingType: string, productImageBase64?: string | null): Promise<string[]> => {
    if (productImageBase64) {
        // Use multimodal model
        const imagePart = base64ToGenerativePart(productImageBase64);
        const textPrompt = `Using the provided product image, create a photorealistic 3D render of a complete ${packagingType} product packaging design concept. The product is: ${productInfo}. The style should be: ${style}. The final image should be on a clean studio background.`;
        
        const parts: Part[] = [imagePart, { text: textPrompt }];
        
        const generateOneImage = async (): Promise<string> => {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            const candidate = result.candidates?.[0];
            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        return part.inlineData.data;
                    }
                }
            }
            throw new Error('Packaging design generation failed: No image part in response.');
        };

        // Generate 4 images in parallel
        const generationPromises = [
            generateOneImage(),
            generateOneImage(),
            generateOneImage(),
            generateOneImage(),
        ];
        
        return await Promise.all(generationPromises);

    } else {
        // Use text-to-image model (original functionality)
        const prompt = `A photorealistic 3D render of a ${packagingType} product packaging design concept for ${productInfo}. Style: ${style}. The image should show the product packaging on a clean studio background.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => img.image.imageBytes);
        }
        
        throw new Error('Packaging design generation failed: No images were returned.');
    }
};

export const generateStoryboardScenes = async (script: string): Promise<StoryboardScene[]> => {
    const prompt = `You are a film director. Based on the following script or scene description, create a 4-panel storyboard. For each panel, provide a detailed prompt for an AI image generator to create the visual, a suggested camera shot type, and a brief description of the action.
    
    Script: "${script}"
    
    Return a JSON array of objects.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        panel: { type: Type.INTEGER },
                        imagePrompt: { type: Type.STRING, description: "A detailed prompt for an AI image generator, e.g., 'A wide shot of a futuristic city at night, raining, neon signs reflecting on puddles.'" },
                        shotType: { type: Type.STRING, description: "The camera shot type, e.g., 'Wide Shot', 'Close-up', 'Over-the-shoulder'." },
                        description: { type: Type.STRING, description: "A brief description of the action in the panel." }
                    },
                    required: ["panel", "imagePrompt", "shotType", "description"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as StoryboardScene[];
    } catch (e) {
        console.error("Failed to parse storyboard scenes:", e);
        throw new Error("Could not generate storyboard scenes.");
    }
};

export const generateStoryboardImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${prompt}, cinematic, film still, dramatic lighting`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error('Storyboard image generation failed: No image was returned.');
};

export const generateColoringBookPage = async (description: string): Promise<string[]> => {
    const prompt = `A black and white coloring book page for adults, featuring ${description}. The design should have intricate details, clean lines, and absolutely no shading or solid filled areas. The background must be plain white.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '4:5',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Coloring book page generation failed: No images were returned.');
};

export const generateSeamlessPattern = async (description: string): Promise<string[]> => {
    const prompt = `A seamless, tileable pattern of ${description}. The design must be perfectly repeatable on all sides. High resolution, 4k.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Pattern generation failed: No images were returned.');
};

export const generateAdCopyVariants = async (productDescription: string, targetAudience: string, imageFile?: File | null): Promise<AdCopyVariant[]> => {
    const parts: Part[] = [];
    let promptText = `You are an expert marketing copywriter. Generate 3 distinct ad copy variations for a product based on the provided information.
    Target Audience: "${targetAudience}"`;

    if (imageFile) {
        parts.push(await fileToGenerativePart(imageFile));
        promptText += `\nProduct Image: is provided. Analyze it for key features and visual style.`;
    }
    if (productDescription) {
         promptText += `\nProduct Description: "${productDescription}"`;
    }
    
    promptText += `
    The variations should have different styles:
    1. A "Punchy & Direct" style: Short, attention-grabbing, and creates urgency.
    2. A "Professional & Persuasive" style: Focuses on benefits, builds trust, and uses sophisticated language.
    3. A "Humorous & Witty" style: Uses clever wordplay or humor to be memorable and relatable.
    
    For each variation, provide a headline, a body, and a call to action.`;

    parts.push({ text: promptText });

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        style: { type: Type.STRING, description: "The style of the ad copy (e.g., 'Punchy & Direct')." },
                        headline: { type: Type.STRING, description: "The ad headline." },
                        body: { type: Type.STRING, description: "The main body of the ad copy." },
                        callToAction: { type: Type.STRING, description: "The call to action." }
                    },
                    required: ["style", "headline", "body", "callToAction"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as AdCopyVariant[];
    } catch (e) {
        console.error("Failed to parse ad copy variants:", e);
        throw new Error("Could not generate ad copy variants.");
    }
};

export const generateArtisticQRCode = async (url: string, prompt: string): Promise<string[]> => {
    const fullPrompt = `A scannable QR code that links to "${url}". The QR code should be artistically integrated into the following scene: "${prompt}". The QR code must be clearly visible and functional. High resolution, 4k.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Artistic QR code generation failed: No images were returned.');
};

export const virtualTryOn = async (
    personImageFile: File,
    clothingPrompt: string,
    clothingImageFile?: File | null
): Promise<string> => {
    const personImagePart = await fileToGenerativePart(personImageFile);
    
    const parts: Part[] = [personImagePart];
    let textContent = '';

    if (clothingImageFile) {
        const clothingImagePart = await fileToGenerativePart(clothingImageFile);
        parts.push(clothingImagePart);
        textContent = `The first image is a person. The second image is a reference for an clothing style. Realistically dress the person in the first image in an outfit inspired by the clothing in the second image. `;
        if (clothingPrompt) {
            textContent += `Incorporate these details from the user: "${clothingPrompt}". `;
        }
        textContent += `Keep the person's face, body, and the background the same. The result should be a photorealistic image.`;
    } else {
        textContent = `Realistically replace the clothes the person in the image is wearing with: "${clothingPrompt}". Keep the person's face, body, and the background the same. The result should be a photorealistic image.`;
    }
    
    parts.push({ text: textContent });

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Virtual try-on failed: No image part in response.');
};


export const generatePodcastShowNotes = async (transcript: string): Promise<PodcastShowNotes> => {
    const prompt = `You are a podcast producer. Based on the following transcript, generate a complete set of show notes.
    Your response must be a JSON object with the following structure:
    - title: A catchy and relevant title for the podcast episode.
    - summary: A concise, one-paragraph summary of the episode.
    - timestamps: An array of key moments, each with a "time" (e.g., "00:15:32") and a "topic" description. Find at least 5 key moments.
    - socialPosts: An array of 2 social media posts to promote the episode, one for "X (Twitter)" and one for "LinkedIn".

    Transcript:
    "${transcript}"`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    timestamps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING },
                                topic: { type: Type.STRING }
                            },
                            required: ["time", "topic"]
                        }
                    },
                    socialPosts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING },
                                post: { type: Type.STRING }
                            },
                            required: ["platform", "post"]
                        }
                    }
                },
                required: ["title", "summary", "timestamps", "socialPosts"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as PodcastShowNotes;
    } catch (e) {
        console.error("Failed to parse podcast show notes:", e);
        throw new Error("Could not generate podcast show notes.");
    }
};

export const generateVideoFromText = async (prompt: string): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        const error = operation.error as { message?: string };
        const errorMessage = error.message || JSON.stringify(operation.error);
        throw new Error(`Video generation failed: ${errorMessage}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation failed: No download link in response.');
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const generatePresentation = async (topic: string): Promise<Presentation> => {
    const prompt = `Generate a 5-slide presentation on the topic: "${topic}". Include a main title and for each slide, provide a slide number, title, an array of 3-4 content bullet points, and a descriptive prompt for an AI image generator to create a relevant visual.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mainTitle: { type: Type.STRING },
                    slides: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                slideNumber: { type: Type.INTEGER },
                                title: { type: Type.STRING },
                                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                                imagePrompt: { type: Type.STRING }
                            },
                            required: ["slideNumber", "title", "content", "imagePrompt"]
                        }
                    }
                },
                required: ["mainTitle", "slides"]
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as Presentation;
    } catch (e) {
        console.error("Failed to parse presentation:", e);
        throw new Error("Could not generate presentation.");
    }
};

export const generateComicPanels = async (story: string): Promise<ComicPanel[]> => {
    const prompt = `Based on the following story idea, create a 4-panel comic strip script. For each panel, provide a detailed prompt for an AI image generator, optional dialogue for characters, and optional narration.
    
    Story: "${story}"
    
    Return a JSON array of objects.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        panel: { type: Type.INTEGER },
                        imagePrompt: { type: Type.STRING },
                        dialogue: { type: Type.STRING, description: "Character dialogue. Can be empty." },
                        narration: { type: Type.STRING, description: "Narrator's box text. Can be empty." }
                    },
                    required: ["panel", "imagePrompt"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonString) as ComicPanel[];
    } catch (e) {
        console.error("Failed to parse comic panels:", e);
        throw new Error("Could not generate comic panels.");
    }
};

export const generateComicPanelImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${prompt}, american comic book style, vibrant colors, dynamic action, detailed line art`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error('Comic panel image generation failed: No image was returned.');
};

// New functions for enhanced mini-apps
export const generateMoodboardImage = async (prompt: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A moodboard for a photoshoot. Theme: ${prompt}. A collage of inspirational images, textures, and colors.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error('Moodboard image generation failed: No images were returned.');
};

export const generateSceneImage = async (sceneInfo: PhotoshootScene): Promise<string> => {
    const prompt = `Photoshoot scene: ${sceneInfo.title}. ${sceneInfo.description}. Lighting: ${sceneInfo.lighting}. Camera Angle: ${sceneInfo.cameraAngle}. Props include: ${sceneInfo.props.join(', ')}. Photorealistic, professional photography.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error('Scene image generation failed: No image was returned.');
};

export const generateVideoSceneImage = async (visualDescription: string): Promise<string> => {
    const prompt = `Cinematic still from a short video ad. Scene description: ${visualDescription}. Vibrant, high-energy, commercial style.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '9:16',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error('Video scene image generation failed: No image was returned.');
};

export const sketchToImage = async (sketchBase64: string, prompt: string, referenceImageBase64?: string | null): Promise<string> => {
    const parts: Part[] = [];
    let textContent = '';

    const sketchPart = base64ToGenerativePart(sketchBase64, 'image/png');

    if (referenceImageBase64) {
        const referencePart = base64ToGenerativePart(referenceImageBase64);
        parts.push(referencePart);
        parts.push(sketchPart);
        textContent = `Using the first image as a reference, apply the edits from the second image (a transparent sketch overlay) to generate a new, cohesive image based on this description: "${prompt}". Blend the sketch elements naturally into the reference image.`;
    } else {
        parts.push(sketchPart);
        textContent = `Transform this rough sketch into a detailed image based on the following description: "${prompt}". Interpret the shapes and lines in the sketch as the primary subjects of the image.`;
    }
    
    parts.push({ text: textContent });

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error('Sketch to Image failed: No image part in response.');
};
