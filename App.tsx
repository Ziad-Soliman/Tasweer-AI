import React, { useState } from 'react';
import { ProductGenerationPage } from './pages/ProductGenerationPage';
import { MiniAppsPage } from './pages/MiniAppsPage';
import { ClassicGenerationPage } from './pages/ClassicGenerationPage';
import { LogoConceptualizationPage } from './pages/LogoConceptualizationPage';
import { Icon } from './components/Icon';

type Page = 'product-generation' | 'mini-apps' | 'classic-generation' | 'logo-conceptualization';

interface PageConfig {
    title: string;
    component: React.ComponentType<any>;
}

const pageConfig: Record<Page, PageConfig> = {
    'product-generation': { title: 'Product Generation', component: ProductGenerationPage },
    'mini-apps': { title: 'Mini Apps', component: MiniAppsPage },
    'classic-generation': { title: 'Classic Generation', component: ClassicGenerationPage },
    'logo-conceptualization': { title: 'Logo Conceptualization', component: LogoConceptualizationPage },
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('product-generation');
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const PageComponent = pageConfig[currentPage].component;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background dark">
            <header className="w-full px-4 border-b border-border/80 flex-shrink-0 flex justify-between items-center h-[65px]">
                 <div className="flex items-center gap-3">
                    {currentPage === 'product-generation' && (
                        <button 
                            onClick={() => setIsLeftSidebarOpen(p => !p)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 w-10 bg-transparent text-secondary-foreground hover:bg-accent"
                            aria-label={isLeftSidebarOpen ? "Hide Controls Panel" : "Show Controls Panel"}
                        >
                            <Icon name="menu" className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNBNTg1N0Y3Ii8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzYzNjZGMSIvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8cGF0aCBkPSJNMTIgMkwzIDIySDdMOC4yNSAxOEgxNS43NUwxNyAyMkgxMUwxMiAyWk0xMiA2LjhMMTQuMjUgMTRIMi43NUwxMiA2LjhaIiBmaWxsPSJ1cmwoI2xvZ29HcmFkaWVudCkiLz4KICAgIDxwYXRoIGQ9Ik0xOCAyTDE5LjUgNUwyMiA2TDE5LjUgN0wxOCAxMEwxNi41IDdMMTQgNkwxNi41IDVMMTggMloiIGZpbGw9InVybCgjbG9nb0dyYWRpZW50KSIvPgo8L3N2Zz4=" alt="AI Designer Logo" className="w-8 h-8" />
                        <h1 className="text-xl font-semibold text-foreground">
                            AI Designer
                        </h1>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
                    {Object.entries(pageConfig).map(([pageKey, { title }]) => (
                        <button
                            key={pageKey}
                            onClick={() => setCurrentPage(pageKey as Page)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${currentPage === pageKey ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {title}
                        </button>
                    ))}
                </nav>

                 <div className="flex items-center gap-2">
                    {currentPage === 'product-generation' && (
                        <button 
                            onClick={() => setIsRightSidebarOpen(p => !p)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent gap-2"
                            aria-label={isRightSidebarOpen ? "Hide Workspace Panel" : "Show Workspace Panel"}
                        >
                             <Icon name="history" className="w-5 h-5" />
                             <span className="hidden sm:inline">Workspace</span>
                        </button>
                    )}
                 </div>
            </header>
            
            {currentPage === 'product-generation' ? (
                <ProductGenerationPage 
                    isLeftSidebarOpen={isLeftSidebarOpen}
                    isRightSidebarOpen={isRightSidebarOpen}
                    setIsRightSidebarOpen={setIsRightSidebarOpen}
                />
            ) : (
                <PageComponent />
            )}
        </div>
    );
};

export default App;
