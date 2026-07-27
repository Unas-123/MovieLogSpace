import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function ShareSettings() {
    const { shareId, publicListEnabled, updateShareSettings } = useApp();
    const [enabled, setEnabled] = useState(publicListEnabled);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setEnabled(publicListEnabled);
    }, [publicListEnabled]);

    
    const baseUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');
    const shareUrl = shareId ? `${baseUrl}?share=${shareId}` : '';
    const isLocal =
        /localhost|127\.0\.0\.1/.test(baseUrl) ||
        baseUrl.startsWith('http://192.168.') ||
        baseUrl.startsWith('http://10.');

    const togglePublic = async () => {
        const next = !enabled;
        const data = await updateShareSettings({ publicListEnabled: next });
        if (data) setEnabled(data.publicListEnabled);
    };

    const copyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xl">
            <h3 className="text-lg font-bold mb-2">Public watchlist</h3>
            <p className="text-slate-400 text-sm mb-4">
                Share a read-only link so others can browse your log (no login required).
            </p>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={togglePublic}
                    className="w-5 h-5 rounded accent-cyan-500"
                />
                <span>List is {enabled ? 'public' : 'private'}</span>
            </label>

            {shareUrl && enabled && (
                <>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={shareUrl}
                            className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-300"
                        />
                        <button
                            onClick={copyLink}
                            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                  
                </>
            )}

            <button
                onClick={() => updateShareSettings({ regenerateShareId: true })}
                className="mt-4 text-sm text-slate-400 hover:text-cyan-400"
            >
                Regenerate share link
            </button>
        </div>
    );
}