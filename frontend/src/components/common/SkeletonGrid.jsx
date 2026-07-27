import React from 'react';

export default function SkeletonGrid({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-slate-900 rounded-xl overflow-hidden animate-pulse border border-slate-800">
                    <div className="w-full aspect-2/3 bg-slate-800" />
                    <div className="p-4 space-y-2">
                        <div className="h-5 bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-800 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
