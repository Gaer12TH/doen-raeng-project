import React, { useState } from 'react';
import UrlInput from './components/UrlInput';
import VideoPreview from './components/VideoPreview';
import DownloadButtons from './components/DownloadButtons';
import ErrorAlert from './components/ErrorAlert';
import { getVideoInfo, getDownloadUrl } from './services/api';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleUrlSubmit = async (e) => {
    e?.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const info = await getVideoInfo(url);
      setVideoInfo(info);
    } catch (err) {
      console.error(err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลวิดีโอได้ (Failed to load video)');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format, type, quality) => {
    if (!videoInfo) return;
    setDownloading(true);

    try {
      const downloadUrl = getDownloadUrl(url, format, type, quality);
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank'; // Open in new tab if needed for browser handle
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดาวน์โหลด');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 py-12 bg-black font-sans selection:bg-red-900 selection:text-white">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-red-600/10 to-transparent rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-[150px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-2xl text-center">
        {/* Logo / Header */}
        <div className="mb-12 animate-fade-in relative inline-block select-none">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
            DOEN RAENG
          </h1>
          <div className="absolute -bottom-2 md:-bottom-4 right-0 rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
            <span className="bg-red-600 text-black px-4 py-1 text-xl md:text-3xl font-black italic shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] skew-x-[-12deg] block border-2 border-transparent hover:border-white transition-colors">
              LOAD DER!
            </span>
          </div>
        </div>

        <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg animate-fade-in delay-100">
          YouTube Downloader ที่ <span className="text-red-500 font-bold">แรง</span> ที่สุดในสามโลก
        </p>

        {/* Input Section */}
        <div className="animate-fade-in delay-200">
          <UrlInput
            value={url}
            onChange={setUrl}
            onSubmit={handleUrlSubmit}
            isLoading={loading}
          />
        </div>

        {/* Error State */}
        {error && (
          <ErrorAlert message={error} />
        )}

        {/* Success / Preview Section */}
        {videoInfo && (
          <VideoPreview videoInfo={videoInfo} />
        )}

        {/* Download Buttons */}
        {videoInfo && (
          <div className="animate-fade-in-up delay-100">
            <DownloadButtons
              onDownload={handleDownload}
              isDownloading={downloading}
              resolutions={videoInfo.resolutions}
              audioBitrates={videoInfo.audioBitrates}
            />
          </div>
        )}
      </div>

      <footer className="absolute bottom-6 text-zinc-800 text-xs font-mono text-center w-full">
        DOEN RAENG LOAD DER v1.0.0 • POWERED BY NODE & REACT
      </footer>
    </div>
  );
}

export default App;
