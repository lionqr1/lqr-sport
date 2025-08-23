import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase, type Channel, type LiveTV, type Radio, type Update } from "@/lib/supabase";
import { 
  Play, 
  Radio as RadioIcon, 
  Users, 
  Clock,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function TV() {
  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [liveTV, setLiveTV] = useState<LiveTV[]>([]);
  const [radio, setRadio] = useState<Radio[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);

  // UI states
  const [currentSection, setCurrentSection] = useState('streams');
  const [loading, setLoading] = useState<Record<string, boolean>>({
    channels: false,
    liveTV: false,
    radio: false,
    updates: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Navigation states for Fire TV
  const [focusedItem, setFocusedItem] = useState(0);
  const [focusedNav, setFocusedNav] = useState(0);
  const [isNavFocused, setIsNavFocused] = useState(true);
  
  // Video player states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [currentStreamTitle, setCurrentStreamTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Media player states
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [audio] = useState(new Audio());

  // Navigation items
  const navItems = [
    { id: 'streams', label: 'Haitian Streams', icon: Play },
    { id: 'channels', label: 'TV Channels', icon: Users },
    { id: 'radio', label: 'Radio Stations', icon: RadioIcon },
    { id: 'updates', label: 'Latest Updates', icon: Clock }
  ];

  // Get current items based on section
  const getCurrentItems = () => {
    switch (currentSection) {
      case 'streams': return liveTV;
      case 'channels': return channels;
      case 'radio': return radio;
      case 'updates': return updates;
      default: return [];
    }
  };

  // Fetch functions
  const fetchChannels = async () => {
    setLoading(prev => ({ ...prev, channels: true }));
    try {
      const { data, error } = await supabase
        .from('tv_channels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setChannels(data || []);
      setErrors(prev => ({ ...prev, channels: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, channels: 'Failed to load channels' }));
    } finally {
      setLoading(prev => ({ ...prev, channels: false }));
    }
  };

  const fetchLiveTV = async () => {
    setLoading(prev => ({ ...prev, liveTV: true }));
    try {
      const { data, error } = await supabase
        .from('live_tv')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setLiveTV(data || []);
      setErrors(prev => ({ ...prev, liveTV: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, liveTV: 'Failed to load live TV' }));
    } finally {
      setLoading(prev => ({ ...prev, liveTV: false }));
    }
  };

  const fetchRadio = async () => {
    setLoading(prev => ({ ...prev, radio: true }));
    try {
      const { data, error } = await supabase
        .from('radio')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setRadio(data || []);
      if (data && data.length > 0) {
        setCurrentRadio(data[0]);
      }
      setErrors(prev => ({ ...prev, radio: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, radio: 'Failed to load radio' }));
    } finally {
      setLoading(prev => ({ ...prev, radio: false }));
    }
  };

  const fetchUpdates = async () => {
    setLoading(prev => ({ ...prev, updates: true }));
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUpdates(data || []);
      setErrors(prev => ({ ...prev, updates: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, updates: 'Failed to load updates' }));
    } finally {
      setLoading(prev => ({ ...prev, updates: false }));
    }
  };

  // Video player functions
  const playStream = async (url: string, title: string) => {
    setCurrentStreamUrl(url);
    setCurrentStreamTitle(title);
    setIsFullscreen(true);
    
    if (videoRef.current) {
      videoRef.current.src = url;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

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

  // Radio functions
  const toggleRadio = () => {
    if (!currentRadio?.live_url) return;
    
    if (isRadioPlaying) {
      audio.pause();
    } else {
      audio.src = currentRadio.live_url;
      audio.play();
    }
    setIsRadioPlaying(!isRadioPlaying);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Fire TV Remote Navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
      if (isFullscreen) {
        // Fullscreen controls
        if (event.key === 'ArrowUp' || event.key === 'Escape' || event.key === 'Backspace') {
          exitFullscreen();
        } else if (event.key === 'Enter' || event.key === ' ') {
          togglePlay();
        } else if (event.key === 'm' || event.key === 'M') {
          toggleMute();
        }
        return;
      }

      const currentItems = getCurrentItems();
      
      if (isNavFocused) {
        // Navigation controls
        if (event.key === 'ArrowLeft') {
          setFocusedNav(prev => Math.max(0, prev - 1));
        } else if (event.key === 'ArrowRight') {
          setFocusedNav(prev => Math.min(navItems.length - 1, prev + 1));
        } else if (event.key === 'ArrowDown') {
          setIsNavFocused(false);
          setFocusedItem(0);
        } else if (event.key === 'Enter') {
          setCurrentSection(navItems[focusedNav].id);
          setFocusedItem(0);
        }
      } else {
        // Content controls
        if (event.key === 'ArrowUp') {
          setIsNavFocused(true);
        } else if (event.key === 'ArrowLeft') {
          setFocusedItem(prev => Math.max(0, prev - 1));
        } else if (event.key === 'ArrowRight') {
          setFocusedItem(prev => Math.min(currentItems.length - 1, prev + 1));
        } else if (event.key === 'ArrowDown') {
          const itemsPerRow = 4;
          const nextRow = focusedItem + itemsPerRow;
          if (nextRow < currentItems.length) {
            setFocusedItem(nextRow);
          }
        } else if (event.key === 'ArrowUp') {
          const itemsPerRow = 4;
          const prevRow = focusedItem - itemsPerRow;
          if (prevRow >= 0) {
            setFocusedItem(prevRow);
          } else {
            setIsNavFocused(true);
          }
        } else if (event.key === 'Enter') {
          const item = currentItems[focusedItem];
          if (item) {
            if (currentSection === 'radio') {
              setCurrentRadio(item as Radio);
              toggleRadio();
            } else {
              const url = (item as Channel).stream_url || (item as LiveTV).stream_url;
              const name = (item as Channel).name || (item as LiveTV).name;
              if (url) {
                playStream(url, name);
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavFocused, focusedNav, focusedItem, currentSection, isFullscreen, getCurrentItems]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        fetchChannels(),
        fetchLiveTV(),
        fetchRadio(),
        fetchUpdates()
      ]);
      setIsInitialLoading(false);
    };
    
    loadData();
  }, []);

  if (isInitialLoading) {
    return <LoadingScreen isLoading={true} text="Loading LQR SPORT TV" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fullscreen Video Player */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            controls={false}
          />
          
          {/* Fullscreen Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-bold text-white">{currentStreamTitle}</h3>
                <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></div>
                  LIVE
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
                
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 text-white hover:bg-gray-700"
                >
                  {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-lg">Press ↑ to exit • Enter to play/pause • M to mute</p>
            </div>
          </div>
        </div>
      )}

      {/* Main TV Interface */}
      {!isFullscreen && (
        <>
          {/* TV Header */}
          <header className="bg-black border-b border-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://i.ibb.co/CsB7SJp0/best.png" 
                  alt="LQR SPORT" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">LQR SPORT</h1>
                  <p className="text-sm text-gray-400">Fire TV • Use remote to navigate</p>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-red-600 text-white text-base px-3 py-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE TV
              </Badge>
            </div>
          </header>

          {/* TV Navigation */}
          <nav className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center space-x-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isFocused = isNavFocused && focusedNav === index;
                  const isActive = currentSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentSection(item.id);
                        setFocusedItem(0);
                      }}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                        isFocused 
                          ? 'bg-white text-black scale-110 ring-4 ring-orange-600' 
                          : isActive
                          ? 'bg-orange-600 text-white scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto p-6">
            {/* Content Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">
                  {navItems.find(item => item.id === currentSection)?.label}
                </h2>
                <p className="text-gray-400 text-lg">Use arrow keys to navigate • Enter to select</p>
              </div>
              
              {loading[currentSection] ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin text-orange-600" />
                </div>
              ) : errors[currentSection] ? (
                <div className="text-center py-16 text-red-400 text-2xl">
                  ❌ {errors[currentSection]}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {getCurrentItems().map((item, index) => {
                    const isFocused = !isNavFocused && focusedItem === index;
                    
                    if (currentSection === 'updates') {
                      const update = item as Update;
                      return (
                        <Card 
                          key={update.id}
                          className={`col-span-2 transition-all duration-300 ${
                            isFocused 
                              ? 'bg-orange-600 text-white scale-105 ring-4 ring-white'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className={`font-bold text-xl ${
                                isFocused ? 'text-white' : 'text-yellow-400'
                              }`}>
                                {update.title}
                              </h3>
                              <span className={`text-sm ${
                                isFocused ? 'text-orange-200' : 'text-gray-400'
                              }`}>
                                {formatDate(update.created_at)}
                              </span>
                            </div>
                            <p className={`text-base leading-relaxed ${
                              isFocused ? 'text-orange-100' : 'text-gray-300'
                            }`}>
                              {update.message}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    }

                    if (currentSection === 'radio') {
                      const station = item as Radio;
                      return (
                        <Card 
                          key={station.id}
                          className={`transition-all duration-300 cursor-pointer ${
                            isFocused 
                              ? 'bg-orange-600 text-white scale-110 ring-4 ring-white'
                              : currentRadio?.id === station.id && isRadioPlaying
                              ? 'bg-gradient-to-br from-orange-600/30 to-red-600/30 border-orange-600/50'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                                <RadioIcon className="w-6 h-6 text-white" />
                              </div>
                              <Badge className="bg-green-600 text-white">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                                LIVE
                              </Badge>
                            </div>
                            
                            <h3 className="font-bold text-white mb-2 text-lg truncate">{station.title}</h3>
                            <p className={`text-sm mb-4 ${
                              isFocused ? 'text-orange-200' : 'text-gray-400'
                            }`}>
                              Radio Station
                            </p>
                            
                            <div className={`text-sm font-medium ${
                              currentRadio?.id === station.id && isRadioPlaying ? 'text-orange-300' : 'text-gray-500'
                            }`}>
                              {currentRadio?.id === station.id && isRadioPlaying ? 'Playing' : 'Press Enter to play'}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    // Streams and Channels
                    const stream = item as LiveTV | Channel;
                    return (
                      <Card 
                        key={stream.id}
                        className={`transition-all duration-300 cursor-pointer ${
                          isFocused 
                            ? 'bg-orange-600 text-white scale-110 ring-4 ring-white'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            {stream.logo_url && (
                              <img 
                                src={stream.logo_url} 
                                alt={stream.name}
                                className="w-12 h-12 object-contain rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg truncate">{stream.name}</h3>
                              <p className={`text-sm ${
                                isFocused ? 'text-orange-200' : 'text-gray-400'
                              }`}>
                                {currentSection === 'streams' ? 'Live Stream' : 'TV Channel'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className="bg-red-600 text-white">LIVE</Badge>
                            <div className={`text-sm font-medium ${
                              isFocused ? 'text-orange-200' : 'text-gray-500'
                            }`}>
                              Press Enter to watch
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src="https://i.ibb.co/CsB7SJp0/best.png" 
                    alt="LQR SPORT" 
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h3 className="font-bold text-white">LQR SPORT</h3>
                    <p className="text-sm text-gray-400">Contact: mail.lqrsport@dr.com</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  LQR SPORT WAS CREATED 1 day ago
                </p>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
