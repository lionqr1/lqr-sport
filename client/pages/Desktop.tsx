import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Maximize,
  Search,
  Loader2,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

export default function Desktop() {
  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [liveTV, setLiveTV] = useState<LiveTV[]>([]);
  const [radio, setRadio] = useState<Radio[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);

  // UI states
  const [channelSearch, setChannelSearch] = useState('');
  const [liveSearch, setLiveSearch] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({
    channels: false,
    liveTV: false,
    radio: false,
    updates: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [radioStatus, setRadioStatus] = useState<Record<number, 'online' | 'offline' | 'checking'>>({});

  // Video Player Modal states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [currentStreamTitle, setCurrentStreamTitle] = useState('');

  // Media player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [audio] = useState(new Audio());
  const [isMuted, setIsMuted] = useState(false);

  // Check radio station status
  const checkRadioStatus = async (station: Radio) => {
    setRadioStatus(prev => ({ ...prev, [station.id]: 'checking' }));
    
    try {
      const testAudio = new Audio();
      testAudio.preload = 'none';
      testAudio.src = station.live_url;
      
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          setRadioStatus(prev => ({ ...prev, [station.id]: 'offline' }));
          resolve();
        }, 5000);
        
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

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const filteredLiveTV = liveTV.filter(tv =>
    tv.name.toLowerCase().includes(liveSearch.toLowerCase())
  );

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
      {/* Desktop Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://i.ibb.co/CsB7SJp0/best.png" 
                alt="LQR SPORT" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">LQR SPORT</h1>
                <p className="text-sm text-gray-400">Haitian Media Hub - Desktop</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Badge variant="secondary" className="bg-red-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE STREAMING
              </Badge>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <a href="mailto:mail.lqrsport@dr.com" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="streams" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-800">
            <TabsTrigger value="streams" className="data-[state=active]:bg-orange-600">
              <Play className="w-4 h-4 mr-2" />
              Haitian Streams
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-orange-600">
              <Users className="w-4 h-4 mr-2" />
              TV Channels
            </TabsTrigger>
            <TabsTrigger value="radio" className="data-[state=active]:bg-orange-600">
              <RadioIcon className="w-4 h-4 mr-2" />
              Radio Stations
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-orange-600">
              <Clock className="w-4 h-4 mr-2" />
              Updates
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-orange-600">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Streams Tab */}
          <TabsContent value="streams">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Haitian Streams</h2>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search streams..."
                    value={liveSearch}
                    onChange={(e) => setLiveSearch(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              {loading.liveTV ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                </div>
              ) : errors.liveTV ? (
                <div className="text-center py-12 text-red-400 text-xl">
                  ❌ {errors.liveTV}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLiveTV.map((stream) => (
                    <Card key={stream.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group hover:shadow-xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          {stream.logo_url && (
                            <img 
                              src={stream.logo_url} 
                              alt={stream.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white truncate">{stream.name}</CardTitle>
                            <p className="text-sm text-gray-400">Live Stream</p>
                          </div>
                          <Badge className="bg-red-600 text-white">LIVE</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => openVideoPlayer(stream.stream_url, stream.name)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white group-hover:scale-105 transition-transform"
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
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">TV Channels</h2>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search channels..."
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              {loading.channels ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                </div>
              ) : errors.channels ? (
                <div className="text-center py-12 text-red-400 text-xl">
                  ❌ {errors.channels}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredChannels.map((channel) => (
                    <Card key={channel.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group hover:shadow-xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          {channel.logo_url && (
                            <img 
                              src={channel.logo_url} 
                              alt={channel.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                          )}
                          <CardTitle className="text-white">{channel.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => openVideoPlayer(channel.stream_url, channel.name)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white group-hover:scale-105 transition-transform"
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
          </TabsContent>

          {/* Radio Tab */}
          <TabsContent value="radio">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">Radio Stations</h2>
              
              {loading.radio ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                </div>
              ) : errors.radio ? (
                <div className="text-center py-12 text-red-400 text-xl">
                  ❌ {errors.radio}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Radio Player */}
                  <div className="lg:col-span-1">
                    <Card className="bg-gray-800 border-gray-700 sticky top-6">
                      <CardHeader>
                        <CardTitle className="text-center">Now Playing</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                          <RadioIcon className="w-16 h-16 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {currentRadio?.title || 'Select a radio station'}
                          </h3>
                          
                          {isPlaying && currentRadio && (
                            <div className="flex justify-center items-end space-x-1 h-8">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-orange-600 rounded animate-pulse"
                                  style={{
                                    height: `${Math.random() * 24 + 8}px`,
                                    animationDelay: `${i * 100}ms`,
                                    animationDuration: '1s'
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <Button
                            onClick={toggleRadio}
                            disabled={!currentRadio}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Play
                              </>
                            )}
                          </Button>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={toggleMute}
                              variant="outline"
                              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Maximize className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Radio Stations List */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {radio.map((station) => (
                        <Card 
                          key={station.id} 
                          className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            currentRadio?.id === station.id
                              ? 'bg-gradient-to-r from-orange-600/30 to-red-600/30 border-orange-600/50'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                          }`}
                          onClick={() => setCurrentRadio(station)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                                <RadioIcon className="w-5 h-5 text-white" />
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
                            
                            <h3 className="font-semibold text-white mb-1 truncate">{station.title}</h3>
                            <p className="text-xs text-gray-400 mb-3">Radio Station</p>
                            
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
                              size="sm"
                              className={`w-full transition-colors ${
                                currentRadio?.id === station.id && isPlaying
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                              }`}
                            >
                              {currentRadio?.id === station.id && isPlaying ? (
                                <>
                                  <Pause className="w-3 h-3 mr-1" />
                                  Playing
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Listen
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Latest Updates</h2>
              
              {loading.updates ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                </div>
              ) : errors.updates ? (
                <div className="text-center py-12 text-red-400 text-xl">
                  ❌ {errors.updates}
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xl">
                  No updates available
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {updates.map((update) => (
                    <Card key={update.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-yellow-400">{update.title}</CardTitle>
                          <span className="text-sm text-gray-400">
                            {formatDate(update.created_at)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed">{update.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <img 
                        src="https://i.ibb.co/CsB7SJp0/best.png" 
                        alt="LQR SPORT" 
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-white">LQR SPORT</h3>
                        <p className="text-gray-400">Haitian Media Hub</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-lg font-semibold text-white">mail.lqrsport@dr.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Support</p>
                        <p className="text-lg font-semibold text-white">We're here to help</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Serving</p>
                        <p className="text-lg font-semibold text-white">Haiti & Worldwide</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>About LQR SPORT</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      LQR SPORT is your premier destination for Haitian media content, offering 
                      live streaming, radio stations, and the latest updates from Haiti and beyond.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Get in touch with us for any questions, feedback, or support regarding our 
                      streaming services. We're committed to providing you with the best Haitian 
                      media experience.
                    </p>
                    
                    <div className="pt-4 border-t border-gray-600">
                      <h4 className="font-semibold text-white mb-2">Copyright Disclaimer</h4>
                      <p className="text-sm text-gray-400">
                        All channels featured on LQR SPORT are publicly available from the internet. 
                        We do not host, own, or claim any rights over the content displayed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoPlayer}
        streamUrl={currentStreamUrl}
        title={currentStreamTitle}
        platform="desktop"
      />
    </div>
  );
}
