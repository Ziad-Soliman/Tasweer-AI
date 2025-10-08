import React, { useState, useEffect, useMemo } from 'react';
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
import { useTranslation } from '../App';
import { translations } from '../lib/translations';
import AIVideoGenerator from './miniapps/AIVideoGenerator';
import AIPresentationGenerator from './miniapps/AIPresentationGenerator';
import AIComicCreator from './miniapps/AIComicCreator';
import AIFashionDesigner from './miniapps/AIFashionDesigner';
import AIQRCodeGenerator from './miniapps/AIQRCodeGenerator';
import AIPodcastSummarizer from './miniapps/AIPodcastSummarizer';
import AIColoringBookGenerator from './miniapps/AIColoringBookGenerator';
import AIAdCopyGenerator from './miniapps/AIAdCopyGenerator';
import AIPatternGenerator from './miniapps/AIPatternGenerator';
import AICharacterConceptGenerator from './miniapps/AICharacterConceptGenerator';
import AIProductPackagingDesigner from './miniapps/AIProductPackagingDesigner';
import AIStoryboardGenerator from './miniapps/AIStoryboardGenerator';
import NeuroSalesCopywriter from './miniapps/NeuroSalesCopywriter';
import SketchToImage from './miniapps/SketchToImage';
import LipsyncStudio from './miniapps/LipsyncStudio';
import { HistoryItem } from '../types';
import { Icon } from '../components/Icon';

