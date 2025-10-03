import React, { useState } from 'react';
import { Icon } from './Icon';
import { MarketingCopy } from '../types';
import { useTranslation } from '../App';
import { Tooltip } from './Tooltip';

interface MarketingCopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    copy: MarketingCopy | null;
    onRegenerate: () => void;
    isLoading: boolean;
}

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="text-sm font-semibold text-muted-foreground">{label}</label>
            <div className="mt-1 flex items-center gap-2">
                <p dir="auto" className="flex-1 text-sm bg-muted p-3 rounded-md">{value}</p>
                <Tooltip text={copied ? t('copied')! : t('copy')}><button onClick={handleCopy} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Icon name={copied ? "check" : "copy"} className="w-4 h-4" /></button></Tooltip>
            </div>
        </div>
    );
};


export const MarketingCopyModal: React.FC<MarketingCopyModalProps> = ({ isOpen, onClose, copy, onRegenerate, isLoading }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card border rounded-lg shadow-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('aiGeneratedMarketingCopy')}</h3>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-accent"><Icon name="close" /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Icon name="spinner" className="w-8 h-8 animate-spin text-primary"/></div>
                    ) : copy ? (
                        <>
                            <CopyField label={t('productName')} value={copy.productName} />
                            <CopyField label={t('tagline')} value={copy.tagline} />
                            <CopyField label={t('description')} value={copy.description} />
                            <CopyField label={t('socialMediaPost')} value={copy.socialMediaPost} />
                            <CopyField label={t('socialMediaPostArabic')} value={copy.socialMediaPostArabic} />
                        </>
                    ) : (
                        <p className="text-muted-foreground">{t('noResultsFound')}</p>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-accent">{t('close')}</button>
                    <button onClick={onRegenerate} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? <Icon name="spinner" className="w-4 h-4 animate-spin"/> : <Icon name="sparkles" className="w-4 h-4" />}
                        {t('regenerate')}
                    </button>
                </div>
            </div>
        </div>
    );
};
