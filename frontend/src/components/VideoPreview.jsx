import React from 'react';

const VideoPreview = ({ videoInfo }) => {
    if (!videoInfo) return null;

    const { title, thumbnail, duration, author } = videoInfo;

    return (
        <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in-up">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative shrink-0 sm:w-48 aspect-video rounded-lg overflow-hidden bg-black/50">
                    <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                        {duration}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center text-left">
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-2" title={title}>
                        {title}
                    </h3>
                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {author}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview;