const miniApps: {
    id: string;
    titleKey: keyof typeof translations.en;
    descriptionKey: keyof typeof translations.en;
    imageUrl: string;
    component: React.ComponentType<any>; // Allow additional props
}[] = [
    { 
        id: 'sketch-to-image', 
        titleKey: 'sketch-to-image-title',
        descriptionKey: 'sketch-to-image-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='3'/%3e%3c/filter%3e%3clinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3e%3cstop offset='0%25' stop-color='%23ACFD00'/%3e%3cstop offset='100%25' stop-color='%2380FF00'/%3e%3c/linearGradient%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M60 100L80 80L95 95L110 80L125 95L140 80L160 100' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M100 44L180 44' stroke='%23a1a3b3' stroke-width='6' stroke-linecap='round'/%3e%3cpath d='M160 44L180 34 M160 44L180 54' stroke='%23a1a3b3' stroke-width='6' stroke-linecap='round'/%3e%3cpath d='M70 90C85 70 140 70 170 100' stroke='url(%23g)' stroke-width='6' stroke-linecap='round' stroke-dasharray='10 10'/%3e%3c/g%3e%3c/svg%3e`,
        component: SketchToImage
    },
    { 
        id: 'neurosales-copywriter', 
        titleKey: 'neurosales-copywriter-title',
        descriptionKey: 'neurosales-copywriter-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)' fill-rule='evenodd' clip-rule='evenodd'%3e%3cpath d='M128 32C106.909 32 90 48.9086 90 70V80C90 91.0457 98.9543 100 110 100H115V112H141V100H146C157.046 100 166 91.0457 166 80V70C166 48.9086 149.091 32 128 32Z' stroke='%2380FF00' stroke-width='4'/%3e%3cpath d='M121 70H135' stroke='%2380FF00' stroke-width='3' stroke-linecap='round'/%3e%3cpath d='M118 78H138' stroke='%23a1a3b3' stroke-width='3' stroke-linecap='round'/%3e%3cpath d='M115 86H141' stroke='%23a1a3b3' stroke-width='3' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: NeuroSalesCopywriter
    },
    { 
        id: 'lipsync-studio', 
        titleKey: 'lipsync-studio-title',
        descriptionKey: 'lipsync-studio-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='128' cy='62' r='20' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M116 92C122 102 134 102 140 92' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M90 72H105' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M151 72H166' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: LipsyncStudio
    },
    { 
        id: 'video-generator', 
        titleKey: 'video-generator-title',
        descriptionKey: 'video-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='70' y='42' width='116' height='60' rx='8' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M118 62L138 72L118 82V62Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIVideoGenerator
    },
    { 
        id: 'presentation-generator', 
        titleKey: 'presentation-generator-title',
        descriptionKey: 'presentation-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='68' y='32' width='120' height='80' rx='8' stroke='%23a1a3b3' stroke-width='4'/%3e%3crect x='88' y='80' width='15' height='12' fill='%2380FF00'/%3e%3crect x='108' y='65' width='15' height='27' fill='%2380FF00'/%3e%3crect x='128' y='50' width='15' height='42' fill='%2380FF00'/%3e%3crect x='148' y='72' width='15' height='20' fill='%23a1a3b3'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIPresentationGenerator
    },
    { 
        id: 'comic-creator', 
        titleKey: 'comic-creator-title',
        descriptionKey: 'comic-creator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='68' y='32' width='120' height='80' rx='8' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M68 72H188' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 32V112' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M148 52C148 48.6863 153.373 46 159 46C164.627 46 170 48.6863 170 52C170 55.3137 164.627 58 159 58H152L148 52Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIComicCreator
    },
    { 
        id: 'fashion-designer', 
        titleKey: 'fashion-designer-title',
        descriptionKey: 'fashion-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M160.76 45.92L144 40a8 8 0 00-16 0l-16.76 5.92a4 4 0 00-2.68 4.46l1.16 6.94a2 2 0 001.98 1.68H120v40c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V59h8.34a2 2 0 001.98-1.68l1.16-6.94a4 4 0 00-2.68-4.46z' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='128' cy='78' r='10' fill='%2380FF00' stroke='%2318181b' stroke-width='2'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIFashionDesigner
    },
    { 
        id: 'qr-code-generator', 
        titleKey: 'qr-code-generator-title',
        descriptionKey: 'qr-code-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='88' y='32' width='80' height='80' rx='8' fill='%23a1a3b3'/%3e%3crect x='98' y='42' width='20' height='20' rx='3' fill='%2318181b'/%3e%3crect x='138' y='42' width='20' height='20' rx='3' fill='%2318181b'/%3e%3crect x='98' y='82' width='20' height='20' rx='3' fill='%2318181b'/%3e%3cpath d='M138 82H148V92H158V102H138V82Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIQRCodeGenerator
    },
    { 
        id: 'podcast-summarizer', 
        titleKey: 'podcast-summarizer-title',
        descriptionKey: 'podcast-summarizer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='100' y='32' width='56' height='60' rx='28' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 92V112' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M110 112H146' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M80 62L100 72' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M80 72L100 82' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIPodcastSummarizer
    },
    { 
        id: 'coloring-book-generator', 
        titleKey: 'coloring-book-generator-title',
        descriptionKey: 'coloring-book-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M128 42C144.569 42 158 55.4315 158 72C158 88.5685 144.569 102 128 102C111.431 102 98 88.5685 98 72C98 55.4315 111.431 42 128 42Z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 42V102' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M98 72H158' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M109.289 53.2891L146.711 90.7109' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M109.289 90.7109L146.711 53.2891' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 42C144.569 42 158 55.4315 158 72H128V42Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIColoringBookGenerator
    },
    { 
        id: 'ad-copy-generator', 
        titleKey: 'ad-copy-generator-title',
        descriptionKey: 'ad-copy-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M90 52H110L130 92H110L90 52Z' stroke='%23a1a3b3' stroke-width='4' stroke-linejoin='round'/%3e%3cpath d='M118 72H166' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M130 62L166 62' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M130 82H166' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIAdCopyGenerator
    },
    { 
        id: 'pattern-generator', 
        titleKey: 'pattern-generator-title',
        descriptionKey: 'pattern-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='108' cy='52' r='10' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='148' cy='52' r='10' stroke='%23a1a3b3' stroke-width='4'/%3e%3crect x='98' y='82' width='20' height='20' rx='3' stroke='%23a1a3b3' stroke-width='4'/%3e%3crect x='138' y='82' width='20' height='20' rx='3' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='128' cy='72' r='10' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIPatternGenerator
    },
    { 
        id: 'character-concept-generator', 
        titleKey: 'character-concept-generator-title',
        descriptionKey: 'character-concept-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='128' cy='52' r='12' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M108 112V92C108 80.9543 116.954 72 128 72C139.046 72 148 80.9543 148 92V112' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M128 72V112' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M108 82H148' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100 112L120 92' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AICharacterConceptGenerator
    },
    { 
        id: 'product-packaging-designer', 
        titleKey: 'product-packaging-designer-title',
        descriptionKey: 'product-packaging-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M98 44L128 28L158 44V100L128 116L98 100V44Z' stroke='%23a1a3b3' stroke-width='4' stroke-linejoin='round'/%3e%3cpath d='M128 28V116' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M98 44L158 44' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='128' cy='72' r='12' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIProductPackagingDesigner
    },
    { 
        id: 'storyboard-generator', 
        titleKey: 'storyboard-generator-title',
        descriptionKey: 'storyboard-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='48' y='52' width='50' height='40' rx='4' stroke='%23a1a3b3' stroke-width='4'/%3e%3crect x='103' y='52' width='50' height='40' rx='4' stroke='%2380FF00' stroke-width='4'/%3e%3crect x='158' y='52' width='50' height='40' rx='4' stroke='%23a1a3b3' stroke-width='4'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIStoryboardGenerator
    },
    { 
        id: 'interior-designer', 
        titleKey: 'interior-designer-title',
        descriptionKey: 'interior-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M100 100V80C100 75.5817 103.582 72 108 72H148C152.418 72 156 75.5817 156 80V100' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100 100H156' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M108 72V52' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M148 72V52' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100 52H156' fill='%2380FF00' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIInteriorDesigner 
    },
    { 
        id: 'tattoo-designer', 
        titleKey: 'tattoo-designer-title',
        descriptionKey: 'tattoo-designer-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M128 32C108 42 108 72 128 72C148 72 148 42 128 32Z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 72C118 87 108 102 128 112C148 102 138 87 128 72Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: AITattooDesigner
    },
    { 
        id: 'recipe-generator', 
        titleKey: 'recipe-generator-title',
        descriptionKey: 'recipe-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M108 52C108 46.4772 112.477 42 118 42H138C143.523 42 148 46.4772 148 52V57H108V52Z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M108 57H148V102H108V57Z' fill='%23a1a3b3'/%3e%3cpath d='M128 102V112' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M120 112H136' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIRecipeGenerator
    },
    { 
        id: 'youtube-thumbnail-generator', 
        titleKey: 'youtube-thumbnail-generator-title',
        descriptionKey: 'youtube-thumbnail-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='68' y='42' width='120' height='60' rx='8' fill='%23a1a3b3'/%3e%3cpath d='M118 62L138 72L118 82V62Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: YouTubeThumbnailGenerator 
    },
    { 
        id: 'photoshoot-director', 
        titleKey: 'photoshoot-director-title',
        descriptionKey: 'photoshoot-director-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='128' cy='72' r='40' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='128' cy='72' r='15' fill='%2380FF00'/%3e%3cpath d='M100 44L90 34' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M156 44L166 34' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100 100L90 110' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M156 100L166 110' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: AIPhotoshootDirector
    },
     { 
        id: 'brand-voice-guide', 
        titleKey: 'brand-voice-guide-title',
        descriptionKey: 'brand-voice-guide-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M88 42H168C172.418 42 176 45.5817 176 50V82C176 86.4183 172.418 90 168 90H100L80 102V50C80 45.5817 83.5817 42 88 42Z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M100 60H156' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100 72H130' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: BrandVoiceGuide
    },
    { 
        id: 'background-remover', 
        titleKey: 'background-remover-title', 
        descriptionKey: 'background-remover-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='128' cy='62' r='16' fill='%2380FF00'/%3e%3cpath d='M100 112C100 96.536 112.536 84 128 84C143.464 84 156 96.536 156 112H100Z' fill='%2380FF00'/%3e%3cpath d='M128 32V112' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round' stroke-dasharray='8 8'/%3e%3c/g%3e%3c/svg%3e`, 
        component: BackgroundRemover 
    },
    { 
        id: 'mockup-generator', 
        titleKey: 'mockup-generator-title',
        descriptionKey: 'mockup-generator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M160.76 45.92L144 40a8 8 0 00-16 0l-16.76 5.92a4 4 0 00-2.68 4.46l1.16 6.94a2 2 0 001.98 1.68H120v40c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V59h8.34a2 2 0 001.98-1.68l1.16-6.94a4 4 0 00-2.68-4.46z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 72L132.899 82H123.101L128 72ZM128 90L118 75.3013H138L128 90Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: MockupGenerator 
    },
    { 
        id: 'image-enhancer', 
        titleKey: 'image-enhancer-title',
        descriptionKey: 'image-enhancer-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M128 42L143 72L128 102L113 72L128 42Z' stroke='%23a1a3b3' stroke-width='4' stroke-linejoin='round'/%3e%3cpath d='M128 52L137.5 72L128 92L118.5 72L128 52Z' fill='%2380FF00'/%3e%3c/g%3e%3c/svg%3e`,
        component: ImageEnhancer 
    },
    { 
        id: 'magic-editor', 
        titleKey: 'magic-editor-title',
        descriptionKey: 'magic-editor-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M158 52L178 72' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3crect x='78' y='42' width='100' height='60' rx='8' stroke='%23a1a3b3' stroke-width='4'/%3e%3ccircle cx='128' cy='72' r='15' fill='none' stroke='%2380FF00' stroke-width='4' stroke-dasharray='8 8'/%3e%3c/g%3e%3c/svg%3e`,
        component: MagicEditor 
    },
    { 
        id: 'image-expander', 
        titleKey: 'image-expander-title',
        descriptionKey: 'image-expander-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='103' y='52' width='50' height='40' rx='4' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M103 72H43M43 72L58 62M43 72L58 82' stroke='%2380FF00' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M153 72H213M213 72L198 62M213 72L198 82' stroke='%2380FF00' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: ImageExpander 
    },
    { 
        id: 'palette-extractor', 
        titleKey: 'palette-extractor-title',
        descriptionKey: 'palette-extractor-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M128 42C144.569 42 158 55.4315 158 72C158 88.5685 144.569 102 128 102C111.431 102 98 88.5685 98 72C98 55.4315 111.431 42 128 42Z' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 42C144.569 42 158 55.4315 158 72V102H128V42Z' fill='%2380FF00'/%3e%3crect x='170' y='67' width='10' height='10' rx='2' fill='%2380FF00'/%3e%3crect x='170' y='82' width='10' height='10' rx='2' fill='%23a1a3b3'/%3e%3crect x='170' y='52' width='10' height='10' rx='2' fill='%23eab308'/%3e%3c/g%3e%3c/svg%3e`,
        component: PaletteExtractor 
    },
    { 
        id: 'design-ideator', 
        titleKey: 'design-ideator-title',
        descriptionKey: 'design-ideator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3ccircle cx='128' cy='72' r='20' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M128 52V32' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M128 92V112' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100.5 61.5L86.3589 51.359' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M155.641 92.6411L169.782 102.782' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M100.5 82.5L86.3589 92.641' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M155.641 51.3589L169.782 41.2179' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: DesignIdeator 
    },
    { 
        id: 'product-namer', 
        titleKey: 'product-namer-title',
        descriptionKey: 'product-namer-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M100 42L156 42L176 72L156 102H100L80 72L100 42Z' stroke='%23a1a3b3' stroke-width='4' stroke-linejoin='round'/%3e%3ccircle cx='128' cy='72' r='6' stroke='%2380FF00' stroke-width='4'/%3e%3c/g%3e%3c/svg%3e`,
        component: ProductNamer
    },
    { 
        id: 'logo-ideator', 
        titleKey: 'logo-ideator-title',
        descriptionKey: 'logo-ideator-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M158 52L178 72' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M178 72L158 92' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M98 72C98 58.7452 109.125 48 123 48C136.875 48 148 58.7452 148 72C148 85.2548 136.875 96 123 96' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: LogoIdeator
    },
    { 
        id: 'video-ad-scripter', 
        titleKey: 'video-ad-scripter-title',
        descriptionKey: 'video-ad-scripter-desc',
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3cpath d='M90 38L106 32L166 42L150 48L90 38Z' fill='%2380FF00'/%3e%3cpath d='M90 38V108C90 110.209 91.7909 112 94 112H162C164.209 112 166 110.209 166 108V42' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: VideoAdScripter
    },
    { 
        id: 'marketing-copy', 
        titleKey: 'marketing-copy-title',
        descriptionKey: 'marketing-copy-desc', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 256 144' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='256' height='144' fill='%2318181b'/%3e%3cdefs%3e%3cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3e%3cfeGaussianBlur stdDeviation='4'/%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23s)'%3e%3crect x='88' y='32' width='80' height='80' rx='8' stroke='%23a1a3b3' stroke-width='4'/%3e%3cpath d='M108 52H148' stroke='%2380FF00' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M108 64H148' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M108 76H128' stroke='%23a1a3b3' stroke-width='4' stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e`,
        component: MarketingCopyGenerator 
    },
];

