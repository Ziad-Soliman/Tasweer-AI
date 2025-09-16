import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import { SceneTemplate, MarketingCopy } from "../types";
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES } from '../constants';


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

export const describeStyle = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: "Describe the key aesthetic keywords of this image for an image generation prompt, for example: 'minimalist, pastel color palette, marble background, soft shadows'." }] },
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

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error('Background removal failed: No image part in response.');
};

export const generateImage = async (
    productImageBase64: string, 
    prompt: string, 
    styleImageFile: File | null,
    negativePrompt: string,
    seed: number | null
): Promise<string> => {
    const fullPrompt = `${prompt}${negativePrompt ? `. Negative prompt: do not include ${negativePrompt}.` : ''}`;

    const parts: Part[] = [
        base64ToGenerativePart(productImageBase64),
        { text: fullPrompt },
    ];

    if (styleImageFile) {
        const styleImagePart = await fileToGenerativePart(styleImageFile);
        parts.splice(1, 0, styleImagePart);
    }
    
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

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error('Image generation failed: No image part in response.');
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

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
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

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
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
                    socialMediaPost: { type: Type.STRING, description: "An engaging social media post for Instagram, including relevant hashtags." }
                },
                required: ["productName", "tagline", "description", "socialMediaPost"]
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
