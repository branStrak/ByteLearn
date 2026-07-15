import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Volume2, VolumeX } from 'lucide-react';

const CustomVideoPlayer = ({ videoUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipBackward = () => {
    videoRef.current.currentTime -= 5;
  };

  const skipForward = () => {
    videoRef.current.currentTime += 5;
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullScreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen();
    }
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full cursor-pointer"
        onClick={togglePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
      />

      {/* Center Play/Pause Overlay (Shows on pause or briefly on play) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center shadow-glow animate-pulse">
            <Play size={40} className="text-white fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 mb-4 group/progress cursor-pointer flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleSeek}
            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full h-1 bg-slate-600/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Custom Thumb (Visual Only) */}
          <div 
            className="absolute h-4 w-4 bg-blue-500 border-2 border-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
            </button>

            <div className="flex items-center gap-3">
              <button 
                onClick={skipBackward}
                className="text-white hover:text-blue-400 transition-colors"
                title="Rewind 5s"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={skipForward}
                className="text-white hover:text-blue-400 transition-colors"
                title="Forward 5s"
              >
                <RotateCw size={20} />
              </button>
            </div>

            <div className="text-white text-xs font-medium tabular-nums ml-2 select-none">
              {currentTime} <span className="opacity-60 mx-1">/</span> {duration}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button 
              onClick={toggleFullScreen}
              className="text-white hover:text-blue-400 transition-colors"
              title="Fullscreen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Title Overlay (Top) */}
      <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-white font-semibold text-lg drop-shadow-md">{title}</h3>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
