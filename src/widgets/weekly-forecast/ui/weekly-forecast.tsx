'use client';

// 5일 예보 위젯
import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatTemperature, formatDay, getWeatherIconUrl } from '@/shared/lib/format';
import type { DailyForecast as DailyForecastType } from '@/entities/weather';

interface WeeklyForecastProps {
  forecast: DailyForecastType[] | undefined;
  isLoading: boolean;
}

// 정적 스켈레톤 JSX를 컴포넌트 외부로 호이스팅하여 매 렌더링마다 재생성 방지
const weeklyForecastSkeleton = (
  <Card className="p-4">
    <h3 className="text-sm font-medium text-gray-600 mb-3">5일 예보</h3>
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  </Card>
);

export const WeeklyForecast = memo(function WeeklyForecast({ forecast, isLoading }: WeeklyForecastProps) {
  if (isLoading) {
    return weeklyForecastSkeleton;
  }

  if (!forecast?.length) {
    return null;
  }

  // 전체 기간의 최저/최고 온도 계산 (온도 바 스케일링용)
  const minTemp = Math.min(...forecast.map((d) => d.tempMin));
  const maxTemp = Math.max(...forecast.map((d) => d.tempMax));
  const tempRange = maxTemp - minTemp || 1;

  return (
    <Card className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-gray-600 mb-3">5일 예보</h3>
      <div className="space-y-3 lg:space-y-4">
        {forecast.map((day, index) => {
          const leftPercent = ((day.tempMin - minTemp) / tempRange) * 100;
          const rawWidth = ((day.tempMax - day.tempMin) / tempRange) * 100;
          // 최소 10% 너비 보장하되, 컨테이너를 넘지 않도록 clamp
          const widthPercent = Math.min(Math.max(rawWidth, 10), 100 - leftPercent);

          return (
            <motion.div
              key={day.date}
              className="flex items-center gap-3 lg:gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-sm text-gray-600 w-12 lg:w-16">{formatDay(day.date)}</span>

              <Image
                src={getWeatherIconUrl(day.icon)}
                alt={day.condition}
                width={32}
                height={32}
              />

              {/* 데스크탑 전용 날씨 설명 */}
              <span className="hidden lg:inline text-sm text-gray-500 w-20 truncate">
                {day.condition}
              </span>

              <span className="text-sm text-blue-500 w-10 text-right">
                {formatTemperature(day.tempMin)}
              </span>

              <div
                className="flex-1 h-1 lg:h-1.5 bg-gray-200 rounded-full relative overflow-hidden"
                role="img"
                aria-label={`최저 ${formatTemperature(day.tempMin)}, 최고 ${formatTemperature(day.tempMax)}`}
              >
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full transition-all duration-300"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              <span className="text-sm text-orange-500 w-10">
                {formatTemperature(day.tempMax)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
});
