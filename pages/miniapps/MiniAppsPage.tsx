import React, { useState } from 'react';
import BackgroundRemover from './miniapps/BackgroundRemover';
import MockupGenerator from './miniapps/MockupGenerator';
import ImageEnhancer from './miniapps/ImageEnhancer';
import MarketingCopyGenerator from './miniapps/MarketingCopyGenerator';
import MagicEditor from './miniapps/MagicEditor';
import DesignIdeator from './miniapps/DesignIdeator';
import PaletteExtractor from './miniapps/PaletteExtractor';
import ImageExpander from './miniapps/ImageExpander';
import ProductNamer from './miniapps/ProductNamer';
import LogoIdeator from './miniapps/LogoIdeator';
import VideoAdScripter from './miniapps/VideoAdScripter';
import AIPhotoshootDirector from './miniapps/AIPhotoshootDirector';
import BrandVoiceGuide from './miniapps/BrandVoiceGuide';
import YouTubeThumbnailGenerator from './miniapps/YouTubeThumbnailGenerator';
import AIInteriorDesigner from './miniapps/AIInteriorDesigner';
import AITattooDesigner from './miniapps/AITattooDesigner';
import AIRecipeGenerator from './miniapps/AIRecipeGenerator';
import { useTranslation } from '../../App';
import { translations } from '../../lib/translations';

