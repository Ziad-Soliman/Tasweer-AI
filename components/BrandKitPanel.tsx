import React from 'react';
import { BrandKit } from '../types';
import { FONT_OPTIONS } from '../constants';
import { FileUpload } from './FileUpload';

interface BrandKitPanelProps {
    brandKit: BrandKit;
    setBrandKit: React.Dispatch<React.SetStateAction<BrandKit>>;
}

export const BrandKitPanel: React.FC<BrandKitPanelProps> = ({ brandKit, setBrandKit }) => {
    
    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setBrandKit(prev => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleClearLogo = () => {
        setBrandKit(prev => ({ ...prev, logo: null }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Logo</h3>
                <FileUpload 
                    onFileUpload={handleLogoUpload}
                    label="Upload Logo (PNG)"
                    uploadedFileName={brandKit.logo ? 'logo.png' : undefined}
                    onClear={brandKit.logo ? handleClearLogo : undefined}
                />
                 {brandKit.logo && (
                    <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-md flex justify-center items-center">
                        <img src={brandKit.logo} alt="Brand Logo Preview" className="max-h-16" />
                    </div>
                 )}
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</h3>
                <div className="flex items-center gap-3">
                    <input 
                        type="color"
                        value={brandKit.primaryColor}
                        onChange={(e) => setBrandKit(prev => ({...prev, primaryColor: e.target.value}))}
                        className="p-1 h-10 w-10 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg"
                        title="Select brand color"
                    />
                    <input 
                        type="text"
                        value={brandKit.primaryColor}
                        onChange={(e) => setBrandKit(prev => ({...prev, primaryColor: e.target.value}))}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

             <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Font</h3>
                 <select
                    value={brandKit.font}
                    onChange={(e) => setBrandKit(prev => ({...prev, font: e.target.value}))}
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    {FONT_OPTIONS.map(font => <option key={font} value={font} style={{fontFamily: font}}>{font}</option>)}
                </select>
            </div>
        </div>
    );
};
