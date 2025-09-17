import React from 'react';
import { EditorMode } from '../types';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

interface EditorToolbarProps {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;
}

const TOOLS: { id: EditorMode; name: string; icon: string }[] = [
    { id: 'view', name: 'View', icon: 'image' },
    { id: 'magic-edit', name: 'Magic Edit', icon: 'wand' },
    { id: 'remove-object', name: 'Remove Object', icon: 'eraser' },
    { id: 'expand', name: 'Expand Image', icon: 'expand' },
    { id: 'text', name: 'Add Text', icon: 'text' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ mode, setMode }) => {
    return (
        <div className="absolute bottom-[8.5rem] md:bottom-24 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-md p-2 rounded-full flex gap-1 z-20 border shadow-lg">
            {TOOLS.map((tool) => (
                <Tooltip key={tool.id} text={tool.name}>
                    <button
                        onClick={() => setMode(tool.id)}
                        className={`p-2.5 rounded-full transition-colors ${
                            mode === tool.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-accent'
                        }`}
                        aria-label={tool.name}
                    >
                        <Icon name={tool.icon} className="w-5 h-5" />
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};