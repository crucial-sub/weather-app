'use client';

// 메인 페이지 - 현재 위치 날씨 및 즐겨찾기 표시
import { useState, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { MapPin, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { useGeolocation } from '@/features/geolocation';
import { useCurrentWeather, useHourlyForecast, useDailyForecast } from '@/entities/weather';
import { useReverseGeocode } from '@/entities/location';
import { WeatherCard } from '@/widgets/weather-card';
import { HourlyForecast } from '@/widgets/hourly-forecast';
import { WeeklyForecast } from '@/widgets/weekly-forecast';
import { FavoritesGrid } from '@/widgets/favorites-grid';
import { ThemeToggle } from '@/shared/ui';
import type { Location } from '@/entities/location';
import dynamic from 'next/dynamic';

// SearchModal은 검색 아이콘 클릭 시에만 필요하므로 동적 import로 초기 번들에서 분리
const SearchModal = dynamic(
  () => import('@/widgets/search-modal/ui/search-modal').then(m => ({ default: m.SearchModal })),
  { ssr: false }
);

// 검색 버튼 hover/focus 시 SearchModal 청크 프리로드
const preloadSearchModal = () => {
  void import('@/widgets/search-modal/ui/search-modal');
};

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 현재 위치 감지
  const {
    lat: geoLat,
    lon: geoLon,
    loading: isGeoLoading,
    error: geoError,
    refresh: requestLocation,
  } = useGeolocation();

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

  // 장소 선택 핸들러
  const handleSelectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  // 현재 위치로 돌아가기
  const handleBackToCurrentLocation = useCallback(() => {
    setSelectedLocation(null);
    requestLocation();
  }, [requestLocation]);

  // 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // 선택된 위치가 없으면 현재 위치도 다시 요청
      if (!selectedLocation) {
        requestLocation();
      }
      await refetchWeather();
      toast.success('날씨 정보가 업데이트되었습니다.', { duration: 2000 });
    } catch {
      toast.error('날씨 정보를 갱신하지 못했습니다.', { duration: 3000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 검색 모달 열기 핸들러
  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // 로딩 상태
  const isLoading = isGeoLoading || (hasLocation && isWeatherLoading);

  // 에러 상태 (위치/날씨 에러를 분리 처리)

  return (
    <div className="min-h-screen bg-gradient-to-br from-weather-gradient-from to-weather-gradient-to">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-weather-glass backdrop-blur-md border-b">
        <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between responsive-transition">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-weather-accent-blue" />
            <h1 className="font-semibold text-weather-text-primary">
              {displayLocation?.name || '위치 확인 중...'}
            </h1>
            {selectedLocation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-weather-text-muted"
                onClick={handleBackToCurrentLocation}
              >
                현재 위치로
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSearch}
              onMouseEnter={preloadSearchModal}
              onFocus={preloadSearchModal}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6 responsive-transition">
        {/* 로딩 상태 */}
        {isLoading && !currentWeather ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-weather-accent-blue mb-4" />
            <p className="text-weather-text-muted">
              {isGeoLoading ? '현재 위치를 확인하고 있습니다...' : '날씨 정보를 불러오는 중...'}
            </p>
          </motion.div>
        ) : null}

        {/* 위치 에러 상태 - 위치 권한/감지 실패 */}
        {geoError && !currentWeather && !selectedLocation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-weather-error-bg border border-weather-error-border rounded-xl p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-weather-error-icon mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-weather-error-text mb-2">
              위치 정보를 가져올 수 없습니다
            </h2>
            <p className="text-weather-error-text-sub text-sm mb-4">
              위치 권한을 허용해주세요.
            </p>
            <Button onClick={requestLocation} variant="outline">
              다시 시도
            </Button>
          </motion.div>
        ) : null}

        {/* 날씨 API 에러 상태 */}
        {weatherError && !currentWeather ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-weather-error-bg border border-weather-error-border rounded-xl p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-weather-error-icon mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-weather-error-text mb-2">
              해당 장소의 정보가 제공되지 않습니다.
            </h2>
            <p className="text-weather-error-text-sub text-sm mb-4">
              다른 장소를 검색해보세요.
            </p>
            <Button onClick={() => setIsSearchOpen(true)} variant="outline">
              장소 검색
            </Button>
          </motion.div>
        ) : null}

        {/* 날씨 정보 */}
        {currentWeather ? (
          <LayoutGroup>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0"
            >
              {/* 좌측 패널 - 현재 날씨 카드 */}
              <motion.div layout className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
                <WeatherCard
                  weather={currentWeather}
                  locationName={displayLocation?.name || ''}
                  isLoading={isWeatherLoading}
                  todayTempMin={dailyForecast?.[0]?.tempMin}
                  todayTempMax={dailyForecast?.[0]?.tempMax}
                />
              </motion.div>

              {/* 우측 패널 - 예보 + 즐겨찾기 */}
              <motion.div layout className="lg:col-span-8 space-y-6">
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
                <FavoritesGrid onAddClick={handleOpenSearch} />
              </motion.div>
            </motion.div>
          </LayoutGroup>
        ) : null}

        {/* 위치 권한 요청 안내 (위치 정보 없을 때) */}
        {!hasLocation && !isLoading && !geoError && !weatherError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-weather-glass-solid rounded-xl p-8 text-center shadow-sm"
          >
            <MapPin className="h-16 w-16 text-weather-accent-blue mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-weather-text-primary mb-2">
              위치 권한이 필요합니다
            </h2>
            <p className="text-weather-text-muted mb-6">
              현재 위치의 날씨를 확인하려면 위치 권한을 허용해주세요.
            </p>
            <Button onClick={requestLocation} className="w-full">
              위치 권한 허용하기
            </Button>
          </motion.div>
        ) : null}
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
