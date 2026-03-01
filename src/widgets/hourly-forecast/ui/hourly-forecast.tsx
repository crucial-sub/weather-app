'use client';

// 시간대별 예보 위젯
import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/shared/ui/card';
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatTemperature, formatHour, getWeatherIconUrl } from '@/shared/lib/format';
import type { HourlyForecast as HourlyForecastType } from '@/entities/weather';

interface HourlyForecastProps {
  forecast: HourlyForecastType[] | undefined;
  isLoading: boolean;
}

// 정적 스켈레톤 JSX를 컴포넌트 외부로 호이스팅하여 매 렌더링마다 재생성 방지
const hourlyForecastSkeleton = (
  <Card className="p-4">
    <h3 className="text-sm font-medium text-weather-text-tertiary mb-3">시간대별 예보</h3>
    <div className="flex gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  </Card>
);

export const HourlyForecast = memo(function HourlyForecast({ forecast, isLoading }: HourlyForecastProps) {
  if (isLoading) {
    return hourlyForecastSkeleton;
  }

  if (!forecast?.length) {
    return null;
  }

  return (
    <Card className="p-4 lg:p-6 bg-weather-glass backdrop-blur-sm">
      <h3 className="text-sm font-medium text-weather-text-tertiary mb-3">시간대별 예보</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 lg:gap-6 pb-3">
          {forecast.map((hour, index) => (
            <motion.div
              key={hour.time}
              className="flex flex-col items-center gap-1 min-w-[60px] lg:min-w-[72px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-xs text-weather-text-muted">{formatHour(hour.time)}</span>
              <Image
                src={getWeatherIconUrl(hour.icon)}
                alt="날씨"
                width={40}
                height={40}
                className="lg:w-12 lg:h-12"
              />
              <span className="text-sm font-medium">
                {formatTemperature(hour.temperature)}
              </span>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
});
