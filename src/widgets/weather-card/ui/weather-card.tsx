'use client';

// 현재 날씨 카드 위젯
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatTemperature, getWeatherIconUrl } from '@/shared/lib';
import type { Weather } from '@/entities/weather';

interface WeatherCardProps {
  weather: Weather | undefined;
  locationName: string;
  isLoading: boolean;
  error?: string | null;
}

export function WeatherCard({ weather, locationName, isLoading, error }: WeatherCardProps) {
  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  if (isLoading || !weather) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-24 w-24 mx-auto rounded-full" />
        <Skeleton className="h-12 w-20 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 text-center bg-white/80 backdrop-blur-sm">
        <p className="text-gray-600 text-sm mb-2">📍 {locationName}</p>

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
            className="mx-auto"
          />
        </motion.div>

        <motion.p
          className="text-6xl font-light text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {formatTemperature(weather.temperature)}
        </motion.p>

        <p className="text-gray-500 mt-2">{weather.description}</p>

        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
          <span>최고 {formatTemperature(weather.tempMax)}</span>
          <span>|</span>
          <span>최저 {formatTemperature(weather.tempMin)}</span>
        </div>
      </Card>
    </motion.div>
  );
}
