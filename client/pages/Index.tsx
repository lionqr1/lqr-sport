import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase, type Channel, type LiveTV, type Radio, type Update } from "@/lib/supabase";
import { 
  Play, 
  Radio as RadioIcon, 
  Users, 
  Clock, 
  AlertCircle,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Search,
  Loader2
} from "lucide-react";

export default function Index() {
  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [liveTV, setLiveTV] = useState<LiveTV[]>([]);
  const [radio, setRadio] = useState<Radio[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);

  // UI states
  const [currentSection, setCurrentSection] = useState('streams');
  const [channelSearch, setChannelSearch] = useState('');
  const [liveSearch, setLiveSearch] = useState('');
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
  const [radioStatus, setRadioStatus] = useState<Record<number, 'online' | 'offline' | 'checking'>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
        // Check status of all radio stations
        data.forEach(station => {
          checkRadioStatus(station);
        });
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

  // Check radio station status
  const checkRadioStatus = async (station: Radio) => {
    setRadioStatus(prev => ({ ...prev, [station.id]: 'checking' }));

    try {
      // Create a test audio element to check if the stream works
      const testAudio = new Audio();
      testAudio.preload = 'none';
      testAudio.src = station.live_url;

      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          setRadioStatus(prev => ({ ...prev, [station.id]: 'offline' }));
          resolve();
        }, 5000); // 5 second timeout

        testAudio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          setRadioStatus(prev => ({ ...prev, [station.id]: 'online' }));
          resolve();
        });

        testAudio.addEventListener('error', () => {
          clearTimeout(timeout);
          setRadioStatus(prev => ({ ...prev, [station.id]: 'offline' }));
          resolve();
        });

        testAudio.load();
      });
    } catch (error) {
      setRadioStatus(prev => ({ ...prev, [station.id]: 'offline' }));
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

  // Video player functions
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

  // Filter functions
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const filteredLiveTV = liveTV.filter(tv =>
    tv.name.toLowerCase().includes(liveSearch.toLowerCase())
  );

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

  if (isInitialLoading) {
    return <LoadingScreen isLoading={true} text="Loading LQR SPORT" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Add HLS.js script */}
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      
      <Header 
        onSectionChange={setCurrentSection} 
        currentSection={currentSection}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Haitian Streams Section */}
        {currentSection === 'streams' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold">Haitian Streams</h2>
              <Badge variant="secondary" className="bg-red-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE
              </Badge>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search streams..."
                value={liveSearch}
                onChange={(e) => setLiveSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {loading.liveTV ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : errors.liveTV ? (
              <div className="text-center py-8 text-red-400">
                ❌ {errors.liveTV}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLiveTV.map((stream) => (
                  <Card key={stream.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {stream.logo_url && (
                          <img 
                            src={stream.logo_url} 
                            alt={stream.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{stream.name}</h3>
                          <p className="text-xs text-gray-400">Live Stream</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => openVideoPlayer(stream.stream_url, stream.name)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
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
            <h2 className="text-xl md:text-2xl font-bold mb-4">TV Channels</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search channels..."
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {loading.channels ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : errors.channels ? (
              <div className="text-center py-8 text-red-400">
                ❌ {errors.channels}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChannels.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {channel.logo_url && (
                          <img 
                            src={channel.logo_url} 
                            alt={channel.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        )}
                        <h3 className="font-semibold text-white">{channel.name}</h3>
                      </div>
                      <Button 
                        onClick={() => openVideoPlayer(channel.stream_url, channel.name)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Radio Stations</h2>
              <Badge variant="secondary" className="bg-green-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE RADIO
              </Badge>
            </div>

            {loading.radio ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : errors.radio ? (
              <div className="text-center py-8 text-red-400">
                ❌ {errors.radio}
              </div>
            ) : radio.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No radio stations available
              </div>
            ) : (
              <div className="space-y-6">
                {/* Currently Playing */}
                {currentRadio && isPlaying && (
                  <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-600/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                          <RadioIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold text-white">Now Playing</h3>
                            <Badge className="bg-red-600 text-white text-xs">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                              LIVE
                            </Badge>
                          </div>
                          <p className="text-orange-200 font-semibold">{currentRadio.title}</p>

                          {/* Waveform Animation */}
                          <div className="flex items-end space-x-1 mt-3 h-6">
                            {[...Array(12)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-orange-400 rounded animate-pulse"
                                style={{
                                  height: `${Math.random() * 20 + 8}px`,
                                  animationDelay: `${i * 100}ms`,
                                  animationDuration: '1.2s'
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={toggleRadio}
                            size="icon"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Pause className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={toggleMute}
                            variant="outline"
                            size="icon"
                            className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Radio Stations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {radio.map((station) => (
                    <Card
                      key={station.id}
                      className={`transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                        currentRadio?.id === station.id && isPlaying
                          ? 'bg-gradient-to-br from-orange-600/30 to-red-600/30 border-orange-600/50'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      }`}
                      onClick={() => setCurrentRadio(station)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                            <RadioIcon className="w-6 h-6 text-white" />
                          </div>
                          {radioStatus[station.id] === 'checking' ? (
                            <Badge className="bg-yellow-600 text-white text-xs">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              CHECKING
                            </Badge>
                          ) : radioStatus[station.id] === 'offline' ? (
                            <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                              OFFLINE
                            </Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white text-xs">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                              LIVE
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-white mb-2 truncate">{station.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">Radio Station</p>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentRadio?.id === station.id) {
                              toggleRadio();
                            } else {
                              setCurrentRadio(station);
                              if (!isPlaying) {
                                // Will start playing when currentRadio changes
                                setTimeout(() => toggleRadio(), 100);
                              }
                            }
                          }}
                          className={`w-full transition-colors ${
                            currentRadio?.id === station.id && isPlaying
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-orange-600 hover:bg-orange-700 text-white'
                          }`}
                        >
                          {currentRadio?.id === station.id && isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Playing
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
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
            <h2 className="text-xl md:text-2xl font-bold mb-4">Latest Updates</h2>
            
            {loading.updates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : errors.updates ? (
              <div className="text-center py-8 text-red-400">
                ❌ {errors.updates}
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No updates available
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-yellow-400 text-lg">
                          {update.title}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300">{update.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Copyright Section */}
        {currentSection === 'copyright' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Copyright Disclaimer</h2>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <p className="text-gray-300 leading-relaxed">
                  All channels featured on LQR SPORT are publicly available from the internet.
                  We do not host, own, or claim any rights over the content displayed.
                  All content belongs to their respective owners and broadcasters.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Section */}
        {currentSection === 'contact' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Contact Us</h2>
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center">
                      <img
                        src="https://i.ibb.co/CsB7SJp0/best.png"
                        alt="LQR SPORT"
                        className="w-16 h-16 object-contain"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white">LQR SPORT</h3>
                      <p className="text-gray-300">Haitian Media Hub</p>

                      {/* Email */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-400">Email</p>
                            <p className="text-lg font-semibold text-white">mail.lqrsport@dr.com</p>
                          </div>
                        </div>
                      </div>

                      {/* Support */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-400">Support</p>
                            <p className="text-lg font-semibold text-white">We're here to help</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-400">Serving</p>
                            <p className="text-lg font-semibold text-white">Haiti & Worldwide</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-gray-600">
                      <p className="text-gray-300 leading-relaxed">
                        Get in touch with us for any questions, feedback, or support regarding our Haitian streaming services.
                        We're here to help you enjoy the best of Haitian media content.
                      </p>

                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                          LQR SPORT WAS CREATED 1 day ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
