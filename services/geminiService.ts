import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import { SceneTemplate, MarketingCopy, ProductNameSuggestion, VideoAdScript, PhotoshootConcept, BrandVoiceGuide, AISuggestions, Recipe } from "../types";
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES, FONT_OPTIONS } from '../constants';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const base64ToGenerativePart = (base64: string, mimeType: string = 'image/png'): Part => {
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

export const generateSceneTemplates = async (productDescription: string): Promise<SceneTemplate[]> => {
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the product "${productDescription}", generate 4 diverse and visually appealing scene templates for a professional product photograph. Provide the response as a JSON array of objects. Ensure lighting and perspective values are ONLY from the provided lists.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "A short, catchy name for the scene (e.g., 'Minimalist Studio')." },
                        prompt: { type: Type.STRING, description: "A detailed image generation prompt for this scene, incorporating the product." },
                        lighting: { type: Type.STRING, description: `A suitable lighting style from this list: ${LIGHTING_STYLES.join(', ')}.` },
                        perspective: { type: Type.STRING, description: `A suitable camera perspective from this list: ${CAMERA_PERSPECTIVES.join(', ')}.` }
                    },
                    required: ["name", "prompt", "lighting", "perspective"]
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim();
        const templates = JSON.parse(jsonString);
        if (Array.isArray(templates)) {
            return templates.filter(t => t.name && t.prompt && t.lighting && t.perspective);
        }
        return [];
    } catch (e) {
        console.error("Failed to parse scene templates:", e);
        return [];
    }
};

export const removeBackground = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
    
    const config: { responseModalities: Modality[], seed?: number } = {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    };

    if (seed !== null && !isNaN(seed)) {
        config.seed = seed;
    }

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
    throw new Error('Social post generation failed: No image part in response.');
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

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
    throw new Error('Design generation failed: No image part in response.');
};


export const generateMockup = async (
    productImageBase64: string,
    prompt: string,
    mockupType: string
): Promise<string> => {
    const fullPrompt = `${prompt}. The provided image is a product with a transparent background. Seamlessly and realistically place this product onto the ${mockupType}. The final image should be a single, cohesive, photorealistic scene.`;

    const parts: Part[] = [
        base64ToGenerativePart(productImageBase64),
        { text: fullPrompt },
    ];

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
    throw new Error('Mockup generation failed: No image part in response.');
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
        model: 'gemini-2.5-flash-image-preview',
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

export const enhanceImage = async (
    imageBase64: string,
    originalPrompt: string
): Promise<string> => {
    const imagePart = base64ToGenerativePart(imageBase64);
    const textPart = { text: `Enhance and upscale this image, maintaining the original subject and style described as: "${originalPrompt}". Add photorealistic details, improve texture, and increase resolution.` };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
        const jsonString = result.text.trim();
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
        const jsonString = result.text.trim();
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
         model: 'gemini-2.5-flash-image-preview',
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
        const jsonString = result.text.trim();
        return JSON.parse(jsonString) as ProductNameSuggestion[];
    } catch (e) {
        console.error("Failed to parse product names:", e);
        throw new Error("Could not generate product names.");
    }
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
        const jsonString = result.text.trim();
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
        const jsonString = result.text.trim();
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
        const jsonString = result.text.trim();
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
        const jsonString = result.text.trim();
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
        const jsonString = result.text.trim();
        return JSON.parse(jsonString) as AISuggestions;
    } catch (e) {
        console.error("Failed to parse thumbnail suggestions from image:", e);
        throw new Error("Could not generate thumbnail suggestions from image.");
    }
};

export const redesignRoom = async (imageFile: File, style: string): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
        const jsonString = result.text.trim();
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
