'use client';

// 즐겨찾기 위치 상세 페이지
import { useParams, useRouter } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowLeft, Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useFavoritesStore } from '@/features/manage-favorites';
import { useCurrentWeather, useHourlyForecast, useDailyForecast } from '@/entities/weather';
import { WeatherCard } from '@/widgets/weather-card';
import { HourlyForecast } from '@/widgets/hourly-forecast';
import { WeeklyForecast } from '@/widgets/weekly-forecast';
import { ThemeToggle } from '@/shared/ui';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // 즐겨찾기에서 위치 정보 가져오기
  const { favorites } = useFavoritesStore();
  const favorite = favorites.find((f) => f.id === id);

  // 날씨 데이터 조회
  const {
    data: currentWeather,
    isLoading: isWeatherLoading,
    error: weatherError,
  } = useCurrentWeather(favorite?.lat ?? 0, favorite?.lon ?? 0, {
    enabled: !!favorite,
  });

  const { data: hourlyForecast, isLoading: isHourlyLoading } = useHourlyForecast(
    favorite?.lat ?? 0,
    favorite?.lon ?? 0,
    { enabled: !!favorite }
  );

  const { data: dailyForecast, isLoading: isDailyLoading } = useDailyForecast(
    favorite?.lat ?? 0,
    favorite?.lon ?? 0,
    { enabled: !!favorite }
  );

  // 로딩 상태
  const isLoading = isWeatherLoading;

  // 즐겨찾기를 찾지 못한 경우
  if (!favorite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-weather-gradient-from to-weather-gradient-to">
        <header className="sticky top-0 z-50 bg-weather-glass backdrop-blur-md border-b">
          <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between responsive-transition">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-weather-text-primary">위치를 찾을 수 없음</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 responsive-transition">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-weather-glass-solid rounded-xl p-8 text-center shadow-sm"
          >
            <AlertCircle className="h-16 w-16 text-weather-text-placeholder mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-weather-text-primary mb-2">
              위치를 찾을 수 없습니다
            </h2>
            <p className="text-weather-text-muted mb-6">
              해당 즐겨찾기가 삭제되었거나 존재하지 않습니다.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              홈으로 돌아가기
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const displayName = favorite.alias || favorite.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-weather-gradient-from to-weather-gradient-to">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-weather-glass backdrop-blur-md border-b">
        <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between responsive-transition">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <h1 className="font-semibold text-weather-text-primary">{displayName}</h1>
            </div>
          </div>
          <ThemeToggle />
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
            <p className="text-weather-text-muted">날씨 정보를 불러오는 중...</p>
          </motion.div>
        ) : null}

        {/* 에러 상태 */}
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
            <Button onClick={() => router.back()} variant="outline">
              뒤로 가기
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
                  locationName={displayName}
                  isLoading={isWeatherLoading}
                  todayTempMin={dailyForecast?.[0]?.tempMin}
                  todayTempMax={dailyForecast?.[0]?.tempMax}
                />
              </motion.div>

              {/* 우측 패널 - 예보 */}
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
              </motion.div>
            </motion.div>
          </LayoutGroup>
        ) : null}
      </main>
    </div>
  );
}
