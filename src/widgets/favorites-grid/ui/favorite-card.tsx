'use client';

// 즐겨찾기 카드 컴포넌트
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Pencil, Check } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatTemperature, getWeatherIconUrl } from '@/shared/lib';
import { useCurrentWeather } from '@/entities/weather';
import { useFavoritesStore } from '@/features/manage-favorites';
import type { Favorite } from '@/entities/location';

interface FavoriteCardProps {
  favorite: Favorite;
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [alias, setAlias] = useState(favorite.alias || '');
  const { removeFavorite, updateAlias } = useFavoritesStore();
  const { data: weather, isLoading } = useCurrentWeather(favorite.lat, favorite.lon);

  const handleSaveAlias = () => {
    updateAlias(favorite.id, alias);
    setIsEditing(false);
  };

  const displayName = favorite.alias || favorite.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="p-4 bg-white/80 backdrop-blur-sm relative group lg:hover:shadow-md lg:transition-shadow lg:duration-200">
        {/* 삭제 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
          onClick={() => removeFavorite(favorite.id)}
        >
          <X className="h-4 w-4" />
        </Button>

        <Link href={`/location/${favorite.id}`} className="block">
          {/* 이름/별칭 */}
          {isEditing ? (
            <div className="flex gap-1 mb-2" onClick={(e) => e.preventDefault()}>
              <Input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="h-7 text-sm"
                placeholder="별칭 입력"
              />
              <Button size="icon" className="h-7 w-7" onClick={handleSaveAlias}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-2">
              <p className="text-sm font-medium text-gray-700 truncate flex-1">
                {displayName}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* 날씨 정보 */}
          {isLoading ? (
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-12" />
            </div>
          ) : weather ? (
            <div className="flex items-center justify-between">
              <Image
                src={getWeatherIconUrl(weather.icon)}
                alt={weather.description}
                width={40}
                height={40}
              />
              <div className="text-right">
                <p className="text-2xl font-light">
                  {formatTemperature(weather.temperature)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTemperature(weather.tempMin)} / {formatTemperature(weather.tempMax)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">날씨 정보 없음</p>
          )}
        </Link>
      </Card>
    </motion.div>
  );
}
