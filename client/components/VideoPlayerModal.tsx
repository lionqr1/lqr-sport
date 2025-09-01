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
  platform?: 'mobile' | 'desktop' | 'tv';
  altSources?: { url: string; label?: string }[];
}

export default function VideoPlayerModal({ isOpen, onClose, streamUrl, title, platform = 'mobile', altSources = [] }: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [{ url: streamUrl, label: altSources[0]?.label || 'Source 1' }, ...altSources];
  const currentUrl = sources[sourceIndex]?.url || streamUrl;

  useEffect(() => {
    if (isOpen && videoRef.current && currentUrl) {
      setIsLoading(true);

      let hls: any | null = null;
      const attachListeners = () => {
        if (!videoRef.current) return;
        videoRef.current.onloadstart = () => setIsLoading(true);
        videoRef.current.oncanplay = () => {
          setIsLoading(false);
          videoRef.current?.play();
          setIsPlaying(true);
        };
        videoRef.current.onerror = () => {
          setIsLoading(false);
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((i) => i + 1);
          }
        };
      };

      if (currentUrl.includes('.m3u8') && window.Hls?.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(currentUrl);
        hls.attachMedia(videoRef.current);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          videoRef.current?.play();
          setIsPlaying(true);
        });
        hls.on(window.Hls.Events.ERROR, () => {
          setIsLoading(false);
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((i) => i + 1);
          }
        });
      } else {
        // Direct video stream
        if (videoRef.current) {
          videoRef.current.src = currentUrl;
        }
        attachListeners();
      }

      return () => {
        if (hls) {
          try { hls.destroy(); } catch {}
        }
      };
    }
  }, [isOpen, currentUrl, sourceIndex, altSources.length]);

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

  const [isInIframe, setIsInIframe] = useState(false);
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we're in an iframe
    setIsInIframe(window !== window.parent);
  }, []);

  // Handle mouse movement in fullscreen
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      setShowControls(true);

      // Clear existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      // Hide controls after 2 seconds on all platforms
      const delay = 2000;
      controlsTimeoutRef.current = setTimeout(() => {
        if (isCustomFullscreen || document.fullscreenElement) {
          setShowControls(false);
        }
      }, delay);
    };

    const handleMouseLeave = () => {
      if (isCustomFullscreen || document.fullscreenElement) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initially hide controls after delay in fullscreen
    if (isCustomFullscreen || document.fullscreenElement) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [isOpen, isCustomFullscreen, platform]);

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    // If we're in an iframe or mobile, use custom fullscreen
    if (isInIframe || /Mobi|Android/i.test(navigator.userAgent)) {
      setIsCustomFullscreen(!isCustomFullscreen);
      return;
    }

    // Try native fullscreen for desktop browsers
    if (!document.fullscreenElement) {
      const requestFullscreen = videoRef.current.requestFullscreen ||
                               videoRef.current.webkitRequestFullscreen ||
                               videoRef.current.mozRequestFullScreen ||
                               videoRef.current.msRequestFullscreen;
      if (requestFullscreen) {
        requestFullscreen.call(videoRef.current).catch(() => {
          // Fallback to custom fullscreen if native fails
          setIsCustomFullscreen(true);
        });
      } else {
        setIsCustomFullscreen(true);
      }
    } else {
      const exitFullscreen = document.exitFullscreen ||
                             document.webkitExitFullscreen ||
                             document.mozCancelFullScreen ||
                             document.msExitFullscreen;
      if (exitFullscreen) {
        exitFullscreen.call(document);
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
    setSourceIndex(0);
    setIsCustomFullscreen(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black flex flex-col items-center justify-center ${
      isCustomFullscreen ? 'z-[99999] p-0' : 'z-[9999] bg-opacity-95 p-4'
    }`}>
      {/* Video Player */}
      <div className={`flex flex-col ${
        isCustomFullscreen ? 'w-full h-full' :
        platform === 'desktop' ? 'w-full max-w-2xl' : 'w-full max-w-4xl'
      }`}>
        <div className={`relative bg-black overflow-hidden ${
          isCustomFullscreen ? 'flex-1' : 'aspect-video rounded-lg mb-4'
        }`}>
          <video
            ref={videoRef}
            className={`w-full h-full object-contain ${
              platform === 'desktop' ? 'max-h-96' : ''
            }`}
            autoPlay
            playsInline
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
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
          {(!isCustomFullscreen && !document.fullscreenElement) || showControls ? (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                <h3 className="font-semibold truncate">{title}</h3>
              </div>
            </div>
          ) : null}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-75 hover:bg-opacity-100 text-white rounded-full flex items-center justify-center transition-all ${
              (isCustomFullscreen || document.fullscreenElement) && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className={`flex items-center justify-between bg-gray-800 p-4 transition-opacity duration-300 ${
          isCustomFullscreen ? `absolute bottom-0 left-0 right-0 z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}` : 'rounded-lg'
        } ${
          document.fullscreenElement && platform === 'desktop' ? `${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}` : ''
        }`}>
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
        {!isCustomFullscreen && (
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
        )}

        {/* Custom Fullscreen Exit Button */}
        {isCustomFullscreen && (
          <button
            onClick={() => setIsCustomFullscreen(false)}
            className={`absolute top-4 right-4 z-20 w-12 h-12 bg-black bg-opacity-75 hover:bg-opacity-100 text-white rounded-full flex items-center justify-center transition-all ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

// Extend Window interface for HLS.js and cross-browser fullscreen
declare global {
  interface Window {
    Hls: any;
  }

  interface HTMLVideoElement {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }

  interface Document {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  }
}
