import React, { useState, useEffect } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { ImageComparator } from '../../components/ImageComparator';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';
import { HistoryItem } from '../../types';

interface MiniAppProps {
    onBack: () => void;
    addHistoryItem: (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
    initialState: any | null;
    clearRestoredState: () => void;
}

const BackgroundRemover: React.FC<MiniAppProps> = ({ onBack, addHistoryItem, initialState, clearRestoredState }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (initialState) {
            setImagePreview(initialState.imagePreview);
            setResultImage(initialState.resultImage);
            clearRestoredState();
        }
    }, [initialState, clearRestoredState]);

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
        setError(null);
    };

    const handleRemoveBackground = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const resultBase64 = await geminiService.removeBackground(imageFile);
            const finalResultImage = `data:image/png;base64,${resultBase64}`;
            setResultImage(finalResultImage);

            addHistoryItem({
                source: { page: 'mini-apps', miniAppId: 'background-remover', appName: t('background-remover-title') },
                thumbnail: { type: 'image', value: finalResultImage },
                title: `Background removed from ${imageFile.name}`,
                payload: {
                    imagePreview: URL.createObjectURL(imageFile),
                    resultImage: finalResultImage,
                }
            });

        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to remove background.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'background-removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MiniAppLayout
            title={t('background-remover-title')}
            description={t('bgRemoverDescription')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label={t('uploadPhoto')}
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleRemoveBackground}
                            disabled={!imageFile || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? (
                                <Icon name="spinner" className="animate-spin w-5 h-5" />
                            ) : (
                                <Icon name="eraser" className="w-5 h-5" />
                            )}
                            <span>{isLoading ? t('bgRemoverProcessing') : t('bgRemoverButton')}</span>
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
                        <div className="text-center">
                             <button
                                onClick={handleDownload}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent gap-2"
                            >
                                <Icon name="download" className="w-4 h-4" />
                                {t('downloadPNG')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default BackgroundRemover;