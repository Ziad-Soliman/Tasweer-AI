
import { Preset } from '../types';

export const ALL_MODES: Preset['applicableModes'] = ['product', 'video', 'mockup', 'social', 'design'];

export const PRESETS: Preset[] = [
    // Photorealistic
    {
        id: 'photo-hyperrealistic',
        name: 'Hyperrealistic',
        category: 'Photorealistic',
        preview: { type: 'gradient', value: 'from-gray-700 to-gray-900', icon: 'camera' },
        promptFragment: 'hyperrealistic, 8k, detailed, professional photography, sharp focus',
        applicableModes: ALL_MODES,
    },
    {
        id: 'photo-cinematic-noir',
        name: 'Cinematic Noir',
        category: 'Photorealistic',
        preview: { type: 'gradient', value: 'from-slate-800 to-black', icon: 'video' },
        promptFragment: 'cinematic film noir style, high contrast, dramatic shadows, black and white, mysterious mood',
        applicableModes: ALL_MODES,
    },
    {
        id: 'photo-golden-hour',
        name: 'Golden Hour',
        category: 'Photorealistic',
        preview: { type: 'gradient', value: 'from-amber-400 to-orange-600', icon: 'sun' },
        promptFragment: 'golden hour lighting, warm tones, soft light, long shadows, serene atmosphere',
        applicableModes: ALL_MODES,
    },
    {
        id: 'photo-food-photography',
        name: 'Gourmet Food',
        category: 'Photorealistic',
        preview: { type: 'gradient', value: 'from-red-500 to-yellow-500', icon: 'sparkles' },
        promptFragment: 'gourmet food photography, delicious, mouth-watering, fresh, clean composition, detailed texture',
        applicableModes: ALL_MODES,
    },

    // Artistic
    {
        id: 'art-watercolor',
        name: 'Watercolor',
        category: 'Artistic',
        preview: { type: 'gradient', value: 'from-sky-300 to-cyan-400', icon: 'paint-brush' },
        promptFragment: 'watercolor painting, soft edges, blended colors, artistic, light and airy, pastel palette',
        applicableModes: ALL_MODES,
    },
    {
        id: 'art-pop-art',
        name: 'Pop Art',
        category: 'Artistic',
        preview: { type: 'gradient', value: 'from-rose-400 to-red-500', icon: 'star' },
        promptFragment: 'pop art, bold colors, graphic style, halftone dots, comic book aesthetic, vibrant and playful',
        applicableModes: ALL_MODES,
    },
    {
        id: 'art-oil-painting',
        name: 'Oil Painting',
        category: 'Artistic',
        preview: { type: 'gradient', value: 'from-amber-700 to-stone-800', icon: 'paint-brush' },
        promptFragment: 'classic oil painting, visible brush strokes, rich textures, dramatic lighting, impasto',
        applicableModes: ALL_MODES,
    },
    {
        id: 'art-fantasy',
        name: 'Dark Fantasy',
        category: 'Artistic',
        preview: { type: 'gradient', value: 'from-indigo-800 to-slate-900', icon: 'moon-stars' },
        promptFragment: 'dark fantasy art, epic, moody lighting, dramatic shadows, enchanted, mysterious atmosphere',
        applicableModes: ALL_MODES,
    },
    
    // Futuristic
    {
        id: 'future-cyberpunk',
        name: 'Cyberpunk',
        category: 'Futuristic',
        preview: { type: 'gradient', value: 'from-pink-500 to-violet-600', icon: 'cube' },
        promptFragment: 'cyberpunk aesthetic, neon lighting, futuristic cityscape, dystopian, high-tech, vibrant pinks and blues',
        applicableModes: ALL_MODES,
    },
    {
        id: 'future-steampunk',
        name: 'Steampunk',
        category: 'Futuristic',
        preview: { type: 'gradient', value: 'from-amber-800 to-yellow-900', icon: 'cog' },
        promptFragment: 'steampunk, victorian aesthetic, gears, cogs, steam-powered, intricate machinery, bronze and copper tones',
        applicableModes: ALL_MODES,
    },
    {
        id: 'future-hologram',
        name: 'Holographic',
        category: 'Futuristic',
        preview: { type: 'gradient', value: 'from-cyan-400 to-indigo-500', icon: 'sparkles' },
        promptFragment: 'holographic, glowing, translucent, futuristic, neon blue, digital projection',
        applicableModes: ALL_MODES,
    },
    {
        id: 'future-solarpunk',
        name: 'Solarpunk',
        category: 'Futuristic',
        preview: { type: 'gradient', value: 'from-green-400 to-teal-500', icon: 'leaf' },
        promptFragment: 'solarpunk, eco-futurism, lush greenery, sustainable technology, optimistic, bright and airy',
        applicableModes: ALL_MODES,
    },

    // Vintage
    {
        id: 'vintage-film',
        name: 'Vintage Film',
        category: 'Vintage',
        preview: { type: 'gradient', value: 'from-amber-200 to-yellow-400', icon: 'camera' },
        promptFragment: 'vintage film photo, 35mm, grainy, soft focus, warm nostalgic tones, cinematic',
        applicableModes: ALL_MODES,
    },
    {
        id: 'vintage-polaroid',
        name: 'Polaroid',
        category: 'Vintage',
        preview: { type: 'gradient', value: 'from-stone-300 to-slate-400', icon: 'image' },
        promptFragment: 'polaroid photo, instant film, faded colors, classic white border, retro feel, light leaks',
        applicableModes: ALL_MODES,
    },
    {
        id: 'vintage-daguerreotype',
        name: 'Daguerreotype',
        category: 'Vintage',
        preview: { type: 'gradient', value: 'from-gray-500 to-zinc-600', icon: 'history' },
        promptFragment: 'daguerreotype, antique photo, monochrome, high detail, metallic sheen, 19th-century style',
        applicableModes: ALL_MODES,
    },
    {
        id: 'vintage-90s-retro',
        name: '90s Retro',
        category: 'Vintage',
        preview: { type: 'gradient', value: 'from-purple-500 to-pink-500', icon: 'star' },
        promptFragment: '90s retro aesthetic, vibrant colors, geometric patterns, grainy VHS look, nostalgic',
        applicableModes: ALL_MODES,
    },
    
    // Abstract
    {
        id: 'abstract-minimalist',
        name: 'Minimalist',
        category: 'Abstract',
        preview: { type: 'gradient', value: 'from-slate-200 to-stone-300', icon: 'leaf' },
        promptFragment: 'minimalist, clean background, simple composition, neutral color palette, elegant, modern, negative space',
        applicableModes: ALL_MODES,
    },
    {
        id: 'abstract-geometric',
        name: 'Geometric',
        category: 'Abstract',
        preview: { type: 'gradient', value: 'from-blue-500 to-green-500', icon: 'cube' },
        promptFragment: 'geometric abstraction, clean lines, shapes, patterns, bold colors, structured composition',
        applicableModes: ALL_MODES,
    },
    {
        id: 'abstract-double-exposure',
        name: 'Double Exposure',
        category: 'Abstract',
        preview: { type: 'gradient', value: 'from-rose-500 to-indigo-600', icon: 'image' },
        promptFragment: 'double exposure, superimposed images, silhouette, artistic blend, surreal, ethereal',
        applicableModes: ['product', 'mockup', 'social', 'design'],
    },
    {
        id: 'abstract-paper-craft',
        name: 'Paper Quilling',
        category: 'Abstract',
        preview: { type: 'gradient', value: 'from-lime-300 to-emerald-400', icon: 'sparkles' },
        promptFragment: 'paper quilling art, coiled paper strips, 3D paper craft, intricate details, vibrant colors',
        applicableModes: ALL_MODES,
    },
];
