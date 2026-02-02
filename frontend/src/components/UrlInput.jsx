import React from 'react';
import { Clipboard, ArrowRight } from 'lucide-react';

const UrlInput = ({ value, onChange, onSubmit, isLoading }) => {
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <form onSubmit={onSubmit} className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl focus-within:border-red-500 transition-colors">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="วางลิงก์ YouTube ที่นี่... (Paste URL)"
                    className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-zinc-500"
                    disabled={isLoading}
                />

                {value === '' && (
                    <button
                        type="button"
                        onClick={handlePaste}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors border border-zinc-700 rounded-lg hover:border-zinc-500 mr-2"
                    >
                        <Clipboard size={14} />
                        PASTE
                    </button>
                )}

                <button
                    type="submit"
                    disabled={!value || isLoading}
                    className={`p-3 rounded-lg transition-all duration-300 ${value
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    ) : (
                        <ArrowRight size={20} />
                    )}
                </button>
            </form>
        </div>
    );
};

export default UrlInput;
