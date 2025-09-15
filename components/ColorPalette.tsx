import React, { useState } from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

interface ColorPaletteProps {
    palette: string[] | undefined;
    onExtract: () => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette, onExtract }) => {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const handleCopy = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    if (!palette) {
        return (
            <Tooltip text="Extract Color Palette with AI">
                <button onClick={onExtract} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2.5 rounded-full transition-colors">
                    <Icon name="palette" className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-900 rounded-full">
            {palette.map((color) => (
                <Tooltip key={color} text={copiedColor === color ? 'Copied!' : color}>
                    <button
                        onClick={() => handleCopy(color)}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110 border-2 border-white/50 dark:border-black/50"
                        style={{ backgroundColor: color }}
                        aria-label={`Copy color ${color}`}
                    />
                </Tooltip>
            ))}
        </div>
    );
};
