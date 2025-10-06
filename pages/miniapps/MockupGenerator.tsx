import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { MOCKUP_TYPES } from '../../constants';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const MockupGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mockupType, setMockupType] = useState(MOCKUP_TYPES[0]);
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

    const handleGenerate = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(imageFile);
            });

            // FIX: Pass the `promptFragment` property of the mockupType object, not the whole object.
            const resultBase64 = await geminiService.generateMockup(base64Image, prompt, mockupType.promptFragment);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate mockup.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('mockup-generator-title')}
            description={t('mockup-generator-desc')}
            onBack={onBack}
        >
            <div className="grid lg:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col gap-6 bg-card/80 backdrop-blur-md border p-6 rounded-lg">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label={t('uploadProductTransparent')}
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t('mockupType')}</label>
                        <select
                            // FIX: The select value must be a string (the ID), not the entire object.
                            value={mockupType.id}
                            // FIX: The onChange handler must find the corresponding object by ID and set it in the state.
                            onChange={(e) => setMockupType(MOCKUP_TYPES.find(m => m.id === e.target.value)!)}
                            disabled={!imageFile || isLoading}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {/* FIX: Use the `id` for key and value, and `name` for the display text. */}
                            {MOCKUP_TYPES.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t('additionalDetails')}</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('additionalDetailsPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                            disabled={!imageFile || isLoading}
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!imageFile || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2 mt-auto"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="cube" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('generating') : t('generateMockup')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
                <div className="bg-muted rounded-lg flex items-center justify-center p-4 min-h-[400px]">
                    {resultImage ? (
                        <img src={resultImage} alt="Generated Mockup" className="max-h-full max-w-full rounded-md object-contain animate-fade-in" />
                    ) : imagePreview ? (
                        <img src={imagePreview} alt="Uploaded Product" className="max-h-64 max-w-full rounded-md object-contain" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Icon name="image" className="mx-auto w-16 h-16" />
                            <p>{t('mockupResultPlaceholder')}</p>
                        </div>
                    )}
                </div>
            </div>
        </MiniAppLayout>
    );
};

export default MockupGenerator;