import React from 'react';
import { Icon } from './Icon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                    <Icon name="error" className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                    </p>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
