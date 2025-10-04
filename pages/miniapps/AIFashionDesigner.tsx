
import React, { useState, useRef, useEffect } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import { ImageComparator } from '../../components/ImageComparator';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const CameraModal: React.FC<{ onClose: () => void, onCapture: (file: File) => void }> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let streamInstance: MediaStream;
        const startCamera = async () => {
            try {
                streamInstance = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(streamInstance);
                if (videoRef.current) {
                    videoRef.current.srcObject = streamInstance;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please ensure permissions are granted.");
                onClose();
            }
        };

        startCamera();

        return () => {
            streamInstance?.getTracks().forEach(track => track.stop());
        };
    }, [onClose]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                    onCapture(file);
                }
            }, 'image/png');
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card border rounded-lg shadow-lg p-4 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md aspect-video" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-accent">Cancel</button>
                    <button onClick={handleCapture} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Capture</button>
                </div>
            </div>
        </div>
    );
};


const AIFashionDesigner: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [clothingPrompt, setClothingPrompt] = useState('');
    const [clothingImageFile, setClothingImageFile] = useState<File | null>(null);
    const [clothingImagePreview, setClothingImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const { t } = useTranslation();

    const handleFileUpload = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResultImage(null);
        setError(null);
    };

    const handleCameraCapture = (file: File) => {
        handleFileUpload(file);
        setIsCameraOpen(false);
    }

    const handleClothingImageUpload = (file: File) => {
        setClothingImageFile(file);
        setClothingImagePreview(URL.createObjectURL(file));
    };

    const handleGenerate = async () => {
        if (!imageFile || (!clothingPrompt && !clothingImageFile)) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        try {
            const resultBase64 = await geminiService.virtualTryOn(imageFile, clothingPrompt, clothingImageFile);
            setResultImage(`data:image/png;base64,${resultBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate design.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('fashion-designer-title')}
            description={t('fashion-designer-desc')}
            onBack={onBack}
        >
            {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} />}
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-2">
                        <FileUpload
                            onFileUpload={handleFileUpload}
                            label={t('uploadYourself')}
                            uploadedFileName={imageFile?.name}
                            onClear={() => { setImageFile(null); setImagePreview(null); }}
                        />
                        <button onClick={() => setIsCameraOpen(true)} className="w-full text-sm inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-accent">
                            <Icon name="camera" className="w-4 h-4"/> Use Camera
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <textarea
                            value={clothingPrompt}
                            onChange={(e) => setClothingPrompt(e.target.value)}
                            placeholder={t('clothingPromptPlaceholder')}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                            disabled={!imageFile}
                        />
                        <FileUpload
                            onFileUpload={handleClothingImageUpload}
                            label={t('uploadClothingReference')}
                            uploadedFileName={clothingImageFile?.name}
                            onClear={() => { setClothingImageFile(null); setClothingImagePreview(null); }}
                            disabled={!imageFile}
                        />
                         {clothingImagePreview && <img src={clothingImagePreview} alt="Clothing Preview" className="mt-2 rounded-md max-h-20 object-contain self-start" />}
                        <button
                            onClick={handleGenerate}
                            disabled={!imageFile || (!clothingPrompt && !clothingImageFile) || isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                        >
                            {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="shirt" className="w-5 h-5" /> )}
                            <span>{isLoading ? t('designing') : t('virtualTryOn')}</span>
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

export default AIFashionDesigner;