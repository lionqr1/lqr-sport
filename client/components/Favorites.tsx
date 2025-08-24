import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getFavorites, removeFromFavorites, type FavoriteItem } from "@/lib/favorites";
import { 
  Heart, 
  Play, 
  Radio as RadioIcon, 
  Users, 
  Search, 
  Trash2,
  HeartOff
} from "lucide-react";

interface FavoritesProps {
  onPlay: (url: string, title: string) => void;
}

export default function Favorites({ onPlay }: FavoritesProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favs = getFavorites();
    setFavorites(favs);
  };

  const handleRemove = (id: number, type: string) => {
    if (confirm('Remove from favorites?')) {
      removeFromFavorites(id, type);
      loadFavorites();
    }
  };

  const handlePlay = (item: FavoriteItem) => {
    const url = item.stream_url || item.live_url || '';
    const title = item.name || item.title || '';
    if (url) {
      onPlay(url, title);
    }
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio': return RadioIcon;
      case 'channel': return Users;
      case 'stream': return Play;
      default: return Play;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'radio': return 'bg-purple-600';
      case 'channel': return 'bg-blue-600';
      case 'stream': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeCounts = () => {
    return {
      all: favorites.length,
      channel: favorites.filter(f => f.type === 'channel').length,
      stream: favorites.filter(f => f.type === 'stream').length,
      radio: favorites.filter(f => f.type === 'radio').length,
    };
  };

  const counts = getTypeCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Favorites</h2>
          <p className="text-gray-400">Your saved channels, streams, and radio stations</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-orange-600 hover:bg-orange-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
          >
            All ({counts.all})
          </Button>
          <Button
            variant={filter === 'channel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('channel')}
            className={filter === 'channel' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
          >
            <Users className="w-3 h-3 mr-1" />
            Channels ({counts.channel})
          </Button>
          <Button
            variant={filter === 'stream' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('stream')}
            className={filter === 'stream' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
          >
            <Play className="w-3 h-3 mr-1" />
            Streams ({counts.stream})
          </Button>
          <Button
            variant={filter === 'radio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('radio')}
            className={filter === 'radio' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
          >
            <RadioIcon className="w-3 h-3 mr-1" />
            Radio ({counts.radio})
          </Button>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <HeartOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'No matches found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start adding channels, streams, and radio stations to your favorites!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map((item) => {
            const Icon = getTypeIcon(item.type);
            return (
              <Card key={`${item.type}-${item.id}`} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Logo or Icon */}
                    <div className="flex-shrink-0">
                      {item.logo_url ? (
                        <img 
                          src={item.logo_url} 
                          alt={item.name || item.title}
                          className="w-12 h-12 object-contain rounded"
                        />
                      ) : (
                        <div className={`w-12 h-12 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {item.name || item.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`${getTypeColor(item.type)} text-white text-xs`}
                        >
                          {item.type.toUpperCase()}
                        </Badge>
                        {(item.stream_url || item.live_url) && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                            LIVE
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {(item.stream_url || item.live_url) && (
                        <Button
                          size="sm"
                          onClick={() => handlePlay(item)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(item.id, item.type)}
                        className="border-red-600 text-red-400 hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
