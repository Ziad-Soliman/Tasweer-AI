import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { Tooltip } from '../../components/Tooltip';
import * as geminiService from '../../services/geminiService';

interface MiniAppProps {
    onBack: () => void;
}

const PaletteExtractor: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setPalette(null);
        setError(null);
    };

    const handleExtract = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setPalette(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const result = await geminiService.extractPalette(base64Image);
                setPalette(result);
                setIsLoading(false);
            };
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to extract palette.");
            setIsLoading(false);
        }
    };
    
    const handleCopy = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <MiniAppLayout
            title="Color Palette Extractor"
            description="Upload an image to automatically extract its dominant colors."
            onBack={onBack}
        >
             <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Uploaded" className="w-full rounded-lg shadow-md" />
                    ) : (
                        <FileUpload onFileUpload={handleFileUpload} label="Upload an Image"/>
                    )}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleExtract}
                            disabled={!imageFile || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="palette" className="w-5 h-5" /> )}
                            <span>{isLoading ? 'Extracting...' : 'Extract Palette'}</span>
                        </button>
                         {error && <p className="text-sm text-destructive text-center">{error}</p>}
                         
                         {palette && (
                             <div className="animate-fade-in space-y-3 pt-4">
                                <h3 className="text-md font-semibold text-foreground">Extracted Colors:</h3>
                                <div className="flex flex-wrap gap-3">
                                    {palette.map(color => (
                                         <div key={color} className="flex flex-col items-center gap-2">
                                            <Tooltip text={copiedColor === color ? 'Copied!' : 'Copy'}>
                                                <button
                                                    onClick={() => handleCopy(color)}
                                                    className="w-16 h-16 rounded-lg transition-transform hover:scale-110 border-2 border-border"
                                                    style={{ backgroundColor: color }}
                                                />
                                            </Tooltip>
                                            <code className="text-xs text-muted-foreground">{color}</code>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </MiniAppLayout>
    );
};

export default PaletteExtractor;
