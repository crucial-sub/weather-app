'use client';

// 메인 페이지 - 현재 위치 날씨 및 즐겨찾기 표시
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useGeolocation } from '@/features/geolocation';
import { useFavoritesStore } from '@/features/manage-favorites';
import { useCurrentWeather, useHourlyForecast, useDailyForecast } from '@/entities/weather';
import { useReverseGeocode } from '@/entities/location';
import { WeatherCard } from '@/widgets/weather-card';
import { HourlyForecast } from '@/widgets/hourly-forecast';
import { WeeklyForecast } from '@/widgets/weekly-forecast';
import { FavoritesGrid } from '@/widgets/favorites-grid';
import { SearchModal } from '@/widgets/search-modal';
import type { Location } from '@/entities/location';

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // 현재 위치 감지
  const {
    lat: geoLat,
    lon: geoLon,
    loading: isGeoLoading,
    error: geoError,
    refresh: requestLocation,
  } = useGeolocation();

  // 즐겨찾기 스토어
  const { setCurrentLocation } = useFavoritesStore();

  // 현재 위치 유무 확인
  const hasGeoLocation = geoLat !== null && geoLon !== null;

  // 역지오코딩 (좌표 → 지명)
  const { data: geoLocation } = useReverseGeocode(
    geoLat ?? 0,
    geoLon ?? 0,
    { enabled: hasGeoLocation }
  );

  // 표시할 위치 결정 (선택된 위치 > 현재 위치)
  const displayLocation = selectedLocation || geoLocation;
  const lat = selectedLocation?.lat ?? geoLat ?? 0;
  const lon = selectedLocation?.lon ?? geoLon ?? 0;
  const hasLocation = !!selectedLocation || hasGeoLocation;

  // 날씨 데이터 조회
  const {
    data: currentWeather,
    isLoading: isWeatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useCurrentWeather(lat, lon, { enabled: hasLocation });

  const {
    data: hourlyForecast,
    isLoading: isHourlyLoading,
  } = useHourlyForecast(lat, lon, { enabled: hasLocation });

  const {
    data: dailyForecast,
    isLoading: isDailyLoading,
  } = useDailyForecast(lat, lon, { enabled: hasLocation });

  // 현재 위치가 변경되면 스토어에 저장
  useEffect(() => {
    if (geoLocation && !selectedLocation) {
      setCurrentLocation(geoLocation);
    }
  }, [geoLocation, selectedLocation, setCurrentLocation]);

  // 장소 선택 핸들러
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  // 현재 위치로 돌아가기
  const handleBackToCurrentLocation = () => {
    setSelectedLocation(null);
    requestLocation();
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    refetchWeather();
  };

  // 로딩 상태
  const isLoading = isGeoLoading || (hasLocation && isWeatherLoading);

  // 에러 상태
  const error = geoError || weatherError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h1 className="font-semibold text-gray-800">
              {displayLocation?.name || '위치 확인 중...'}
            </h1>
            {selectedLocation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={handleBackToCurrentLocation}
              >
                현재 위치로
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 로딩 상태 */}
        {isLoading && !currentWeather && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">
              {isGeoLoading ? '현재 위치를 확인하고 있습니다...' : '날씨 정보를 불러오는 중...'}
            </p>
          </motion.div>
        )}

        {/* 에러 상태 */}
        {error && !currentWeather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              위치 정보를 가져올 수 없습니다
            </h2>
            <p className="text-red-600 text-sm mb-4">
              {geoError || '위치 권한을 허용해주세요.'}
            </p>
            <Button onClick={requestLocation} variant="outline">
              다시 시도
            </Button>
          </motion.div>
        )}

        {/* 날씨 정보 */}
        {currentWeather && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 현재 날씨 카드 */}
            <WeatherCard
              weather={currentWeather}
              locationName={displayLocation?.name || ''}
              isLoading={isWeatherLoading}
            />

            {/* 시간대별 예보 */}
            <HourlyForecast
              forecast={hourlyForecast || []}
              isLoading={isHourlyLoading}
            />

            {/* 주간 예보 */}
            <WeeklyForecast
              forecast={dailyForecast || []}
              isLoading={isDailyLoading}
            />

            {/* 즐겨찾기 그리드 */}
            <FavoritesGrid onAddClick={() => setIsSearchOpen(true)} />
          </motion.div>
        )}

        {/* 위치 권한 요청 안내 (위치 정보 없을 때) */}
        {!hasLocation && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 text-center shadow-sm"
          >
            <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              위치 권한이 필요합니다
            </h2>
            <p className="text-gray-500 mb-6">
              현재 위치의 날씨를 확인하려면 위치 권한을 허용해주세요.
            </p>
            <Button onClick={requestLocation} className="w-full">
              위치 권한 허용하기
            </Button>
          </motion.div>
        )}
      </main>

      {/* 검색 모달 */}
      <SearchModal
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
