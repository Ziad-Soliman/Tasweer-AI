import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { Tooltip } from '../../components/Tooltip';
import * as geminiService from '../../services/geminiService';
import { MarketingCopy } from '../../types';

interface MiniAppProps {
    onBack: () => void;
}

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid gap-2">
             <label className="text-sm font-medium leading-none text-muted-foreground">{label}</label>
            <div className="flex items-center space-x-2">
                <p dir="auto" className="flex-1 text-sm bg-secondary text-secondary-foreground p-3 rounded-md whitespace-pre-wrap font-mono">{value}</p>
                <Tooltip text={copied ? "Copied!" : "Copy"}>
                    <button onClick={handleCopy} className="p-2 rounded-md bg-secondary hover:bg-accent text-muted-foreground">
                        <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

const MarketingCopyGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultCopy, setResultCopy] = useState<MarketingCopy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultCopy(null);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultCopy(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const finalPrompt = prompt || `a product photo`;
                const copy = await geminiService.generateMarketingCopy(base64Image, finalPrompt);
                setResultCopy(copy);
                setIsLoading(false);
            };
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate copy.");
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title="Marketing Copy Generator"
            description="Generate compelling product copy and social media posts from an image."
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                 <div className="grid md:grid-cols-2 gap-8 items-start">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Uploaded product" className="w-full rounded-lg" />
                    ) : (
                        <FileUpload onFileUpload={handleFileUpload} label="Upload Product Photo"/>
                    )}
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Optional: Describe product or its prompt..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={!imageFile}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!imageFile || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                             {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="pencil" className="w-5 h-5" /> )}
                            <span>{isLoading ? 'Generating...' : 'Generate Copy'}</span>
                        </button>
                         {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </div>
                </div>
                
                {resultCopy && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <CopyField label="Product Name" value={resultCopy.productName} />
                        <CopyField label="Tagline" value={resultCopy.tagline} />
                        <CopyField label="Description" value={resultCopy.description} />
                        <CopyField label="Social Media Post" value={resultCopy.socialMediaPost} />
                        <CopyField label="Social Media Post (Arabic)" value={resultCopy.socialMediaPostArabic} />
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default MarketingCopyGenerator;
