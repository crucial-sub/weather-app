'use client';

// 현재 날씨 카드 위젯
import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Droplets, Wind, Thermometer } from 'lucide-react';
import { formatTemperature, getWeatherIconUrl } from '@/shared/lib/format';
import type { Weather } from '@/entities/weather';

interface WeatherCardProps {
  weather: Weather | undefined;
  locationName: string;
  isLoading: boolean;
  error?: string | null;
  todayTempMin?: number;  // dailyForecast 기반 오늘 최저 온도
  todayTempMax?: number;  // dailyForecast 기반 오늘 최고 온도
}

// 정적 스켈레톤 JSX를 컴포넌트 외부로 호이스팅하여 매 렌더링마다 재생성 방지
const weatherCardSkeleton = (
  <Card className="p-6 space-y-4">
    <Skeleton className="h-6 w-32 mx-auto" />
    <Skeleton className="h-24 w-24 mx-auto rounded-full" />
    <Skeleton className="h-12 w-20 mx-auto" />
    <Skeleton className="h-4 w-40 mx-auto" />
  </Card>
);

export const WeatherCard = memo(function WeatherCard({ weather, locationName, isLoading, error, todayTempMin, todayTempMax }: WeatherCardProps) {
  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (isLoading || !weather) {
    return weatherCardSkeleton;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 lg:p-8 text-center bg-weather-glass backdrop-blur-sm">
        <p className="text-weather-text-tertiary text-sm mb-2">📍 {locationName}</p>

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Image
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            width={100}
            height={100}
            className="mx-auto lg:w-32 lg:h-32"
          />
        </motion.div>

        <motion.p
          className="text-6xl lg:text-7xl font-light text-weather-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {formatTemperature(weather.temperature)}
        </motion.p>

        <p className="text-weather-text-muted mt-2">{weather.description}</p>

        <div className="flex justify-center gap-4 mt-4 text-sm text-weather-text-tertiary">
          <span>최고 {todayTempMax !== undefined ? formatTemperature(todayTempMax) : '--'}</span>
          <span>|</span>
          <span>최저 {todayTempMin !== undefined ? formatTemperature(todayTempMin) : '--'}</span>
        </div>

        {/* 데스크탑 전용 상세 정보 */}
        <div className="hidden lg:grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="h-5 w-5 text-weather-text-placeholder" />
            <span className="text-xs text-weather-text-muted">체감온도</span>
            <span className="text-sm font-medium">{formatTemperature(weather.feelsLike)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets className="h-5 w-5 text-weather-text-placeholder" />
            <span className="text-xs text-weather-text-muted">습도</span>
            <span className="text-sm font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="h-5 w-5 text-weather-text-placeholder" />
            <span className="text-xs text-weather-text-muted">풍속</span>
            <span className="text-sm font-medium">{weather.windSpeed}m/s</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
