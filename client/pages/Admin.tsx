import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminLogin from "@/components/AdminLogin";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase, type Channel, type LiveTV, type Radio, type Update, type Team, type League, type Match, type MatchSource, type Message } from "@/lib/supabase";
import { 
  Shield, 
  BarChart3, 
  Users,
  Radio as RadioIcon,
  Tv,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  TrendingUp,
  Clock,
  Loader2,
  Database,
  Activity,
  Globe,
  Trophy,
  Calendar,
  Mail
} from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [liveTV, setLiveTV] = useState<LiveTV[]>([]);
  const [radio, setRadio] = useState<Radio[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchSources, setMatchSources] = useState<MatchSource[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Form states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalChannels: 0,
    totalStreams: 0,
    totalRadio: 0,
    totalUpdates: 0,
    onlineRadio: 0,
    recentActivity: []
  });

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const [channelsRes, liveRes, radioRes, updatesRes, teamsRes, leaguesRes, matchesRes, matchSrcRes, messagesRes] = await Promise.all([
        supabase.from('tv_channels').select('*').order('name'),
        supabase.from('live_tv').select('*').order('name'),
        supabase.from('radio').select('*').order('title'),
        supabase.from('updates').select('*').order('created_at', { ascending: false }),
        supabase.from('teams').select('*').order('name'),
        supabase.from('leagues').select('*').order('name'),
        supabase.from('matches').select('*').order('match_time', { ascending: true }),
        supabase.from('match_sources').select('*'),
        supabase.from('messages').select('*').order('created_at', { ascending: false })
      ]);

      if (channelsRes.data) setChannels(channelsRes.data);
      if (liveRes.data) setLiveTV(liveRes.data);
      if (radioRes.data) setRadio(radioRes.data);
      if (updatesRes.data) setUpdates(updatesRes.data);
      if (teamsRes.data) setTeams(teamsRes.data);
      if (leaguesRes.data) setLeagues(leaguesRes.data);
      if (matchesRes.data) setMatches(matchesRes.data);
      if (matchSrcRes.data) setMatchSources(matchSrcRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);

      // Update analytics
      setAnalytics({
        totalChannels: channelsRes.data?.length || 0,
        totalStreams: liveRes.data?.length || 0,
        totalRadio: radioRes.data?.length || 0,
        totalUpdates: updatesRes.data?.length || 0,
        onlineRadio: radioRes.data?.length || 0, // Simplified for now
        recentActivity: updatesRes.data?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // CRUD Operations
  const handleCreate = async (table: string, data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from(table)
        .insert([data]);
      
      if (error) throw error;
      
      await fetchAllData();
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (table: string, id: number, data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (table: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Initialize admin panel
  useEffect(() => {
    const initAdmin = async () => {
      // Show loading for 2 seconds minimum
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    
    initAdmin();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen isLoading={true} text="Initializing Admin Panel" />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderForm = (type: string, item?: any) => {
    const isEdit = !!item;
    const currentData = formData;

    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{isEdit ? 'Edit' : 'Add'} {type}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'Channel' && (
            <>
              <Input
                placeholder="Channel Name"
                value={currentData.name || ''}
                onChange={(e) => setFormData({...currentData, name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Stream URL"
                value={currentData.stream_url || ''}
                onChange={(e) => setFormData({...currentData, stream_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Logo URL (optional)"
                value={currentData.logo_url || ''}
                onChange={(e) => setFormData({...currentData, logo_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </>
          )}

          {type === 'Stream' && (
            <>
              <Input
                placeholder="Stream Name"
                value={currentData.name || ''}
                onChange={(e) => setFormData({...currentData, name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Stream URL"
                value={currentData.stream_url || ''}
                onChange={(e) => setFormData({...currentData, stream_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Logo URL (optional)"
                value={currentData.logo_url || ''}
                onChange={(e) => setFormData({...currentData, logo_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </>
          )}

          {type === 'Radio' && (
            <>
              <Input
                placeholder="Radio Station Title"
                value={currentData.title || ''}
                onChange={(e) => setFormData({...currentData, title: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Live Stream URL"
                value={currentData.live_url || ''}
                onChange={(e) => setFormData({...currentData, live_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </>
          )}

          {type === 'Update' && (
            <>
              <Input
                placeholder="Update Title"
                value={currentData.title || ''}
                onChange={(e) => setFormData({...currentData, title: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Textarea
                placeholder="Update Message"
                value={currentData.message || ''}
                onChange={(e) => setFormData({...currentData, message: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              />
            </>
          )}

          {type === 'Team' && (
            <>
              <Input
                placeholder="Team Name"
                value={currentData.name || ''}
                onChange={(e) => setFormData({...currentData, name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Logo URL (optional)"
                value={currentData.logo_url || ''}
                onChange={(e) => setFormData({...currentData, logo_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </>
          )}

          {type === 'League' && (
            <>
              <Input
                placeholder="League Name"
                value={currentData.name || ''}
                onChange={(e) => setFormData({...currentData, name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Logo URL (optional)"
                value={currentData.logo_url || ''}
                onChange={(e) => setFormData({...currentData, logo_url: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </>
          )}

          {type === 'Match' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={currentData.home_team_id || ''}
                  onChange={(e) => setFormData({ ...currentData, home_team_id: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white rounded p-2"
                >
                  <option value="" disabled>Home Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select
                  value={currentData.away_team_id || ''}
                  onChange={(e) => setFormData({ ...currentData, away_team_id: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white rounded p-2"
                >
                  <option value="" disabled>Away Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={currentData.league_id || ''}
                  onChange={(e) => setFormData({ ...currentData, league_id: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white rounded p-2"
                >
                  <option value="" disabled>League</option>
                  {leagues.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={currentData.match_time ? new Date(currentData.match_time).toISOString().slice(0,16) : ''}
                  onChange={(e) => setFormData({ ...currentData, match_time: new Date(e.target.value).toISOString() })}
                  className="bg-gray-700 border-gray-600 text-white rounded p-2"
                />
              </div>
            </>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                const table = type === 'Channel' ? 'tv_channels' :
                           type === 'Stream' ? 'live_tv' :
                           type === 'Radio' ? 'radio' :
                           type === 'Team' ? 'teams' :
                           type === 'League' ? 'leagues' :
                           type === 'Match' ? 'matches' : 'updates';
                
                if (isEdit) {
                  handleUpdate(table, item.id, currentData);
                } else {
                  handleCreate(table, currentData);
                }
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEdit ? 'Update' : 'Create'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null);
                setFormData({});
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDataTable = (data: any[], type: string, table: string) => (
    <div className="space-y-4">
      {data.map((item) => (
        <Card key={item.id} className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {item.name || item.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {item.stream_url || item.live_url || item.message}
                </p>
                {item.created_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(item);
                    setFormData(item);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(table, item.id)}
                  className="border-red-600 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Header */}
      <header className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">LQR SPORT Admin</h1>
              <p className="text-sm text-gray-400">Management Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-600 text-white">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAuthenticated(false);
                setActiveTab('dashboard');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8 bg-gray-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-orange-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-orange-600">
              <Tv className="w-4 h-4 mr-2" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="streams" className="data-[state=active]:bg-orange-600">
              <Globe className="w-4 h-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="radio" className="data-[state=active]:bg-orange-600">
              <RadioIcon className="w-4 h-4 mr-2" />
              Radio
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-orange-600">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="leagues" className="data-[state=active]:bg-orange-600">
              <Trophy className="w-4 h-4 mr-2" />
              Leagues
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-orange-600">
              <Calendar className="w-4 h-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-orange-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Updates
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-orange-600">
              <Mail className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">TV Channels</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalChannels}</p>
                      </div>
                      <Tv className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Live Streams</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalStreams}</p>
                      </div>
                      <Globe className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Radio Stations</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalRadio}</p>
                      </div>
                      <RadioIcon className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Updates</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalUpdates}</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivity.map((update: any) => (
                      <div key={update.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{update.title}</p>
                          <p className="text-sm text-gray-400">{update.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">TV Channels Management</h2>
                <Button
                  onClick={() => { setEditingItem('new'); setFormData({}); }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Channel
                </Button>
              </div>

              {editingItem && renderForm('Channel', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(channels, 'Channel', 'tv_channels')}
            </div>
          </TabsContent>

          {/* Streams Tab */}
          <TabsContent value="streams">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Live Streams Management</h2>
                <Button
                  onClick={() => { setEditingItem('new'); setFormData({}); }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stream
                </Button>
              </div>

              {editingItem && renderForm('Stream', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(liveTV, 'Stream', 'live_tv')}
            </div>
          </TabsContent>

          {/* Radio Tab */}
          <TabsContent value="radio">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Radio Stations Management</h2>
                <Button
                  onClick={() => { setEditingItem('new'); setFormData({}); }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Radio Station
                </Button>
              </div>

              {editingItem && renderForm('Radio', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(radio, 'Radio', 'radio')}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Teams Management</h2>
                <Button onClick={() => setEditingItem('new')} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team
                </Button>
              </div>
              {editingItem && renderForm('Team', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(teams, 'Team', 'teams')}
            </div>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Leagues Management</h2>
                <Button onClick={() => setEditingItem('new')} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add League
                </Button>
              </div>
              {editingItem && renderForm('League', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(leagues, 'League', 'leagues')}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Matches Management</h2>
                <Button onClick={() => setEditingItem('new')} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Match
                </Button>
              </div>

              {editingItem && renderForm('Match', editingItem === 'new' ? null : editingItem)}

              {/* Matches list with sources management */}
              <div className="space-y-4">
                {matches.map((m) => {
                  const home = teams.find(t => t.id === m.home_team_id);
                  const away = teams.find(t => t.id === m.away_team_id);
                  const league = leagues.find(l => l.id === m.league_id);
                  const sources = matchSources.filter(s => s.match_id === m.id);
                  return (
                    <Card key={m.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{home?.name} vs {away?.name}</h3>
                            <p className="text-sm text-gray-400">{league?.name} • {new Date(m.match_time).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingItem(m); setFormData(m); }} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete('matches', m.id)} className="border-red-600 text-red-400 hover:bg-red-900">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Add source */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          <select id={`type-${m.id}`} className="bg-gray-700 border-gray-600 text-white rounded p-2">
                            <option value="channel">Channel</option>
                            <option value="stream">Stream</option>
                          </select>
                          <select id={`source-${m.id}`} className="bg-gray-700 border-gray-600 text-white rounded p-2 md:col-span-2">
                            {[...channels.map(c => ({ id: c.id, name: c.name, type: 'channel' as const })), ...liveTV.map(s => ({ id: s.id, name: s.name, type: 'stream' as const }))].map(opt => (
                              <option key={`${opt.type}-${opt.id}`} value={`${opt.type}:${opt.id}`}>{opt.name} ({opt.type})</option>
                            ))}
                          </select>
                          <input id={`label-${m.id}`} placeholder="Label (optional)" className="bg-gray-700 border-gray-600 text-white rounded p-2" />
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              const srcEl = document.getElementById(`source-${m.id}`) as HTMLSelectElement | null;
                              const labelEl = document.getElementById(`label-${m.id}`) as HTMLInputElement | null;
                              if (!srcEl) return;
                              const [stype, sid] = srcEl.value.split(':');
                              const payload: any = { match_id: m.id, source_type: stype, source_id: Number(sid) };
                              if (labelEl && labelEl.value) payload.label = labelEl.value;
                              const { error } = await supabase.from('match_sources').insert([payload]);
                              if (!error) fetchAllData();
                            }}
                          >
                            Add Source
                          </Button>
                        </div>

                        {/* Current sources */}
                        <div className="space-y-2">
                          {sources.length === 0 ? (
                            <p className="text-sm text-gray-500">No sources added yet.</p>
                          ) : (
                            sources.map(s => {
                              const name = s.source_type === 'channel' ? channels.find(c => c.id === s.source_id)?.name : liveTV.find(v => v.id === s.source_id)?.name;
                              return (
                                <div key={s.id} className="flex items-center justify-between bg-gray-700 rounded p-2">
                                  <span className="text-sm text-white">{s.label || name || `${s.source_type} #${s.source_id}`}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleDelete('match_sources', s.id)} className="border-red-600 text-red-400 hover:bg-red-900">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Updates Management</h2>
                <Button
                  onClick={() => { setEditingItem('new'); setFormData({}); }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </div>

              {editingItem && renderForm('Update', editingItem === 'new' ? null : editingItem)}
              {renderDataTable(updates, 'Update', 'updates')}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Messages</h2>
              <div className="space-y-4">
                {messages.map(msg => (
                  <Card key={msg.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{msg.email}</p>
                        <p className="text-gray-300 mt-1 whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDelete('messages', msg.id)} className="border-red-600 text-red-400 hover:bg-red-900">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {messages.length === 0 && (
                  <p className="text-gray-400">No messages yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
