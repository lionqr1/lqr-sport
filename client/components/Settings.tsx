import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportFavorites, importFavorites, clearFavorites, getFavorites, removeFromFavorites, type FavoriteItem } from "@/lib/favorites";
import {
  Download,
  Upload,
  Trash2,
  Save,
  Database,
  Settings as SettingsIcon,
  Heart,
  AlertCircle,
  CheckCircle2,
  Play,
  Users,
  Radio as RadioIcon
} from "lucide-react";

export default function Settings() {
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadFavorites = () => setFavorites(getFavorites());
  useEffect(() => { loadFavorites(); }, []);

  const handleExport = () => {
    try {
      const data = exportFavorites();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lqr-sport-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Favorites exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export favorites.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Please paste your data first.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsProcessing(true);
    
    try {
      const success = importFavorites(importData);
      if (success) {
        setMessage({ type: 'success', text: 'Favorites imported successfully!' });
        setImportData("");
      } else {
        setMessage({ type: 'error', text: 'Invalid data format. Please check your data.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import favorites.' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      const success = clearFavorites();
      if (success) {
        setMessage({ type: 'success', text: 'All favorites cleared successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to clear favorites.' });
      }
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400">Manage your data and preferences</p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <Alert className={`border ${
          message.type === 'success' 
            ? 'border-green-600/50 bg-green-600/10' 
            : 'border-red-600/50 bg-red-600/10'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={
            message.type === 'success' ? 'text-green-300' : 'text-red-300'
          }>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-400" />
              <span>Export Your Data</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Download your favorites and settings as a backup file.
            </p>
            <Button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Favorites
            </Button>
          </div>

          <div className="border-t border-gray-700 pt-6">
            {/* Import Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Import Your Data</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Paste your exported data below to restore your favorites.
              </p>
              
              <Textarea
                placeholder="Paste your exported favorites data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
              />
              
              <Button
                onClick={handleImport}
                disabled={!importData.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Favorites
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            {/* Clear Data Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <span>Clear All Data</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Remove all favorites and reset your preferences. This action cannot be undone.
              </p>
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Favorites
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Your Favorites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-gray-400">No favorites yet.</p>
          ) : (
            <div className="space-y-3">
              {favorites.map((f) => (
                <div key={`${f.type}-${f.id}`} className="flex items-center justify-between bg-gray-700 rounded p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.type==='radio' ? 'bg-purple-600' : f.type==='channel' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {f.type==='radio' ? <RadioIcon className="w-4 h-4 text-white" /> : f.type==='channel' ? <Users className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{f.name || f.title}</p>
                      <p className="text-xs text-gray-300 uppercase">{f.type}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { removeFromFavorites(f.id, f.type); loadFavorites(); }}
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
