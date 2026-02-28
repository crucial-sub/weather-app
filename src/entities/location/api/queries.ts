// 위치 TanStack Query 훅
import { useQuery } from '@tanstack/react-query';
import { fetchReverseGeocode, type GeocodingResponse } from '@/shared/api';
import type { Location } from '../model/types';

export const locationKeys = {
  all: ['location'] as const,
  reverse: (lat: number, lon: number) => [...locationKeys.all, 'reverse', lat, lon] as const,
};

// 쿼리 옵션 타입
interface QueryOptions {
  enabled?: boolean;
}

// GeocodingResponse → Location 변환
function transformToLocation(data: GeocodingResponse[], lat: number, lon: number): Location | null {
  if (data.length === 0) return null;

  const item = data[0];
  const name = item.local_names?.ko || item.name;

  return {
    id: `${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name,
    fullName: `${item.country}-${name}`,
    lat: item.lat,
    lon: item.lon,
  };
}

// 좌표 → 지역명 변환
export function useReverseGeocode(
  lat: number,
  lon: number,
  options: QueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: locationKeys.reverse(lat, lon),
    queryFn: () => fetchReverseGeocode(lat, lon),
    select: (data) => transformToLocation(data, lat, lon),
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: Infinity, // 좌표-지역명 매핑은 변하지 않음
  });
}
