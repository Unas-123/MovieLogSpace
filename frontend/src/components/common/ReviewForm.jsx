import React, { useState } from 'react';
import { STATUS_OPTIONS } from '../../utils/movie';

export default function ReviewForm({ fields, onChange }) {
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (!tag) return;
        const tags = fields.tags || [];
        if (!tags.includes(tag)) {
            onChange({ ...fields, tags: [...tags, tag] });
        }
        setTagInput('');
    };

    const removeTag = (tag) => {
        onChange({ ...fields, tags: (fields.tags || []).filter((t) => t !== tag) });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm text-slate-400 block mb-1">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange({ ...fields, rating: n })}
                            className={`text-2xl ${n <= fields.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm text-slate-400 block mb-1">Status</label>
                <select
                    value={fields.status}
                    onChange={(e) => onChange({ ...fields, status: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-sm text-slate-400 block mb-1">Watch date</label>
                <input
                    type="date"
                    value={fields.watchDate ? fields.watchDate.slice(0, 10) : ''}
                    onChange={(e) => onChange({ ...fields, watchDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
            </div>

            <div>
                <label className="text-sm text-slate-400 block mb-1">Tags</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={tagInput}
                        placeholder="e.g. sci-fi"
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                    <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700">
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(fields.tags || []).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm text-slate-400 block mb-1">Notes</label>
                <textarea
                    value={fields.notes || ''}
                    onChange={(e) => onChange({ ...fields, notes: e.target.value })}
                    rows={3}
                    placeholder="Your thoughts..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white resize-none"
                />
            </div>
        </div>
    );
}
