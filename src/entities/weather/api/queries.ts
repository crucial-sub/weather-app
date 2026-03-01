// 날씨 TanStack Query 훅
import { useQuery } from '@tanstack/react-query';
import {
  fetchCurrentWeather,
  fetchForecast,
  type CurrentWeatherResponse,
  type ForecastResponse
} from '@/shared/api';
import { getWeatherDescription } from '@/shared/lib/weather-description';
import type { Weather, HourlyForecast, DailyForecast } from '../model/types';

// 쿼리 키
export const weatherKeys = {
  all: ['weather'] as const,
  current: (lat: number, lon: number) => [...weatherKeys.all, 'current', lat, lon] as const,
  forecast: (lat: number, lon: number) => [...weatherKeys.all, 'forecast', lat, lon] as const,
};

// 응답 변환 함수
function transformCurrentWeather(data: CurrentWeatherResponse): Weather {
  const weatherId = data.weather[0].id;
  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    weatherId,
    condition: data.weather[0].main,
    description: getWeatherDescription(weatherId),
    icon: data.weather[0].icon,
  };
}

function transformHourlyForecast(data: ForecastResponse): HourlyForecast[] {
  return data.list.slice(0, 8).map((item) => ({
    time: item.dt,
    temperature: item.main.temp,
    icon: item.weather[0].icon,
  }));
}

function transformDailyForecast(data: ForecastResponse): DailyForecast[] {
  // 일별로 그룹화하여 최저/최고 온도 계산
  const dailyMap = new Map<string, { temps: number[]; icons: string[]; weatherId: number; date: number }>();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const existing = dailyMap.get(date);

    if (existing) {
      existing.temps.push(item.main.temp);
      existing.icons.push(item.weather[0].icon);
    } else {
      dailyMap.set(date, {
        temps: [item.main.temp],
        icons: [item.weather[0].icon],
        weatherId: item.weather[0].id,
        date: item.dt,
      });
    }
  });

  return Array.from(dailyMap.values())
    .slice(0, 5)
    .map((day) => ({
      date: day.date,
      tempMin: Math.min(...day.temps),
      tempMax: Math.max(...day.temps),
      icon: day.icons[Math.floor(day.icons.length / 2)], // 중간 시간대 아이콘
      weatherId: day.weatherId,
      condition: getWeatherDescription(day.weatherId),
    }));
}

// 쿼리 옵션 타입
interface QueryOptions {
  enabled?: boolean;
}

// 현재 날씨 쿼리 훅
export function useCurrentWeather(
  lat: number,
  lon: number,
  options: QueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: weatherKeys.current(lat, lon),
    queryFn: () => fetchCurrentWeather(lat, lon),
    select: transformCurrentWeather,
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000,   // 30분
  });
}

// 시간대별 예보 쿼리 훅
export function useHourlyForecast(
  lat: number,
  lon: number,
  options: QueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchForecast(lat, lon),
    select: transformHourlyForecast,
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// 5일 예보 쿼리 훅
export function useDailyForecast(
  lat: number,
  lon: number,
  options: QueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchForecast(lat, lon),
    select: transformDailyForecast,
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
