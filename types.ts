

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16" | "4:3" | "3:4";

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

export type GenerationMode = 'product' | 'video' | 'mockup' | 'social' | 'design' | 'character';

export type PresetCategory = 'Photorealistic' | 'Artistic' | 'Futuristic' | 'Vintage' | 'Abstract' | 'Video' | 'Social';

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

export interface KeyObject {
    id: string;
    name: string;
    image: File | null;
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
    numberOfImages: 1 | 2 | 3 | 4;
    
    productDescription: string;
    selectedPresetId: string | null;
    watermark: WatermarkSettings;

    // Cinematic Controls
    photoStyle: string;
    cameraZoom: string;
    shotType: string;
    colorTone: string;
    keyObjects: KeyObject[];
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

type Page = 'product-generation' | 'mini-apps' | 'classic-generation' | 'logo-conceptualization' | 'ai-texture-enhancer' | 'character';

export interface HistoryItem {
    id: string;
    // Source of the generation
    source: {
        page: Page;
        miniAppId?: string; // e.g., 'background-remover'
        appName: string; // Display name, e.g., 'Product Generation', 'Background Remover'
    };
    // For display in the history list
    thumbnail: {
        type: 'image' | 'video' | 'icon';
        value: string; // base64 image data URL, or icon name
    };
    // The main prompt or a summary of the generation
    title: string;
    // All data needed to restore the state of the source page/app
    payload: any; 
    isFavorite: boolean;
    timestamp: number;
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

// Mini-app specific types
export interface ProductNameSuggestion {
    name: string;
    reasoning: string;
}

export interface VideoAdScene {
    sceneNumber: number;
    visual: string;
    voiceover: string;
    onScreenText: string;
    duration: string;
    imageUrl?: string;
}

export interface VideoAdScript {
    title: string;
    platform: string;
    targetAudience: string;
    hook: string;
    scenes: VideoAdScene[];
    callToAction: string;
    musicSuggestion: string;
}

export interface PhotoshootScene {
    title: string;
    description: string;
    lighting: string;
    props: string[];
    cameraAngle: string;
    imageUrl?: string;
}

export interface PhotoshootConcept {
    conceptTitle: string;
    moodboardDescription: string;
    colorPalette: { hex: string, name: string }[];
    scenes: PhotoshootScene[];
    moodboardImageUrls?: string[];
}

export interface BrandVoiceGuide {
    voiceName: string;
    description: string;
    characteristics: string[];
    messagingMatrix: {
        do: string[];
        dont: string[];
    };
    exampleCopy: {
        scenario: string;
        copy: string;
    }[];
}

// YouTube Thumbnail Generator types
export interface ThumbnailElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background';
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  rotation: number; // degrees
  zIndex: number;
  
  // Text specific
  text?: string;
  fontSize?: number; // percentage of canvas height
  fontFamily?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  
  // Image specific
  src?: string;
  
  // Shape/Background specific
  backgroundColor?: string;
  shapeType?: 'rectangle' | 'ellipse';
}

export interface AISuggestions {
    titles: string[];
    imagePrompts: string[];
    colorPalette: string[];
    fontPairing: { heading: string; body: string };
}

export interface Recipe {
    recipeName: string;
    description: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string[];
    instructions: string[];
}

export interface StoryboardScene {
  panel: number;
  imagePrompt: string;
  shotType: string;
  description: string;
  imageUrl?: string; // To be populated after image generation
}

export interface AdCopyVariant {
    style: string;
    headline: string;
    body: string;
    callToAction: string;
}

export interface PodcastShowNotes {
    title: string;
    summary: string;
    timestamps: { time: string; topic: string }[];
    socialPosts: { platform: string; post: string }[];
}

// Presentation Generator
export interface PresentationSlide {
  slideNumber: number;
  title: string;
  content: string[]; // Array of bullet points
  imagePrompt: string;
}

export interface Presentation {
  mainTitle: string;
  slides: PresentationSlide[];
}

// Comic Book Creator
export interface ComicPanel {
  panel: number;
  imagePrompt: string;
  dialogue?: string;
  narration?: string;
  imageUrl?: string; // To be populated after image generation
}