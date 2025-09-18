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

const AIInteriorDesigner: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [style, setStyle] = useState('Modern');
    const { t } = useTranslation();

    const designStyles = ['Modern', 'Minimalist', 'Bohemian', 'Industrial', 'Scandinavian', 'Coastal', 'Farmhouse'];

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
        setError(null);
    };

    const handleRedesign = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const resultBase64 = await geminiService.redesignRoom(imageFile, style);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to redesign room.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <MiniAppLayout
            title={t('interior-designer-title')}
            description={t('interiorDesignerDesc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        label={t('uploadRoomPhoto')}
                        uploadedFileName={imageFile?.name}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                    />
                    <div className="flex flex-col gap-4">
                         <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('designStyle')}</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                disabled={!imageFile || isLoading}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {designStyles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleRedesign}
                            disabled={!imageFile || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? (
                                <Icon name="spinner" className="animate-spin w-5 h-5" />
                            ) : (
                                <Icon name="sparkles" className="w-5 h-5" />
                            )}
                            <span>{isLoading ? t('redesigning') : t('redesign')}</span>
                        </button>
                         {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </div>
                </div>
                
                {resultImage && imagePreview && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('result')}</h3>
                         <div className="aspect-video w-full max-w-2xl mx-auto">
                            <ImageComparator baseImage={imagePreview} newImage={resultImage} />
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIInteriorDesigner;