const miniApps: {
    id: string;
    titleKey: keyof typeof translations.en;
    descriptionKey: keyof typeof translations.en;
    imageUrl: string;
    component: React.ComponentType<{ onBack: () => void; }>;
}[] = [
    { 
        id: 'interior-designer', 
        titleKey: 'interior-designer-title',
        descriptionKey: 'interior-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M7 12V17.5C7 18.3284 7.67157 19 8.5 19H15.5C16.3284 19 17 18.3284 17 17.5V12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M17 10V8C17 6.89543 16.1046 6 15 6H9C7.89543 6 7 6.89543 7 8V10' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 10H17' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M9 19V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M15 19V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round'/%3e%3c/svg%3e`,
        component: AIInteriorDesigner 
    },
    { 
        id: 'tattoo-designer', 
        titleKey: 'tattoo-designer-title',
        descriptionKey: 'tattoo-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M14.0029 3.99902L19.9988 9.99496' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12.9365 5.06445C11.6661 6.33488 11.6661 8.38423 12.9365 9.65466C14.207 10.9251 16.2563 10.9251 17.5267 9.65466L18.5924 8.58899C19.8628 7.31855 19.8628 5.2692 18.5924 3.99877C17.3219 2.72833 15.2726 2.72833 13.999 3.99877L12.9365 5.06445Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M3 21L12 12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M11.999 12.001L15.5345 8.46552' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: AITattooDesigner
    },
    { 
        id: 'recipe-generator', 
        titleKey: 'recipe-generator-title',
        descriptionKey: 'recipe-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 5C10.8954 5 10 5.89543 10 7C10 8.10457 10.8954 9 12 9C13.1046 9 14 8.10457 14 7C14 5.89543 13.1046 5 12 5Z' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M7 6C5.89543 6 5 6.89543 5 8C5 9.10457 5.89543 10 7 10V11H17V10C18.1046 10 19 9.10457 19 8C19 6.89543 18.1046 6 17 6' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M5 11H19V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V11Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3c/svg%3e`,
        component: AIRecipeGenerator
    },
    { 
        id: 'youtube-thumbnail-generator', 
        titleKey: 'youtube-thumbnail-generator-title',
        descriptionKey: 'youtube-thumbnail-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='2' y='6' width='20' height='12' rx='3' fill='hsl(54, 96%, 53%)'/%3e%3cpath d='M10 9L15 12L10 15V9Z' fill='hsl(0, 0%, 13%)'/%3e%3c/svg%3e`,
        component: YouTubeThumbnailGenerator 
    },
    { 
        id: 'photoshoot-director', 
        titleKey: 'photoshoot-director-title',
        descriptionKey: 'photoshoot-director-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M9 3H4C3.44772 3 3 3.44772 3 4V9' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M15 3H20C20.5523 3 21 3.44772 21 4V9' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M9 21H4C3.44772 21 3 20.5523 3 20V15' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M15 21H20C20.5523 21 21 20.5523 21 20V15' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='12' cy='12' r='4' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M15 12H17' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/><path d='M11 7L12 5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/><%2fsvg>`,
        component: AIPhotoshootDirector
    },
     { 
        id: 'brand-voice-guide', 
        titleKey: 'brand-voice-guide-title',
        descriptionKey: 'brand-voice-guide-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H9.41421C9.149 16 8.89462 16.1054 8.70711 16.2929L5.41421 19.5858C4.82843 20.1716 4 19.7262 4 18.8284V6Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M8 9H16' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M8 12H12' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3c/svg%3e`,
        component: BrandVoiceGuide
    },
    { 
        id: 'background-remover', 
        titleKey: 'background-remover-title', 
        descriptionKey: 'background-remover-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='checker' width='4' height='4' patternUnits='userSpaceOnUse'%3e%3crect width='2' height='2' fill='hsl(var(--border))'/%3e%3crect x='2' y='2' width='2' height='2' fill='hsl(var(--border))'/%3e%3c/pattern%3e%3c/defs%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' fill='url(%23checker)'/%3e%3cpath d='M12 2C17.52 2 22 6.48 22 12s-4.48 10-10 10V2z' fill='hsl(var(--primary)/0.2)'/%3e%3ccircle cx='12' cy='9' r='2.5' fill='hsl(var(--primary))' /%3e%3cpath d='M12 12.5c-3.03 0-5.5 2.47-5.5 5.5v1h11v-1c0-3.03-2.47-5.5-5.5-5.5z' fill='hsl(var(--primary))' /%3e%3c/svg%3e`, 
        component: BackgroundRemover 
    },
    { 
        id: 'mockup-generator', 
        titleKey: 'mockup-generator-title',
        descriptionKey: 'mockup-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M9 2H15L19 6L17 8H7L5 6L9 2Z' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 8H17V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V8Z' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='12' cy='12' r='2.5' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M18 2L22 4V8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M18 2C17 5 15 6 12 6C9 6 7 5 6 2' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MockupGenerator 
    },
    { 
        id: 'image-enhancer', 
        titleKey: 'image-enhancer-title',
        descriptionKey: 'image-enhancer-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 12C3 7.03 7.03 3 12 3' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 21C16.97 21 21 16.97 21 12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 3V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 12C7 9.24 9.24 7 12 7' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 17C14.76 17 17 14.76 17 12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M4 16L6 14L9 17L10 16' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='0.1 1.9'/%3e%3cpath d='M14 10L15 9L18 12L20 10' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M18 4L17.5 5.5L16 6L17.5 6.5L18 8L18.5 6.5L20 6L18.5 5.5L18 4Z' fill='hsl(var(--primary))'/%3e%3c/svg%3e`,
        component: ImageEnhancer 
    },
    { 
        id: 'magic-editor', 
        titleKey: 'magic-editor-title',
        descriptionKey: 'magic-editor-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 21H21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M5 21V15L9 12L13 17L19 13V21' fill='hsl(var(--foreground))' fill-opacity='0.1'/%3e%3cpath d='M5 21V15L9 12L13 17L19 13V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M15 3L17 5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 10L14 4' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M6 12L12 6' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M19 7L21 9L15 15L13 13L19 7Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MagicEditor 
    },
    { 
        id: 'image-expander', 
        titleKey: 'image-expander-title',
        descriptionKey: 'image-expander-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='7' y='7' width='10' height='10' rx='1' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M17 12H21M21 12L19 10M21 12L19 14' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 12H3M3 12L5 10M3 12L5 14' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 7V3M12 3L10 5M12 3L14 5' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 17V21M12 21L10 19M12 21L14 19' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 7L3 3' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M17 7L21 3' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M7 17L3 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M17 17L21 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3c/svg%3e`,
        component: ImageExpander 
    },
    { 
        id: 'palette-extractor', 
        titleKey: 'palette-extractor-title',
        descriptionKey: 'palette-extractor-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='2' y='3' width='14' height='14' rx='2' fill='hsl(var(--primary)/0.1)' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3cpath d='M2 10H16' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-dasharray='2 2' stroke-opacity='0.5'/%3e%3cpath d='M9 3V17' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-dasharray='2 2' stroke-opacity='0.5'/%3e%3cpath d='M13 6L21 14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M18 9L21 12' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3ccircle cx='5' cy='20' r='2' fill='hsl(var(--primary))'/%3e%3ccircle cx='11' cy='20' r='2' fill='hsl(var(--foreground))' fill-opacity='0.7'/%3e%3ccircle cx='17' cy='20' r='2' fill='hsl(var(--primary))' fill-opacity='0.5'/%3e%3c/svg%3e`,
        component: PaletteExtractor 
    },
    { 
        id: 'design-ideator', 
        titleKey: 'design-ideator-title',
        descriptionKey: 'design-ideator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 8C12 7.44772 11.5523 7 11 7H9C8.44772 7 8 7.44772 8 8V11C8 12.1046 8.89543 13 10 13H10C11.1046 13 12 12.1046 12 11V8Z' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M12 13V15C12 15.5523 11.5523 16 11 16H9C8.44772 16 8 15.5523 8 15V13' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M10 7V5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M10 16V18' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M12 9H14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M6 9H8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M12 14H14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M6 14H8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M17 17L21 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-dasharray='2 2'/%3e%3cpath d='M20 8L20 4L16 4' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M4 16L4 20L8 20' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='19' cy='5' r='3' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3crect x='3' y='17' width='4' height='4' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3c/svg%3e`,
        component: DesignIdeator 
    },
    { 
        id: 'product-namer', 
        titleKey: 'product-namer-title',
        descriptionKey: 'product-namer-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C11.1717 2 10.5 2.67173 10.5 3.5V4.3122C8.6199 5.08182 7.19522 6.5065 6.4256 8.3866C5.65598 10.2667 5.74312 12.3732 6.66667 14.1667C7.5 15.75 9.5 17 12 17C14.5 17 16.5 15.75 17.3333 14.1667C18.2569 12.3732 18.344 10.2667 17.5744 8.3866C16.8048 6.5065 15.3801 5.08182 13.5 4.3122V3.5C13.5 2.67173 12.8283 2 12 2Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M8 22H16' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M9.5 9.5H14.5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M9.5 12.5H13' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3c/svg%3e`,
        component: ProductNamer
    },
    { 
        id: 'logo-ideator', 
        titleKey: 'logo-ideator-title',
        descriptionKey: 'logo-ideator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='3' y='3' width='18' height='18' rx='2' fill='hsl(var(--card))' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-dasharray='3 3' stroke-opacity='0.7'/%3e%3ccircle cx='12' cy='12' r='4' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M18 6L21 9L15 15L12 12L18 6Z' fill='hsl(var(--primary)/0.1)' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 12L9 15' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: LogoIdeator
    },
    { 
        id: 'video-ad-scripter', 
        titleKey: 'video-ad-scripter-title',
        descriptionKey: 'video-ad-scripter-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4.26788 4.26788L8.53576 8.53576' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M15.4642 8.53576L19.7321 4.26788' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M4 9.49988H20V19.9999C20 20.5522 19.5523 20.9999 19 20.9999H5C4.44772 20.9999 4 20.5522 4 19.9999V9.49988Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M4 9.49988L2 3.99988H22L20 9.49988' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 13.5H16' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M8 16.5H13' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3c/svg%3e`,
        component: VideoAdScripter
    },
    { 
        id: 'marketing-copy', 
        titleKey: 'marketing-copy-title',
        descriptionKey: 'marketing-copy-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='4' y='4' width='10' height='10' rx='2' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3ccircle cx='9' cy='9' r='2' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M16 8L20 4L20 4M20 4L18 6' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M14 10L18.5 5.5' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 18H20' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 20H16' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MarketingCopyGenerator 
    },
];

const MiniAppCard: React.FC<{ title: string, description: string, imageUrl: string, onClick: () => void }> = ({ title, description, imageUrl, onClick }) => (
    <button
        onClick={onClick}
        className="text-left bg-card border border-border/80 rounded-xl hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col"
    >
        <div className="w-full aspect-video bg-muted/50 overflow-hidden p-4 flex items-center justify-center">
            <img src={imageUrl} alt={title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4 border-t border-border/80 flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    </button>
);

export const MiniAppsPage: React.FC = () => {
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const { t } = useTranslation();

    const activeApp = miniApps.find(app => app.id === activeAppId);

    if (activeApp) {
        const AppComponent = activeApp.component;
        return <AppComponent onBack={() => setActiveAppId(null)} />;
    }

    return (
        <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('miniAppsTitle')}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('miniAppsDescription')}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {miniApps.map(app => (
                        <MiniAppCard 
                            key={app.id}
                            title={t(app.titleKey)}
                            description={t(app.descriptionKey)}
                            imageUrl={app.imageUrl}
                            onClick={() => setActiveAppId(app.id)}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};
