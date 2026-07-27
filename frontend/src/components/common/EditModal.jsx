import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import MoviePoster from './MoviePoster';
import { DEFAULT_REVIEW } from '../../utils/movie';

export default function EditModal({
    isOpen,
    onClose,
    movie,
    favorite,
    onSave,
    title,
}) {
    const [fields, setFields] = useState(DEFAULT_REVIEW);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (favorite) {
            setFields({
                rating: favorite.rating ?? 5,
                notes: favorite.notes || '',
                status: favorite.status || 'watched',
                tags: favorite.tags || [],
                watchDate: favorite.watchDate ? new Date(favorite.watchDate).toISOString().slice(0, 10) : '',
            });
        } else {
            setFields(DEFAULT_REVIEW);
        }
    }, [isOpen, favorite]);

    if (!isOpen) return null;

    const displayTitle = title || favorite?.title || movie?.Title || 'Movie';
    const poster = favorite?.poster || movie?.Poster;

    const handleSubmit = async () => {
        setSaving(true);
        const payload = {
            ...fields,
            watchDate: fields.watchDate || undefined,
        };
        const ok = await onSave(payload);
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-4 mb-6">
                    {poster && (
                        <MoviePoster src={poster} alt={displayTitle} className="w-24 h-36 object-cover rounded-lg shrink-0" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold">{displayTitle}</h2>
                        <p className="text-slate-400 text-sm">{favorite ? 'Edit your log entry' : 'Add to your log'}</p>
                    </div>
                </div>

                <ReviewForm fields={fields} onChange={setFields} />

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : favorite ? 'Save changes' : 'Add to log'}
                    </button>
                </div>
            </div>
        </div>
    );
}
