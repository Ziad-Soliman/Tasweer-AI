import React, { useState, useMemo } from 'react';
import { Preset, GenerationMode, PresetCategory } from '../types';
import { Icon } from './Icon';
import { useTranslation } from '../App';

interface StylePresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    presets: Preset[];
    onSelect: (preset: Preset) => void;
    activeMode: GenerationMode;
}

const CATEGORIES: PresetCategory[] = ['Photorealistic', 'Artistic', 'Futuristic', 'Vintage', 'Abstract'];

const PresetCard: React.FC<{ preset: Preset; onSelect: () => void }> = ({ preset, onSelect }) => (
    <button
        onClick={onSelect}
        className="text-left w-full rounded-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group overflow-hidden"
    >
        <div className={`relative w-full aspect-video bg-gradient-to-br ${preset.preview.value} flex items-center justify-center`}>
            <Icon name={preset.preview.icon} className="w-10 h-10 text-white/70" />
        </div>
        <div className="p-3 bg-muted/50 group-hover:bg-accent">
            <p className="font-semibold text-sm text-foreground">{preset.name}</p>
        </div>
    </button>
);

export const StylePresetModal: React.FC<StylePresetModalProps> = ({ isOpen, onClose, presets, onSelect, activeMode }) => {
    const [activeCategory, setActiveCategory] = useState<PresetCategory | 'All'>('All');
    const { t } = useTranslation();

    const filteredPresets = useMemo(() => {
        return presets
            .filter(p => p.applicableModes.includes(activeMode))
            .filter(p => activeCategory === 'All' || p.category === activeCategory);
    }, [presets, activeMode, activeCategory]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-card border shadow-lg rounded-xl p-0 w-full max-w-4xl h-[80vh] m-4 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <div className="flex flex-col">
                         <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                            <Icon name="sparkles" /> {t('stylePresetBrowser')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('stylePresetDescription')}
                        </p>
                    </div>
                     <button onClick={onClose} className="p-2 rounded-md bg-secondary hover:bg-accent text-muted-foreground">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex min-h-0">
                    {/* Sidebar */}
                    <nav className="w-48 border-e p-4 flex-shrink-0">
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveCategory('All')}
                                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeCategory === 'All' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                >
                                    {t('allStyles')}
                                </button>
                            </li>
                            {CATEGORIES.map(category => (
                                <li key={category}>
                                    <button
                                        onClick={() => setActiveCategory(category)}
                                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        {t(category)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredPresets.map(preset => (
                                <PresetCard
                                    key={preset.id}
                                    preset={preset}
                                    onSelect={() => onSelect(preset)}
                                />
                            ))}
                        </div>
                         {filteredPresets.length === 0 && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>{t('noPresetsAvailable')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
