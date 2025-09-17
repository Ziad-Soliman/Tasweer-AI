

import { AspectRatio, VideoLength, CameraMotion, SocialMediaTemplate } from './types';

export const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '4:5 Vertical', value: '4:5' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Wide', value: '16:9' },
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

export const NEGATIVE_PROMPT_PRESETS: string[] = [
    'text', 'watermark', 'blurry', 'deformed', 'disfigured', 'ugly', 'low quality', 'pixelated'
];

export const SOCIAL_MEDIA_TEMPLATES: SocialMediaTemplate[] = [
  { id: 'ig-post', name: 'Instagram Post', platform: 'Instagram', aspectRatio: '1:1', icon: 'image' },
  { id: 'ig-story', name: 'Instagram Story', platform: 'Instagram', aspectRatio: '9:16', icon: 'image' },
  { id: 'fb-post', name: 'Facebook Post', platform: 'Facebook', aspectRatio: '4:5', icon: 'image' },
  { id: 'fb-cover', name: 'Facebook Cover', platform: 'Facebook', aspectRatio: '16:9', icon: 'image' },
  { id: 'x-post', name: 'X (Twitter) Post', platform: 'X (Twitter)', aspectRatio: '16:9', icon: 'image' },
];
