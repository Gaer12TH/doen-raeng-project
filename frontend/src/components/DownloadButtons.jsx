import React, { useState } from 'react';
import { Download, Music, Video, ChevronDown, Check } from 'lucide-react';

const DownloadButtons = ({ onDownload, isDownloading, resolutions = [], audioBitrates = [] }) => {
    const [videoQuality, setVideoQuality] = useState(resolutions[0] || 'best');
    const [audioQuality, setAudioQuality] = useState(320); // Default to best mp3

    return (
        <div className="flex flex-col gap-6 mt-8 w-full max-w-2xl mx-auto">

            {/* Video Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden group hover:border-red-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Video size={80} className="text-red-500" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
                    <div className="text-left flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Video Download</h3>
                        <p className="text-zinc-400 text-sm">Best for watching on devices</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-32">
                            <select
                                value={videoQuality}
                                onChange={(e) => setVideoQuality(e.target.value)}
                                className="w-full appearance-none bg-black/50 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                            >
                                <option value="best">Best</option>
                                {resolutions.map(res => (
                                    <option key={res} value={res}>{res}p60 / {res}p</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => onDownload('mp4', 'video', videoQuality)}
                            disabled={isDownloading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-6 py-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg shadow-red-900/20"
                        >
                            {isDownloading ? '...' : 'Download'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Audio Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Music size={80} className="text-yellow-500" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
                    <div className="text-left flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Audio Only</h3>
                        <p className="text-zinc-400 text-sm">Convert to high quality MP3</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-32">
                            <select
                                value={audioQuality}
                                onChange={(e) => setAudioQuality(e.target.value)}
                                className="w-full appearance-none bg-black/50 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer"
                            >
                                <option value="best">Best</option>
                                {audioBitrates.map(kbps => (
                                    <option key={kbps} value={kbps}>{kbps} kbps</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => onDownload('mp3', 'audio', audioQuality)}
                            disabled={isDownloading}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg px-6 py-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg shadow-yellow-900/20"
                        >
                            {isDownloading ? '...' : 'Convert'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DownloadButtons;
