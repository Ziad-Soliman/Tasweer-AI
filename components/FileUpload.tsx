import React, { useCallback, useState } from 'react';
import { Icon } from './Icon';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    label: string;
    uploadedFileName?: string;
    onClear?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, label, uploadedFileName, onClear }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    }, [onFileUpload]);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    return (
        <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700' 
                    : 'border-gray-400 dark:border-gray-600 bg-gray-500/10 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2 w-full">
                {uploadedFileName ? (
                    <div className="relative flex flex-col items-center justify-center w-full">
                       <Icon name="check" className="w-8 h-8 mb-2 text-green-500 dark:text-green-400"/>
                       <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-full px-5">{uploadedFileName}</p>
                       {onClear && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClear();
                                }}
                                className="absolute -top-2 -right-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-full p-0.5 transition-colors"
                                aria-label="Clear file"
                            >
                                <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <Icon name="upload" className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </>
                )}
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
        </label>
    );
};
