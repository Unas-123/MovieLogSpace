import React, { useState } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';

export default function Auth() {
    const { handleLogin, backendOnline } = useApp();
    const { success, error } = useToast();
    const [authMode, setAuthMode] = useState('login');
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!backendOnline) {
            error('Backend offline. Run the API server on port 5000 and ensure MongoDB is running.');
            return;
        }
        setLoading(true);
        try {
            if (authMode === 'signup') {
                await API.post('/auth/signup', form);
                success('Account created! Please log in.');
                setAuthMode('login');
            } else {
                const res = await API.post('/auth/login', form);
                handleLogin(res.data);
            }
        } catch (err) {
            error(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
                <h2 className="text-3xl font-black text-white mb-2 text-center">🎬 Movie Log Space</h2>
                <p className="text-slate-500 text-center text-sm mb-6">Track, rate, and share your watchlist</p>

                {!backendOnline && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                        Backend offline — start MongoDB and run <code className="text-red-200">npm start</code> in the backend folder.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        placeholder="Username"
                        required
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !backendOnline}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Create account'}
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-400">
                    <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-cyan-400 hover:underline"
                    >
                        {authMode === 'login' ? 'Create new account' : 'Back to login'}
                    </button>
                </p>
            </div>
        </div>
    );
}
