import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ArrowLeft 
} from "lucide-react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string;
  title: string;
}

export default function VideoPlayerModal({ isOpen, onClose, streamUrl, title }: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current && streamUrl) {
      setIsLoading(true);
      
      // Check if HLS.js is available for m3u8 streams
      if (streamUrl.includes('.m3u8') && window.Hls?.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          videoRef.current?.play();
          setIsPlaying(true);
        });
        hls.on(window.Hls.Events.ERROR, () => {
          setIsLoading(false);
        });
      } else {
        // Direct video stream
        videoRef.current.src = streamUrl;
        videoRef.current.onloadstart = () => setIsLoading(true);
        videoRef.current.oncanplay = () => {
          setIsLoading(false);
          videoRef.current?.play();
          setIsPlaying(true);
        };
        videoRef.current.onerror = () => setIsLoading(false);
      }
    }
  }, [isOpen, streamUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
      {/* Video Player */}
      <div className="w-full max-w-4xl flex flex-col">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            controls={false}
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading stream...</p>
              </div>
            </div>
          )}

          {/* Video Title Overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              <h3 className="font-semibold truncate">{title}</h3>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-75 hover:bg-opacity-100 text-white rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={togglePlay}
              size="icon"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-4 text-center">
          <Button
            onClick={handleClose}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Channels
          </Button>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for HLS.js
declare global {
  interface Window {
    Hls: any;
  }
}
