import React, { useCallback, useState } from 'react';
import { Icon } from './Icon';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    label: string;
    uploadedFileName?: string;
    onClear?: () => void;
    disabled?: boolean;
    disabledReason?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, label, uploadedFileName, onClear, disabled, disabledReason }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    }, [onFileUpload, disabled]);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
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
            className={`flex flex-col items-center justify-center w-full h-full min-h-[8rem] border-2 border-dashed rounded-lg transition-colors
                ${disabled
                    ? 'bg-muted cursor-not-allowed opacity-70'
                    : isDragging 
                        ? 'border-primary bg-accent' 
                        : 'border-border bg-background hover:border-primary/50 hover:bg-accent cursor-pointer'
                }`}
        >
            <div className="flex flex-col items-center justify-center text-center px-2 w-full">
                {uploadedFileName ? (
                    <div className="relative flex flex-col items-center justify-center w-full">
                       <Icon name="check" className="w-8 h-8 mb-2 text-green-500"/>
                       <p className="text-xs text-foreground truncate max-w-full px-5">{uploadedFileName}</p>
                       {onClear && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!disabled) onClear();
                                }}
                                className="absolute -top-2 -right-2 bg-secondary hover:bg-accent text-muted-foreground rounded-full p-0.5 transition-colors"
                                aria-label="Clear file"
                            >
                                <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ) : disabled ? (
                     <>
                        <Icon name="sparkles" className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{disabledReason || 'Action disabled'}</p>
                    </>
                ) : (
                    <>
                        <Icon name="upload" className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </>
                )}
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={disabled} />
        </label>
    );
};
