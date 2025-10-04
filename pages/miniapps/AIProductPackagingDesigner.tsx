import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';
import { FileUpload } from '../../components/FileUpload';

interface MiniAppProps {
    onBack: () => void;
}

const AIProductPackagingDesigner: React.FC<MiniAppProps> = ({ onBack }) => {
    const [productInfo, setProductInfo] = useState('');
    const [style, setStyle] = useState('Minimalist & Clean');
    const [packagingType, setPackagingType] = useState('Box');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { t } = useTranslation();

    const packagingStyles = ['Minimalist & Clean', 'Bold & Vibrant', 'Elegant & Luxurious', 'Eco-friendly & Natural', 'Vintage & Retro', 'Playful & Whimsical'];
    const packagingTypes = ['Box', 'Bottle', 'Pouch', 'Can', 'Tube', 'Jar'];


    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleGenerate = async () => {
        if (!productInfo) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            let imageBase64: string | null = null;
            if (imageFile) {
                imageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
            }
            const images = await geminiService.generatePackagingDesigns(productInfo, style, packagingType, imageBase64);
            setResults(images.map(base64 => `data:image/png;base64,${base64}`));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate designs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('product-packaging-designer-title')}
            description={t('product-packaging-designer-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('productInfo')}</label>
                        <textarea
                            value={productInfo}
                            onChange={(e) => setProductInfo(e.target.value)}
                            placeholder={t('productInfoPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-32 resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('productImageOptional')}</label>
                        <FileUpload
                            onFileUpload={handleFileUpload}
                            label={t('uploadProductImage')}
                            uploadedFileName={imageFile?.name}
                            onClear={() => { setImageFile(null); setImagePreview(null); }}
                        />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md max-h-20 object-contain self-start" />}
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('packagingStyle')}</label>
                         <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {packagingStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('packagingType')}</label>
                         <select
                            value={packagingType}
                            onChange={(e) => setPackagingType(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {packagingTypes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!productInfo || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="cube" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('generatingDesigns') : t('generateDesigns')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {isLoading && (
                    <div className="text-center text-muted-foreground">
                        <Icon name="spinner" className="w-8 h-8 animate-spin mx-auto" />
                        <p className="mt-2">{t('generatingDesigns')}...</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('generatedDesigns')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {results.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Packaging concept ${index + 1}`}
                                    className="w-full aspect-square object-cover bg-muted rounded-lg border"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIProductPackagingDesigner;