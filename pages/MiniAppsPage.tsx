import React, { useState } from 'react';
import BackgroundRemover from './miniapps/BackgroundRemover';
import MockupGenerator from './miniapps/MockupGenerator';
import ImageEnhancer from './miniapps/ImageEnhancer';
import MarketingCopyGenerator from './miniapps/MarketingCopyGenerator';
import MagicEditor from './miniapps/MagicEditor';
import DesignIdeator from './miniapps/DesignIdeator';
import PaletteExtractor from './miniapps/PaletteExtractor';
import ImageExpander from './miniapps/ImageExpander';

const miniApps = [
    { 
        id: 'background-remover', 
        title: 'Background Remover', 
        description: 'Instantly remove the background from any image.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='checker' width='4' height='4' patternUnits='userSpaceOnUse'%3e%3crect width='2' height='2' fill='hsl(var(--border))'/%3e%3crect x='2' y='2' width='2' height='2' fill='hsl(var(--border))'/%3e%3c/pattern%3e%3c/defs%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' fill='url(%23checker)'/%3e%3cpath d='M12 2C17.52 2 22 6.48 22 12s-4.48 10-10 10V2z' fill='hsl(var(--primary)/0.2)'/%3e%3ccircle cx='12' cy='9' r='2.5' fill='hsl(var(--primary))' /%3e%3cpath d='M12 12.5c-3.03 0-5.5 2.47-5.5 5.5v1h11v-1c0-3.03-2.47-5.5-5.5-5.5z' fill='hsl(var(--primary))' /%3e%3c/svg%3e`, 
        component: BackgroundRemover 
    },
    { 
        id: 'mockup-generator', 
        title: 'Mockup Generator', 
        description: 'Place your product on t-shirts, mugs, and more.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M9 2H15L19 6L17 8H7L5 6L9 2Z' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 8H17V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V8Z' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='12' cy='12' r='2.5' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M18 2L22 4V8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M18 2C17 5 15 6 12 6C9 6 7 5 6 2' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MockupGenerator 
    },
    { 
        id: 'image-enhancer', 
        title: 'AI Image Enhancer', 
        description: 'Upscale and enhance your images with one click.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 12C3 7.03 7.03 3 12 3' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 21C16.97 21 21 16.97 21 12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 3V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 12C7 9.24 9.24 7 12 7' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 17C14.76 17 17 14.76 17 12' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M4 16L6 14L9 17L10 16' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='0.1 1.9'/%3e%3cpath d='M14 10L15 9L18 12L20 10' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M18 4L17.5 5.5L16 6L17.5 6.5L18 8L18.5 6.5L20 6L18.5 5.5L18 4Z' fill='hsl(var(--primary))'/%3e%3c/svg%3e`,
        component: ImageEnhancer 
    },
    { 
        id: 'marketing-copy', 
        title: 'Marketing Copy Generator', 
        description: 'Generate compelling copy from a product image.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='4' y='4' width='10' height='10' rx='2' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3ccircle cx='9' cy='9' r='2' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M16 8L20 4L20 4M20 4L18 6' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M14 10L18.5 5.5' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 18H20' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 20H16' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MarketingCopyGenerator 
    },
    { 
        id: 'magic-editor', 
        title: 'Magic Editor', 
        description: 'Edit images by describing changes in plain text.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 21H21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M5 21V15L9 12L13 17L19 13V21' fill='hsl(var(--foreground))' fill-opacity='0.1'/%3e%3cpath d='M5 21V15L9 12L13 17L19 13V21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M15 3L17 5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 10L14 4' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M6 12L12 6' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M19 7L21 9L15 15L13 13L19 7Z' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`,
        component: MagicEditor 
    },
    { 
        id: 'design-ideator', 
        title: 'Design Ideator', 
        description: 'Get creative variations of an existing design.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 8C12 7.44772 11.5523 7 11 7H9C8.44772 7 8 7.44772 8 8V11C8 12.1046 8.89543 13 10 13H10C11.1046 13 12 12.1046 12 11V8Z' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M12 13V15C12 15.5523 11.5523 16 11 16H9C8.44772 16 8 15.5523 8 15V13' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M10 7V5' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M10 16V18' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M12 9H14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M6 9H8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M12 14H14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M6 14H8' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M17 17L21 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-dasharray='2 2'/%3e%3cpath d='M20 8L20 4L16 4' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M4 16L4 20L8 20' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='19' cy='5' r='3' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3crect x='3' y='17' width='4' height='4' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3c/svg%3e`,
        component: DesignIdeator 
    },
    { 
        id: 'palette-extractor', 
        title: 'Color Palette Extractor', 
        description: 'Extract the color palette from any image.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='2' y='3' width='14' height='14' rx='2' fill='hsl(var(--primary)/0.1)' stroke='hsl(var(--foreground))' stroke-width='1.5'/%3e%3cpath d='M2 10H16' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-dasharray='2 2' stroke-opacity='0.5'/%3e%3cpath d='M9 3V17' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-dasharray='2 2' stroke-opacity='0.5'/%3e%3cpath d='M13 6L21 14' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M18 9L21 12' stroke='hsl(var(--primary))' stroke-width='1.5' stroke-linecap='round'/%3e%3ccircle cx='5' cy='20' r='2' fill='hsl(var(--primary))'/%3e%3ccircle cx='11' cy='20' r='2' fill='hsl(var(--foreground))' fill-opacity='0.7'/%3e%3ccircle cx='17' cy='20' r='2' fill='hsl(var(--primary))' fill-opacity='0.5'/%3e%3c/svg%3e`,
        component: PaletteExtractor 
    },
    { 
        id: 'image-expander', 
        title: 'Image Expander', 
        description: 'Seamlessly expand your images in any direction.', 
        imageUrl: `data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='7' y='7' width='10' height='10' rx='1' fill='hsl(var(--primary)/0.2)' stroke='hsl(var(--primary))' stroke-width='1.5'/%3e%3cpath d='M17 12H21M21 12L19 10M21 12L19 14' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 12H3M3 12L5 10M3 12L5 14' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 7V3M12 3L10 5M12 3L14 5' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 17V21M12 21L10 19M12 21L14 19' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 7L3 3' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M17 7L21 3' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M7 17L3 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3cpath d='M17 17L21 21' stroke='hsl(var(--foreground))' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' stroke-dasharray='2 2'/%3e%3c/svg%3e`,
        component: ImageExpander 
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

    const activeApp = miniApps.find(app => app.id === activeAppId);

    if (activeApp) {
        const AppComponent = activeApp.component;
        return <AppComponent onBack={() => setActiveAppId(null)} />;
    }

    return (
        <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Mini Apps</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        A collection of powerful, single-purpose AI tools to streamline your creative workflow.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {miniApps.map(app => (
                        <MiniAppCard 
                            key={app.id}
                            title={app.title}
                            description={app.description}
                            imageUrl={app.imageUrl}
                            onClick={() => setActiveAppId(app.id)}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};
