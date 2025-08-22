import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VideoPlayerModal from "@/components/VideoPlayerModal";
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
  ArrowRight
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

  // Video Player Modal states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [currentStreamTitle, setCurrentStreamTitle] = useState('');

  // Media player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [audio] = useState(new Audio());
  const [isMuted, setIsMuted] = useState(false);

  // TV-specific states
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Fetch functions (same as mobile)
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

  // Media player functions
  const toggleRadio = () => {
    if (!currentRadio?.live_url) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.src = currentRadio.live_url;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const openVideoPlayer = (url: string, title: string) => {
    setCurrentStreamUrl(url);
    setCurrentStreamTitle(title);
    setIsVideoModalOpen(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoModalOpen(false);
    setCurrentStreamUrl('');
    setCurrentStreamTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Load data on mount
  useEffect(() => {
    fetchChannels();
    fetchLiveTV();
    fetchRadio();
    fetchUpdates();
  }, []);

  // Audio event listeners
  useEffect(() => {
    const handleAudioEnd = () => setIsPlaying(false);
    const handleAudioError = () => setIsPlaying(false);
    
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('error', handleAudioError);
    
    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [audio]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* TV Header */}
      <header className="bg-black border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="https://i.ibb.co/CsB7SJp0/best.png" 
              alt="LQR SPORT" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">LQR SPORT</h1>
              <p className="text-lg text-gray-400">Haitian Media Hub - TV Version</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-red-600 text-white text-lg px-4 py-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></div>
            LIVE TV
          </Badge>
        </div>
      </header>

      {/* TV Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-6">
            {[
              { id: 'streams', label: 'Haitian Streams', icon: Play },
              { id: 'channels', label: 'TV Channels', icon: Users },
              { id: 'radio', label: 'Radio Stations', icon: RadioIcon },
              { id: 'updates', label: 'Latest Updates', icon: Clock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentSection(id)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-600 ${
                  currentSection === id 
                    ? 'bg-orange-600 text-white scale-110' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Streams Section */}
        {currentSection === 'streams' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-center">Haitian Streams</h2>
            
            {loading.liveTV ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-16 h-16 animate-spin text-orange-600" />
              </div>
            ) : errors.liveTV ? (
              <div className="text-center py-16 text-red-400 text-2xl">
                ❌ {errors.liveTV}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {liveTV.map((stream, index) => (
                  <Card 
                    key={stream.id} 
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 focus-within:ring-4 focus-within:ring-orange-600"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        {stream.logo_url && (
                          <img 
                            src={stream.logo_url} 
                            alt={stream.name}
                            className="w-16 h-16 object-contain rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-xl truncate">{stream.name}</h3>
                          <p className="text-gray-400 text-lg">Live Stream</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => openVideoPlayer(stream.stream_url, stream.name)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-4 focus:ring-4 focus:ring-orange-300"
                      >
                        <Play className="w-6 h-6 mr-3" />
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Channels Section */}
        {currentSection === 'channels' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-center">TV Channels</h2>
            
            {loading.channels ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-16 h-16 animate-spin text-orange-600" />
              </div>
            ) : errors.channels ? (
              <div className="text-center py-16 text-red-400 text-2xl">
                ❌ {errors.channels}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {channels.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 focus-within:ring-4 focus-within:ring-orange-600">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        {channel.logo_url && (
                          <img 
                            src={channel.logo_url} 
                            alt={channel.name}
                            className="w-16 h-16 object-contain rounded"
                          />
                        )}
                        <h3 className="font-bold text-white text-xl">{channel.name}</h3>
                      </div>
                      <Button 
                        onClick={() => openVideoPlayer(channel.stream_url, channel.name)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-4 focus:ring-4 focus:ring-orange-300"
                      >
                        <Play className="w-6 h-6 mr-3" />
                        Watch
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Radio Section */}
        {currentSection === 'radio' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-center">Radio Stations</h2>
            
            {loading.radio ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-16 h-16 animate-spin text-orange-600" />
              </div>
            ) : errors.radio ? (
              <div className="text-center py-16 text-red-400 text-2xl">
                ❌ {errors.radio}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Currently Playing */}
                {currentRadio && isPlaying && (
                  <Card className="bg-gradient-to-r from-orange-600/30 to-red-600/30 border-orange-600/50 p-8">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                          <RadioIcon className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">Now Playing</h3>
                          <p className="text-orange-200 font-semibold text-xl">{currentRadio.title}</p>
                        </div>
                        
                        <div className="flex space-x-4">
                          <Button
                            onClick={toggleRadio}
                            size="icon"
                            className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white focus:ring-4 focus:ring-orange-300"
                          >
                            <Pause className="w-8 h-8" />
                          </Button>
                          <Button
                            onClick={toggleMute}
                            variant="outline"
                            size="icon"
                            className="w-16 h-16 border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white focus:ring-4 focus:ring-orange-300"
                          >
                            {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Radio Stations Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {radio.map((station) => (
                    <Card 
                      key={station.id} 
                      className={`transition-all duration-300 hover:scale-105 cursor-pointer focus-within:ring-4 focus-within:ring-orange-600 ${
                        currentRadio?.id === station.id && isPlaying
                          ? 'bg-gradient-to-br from-orange-600/30 to-red-600/30 border-orange-600/50'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      }`}
                      onClick={() => setCurrentRadio(station)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                            <RadioIcon className="w-8 h-8 text-white" />
                          </div>
                          <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                            LIVE
                          </Badge>
                        </div>
                        
                        <h3 className="font-bold text-white mb-2 text-xl truncate">{station.title}</h3>
                        <p className="text-gray-400 mb-6 text-lg">Radio Station</p>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentRadio?.id === station.id) {
                              toggleRadio();
                            } else {
                              setCurrentRadio(station);
                              if (!isPlaying) {
                                setTimeout(() => toggleRadio(), 100);
                              }
                            }
                          }}
                          className={`w-full text-xl py-4 transition-colors focus:ring-4 focus:ring-orange-300 ${
                            currentRadio?.id === station.id && isPlaying
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-orange-600 hover:bg-orange-700 text-white'
                          }`}
                        >
                          {currentRadio?.id === station.id && isPlaying ? (
                            <>
                              <Pause className="w-6 h-6 mr-3" />
                              Playing
                            </>
                          ) : (
                            <>
                              <Play className="w-6 h-6 mr-3" />
                              Listen Live
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Updates Section */}
        {currentSection === 'updates' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-center">Latest Updates</h2>
            
            {loading.updates ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-16 h-16 animate-spin text-orange-600" />
              </div>
            ) : errors.updates ? (
              <div className="text-center py-16 text-red-400 text-2xl">
                ❌ {errors.updates}
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-2xl">
                No updates available
              </div>
            ) : (
              <div className="space-y-6">
                {updates.map((update) => (
                  <Card key={update.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-yellow-400 text-2xl">
                          {update.title}
                        </h3>
                        <span className="text-gray-400 text-lg">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xl leading-relaxed">{update.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoPlayer}
        streamUrl={currentStreamUrl}
        title={currentStreamTitle}
      />
    </div>
  );
}
