import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { ImageComparator } from '../../components/ImageComparator';
import * as geminiService from '../../services/geminiService';

interface MiniAppProps {
    onBack: () => void;
}

const DesignIdeator: React.FC<MiniAppProps> = ({ onBack }) => {
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

    const handleGenerate = async () => {
        if (!imageFile || !prompt) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const resultBase64 = await geminiService.generateDesignAlternative(imageFile, prompt);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate design.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title="Design Ideator"
            description="Generate creative variations of an existing design using a text prompt."
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label="Upload Your Design"
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the variation you want to see... e.g., 'make it in a vintage style with pastel colors'"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                            disabled={!imageFile}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!imageFile || !prompt || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                            <span>{isLoading ? 'Generating...' : 'Generate Idea'}</span>
                        </button>
                         {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </div>
                </div>
                
                {resultImage && imagePreview && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-semibold text-center text-foreground">Result</h3>
                         <div className="aspect-video w-full max-w-2xl mx-auto">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default DesignIdeator;
