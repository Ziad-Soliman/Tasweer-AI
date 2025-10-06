import React, { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { useTranslation } from '../App';
import * as geminiService from '../services/geminiService';

interface GroundedResult {
    text: string;
    sources: { uri: string; title: string }[];
}

export const ExplorePage = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GroundedResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await geminiService.generateGroundedContent(searchQuery);
            setResult(response);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during search.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    }
    
    const formattedText = result?.text.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
    ));

    return (
        <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-8 animate-fade-in">
                    <Icon name="search" className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">{t('exploreTitle')}</h1>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">{t('exploreDesc')}</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="relative mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <Icon name="search" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('explorePlaceholder')}
                        className="w-full pl-12 pr-4 py-4 rounded-full bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none text-lg"
                        disabled={isLoading}
                    />
                </form>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <Icon name="spinner" className="w-10 h-10 text-primary animate-spin" />
                        <p className="mt-4 font-semibold text-foreground">{t('searching')}</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md text-center">
                        <h3 className="font-bold">{t('searchFailed')}</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {result && (
                     <div className="animate-fade-in bg-card border border-border rounded-lg p-6">
                        <div className="prose prose-invert max-w-none text-foreground leading-relaxed">
                            {formattedText}
                        </div>
                        {result.sources.length > 0 && (
                            <div className="mt-6 border-t border-border pt-4">
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">{t('sources')}</h3>
                                <ul className="space-y-2">
                                    {result.sources.map((source, index) => (
                                        <li key={index} className="text-sm">
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-2 group">
                                                 <Icon name="link" className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-blue-400" />
                                                 <span>{source.title || new URL(source.uri).hostname}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && !result && !error && (
                    <div className="text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <p className="font-semibold mb-4">{t('tryOneOfThese')}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button onClick={() => handleSuggestionClick(t('suggestionF1'))} className="px-3 py-1.5 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary">{t('suggestionF1')}</button>
                            <button onClick={() => handleSuggestionClick(t('suggestionAITrends'))} className="px-3 py-1.5 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary">{t('suggestionAITrends')}</button>
                            <button onClick={() => handleSuggestionClick(t('suggestionSpace'))} className="px-3 py-1.5 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary">{t('suggestionSpace')}</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};