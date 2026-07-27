import React, { useState, useMemo } from 'react';
import { useApp } from './context/AppContext';
import Auth from './components/Auth/Auth';
import Discover from './components/Discover/Discover';
import Trending from './components/Trending/Trending';
import Recommendations from './components/Recommendations/Recommendations';
import MyLog from './components/MyLog/MyLog';
import Stats from './components/Stats/Stats';
import ShareSettings from './components/Share/ShareSettings';
import PublicWatchlist from './components/PublicWatchlist/PublicWatchlist';

const TABS = [
    { id: 'discover', label: '🔍 Discover' },
    { id: 'trending', label: '🔥 Trending' },
    { id: 'recommend', label: '✨ For you' },
    { id: 'mylog', label: '📚 My Log' },
    { id: 'stats', label: '📊 Stats' },
    { id: 'share', label: '🔗 Share' },
];

function getShareIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
}

export default function App() {
    const shareIdFromUrl = useMemo(() => getShareIdFromUrl(), []);
    const {
        token,
        username,
        backendOnline,
        handleLogout,
        exportToCSV,
    } = useApp();
    const [activeTab, setActiveTab] = useState('discover');

    if (shareIdFromUrl) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
                <header className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6">
                    <h1 className="text-2xl font-black text-cyan-400">🎬 Movie Log Space</h1>
                    <p className="text-slate-500 text-sm mt-1">Shared watchlist</p>
                </header>
                <main className="max-w-6xl mx-auto">
                    <PublicWatchlist shareId={shareIdFromUrl} />
                </main>
            </div>
        );
    }

    if (!token) return <Auth />;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            {!backendOnline && (
                <div className="max-w-6xl mx-auto mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm text-center">
                    Backend offline — favorites and search may not work until the API server is running.
                </div>
            )}

            <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-8">
                <h1 className="text-3xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    🎬 Movie Log Space
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm">
                        <span className="text-slate-400">Hi,</span>{' '}
                        <span className="text-cyan-400 font-bold">{username}</span>
                    </p>
                    <button
                        onClick={exportToCSV}
                        className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-4 py-1.5 rounded-lg text-sm transition"
                    >
                        📤 Export CSV
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-1.5 rounded-lg text-sm transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <nav className="max-w-6xl mx-auto flex gap-1 mb-8 overflow-x-auto border-b border-slate-800 pb-px">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-medium rounded-t-xl whitespace-nowrap transition shrink-0 ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="max-w-6xl mx-auto">
                {activeTab === 'discover' && <Discover />}
                {activeTab === 'trending' && <Trending />}
                {activeTab === 'recommend' && <Recommendations />}
                {activeTab === 'mylog' && <MyLog />}
                {activeTab === 'stats' && <Stats />}
                {activeTab === 'share' && <ShareSettings />}
            </main>
        </div>
    );
}
