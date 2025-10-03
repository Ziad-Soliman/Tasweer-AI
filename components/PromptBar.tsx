import React from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../App';

interface PromptBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  onGenerate: () => void;
  onBrowsePresets: () => void;
  onEnhancePrompt: () => void;
  isGenerating: boolean;
  isImageUploaded: boolean;
  numberOfImages: 1 | 4;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  prompt, onPromptChange, negativePrompt, onNegativePromptChange,
  onGenerate, onBrowsePresets, onEnhancePrompt,
  isGenerating, isImageUploaded, numberOfImages,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20">
      <div className="mx-auto max-w-4xl bg-card/80 backdrop-blur-xl border border-border rounded-lg shadow-2xl p-3 flex flex-col gap-2">
        <div className="flex gap-2 items-start">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={isImageUploaded ? t('promptPlaceholder') : t('promptPlaceholderNoImage')}
            className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground resize-none p-2 h-14"
            rows={2}
            disabled={!isImageUploaded || isGenerating}
          />
          <Tooltip text={t('browsePresets')}>
            <button onClick={onBrowsePresets} disabled={!isImageUploaded || isGenerating} className="p-2 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50"><Icon name="sparkles" className="w-5 h-5" /></button>
          </Tooltip>
          <Tooltip text={t('enhancePrompt')}>
             <button onClick={onEnhancePrompt} disabled={!prompt || isGenerating} className="p-2 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50"><Icon name="wand" className="w-5 h-5" /></button>
          </Tooltip>
           <button
            onClick={onGenerate}
            disabled={!prompt || isGenerating}
            className="bg-primary text-primary-foreground h-14 px-6 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <><span>{t('generate')}</span>{numberOfImages > 1 && <span>{numberOfImages}</span>}</>}
          </button>
        </div>
        <div className="px-2">
            <input 
                type="text"
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                placeholder={t('negativePromptPlaceholder')}
                className="w-full bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
                disabled={!isImageUploaded || isGenerating}
            />
        </div>
      </div>
    </div>
  );
};
