import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { ImageComparator } from '../../components/ImageComparator';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const ImageEnhancer: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
        setError(null);
    };

    const handleEnhance = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const finalPrompt = prompt || `a high-quality photograph of the subject`;
                const resultBase64 = await geminiService.enhanceImage(base64Image, finalPrompt);
                setResultImage(`data:image/png;base64,${resultBase64}`);
                setIsLoading(false);
            };
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enhance image.");
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('image-enhancer-title')}
            description={t('image-enhancer-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label={t('uploadToEnhance')}
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('optionalDescribeStyle')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={!imageFile}
                        />
                        <button
                            onClick={handleEnhance}
                            disabled={!imageFile || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="wand" className="w-5 h-5" /> )}
                            <span>{isLoading ? t('enhancing') : t('enhanceButton')}</span>
                        </button>
                         {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </div>
                </div>
                
                {resultImage && imagePreview && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('result')}</h3>
                         <div className="aspect-square w-full max-w-lg mx-auto">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default ImageEnhancer;
