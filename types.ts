

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

export type Theme = 'light' | 'dark';

export type EditorMode = 'view' | 'magic-edit' | 'crop' | 'text' | 'remove-object' | 'expand';

export type VideoLength = "Short (~5s)" | "Medium (~10s)" | "Long (~15s)";
export type CameraMotion = "Static" | "Slow Pan" | "Dolly Zoom" | "Fly-through";

export interface WatermarkSettings {
    enabled: boolean;
    useLogo: boolean;
    text: string;
    position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    scale: number; // as a percentage of image width
    opacity: number; // 0-100
}

export type GenerationMode = 'product' | 'video' | 'mockup' | 'social' | 'design';

export type PresetCategory = 'Photorealistic' | 'Artistic' | 'Futuristic' | 'Vintage' | 'Abstract';

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  preview: {
    type: 'gradient';
    value: string; // tailwind gradient class
    icon: string;
  };
  promptFragment: string;
  applicableModes: GenerationMode[];
}

export interface SocialMediaTemplate {
  id: string;
  name: string;
  platform: 'Instagram' | 'Facebook' | 'X (Twitter)';
  aspectRatio: AspectRatio;
  icon: string;
}

export interface GenerationSettings {
    generationMode: GenerationMode;
    aspectRatio: AspectRatio;
    lightingStyle: string;
    cameraPerspective: string;
    videoLength: VideoLength;
    cameraMotion: CameraMotion;
    mockupType: string;
    selectedSocialTemplateId: string | null;

    prompt: string; // The auto-generated prompt
    editedPrompt: string | null; // The user-edited prompt
    
    negativePrompt: string;
    seed: string;
    numberOfImages: 1 | 4;
    
    productDescription: string;
    selectedPresetId: string | null;
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
    rotation: number; // degrees
    width: number; // percentage of container width
}

export interface HistoryItem {
    id: string;
    images?: string[];
    videoUrl?: string;
    settings: GenerationSettings;
    isFavorite: boolean;
    timestamp: number;
    palette?: string[];
    textOverlays?: TextOverlay[];
}

export interface BrandKit {
    id:string;
    name: string;
    logo: string | null; // base64 string
    primaryColor: string;
    font: string;
}

export interface SceneTemplate {
    name: string;
    prompt: string;
    lighting: string;
    perspective: string;
}

export interface MarketingCopy {
    productName: string;
    tagline: string;
    description: string;
    socialMediaPost: string;
    socialMediaPostArabic: string;
}