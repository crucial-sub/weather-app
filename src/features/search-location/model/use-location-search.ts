// 장소 검색 훅
import { useState, useMemo } from 'react';
import { useDebounce } from '@/shared/hooks';
import { searchDistricts, getDisplayName, type District } from '@/shared/constants';
import { fetchGeocode } from '@/shared/api';
import type { Location } from '@/entities/location';

export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // 로컬 검색 결과 (korea_districts.json)
  const localResults = useMemo(() => {
    if (!debouncedQuery) return [];
    return searchDistricts(debouncedQuery);
  }, [debouncedQuery]);

  // Geocoding API로 좌표 조회 (선택된 지역에 대해)
  const getLocationWithCoords = async (district: District): Promise<Location | null> => {
    try {
      // 구/동 단위로 검색
      const searchQuery = district.neighborhood || district.district || district.city;
      const results = await fetchGeocode(searchQuery);

      if (results.length === 0) {
        return null;
      }

      const result = results[0];
      return {
        id: `${result.lat}-${result.lon}`,
        name: getDisplayName(district),
        fullName: district.fullName,
        lat: result.lat,
        lon: result.lon,
      };
    } catch {
      return null;
    }
  };

  return {
    query,
    setQuery,
    results: localResults,
    getLocationWithCoords,
    isSearching: query !== debouncedQuery,
  };
}
