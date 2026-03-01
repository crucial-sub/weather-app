// 위치 TanStack Query 훅
import { useQuery } from '@tanstack/react-query';
import { fetchNominatimReverse, type NominatimResponse } from '@/shared/api';
import type { Location } from '../model/types';

export const locationKeys = {
  all: ['location'] as const,
  reverse: (lat: number, lon: number) => [...locationKeys.all, 'reverse', lat, lon] as const,
};

// 쿼리 옵션 타입
interface QueryOptions {
  enabled?: boolean;
}

// Nominatim 응답 → Location 변환
// 동 이름 추출 우선순위: quarter > suburb > neighbourhood > city_district > city
function transformNominatimToLocation(data: NominatimResponse, lat: number, lon: number): Location {
  const { address } = data;

  // 간결한 주소 조합 (예: "서울시 송파구 석촌동")
  // 시/도 이름을 축약 (서울특별시 → 서울시, 경기도 → 경기)
  const cityOrState = address.city || address.state || '';
  const shortCity = cityOrState
    .replace('특별시', '시')
    .replace('광역시', '시')
    .replace('특별자치시', '시')
    .replace('특별자치도', '');

  const dong = address.quarter || address.suburb || address.neighbourhood;
  const gu = address.borough || address.city_district;

  // 표시명: "서울시 송파구 석촌동" 형태
  const nameParts = [shortCity, gu, dong].filter(Boolean);
  const name = nameParts.length > 0 ? nameParts.join(' ') : data.display_name;

  // 전체 주소 (축약 없는 원본, 구 정보도 동일하게 borough 우선)
  const fullParts = [cityOrState, gu, dong].filter(Boolean);
  const fullName = fullParts.length > 0 ? fullParts.join(' ') : data.display_name;

  return {
    id: `${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name,
    fullName,
    lat,
    lon,
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
    queryFn: () => fetchNominatimReverse(lat, lon),
    select: (data) => transformNominatimToLocation(data, lat, lon),
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: Infinity, // 좌표-지역명 매핑은 변하지 않음
  });
}
