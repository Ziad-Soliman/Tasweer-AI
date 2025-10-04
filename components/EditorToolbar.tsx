import React from 'react';
import { EditorMode } from '../types';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../App';

interface EditorToolbarProps {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;
}

const TOOLS: { id: EditorMode; nameKey: keyof typeof import('../lib/translations').translations.en; icon: string }[] = [
    { id: 'view', nameKey: 'editorToolView', icon: 'image' },
    { id: 'magic-edit', nameKey: 'editorToolMagicEdit', icon: 'wand' },
    { id: 'remove-object', nameKey: 'editorToolRemoveObject', icon: 'eraser' },
    { id: 'expand', nameKey: 'editorToolExpandImage', icon: 'expand' },
    { id: 'text', nameKey: 'editorToolAddText', icon: 'text' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ mode, setMode }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-background/70 backdrop-blur-md p-2 rounded-full flex gap-1 border shadow-lg">
            {TOOLS.map((tool) => (
                <Tooltip key={tool.id} text={t(tool.nameKey)}>
                    <button
                        onClick={() => setMode(tool.id)}
                        className={`p-2.5 rounded-full transition-colors ${
                            mode === tool.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-accent'
                        }`}
                        aria-label={t(tool.nameKey)}
                    >
                        <Icon name={tool.icon} className="w-5 h-5" />
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};