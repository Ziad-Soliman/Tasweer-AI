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
                <button onClick={onExtract} className="h-10 w-10 flex items-center justify-center bg-secondary hover:bg-accent text-muted-foreground rounded-full transition-colors">
                    <Icon name="palette" className="w-5 h-5" />
                </button>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-2 p-1.5 bg-secondary rounded-full">
            {palette.map((color) => (
                <Tooltip key={color} text={copiedColor === color ? 'Copied!' : color}>
                    <button
                        onClick={() => handleCopy(color)}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110 border-2 border-background"
                        style={{ backgroundColor: color }}
                        aria-label={`Copy color ${color}`}
                    />
                </Tooltip>
            ))}
        </div>
    );
};
