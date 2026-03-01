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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
          <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-3 responsive-transition">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-800">위치를 찾을 수 없음</h1>
          </div>
        </header>

        <main className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 responsive-transition">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 text-center shadow-sm"
          >
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              위치를 찾을 수 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between responsive-transition">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <h1 className="font-semibold text-gray-800">{displayName}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6 responsive-transition">
        {/* 로딩 상태 */}
        {isLoading && !currentWeather && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">날씨 정보를 불러오는 중...</p>
          </motion.div>
        )}

        {/* 에러 상태 */}
        {weatherError && !currentWeather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              날씨 정보를 불러올 수 없습니다
            </h2>
            <p className="text-red-600 text-sm mb-4">
              잠시 후 다시 시도해주세요.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              뒤로 가기
            </Button>
          </motion.div>
        )}

        {/* 날씨 정보 */}
        {currentWeather && (
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
        )}
      </main>
    </div>
  );
}
