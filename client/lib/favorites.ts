export interface FavoriteItem {
  id: number;
  name: string;
  type: 'channel' | 'stream' | 'radio';
  stream_url?: string;
  live_url?: string;
  logo_url?: string;
  title?: string;
}

const FAVORITES_KEY = 'lqr_sport_favorites';

export const getFavorites = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const addToFavorites = (item: FavoriteItem): boolean => {
  try {
    const favorites = getFavorites();
    const exists = favorites.some(fav => fav.id === item.id && fav.type === item.type);
    
    if (exists) return false;
    
    favorites.push(item);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = (id: number, type: string): boolean => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => !(fav.id === id && fav.type === type));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = (id: number, type: string): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === id && fav.type === type);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const exportFavorites = (): string => {
  try {
    const favorites = getFavorites();
    return JSON.stringify(favorites, null, 2);
  } catch (error) {
    console.error('Error exporting favorites:', error);
    return '[]';
  }
};

export const importFavorites = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(parsed));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing favorites:', error);
    return false;
  }
};

export const clearFavorites = (): boolean => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};
