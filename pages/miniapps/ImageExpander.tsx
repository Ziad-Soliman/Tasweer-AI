import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { ImageComparator } from '../../components/ImageComparator';
import { Tooltip } from '../../components/Tooltip';
import * as geminiService from '../../services/geminiService';

interface MiniAppProps {
    onBack: () => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const ImageExpander: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
        setError(null);
    };

    const handleExpand = async (direction: Direction) => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const finalPrompt = prompt || `a high-quality photograph of the subject`;
                const resultBase64 = await geminiService.expandImage(base64Image, finalPrompt, direction);
                setResultImage(`data:image/png;base64,${resultBase64}`);
                setIsLoading(false);
            };
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to expand image.");
            setIsLoading(false);
        }
    };
    
    const controlButtonClass = "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent gap-2 disabled:opacity-50";

    return (
        <MiniAppLayout
            title="Image Expander"
            description="Seamlessly expand your images in any direction with generative fill."
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label="Upload Your Photo"
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe original image (e.g., 'dog on a beach')"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={!imageFile}
                        />
                         <div className="grid grid-cols-2 gap-2">
                             <Tooltip text="Expand Left"><button onClick={() => handleExpand('left')} disabled={!imageFile || isLoading} className={controlButtonClass}><Icon name="arrow-left" className="w-5 h-5" /></button></Tooltip>
                             <Tooltip text="Expand Right"><button onClick={() => handleExpand('right')} disabled={!imageFile || isLoading} className={controlButtonClass}><Icon name="arrow-right" className="w-5 h-5" /></button></Tooltip>
                             <Tooltip text="Expand Up"><button onClick={() => handleExpand('up')} disabled={!imageFile || isLoading} className={controlButtonClass}><Icon name="arrow-up" className="w-5 h-5" /></button></Tooltip>
                             <Tooltip text="Expand Down"><button onClick={() => handleExpand('down')} disabled={!imageFile || isLoading} className={controlButtonClass}><Icon name="arrow-down" className="w-5 h-5" /></button></Tooltip>
                        </div>
                        {isLoading && <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Icon name="spinner" className="animate-spin w-4 h-4"/> Expanding...</div>}
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </div>
                </div>

                {resultImage && imagePreview && !isLoading && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-semibold text-center text-foreground">Result</h3>
                         <div className="aspect-video w-full max-w-2xl mx-auto">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                    </div>
                )}
                 {!resultImage && imagePreview && !isLoading && (
                    <div className="animate-fade-in space-y-4">
                        <img src={imagePreview} alt="Preview" className="max-w-md mx-auto rounded-lg shadow-md" />
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default ImageExpander;
