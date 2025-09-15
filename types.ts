export type AspectRatio = "1:1" | "4:5" | "16:9";

export type Theme = 'light' | 'dark';

export type EditorMode = 'view' | 'inpaint' | 'crop' | 'text';

export interface WatermarkSettings {
    enabled: boolean;
    useLogo: boolean;
    text: string;
    position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    scale: number; // as a percentage of image width
    opacity: number; // 0-100
}

export interface GenerationSettings {
    aspectRatio: AspectRatio;
    lightingStyle: string;
    cameraPerspective: string;

    prompt: string; // The auto-generated prompt
    editedPrompt: string | null; // The user-edited prompt
    
    negativePrompt: string;
    seed: string;
    numberOfImages: 1 | 4;
    
    productDescription: string;
    styleKeywords: string;
    watermark: WatermarkSettings;
}

export interface TextOverlay {
    id: string;
    text: string;
    x: number; // percentage
    y: number; // percentage
    color: string;
    fontSize: number; // percentage of image height
    fontFamily: string;
}

export interface HistoryItem {
    id: string;
    images: string[];
    settings: GenerationSettings;
    isFavorite: boolean;
    timestamp: number;
    palette?: string[];
    textOverlays?: TextOverlay[];
}

export interface BrandKit {
    logo: string | null; // base64 string
    primaryColor: string;
    font: string;
}
