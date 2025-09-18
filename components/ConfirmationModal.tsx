import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../App';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    const { t } = useTranslation();

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-md m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:mx-0 sm:h-10 sm:w-10">
                        <Icon name="error" className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="mt-3 text-center sm:ms-4 sm:mt-0 sm:text-left">
                        <h3 className="text-base font-semibold leading-6 text-foreground" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 sm:ms-3 sm:w-auto"
                        onClick={onConfirm}
                    >
                        {t('confirm')}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};
