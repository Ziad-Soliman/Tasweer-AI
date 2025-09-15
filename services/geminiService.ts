import { GoogleGenAI, Modality, Part, Type } from "@google/genai";

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

export const generateStyleSuggestions = async (productDescription: string): Promise<string[]> => {
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the product described as "${productDescription}", generate 3 creative and distinct scene concepts for a professional product photograph. Provide the response as a JSON array of strings, where each string is a complete and compelling image generation prompt. For example: ["A close-up shot of the product on a wet, black slate background with scattered water droplets, lit by dramatic side lighting.", "The product displayed on a pedestal made of natural wood, surrounded by lush green foliage and soft, diffused sunlight.", "A flat-lay of the product on a minimalist pastel-colored surface, with geometric shadows and a single, elegant flower petal."]`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        }
    });

    try {
        const jsonString = result.text.trim();
        const suggestions = JSON.parse(jsonString);
        if (Array.isArray(suggestions) && suggestions.every(item => typeof item === 'string')) {
            return suggestions;
        }
        return [];
    } catch (e) {
        console.error("Failed to parse style suggestions:", e);
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

export const inpaintImage = async (
    imageWithMaskBase64: string,
    prompt: string
): Promise<string> => {
    const imagePart = base64ToGenerativePart(imageWithMaskBase64);
    const textPart = { text: `In the following image, fill the transparent area with: ${prompt}. Blend it seamlessly with the rest of the image.` };

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
    throw new Error('In-painting failed: No image part in response.');
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
