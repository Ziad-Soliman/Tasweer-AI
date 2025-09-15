import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from './Icon';

interface ImageComparatorProps {
    baseImage: string;
    newImage: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ baseImage, newImage }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPos(percent);
    }, [isDragging]);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMove]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full select-none overflow-hidden rounded-lg cursor-ew-resize"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <img src={baseImage} alt="Original" className="absolute w-full h-full object-contain" />
            
            <div 
                className="absolute w-full h-full object-contain overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img src={newImage} alt="Generated" className="absolute w-full h-full object-contain" />
            </div>

            <div 
                className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-700">
                    <Icon name="compare" className="w-6 h-6 rotate-90" />
                </div>
            </div>
        </div>
    );
};
