// Zustand 즐겨찾기 스토어
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorite, Location } from '@/entities/location';

const MAX_FAVORITES = 6;

interface FavoritesState {
  favorites: Favorite[];
  currentLocation: Location | null;
  addFavorite: (location: Location) => boolean;
  removeFavorite: (id: string) => void;
  updateAlias: (id: string, alias: string) => void;
  isFavorite: (id: string) => boolean;
  canAddMore: () => boolean;
  setCurrentLocation: (location: Location) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      currentLocation: null,

      setCurrentLocation: (location) => {
        set({ currentLocation: location });
      },

      addFavorite: (location) => {
        const { favorites } = get();

        if (favorites.length >= MAX_FAVORITES) {
          return false;
        }

        if (favorites.some((f) => f.id === location.id)) {
          return false;
        }

        const favorite: Favorite = {
          ...location,
          createdAt: Date.now(),
        };

        set({ favorites: [...favorites, favorite] });
        return true;
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      updateAlias: (id, alias) => {
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.id === id ? { ...f, alias: alias.trim() || undefined } : f
          ),
        }));
      },

      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },

      canAddMore: () => {
        return get().favorites.length < MAX_FAVORITES;
      },
    }),
    {
      name: 'weather-favorites',
    }
  )
);
