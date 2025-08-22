import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Radio 
} from "lucide-react";

interface MediaPlayerProps {
  title?: string;
  isLive?: boolean;
}

export default function MediaPlayer({ title = "Live Stream", isLive = true }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-card via-card to-muted/20 border-border/50">
      <div className="p-6">
        {/* Video/Stream Display Area */}
        <div className="relative aspect-video bg-black rounded-lg mb-4 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {isLive && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              </div>
            )}
            
            {!isPlaying ? (
              <div className="text-center">
                <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Click play to start streaming</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-primary font-medium">Loading stream...</p>
              </div>
            )}
          </div>
        </div>

        {/* Media Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {isLive ? "Live Haitian Radio & TV" : "On Demand Content"}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume and Additional Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
