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
    { id: 'inpaint', name: 'In-paint', icon: 'brush' },
    { id: 'crop', name: 'Crop', icon: 'crop' },
    { id: 'text', name: 'Add Text', icon: 'text' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ mode, setMode }) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/70 backdrop-blur-md p-2 rounded-full flex gap-2 z-20">
            {TOOLS.map((tool) => (
                <Tooltip key={tool.id} text={tool.name}>
                    <button
                        onClick={() => setMode(tool.id)}
                        className={`p-2.5 rounded-full transition-colors ${
                            mode === tool.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
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
