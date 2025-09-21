import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { Icon } from './Icon';
import { useTranslation } from '../App';

interface HistoryPanelProps {
    history: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
}

const HistoryThumbnail: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const { thumbnail } = item;
    
    if (thumbnail.type === 'image') {
        return <img src={thumbnail.value} alt="History thumbnail" className="w-full h-full object-cover" />;
    }
    
    if (thumbnail.type === 'video') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <Icon name="video" className="w-8 h-8 text-slate-400" />
            </div>
        );
    }

    if (thumbnail.type === 'icon') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted">
                <Icon name={thumbnail.value} className="w-8 h-8 text-muted-foreground" />
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" className="w-8 h-8 text-muted-foreground" />
        </div>
    );
};


const HistoryCard: React.FC<{ item: HistoryItem, onRestore: () => void, onToggleFavorite: () => void }> = ({ item, onRestore, onToggleFavorite }) => {
    const { t } = useTranslation();
    const { title, timestamp, isFavorite, source } = item;
    
    const timeAgo = (date: number) => {
        const seconds = Math.floor((new Date().getTime() - date) / 1000);
        
        if (seconds < 60) return t('justNow');
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t(minutes === 1 ? 'minuteAgo' : 'minutesAgo', { count: minutes });

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t(hours === 1 ? 'hourAgo' : 'hoursAgo', { count: hours });

        const days = Math.floor(hours / 24);
        if (days < 30) return t(days === 1 ? 'dayAgo' : 'daysAgo', { count: days });

        const months = Math.floor(days / 30);
        if (months < 12) return t(months === 1 ? 'monthAgo' : 'monthsAgo', { count: months });

        const years = Math.floor(days / 365);
        return t(years === 1 ? 'yearAgo' : 'yearsAgo', { count: years });
    };

    return (
        <div className="bg-muted/50 p-3 rounded-lg flex gap-4 transition-colors hover:bg-accent">
            <button onClick={onRestore} className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden group relative bg-muted">
                <HistoryThumbnail item={item} />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="restart" className="text-white w-8 h-8"/>
                </div>
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium truncate" title={title}>
                    {title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {timeAgo(timestamp)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                     <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 font-medium rounded-full capitalize">
                        {source.appName}
                     </span>
                     <button onClick={onToggleFavorite} className="text-muted-foreground hover:text-yellow-400" title={t(isFavorite ? 'unfavorite' : 'favorite')}>
                        <Icon name={isFavorite ? 'star-filled' : 'star'} className={`w-5 h-5 ${isFavorite ? 'text-yellow-400' : ''}`}/>
                     </button>
                </div>
            </div>
        </div>
    );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore, onToggleFavorite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);
    const { t } = useTranslation();

    const filteredHistory = useMemo(() => {
        return history
            .filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.source.appName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFavorite = !showFavorites || item.isFavorite;
                return matchesSearch && matchesFavorite;
            });
    }, [history, searchTerm, showFavorites]);
    
    if (history.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <Icon name="history" className="mx-auto w-12 h-12 mb-2"/>
                <p className="font-semibold">{t('noHistoryYet')}</p>
                <p className="text-sm">{t('noHistoryDescription')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder={t('searchByPrompt')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent ps-9 pe-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <Icon name="search" className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                </div>
                <button 
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors ${showFavorites ? 'bg-yellow-400/20 text-yellow-500' : 'bg-secondary text-muted-foreground'}`}
                    title={t('filterFavorites')}
                >
                    <Icon name={showFavorites ? 'star-filled' : 'star'} className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pe-1">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map(item => (
                        <HistoryCard 
                            key={item.id} 
                            item={item} 
                            onRestore={() => onRestore(item)}
                            onToggleFavorite={() => onToggleFavorite(item.id)}
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>{t('noResultsFound')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};