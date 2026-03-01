'use client';

// 장소 검색 모달 위젯
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useLocationSearch } from '@/features/search-location';
import { useFavoritesStore } from '@/features/manage-favorites';
import { getDisplayName, type District } from '@/shared/constants';
import type { Location } from '@/entities/location';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLocation: (location: Location) => void;
}

export function SearchModal({ open, onOpenChange, onSelectLocation }: SearchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { query, setQuery, results, getLocationWithCoords, isSearching } = useLocationSearch();
  const { addFavorite, canAddMore, isFavoriteByFullName, removeFavoriteByFullName } = useFavoritesStore();

  const handleSelectDistrict = async (district: District) => {
    setIsLoading(true);

    try {
      const location = await getLocationWithCoords(district);

      if (!location) {
        toast.error('해당 장소의 정보가 제공되지 않습니다.');
        return;
      }

      onSelectLocation(location);
      onOpenChange(false);
      setQuery('');
    } catch {
      toast.error('위치 정보를 가져올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 즐겨찾기 토글 (추가/제거)
  const handleToggleFavorite = async (district: District, e: React.MouseEvent) => {
    e.stopPropagation();

    // 이미 즐겨찾기된 항목이면 제거
    if (isFavoriteByFullName(district.fullName)) {
      removeFavoriteByFullName(district.fullName);
      toast.success('즐겨찾기에서 제거되었습니다.');
      return;
    }

    if (!canAddMore()) {
      toast.error('즐겨찾기는 최대 6개까지 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const location = await getLocationWithCoords(district);

      if (!location) {
        toast.error('해당 장소의 정보가 제공되지 않습니다.');
        return;
      }

      const success = addFavorite(location);

      if (success) {
        toast.success('즐겨찾기에 추가되었습니다.');
      }
    } catch {
      toast.error('추가할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md lg:max-w-lg">
        <DialogHeader>
          <DialogTitle>장소 검색</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="시, 구, 동으로 검색 (예: 종로구, 청운동)"
              className="pl-10"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          {/* 검색 결과 */}
          <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto space-y-1">
            <AnimatePresence>
              {results.length > 0 ? (
                results.map((district, index) => (
                  <motion.div
                    key={district.fullName}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-left cursor-pointer touch-manipulation"
                      onClick={() => !isLoading && handleSelectDistrict(district)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {getDisplayName(district)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {district.fullName.replace(/-/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleToggleFavorite(district, e)}
                        disabled={isLoading}
                        aria-label={isFavoriteByFullName(district.fullName) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                      >
                        <Star className={`h-4 w-4 ${isFavoriteByFullName(district.fullName) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : query && !isSearching ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  검색 결과가 없습니다.
                </p>
              ) : !query ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  검색어를 입력해주세요.
                </p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
