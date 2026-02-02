import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }) => {
    if (!message) return null;

    return (
        <div className="w-full max-w-xl mx-auto mt-6 animate-shake">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
};

export default ErrorAlert;
