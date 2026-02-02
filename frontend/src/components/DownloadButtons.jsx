import React from 'react';
import { Download, Music, Video } from 'lucide-react';

const DownloadButtons = ({ onDownload, isDownloading }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-xl mx-auto">
            <button
                onClick={() => onDownload('mp4')}
                disabled={isDownloading}
                className="flex-1 group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20"
            >
                <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="bg-red-500/10 p-2 rounded-full text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Video size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm text-zinc-400 group-hover:text-red-300">Video (HD)</div>
                        <div className="text-lg font-bold text-white">Download MP4</div>
                    </div>
                </div>
            </button>

            <button
                onClick={() => onDownload('mp3')}
                disabled={isDownloading}
                className="flex-1 group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-900/20"
            >
                <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="bg-yellow-500/10 p-2 rounded-full text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        <Music size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm text-zinc-400 group-hover:text-yellow-300">Audio Only</div>
                        <div className="text-lg font-bold text-white">Download MP3</div>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default DownloadButtons;
