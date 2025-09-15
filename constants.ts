
import { AspectRatio } from './types';

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

export const FONT_OPTIONS: string[] = [
    'Inter',
    'Poppins',
    'Montserrat',
    'Lato',
    'Roboto',
    'Playfair Display',
    'Oswald',
];
