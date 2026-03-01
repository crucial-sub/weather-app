'use client';

// 즐겨찾기 그리드 위젯
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { useFavoritesStore } from '@/features/manage-favorites';
import { FavoriteCard } from './favorite-card';

interface FavoritesGridProps {
  onAddClick: () => void;
}

export const FavoritesGrid = memo(function FavoritesGrid({ onAddClick }: FavoritesGridProps) {
  const { favorites, canAddMore } = useFavoritesStore();

  if (favorites.length === 0 && !canAddMore()) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-weather-text-tertiary">⭐ 즐겨찾기</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        <AnimatePresence mode="popLayout">
          {favorites.map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} />
          ))}
        </AnimatePresence>

        {/* 추가 버튼 */}
        {canAddMore() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className="p-4 h-full min-h-[100px] flex items-center justify-center cursor-pointer border-dashed border-2 hover:border-weather-border-accent hover:bg-weather-hover-accent transition-colors"
              onClick={onAddClick}
            >
              <div className="text-center text-weather-text-placeholder">
                <Plus className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs">추가</span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-weather-text-placeholder text-right">
        {favorites.length}/6
      </p>
    </div>
  );
});