const MiniAppCard: React.FC<{ title: string, description: string, imageUrl: string, onClick: () => void }> = ({ title, description, imageUrl, onClick }) => (
    <button
        onClick={onClick}
        className="text-left bg-card/50 backdrop-blur-md border border-border/50 rounded-xl hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col"
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


interface AppsPageProps {
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    restoredState: HistoryItem | null;
    clearRestoredState: () => void;
}

export const AppsPage: React.FC<AppsPageProps> = ({ addHistoryItem, restoredState, clearRestoredState }) => {
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (restoredState && restoredState.source.page === 'mini-apps') {
            setActiveAppId(restoredState.source.miniAppId || null);
        }
    }, [restoredState]);
    
    // FIX: Moved sorting logic inside the component to have access to `t`
    const sortedMiniApps = useMemo(() => 
        [...miniApps].sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey))), 
    [t]);

    const filteredApps = useMemo(() => sortedMiniApps.filter(app => {
        const title = t(app.titleKey);
        const description = t(app.descriptionKey);
        return title.toLowerCase().includes(searchTerm.toLowerCase()) || description.toLowerCase().includes(searchTerm.toLowerCase());
    }), [searchTerm, t, sortedMiniApps]);

    const activeApp = miniApps.find(app => app.id === activeAppId);

    if (activeApp) {
        const AppComponent = activeApp.component;
        const initialState = (restoredState && restoredState.source.miniAppId === activeApp.id) ? restoredState.payload : null;

        return <AppComponent 
            onBack={() => { setActiveAppId(null); clearRestoredState(); }}
            addHistoryItem={addHistoryItem}
            initialState={initialState}
            clearRestoredState={clearRestoredState}
        />;
    }

    return (
        <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('miniAppsTitle')}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('miniAppsDescription')}
                    </p>
                </div>

                <div className="mb-8 w-full max-w-lg mx-auto relative">
                     <Icon name="search" className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search for an app..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-12 pe-4 py-3 rounded-full bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredApps.map(app => (
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