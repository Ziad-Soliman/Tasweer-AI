
import React from 'react';
import { SceneTemplate } from '../types';
import { Icon } from './Icon';

interface SceneSuggestionsProps {
    templates: SceneTemplate[];
    onSelect: (template: SceneTemplate) => void;
    isLoading: boolean;
}

const SuggestionCard: React.FC<{ template: SceneTemplate; onClick: () => void }> = ({ template, onClick }) => (
    <button
        onClick={onClick}
        className="flex-shrink-0 w-48 bg-muted/50 p-3 rounded-lg flex flex-col gap-2 text-left transition-colors hover:bg-accent"
    >
        <div className="flex items-center gap-2">
            <Icon name="sparkles" className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3">{template.prompt}</p>
    </button>
);

const LoadingSkeleton: React.FC = () => (
    <div className="flex-shrink-0 w-48 bg-muted/50 p-3 rounded-lg flex flex-col gap-2 animate-pulse">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
        <div className="space-y-1.5">
            <div className="h-2 w-full bg-muted rounded"></div>
            <div className="h-2 w-full bg-muted rounded"></div>
            <div className="h-2 w-10/12 bg-muted rounded"></div>
        </div>
    </div>
);

export const SceneSuggestions: React.FC<SceneSuggestionsProps> = ({ templates, onSelect, isLoading }) => {
    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                    {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    if (templates.length === 0) {
        return null;
    }

    return (
        <div className="animate-fade-in">
             <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                {templates.map((template, index) => (
                    <SuggestionCard key={index} template={template} onClick={() => onSelect(template)} />
                ))}
            </div>
        </div>
    );
};