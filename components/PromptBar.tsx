import React from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../App';

interface PromptBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onBrowsePresets: () => void;
  onEnhancePrompt: () => void;
  isGenerating: boolean;
  isEnhancingPrompt: boolean;
  isImageUploaded: boolean;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  prompt, onPromptChange,
  onGenerate, onBrowsePresets, onEnhancePrompt,
  isGenerating, isEnhancingPrompt, isImageUploaded,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="absolute bottom-6 start-1/2 -translate-x-1/2 w-full max-w-4xl z-30 px-4">
      <div className="bg-card/60 backdrop-blur-xl border border-border/80 rounded-full shadow-2xl p-2 flex items-center gap-2">
        <Tooltip text={t('browsePresets')}>
            <button onClick={onBrowsePresets} disabled={!isImageUploaded || isGenerating} className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-muted rounded-full hover:bg-accent text-muted-foreground disabled:opacity-50 transition-colors">
                <Icon name="sparkles" className="w-5 h-5" />
            </button>
        </Tooltip>
        <input
            type="text"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={isImageUploaded ? t('promptPlaceholder') : t('promptPlaceholderNoImage')}
            className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground px-2"
            disabled={!isImageUploaded || isGenerating}
        />
        <Tooltip text={t('enhancePrompt')}>
            <button onClick={onEnhancePrompt} disabled={!prompt || isGenerating || isEnhancingPrompt} className="p-2 rounded-full hover:bg-accent text-muted-foreground disabled:opacity-50 transition-colors">
                {isEnhancingPrompt ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <Icon name="wand" className="w-5 h-5" />}
            </button>
        </Tooltip>
        <button
            onClick={onGenerate}
            disabled={!prompt || isGenerating || isEnhancingPrompt}
            className="bg-primary text-primary-foreground h-10 px-6 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-all"
        >
            {isGenerating ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><span>{t('generate')}</span> <Icon name="arrow-right" className="w-4 h-4"/></>}
        </button>
      </div>
    </div>
  );
};