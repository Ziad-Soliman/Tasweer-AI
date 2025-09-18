import React, { useState } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { FileUpload } from '../../components/FileUpload';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { Recipe } from '../../types';
import { useTranslation } from '../../App';

interface MiniAppProps {
    onBack: () => void;
}

const AIRecipeGenerator: React.FC<MiniAppProps> = ({ onBack }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [ingredientsText, setIngredientsText] = useState('');
    const [restrictions, setRestrictions] = useState('');
    const [inputMethod, setInputMethod] = useState<'image' | 'text'>('text');
    const [result, setResult] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleFileChange = (file: File) => {
        setImageFile(file);
        setIngredientsText('');
        setResult(null);
        setError(null);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIngredientsText(e.target.value);
        setImageFile(null);
        setResult(null);
        setError(null);
    }

    const handleGenerate = async () => {
        if (!imageFile && !ingredientsText) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const recipe = await geminiService.generateRecipe({
                imageFile: inputMethod === 'image' ? imageFile : undefined,
                ingredientsText: inputMethod === 'text' ? ingredientsText : undefined,
                restrictions
            });
            setResult(recipe);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate recipe.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <MiniAppLayout
            title={t('recipe-generator-title')}
            description={t('recipeGeneratorDesc')}
            onBack={onBack}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="bg-card border p-6 rounded-lg grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('inputMethod')}</label>
                        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
                           <button onClick={() => setInputMethod('text')} className={`w-full inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ${inputMethod === 'text' ? 'bg-background text-foreground shadow-sm' : ''}`}>{t('text')}</button>
                           <button onClick={() => setInputMethod('image')} className={`w-full inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ${inputMethod === 'image' ? 'bg-background text-foreground shadow-sm' : ''}`}>{t('image')}</button>
                        </div>
                        {inputMethod === 'text' ? (
                            <textarea
                                value={ingredientsText}
                                onChange={handleTextChange}
                                placeholder={t('listIngredientsPlaceholder')}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 resize-none"
                            />
                        ) : (
                             <FileUpload
                                onFileUpload={handleFileChange}
                                label={t('uploadIngredientsPhoto')}
                                uploadedFileName={imageFile?.name}
                            />
                        )}
                    </div>
                     <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">{t('dietaryRestrictions')}</label>
                        <input
                            type="text"
                            value={restrictions}
                            onChange={(e) => setRestrictions(e.target.value)}
                            placeholder={t('dietaryRestrictionsPlaceholder')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={(!imageFile && !ingredientsText) || isLoading}
                        className="md:col-span-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                    >
                        {isLoading ? ( <Icon name="spinner" className="animate-spin w-5 h-5" /> ) : ( <Icon name="sparkles" className="w-5 h-5" /> )}
                        <span>{isLoading ? t('findingRecipe') : t('findRecipe')}</span>
                    </button>
                    {error && <p className="text-sm text-destructive text-center md:col-span-2">{error}</p>}
                </div>

                {result && (
                    <div className="animate-fade-in space-y-6 border-t pt-8">
                         <div className="bg-card border p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-primary mb-2">{result.recipeName}</h2>
                            <p className="text-muted-foreground italic mb-4">{result.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm mb-4">
                                <span><strong>{t('prepTime')}:</strong> {result.prepTime}</span>
                                <span><strong>{t('cookTime')}:</strong> {result.cookTime}</span>
                                <span><strong>{t('servings')}:</strong> {result.servings}</span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="font-semibold text-lg mb-2">{t('ingredients')}</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {result.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="md:col-span-2">
                                     <h3 className="font-semibold text-lg mb-2">{t('instructions')}</h3>
                                     <ol className="list-decimal list-inside space-y-2 text-sm">
                                        {result.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                     </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MiniAppLayout>
    );
};

export default AIRecipeGenerator;
