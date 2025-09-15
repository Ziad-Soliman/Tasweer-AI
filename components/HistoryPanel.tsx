import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { Icon } from './Icon';

interface HistoryPanelProps {
    history: HistoryItem[];
    onRevert: (item: HistoryItem) => void;
    onToggleFavorite: (id: string) => void;
}

const HistoryCard: React.FC<{ item: HistoryItem, onRevert: () => void, onToggleFavorite: () => void }> = ({ item, onRevert, onToggleFavorite }) => {
    const { images, settings, timestamp, isFavorite } = item;
    
    const timeAgo = (date: number) => {
        const seconds = Math.floor((new Date().getTime() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg flex gap-4 transition-colors hover:bg-gray-200 dark:hover:bg-gray-900">
            <button onClick={onRevert} className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden group relative">
                <img src={images[0]} alt="History thumbnail" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="restart" className="text-white w-8 h-8"/>
                </div>
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate" title={settings.prompt}>
                    {settings.prompt}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {timeAgo(timestamp)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                     <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">
                        {settings.aspectRatio}
                     </span>
                     <button onClick={onToggleFavorite} className="text-gray-400 hover:text-yellow-400" title={isFavorite ? 'Unfavorite' : 'Favorite'}>
                        <Icon name={isFavorite ? 'star-filled' : 'star'} className={`w-5 h-5 ${isFavorite ? 'text-yellow-400' : ''}`}/>
                     </button>
                </div>
            </div>
        </div>
    );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRevert, onToggleFavorite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.settings.prompt.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFavorite = !showFavorites || item.isFavorite;
            return matchesSearch && matchesFavorite;
        });
    }, [history, searchTerm, showFavorites]);
    
    if (history.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                <Icon name="history" className="mx-auto w-12 h-12 mb-2"/>
                <p className="font-semibold">No History Yet</p>
                <p className="text-sm">Your generated images will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder="Search by prompt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-transparent rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"/>
                </div>
                <button 
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`p-2 rounded-md transition-colors ${showFavorites ? 'bg-yellow-400/20 text-yellow-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                    title="Filter Favorites"
                >
                    <Icon name={showFavorites ? 'star-filled' : 'star'} className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map(item => (
                        <HistoryCard 
                            key={item.id} 
                            item={item} 
                            onRevert={() => onRevert(item)}
                            onToggleFavorite={() => onToggleFavorite(item.id)}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <p>No results found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
