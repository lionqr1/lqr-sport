import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminLogin from "@/components/AdminLogin";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase, type Channel, type LiveTV, type Radio, type Update } from "@/lib/supabase";
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
  Globe
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
      const [channelsRes, liveRes, radioRes, updatesRes] = await Promise.all([
        supabase.from('tv_channels').select('*').order('name'),
        supabase.from('live_tv').select('*').order('name'),
        supabase.from('radio').select('*').order('title'),
        supabase.from('updates').select('*').order('created_at', { ascending: false })
      ]);

      if (channelsRes.data) setChannels(channelsRes.data);
      if (liveRes.data) setLiveTV(liveRes.data);
      if (radioRes.data) setRadio(radioRes.data);
      if (updatesRes.data) setUpdates(updatesRes.data);

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
    const currentData = isEdit ? item : formData;

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

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                const table = type === 'Channel' ? 'tv_channels' : 
                           type === 'Stream' ? 'live_tv' : 
                           type === 'Radio' ? 'radio' : 'updates';
                
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
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-800">
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
            <TabsTrigger value="updates" className="data-[state=active]:bg-orange-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Updates
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
                  onClick={() => setEditingItem('new')}
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
                  onClick={() => setEditingItem('new')}
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
                  onClick={() => setEditingItem('new')}
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

          {/* Updates Tab */}
          <TabsContent value="updates">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Updates Management</h2>
                <Button
                  onClick={() => setEditingItem('new')}
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
        </Tabs>
      </main>
    </div>
  );
}
