import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { VideoAdScript } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const VideoAdScripter: React.FC<MiniAppProps> = ({ onBack }) => {
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [platform, setPlatform] = useState('TikTok');
    const [result, setResult] = useState<VideoAdScript | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts'];

    const handleGenerate = async () => {
        if (!productDescription || !targetAudience) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const script = await geminiService.generateVideoAdScript(productDescription, targetAudience, platform);
            setResult(script);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate script.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MiniAppLayout
            title={t('video-ad-scripter-title')}
            description={t('video-ad-scripter-desc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">{t('productDescription')}</label>
                        <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="e.g., Aura Aromatics, a line of all-natural essential oil diffusers."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20 resize-none"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('targetAudience')}</label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="e.g., Young professionals interested in wellness"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('platform')}</label>
                         <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={!productDescription || !targetAudience || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="video" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('writingScript') : t('generateVideoScript')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {result && (
                    <div className="animate-fade-in space-y-4 border-t pt-8">
                        <div className="bg-card border rounded-lg p-6 font-mono text-sm">
                            <h2 className="text-lg font-bold text-primary mb-2 uppercase">{result.title}</h2>
                            <p><strong className="text-muted-foreground">PLATFORM:</strong> {result.platform}</p>
                            <p className="mb-4"><strong className="text-muted-foreground">AUDIENCE:</strong> {result.targetAudience}</p>
                            
                            <p className="border-t pt-4 mt-4"><strong className="text-muted-foreground">HOOK (0-2s):</strong> {result.hook}</p>
                            
                            <div className="border-t mt-4 pt-4 space-y-4">
                                {result.scenes.map(scene => (
                                    <div key={scene.sceneNumber}>
                                        <p><strong className="text-muted-foreground">SCENE {scene.sceneNumber} ({scene.duration})</strong></p>
                                        <p><strong className="text-primary/80">VISUAL:</strong> {scene.visual}</p>
                                        <p><strong className="text-primary/80">V.O.:</strong> {scene.voiceover || " (None)"}</p>
                                        <p><strong className="text-primary/80">TEXT:</strong> {scene.onScreenText || " (None)"}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="border-t pt-4 mt-4"><strong className="text-muted-foreground">MUSIC:</strong> {result.musicSuggestion}</p>
                            <p className="mt-2"><strong className="text-muted-foreground">C.T.A.:</strong> {result.callToAction}</p>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default VideoAdScripter;
