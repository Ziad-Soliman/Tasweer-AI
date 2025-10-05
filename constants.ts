import { AspectRatio, VideoLength, CameraMotion, SocialMediaTemplate } from './types';

export const ASPECT_RATIOS: { labelKey: keyof typeof import('./lib/translations').translations.en; value: AspectRatio }[] = [
  { labelKey: 'aspectRatioSquare', value: '1:1' },
  { labelKey: 'aspectRatioVertical', value: '4:5' },
  { labelKey: 'aspectRatioStory', value: '9:16' },
  { labelKey: 'aspectRatioWide', value: '16:9' },
  { labelKey: 'aspectRatio4to3', value: '4:3' },
  { labelKey: 'aspectRatio3to4', value: '3:4' },
];

export const LIGHTING_STYLES: string[] = [
  'Studio Softbox',
  'Golden Hour Sunlight',
  'Dramatic Rim Lighting',
  'Cinematic Neon Glow',
  'Clean Ambient',
];

export const CINEMATIC_LIGHTING_STYLES = [
    { id: 'none', name: 'None', icon: 'circle-slash' }, { id: 'cinematic', name: 'Cinematic', icon: 'cinematic-lighting' }, { id: 'film-noir', name: 'Film Noir', icon: 'moon' },
    { id: 'natural', name: 'Natural Light', icon: 'sun' }, { id: 'morning', name: 'Morning', icon: 'sunrise' }, { id: 'daylight', name: 'Bright Daylight', icon: 'sun-high' },
    { id: 'golden-hour', name: 'Golden Hour', icon: 'sunset' }, { id: 'blue-hour', name: 'Blue Hour', icon: 'moon-stars' }, { id: 'night', name: 'Night Cinematic', icon: 'video' },
    { id: 'high-key', name: 'High Key', icon: 'high-key' }, { id: 'low-key', name: 'Low Key', icon: 'low-key' }, { id: 'horror', name: 'Horror Dim', icon: 'horror-dim' },
    { id: 'cyberpunk', name: 'Neon Cyberpunk', icon: 'neon-cyberpunk' }, { id: 'candlelight', name: 'Candlelight', icon: 'flame' }, { id: 'flashlight', name: 'Flashlight', icon: 'flashlight' }
];

export const CAMERA_PERSPECTIVE_OPTIONS = [
    { id: 'None', name: 'None', icon: 'circle-slash' },
    { id: 'Eye-level Front View', name: 'Eye-level', icon: 'camera' },
    { id: 'Low Angle Shot', name: 'Low Angle', icon: 'arrow-up' },
    { id: 'High Angle (Hero) Shot', name: 'High Angle', icon: 'arrow-down' },
    { id: 'Top-down Flat Lay', name: 'Top-down', icon: 'layout-grid' },
    { id: 'Dutch Angle Shot', name: 'Dutch Angle', icon: 'rotate-cw' },
] as const;

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

export const MOCKUP_TYPES: { id: string, name: string, icon: string, promptFragment: string }[] = [
    // Apparel
    { id: 'tshirt', name: 'T-shirt', icon: 'shirt', promptFragment: 'on a person, studio lighting' },
    { id: 'hoodie', name: 'Hoodie', icon: 'shirt', promptFragment: 'worn by a model in a street style setting' },
    { id: 'tote-bag', name: 'Tote Bag', icon: 'shopping-bag', promptFragment: 'held by a person walking in a city' },
    
    // Print
    { id: 'poster', name: 'Poster', icon: 'image', promptFragment: 'framed poster hanging on a clean, modern wall' },
    { id: 'business-card', name: 'Business Card', icon: 'user-square', promptFragment: 'as a stack of business cards on a wooden surface' },
    { id: 'book-cover', name: 'Book Cover', icon: 'book', promptFragment: 'as a hardcover book on a shelf' },
    { id: 'magazine', name: 'Magazine', icon: 'book', promptFragment: 'on an open magazine page with surrounding text' },

    // Home & Living
    { id: 'mug', name: 'Coffee Mug', icon: 'mug', promptFragment: 'on a cozy cafe table with a latte' },
    { id: 'pillow', name: 'Pillow', icon: 'image', promptFragment: 'on a modern minimalist sofa' },
    { id: 'canvas', name: 'Canvas Print', icon: 'image', promptFragment: 'hanging on a stylish gallery wall' },
    { id: 'tumbler', name: 'Tumbler', icon: 'mug', promptFragment: 'on a wooden desk next to a laptop' },
    
    // Packaging
    { id: 'box', name: 'Product Box', icon: 'package', promptFragment: 'as a product box packaging in a studio setting' },
    { id: 'bottle', name: 'Bottle', icon: 'droplet', promptFragment: 'as a cosmetic or drink bottle with professional lighting' },
    { id: 'can', name: 'Soda Can', icon: 'package', promptFragment: 'as an aluminum beverage can with condensation' },
    { id: 'pouch', name: 'Pouch Bag', icon: 'shopping-bag', promptFragment: 'as a stand-up pouch for coffee or snacks' },
    
    // Digital
    { id: 'smartphone', name: 'Smartphone', icon: 'smartphone', promptFragment: 'on a smartphone screen held by a hand' },
    { id: 'tablet', name: 'Tablet', icon: 'smartphone', promptFragment: 'on a tablet screen on a desk' },

    // Outdoor
    { id: 'billboard', name: 'Billboard', icon: 'billboard', promptFragment: 'on a large billboard in a bustling city at dusk' },
    { id: 'signage', name: 'Store Sign', icon: 'billboard', promptFragment: 'on a modern storefront sign' },
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

export const PHOTO_STYLES = [
    { id: 'photorealistic', name: 'Photorealistic', icon: 'camera' },
    { id: 'cinematic', name: 'Cinematic', icon: 'video' },
    { id: 'anime', name: 'Anime', icon: 'user-circle' },
    { id: 'digital-art', name: 'Digital Art', icon: 'paint-brush' },
    { id: '3d-render', name: '3D Render', icon: 'cube' },
];

export const CAMERA_ZOOMS = [
    { id: 'none', name: 'None', icon: 'circle-slash' },
    { id: 'extreme-close-up', name: 'Extreme Close-up', icon: 'zoom-in' },
    { id: 'close-up', name: 'Close-up', icon: 'focus' },
    { id: 'medium-shot', name: 'Medium Shot', icon: 'user-square' },
    { id: 'full-shot', name: 'Full Shot', icon: 'scan-user' },
];
export const SHOT_TYPES = [
    { id: 'none', name: 'None', icon: 'circle-slash' },
    { id: 'wide-shot', name: 'Wide Shot', icon: 'mountain' },
    { id: 'cowboy-shot', name: 'Cowboy Shot', icon: 'user-circle' },
    { id: 'two-shot', name: 'Two-shot', icon: 'users' },
    { id: 'pov', name: 'Point-of-view', icon: 'eye' },
];
export const COLOR_TONES = [
    { id: 'none', name: 'None', icon: 'circle-slash' },
    { id: 'vibrant', name: 'Vibrant', icon: 'palette' },
    { id: 'muted', name: 'Muted', icon: 'droplet' },
    { id: 'warm', name: 'Warm', icon: 'sun' },
    { id: 'cool', name: 'Cool', icon: 'snowflake' },
    { id: 'b-w', name: 'Black and White', icon: 'contrast' },
];