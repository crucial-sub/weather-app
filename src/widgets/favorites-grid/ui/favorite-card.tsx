'use client';

// 즐겨찾기 카드 컴포넌트
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { EllipsisVertical, Pencil, Trash2, Check } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { formatTemperature, getWeatherIconUrl } from '@/shared/lib/format';
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

  // 별칭 저장 핸들러
  const handleSaveAlias = () => {
    updateAlias(favorite.id, alias);
    setIsEditing(false);
  };

  // 키보드 이벤트 핸들러 (Enter로 저장, Escape로 취소)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAlias();
    } else if (e.key === 'Escape') {
      setAlias(favorite.alias || '');
      setIsEditing(false);
    }
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
      <Card className="p-4 bg-white/80 backdrop-blur-sm relative min-h-[100px] lg:hover:shadow-md lg:transition-shadow lg:duration-200">
        {/* 더보기 메뉴 */}
        <div className="absolute top-1 right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400"
                aria-label="즐겨찾기 옵션"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                별칭 편집
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => removeFavorite(favorite.id)}
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/location/${favorite.id}`} className="block">
          {/* 이름/별칭 */}
          {isEditing ? (
            <div className="flex gap-1 mb-2" onClick={(e) => e.preventDefault()}>
              <Input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 text-sm"
                placeholder="별칭 입력"
                autoFocus
                aria-label="즐겨찾기 별칭 입력"
              />
              <Button size="icon" className="h-7 w-7" onClick={handleSaveAlias}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-700 truncate mb-2 pr-6">
              {displayName}
            </p>
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
            <div className="h-[48px] flex items-center">
              <p className="text-xs text-gray-400">날씨 정보 없음</p>
            </div>
          )}
        </Link>
      </Card>
    </motion.div>
  );
}
