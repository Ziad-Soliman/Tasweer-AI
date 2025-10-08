import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const LipsyncStudio: React.FC<MiniAppProps> = ({ onBack }) => {
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleGenerate = async () => {
        if (!avatarFile || !audioFile) return;
        setIsLoading(true);
        setError(null);
        setResultUrl(null);
        
        const videoLoadingMessages = [
            t('videoLoadingMessage1'), t('videoLoadingMessage2'), t('videoLoadingMessage3'),
            t('videoLoadingMessage4'), t('videoLoadingMessage5'), t('videoLoadingMessage6'), t('videoLoadingMessage7')
        ];
        let messageIndex = 0;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
            setLoadingMessage(videoLoadingMessages[messageIndex]);
        }, 5000);

        try {
            const url = await geminiService.generateLipsyncVideo(avatarFile, audioFile);
            setResultUrl(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate video.");
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <MiniAppLayout
            title={t('lipsync-studio-title')}
            description={t('lipsync-studio-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        onFileUpload={setAvatarFile}
                        label={t('uploadAvatar')}
                        uploadedFileName={avatarFile?.name}
                        onClear={() => setAvatarFile(null)}
                    />
                    <FileUpload
                        onFileUpload={setAudioFile}
                        label={t('uploadAudio')}
                        uploadedFileName={audioFile?.name}
                        onClear={() => setAudioFile(null)}
                        accept="audio/mp3, audio/wav, audio/mpeg"
                    />
                </div>
                 <div className="text-center">
                    <button
                        onClick={handleGenerate}
                        disabled={!avatarFile || !audioFile || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="mic" className="w-5 h-5" /> )}
                        <span>{isLoading ? loadingMessage : t('generateLipsyncVideo')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
                </div>

                {isLoading && (
                    <div className="aspect-video bg-card/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                        <Icon name="spinner" className="w-10 h-10 text-primary animate-spin"/>
                        <p className="mt-4 font-semibold text-foreground">{loadingMessage}</p>
                        <p className="text-sm text-muted-foreground">{t('videoGenerationTakesTime')}</p>
                    </div>
                )}

                {resultUrl && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-semibold text-center text-foreground">{t('result')}</h3>
                        <video src={resultUrl} controls autoPlay loop className="w-full max-w-lg mx-auto rounded-lg shadow-lg" />
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default LipsyncStudio;