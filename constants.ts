
import { AspectRatio, VideoLength, CameraMotion, StyleTemplate } from './types';

export const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '4:5 Vertical', value: '4:5' },
  { label: '16:9 Horizontal', value: '16:9' },
];

export const LIGHTING_STYLES: string[] = [
  'Studio Softbox',
  'Golden Hour Sunlight',
  'Dramatic Rim Lighting',
  'Cinematic Neon Glow',
  'Clean Ambient',
];

export const CAMERA_PERSPECTIVES: string[] = [
  'Eye-level Front View',
  'Low Angle Shot',
  'High Angle (Hero) Shot',
  'Top-down Flat Lay',
  'Dutch Angle Shot',
];

export const VIDEO_LENGTHS: VideoLength[] = [
  "Short (~5s)",
  "Medium (~10s)",
  "Long (~15s)",
];

export const CAMERA_MOTIONS: CameraMotion[] = [
  "Static",
  "Slow Pan",
  "Dolly Zoom",
  "Fly-through",
];

export const MOCKUP_TYPES: string[] = [
    'T-shirt on a model',
    'Coffee mug on a desk',
    'Billboard in a city',
    'Smartphone screen',
    'Tote bag held by a person',
    'Hardcover book cover'
];

export const FONT_OPTIONS: string[] = [
    'Inter',
    'Poppins',
    'Montserrat',
    'Lato',
    'Roboto',
    'Playfair Display',
    'Oswald',
];

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    name: 'Vintage Film',
    icon: 'camera',
    keywords: 'vintage film photo, 35mm, grainy, soft focus, warm nostalgic tones, cinematic',
    gradient: 'from-amber-200 to-yellow-400'
  },
  {
    name: 'Cyberpunk',
    icon: 'cube',
    keywords: 'cyberpunk aesthetic, neon lighting, futuristic cityscape, dystopian, high-tech, vibrant pinks and blues',
    gradient: 'from-pink-500 to-violet-600'
  },
  {
    name: 'Watercolor',
    icon: 'paint-brush',
    keywords: 'watercolor painting, soft edges, blended colors, artistic, light and airy, pastel palette',
    gradient: 'from-sky-300 to-cyan-400'
  },
  {
    name: 'Minimalist',
    icon: 'leaf',
    keywords: 'minimalist, clean background, simple composition, neutral color palette, elegant, modern',
    gradient: 'from-slate-200 to-stone-300'
  },
  {
    name: 'Dark Fantasy',
    icon: 'moon-stars',
    keywords: 'dark fantasy art, epic, moody lighting, dramatic shadows, enchanted, mysterious atmosphere',
    gradient: 'from-indigo-800 to-slate-900'
  },
   {
    name: 'Pop Art',
    icon: 'star',
    keywords: 'pop art, bold colors, graphic style, halftone dots, comic book aesthetic, vibrant and playful',
    gradient: 'from-rose-400 to-red-500'
  },
];

export const NEGATIVE_PROMPT_PRESETS: string[] = [
    'text', 'watermark', 'blurry', 'deformed', 'disfigured', 'ugly', 'low quality', 'pixelated'
];
