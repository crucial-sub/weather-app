// 날씨 TanStack Query 훅
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchOpenMeteoDaily,
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

// Open-Meteo 일별 온도 쿼리
function useOpenMeteoDaily(lat: number, lon: number, enabled: boolean) {
  return useQuery({
    queryKey: ['weather', 'open-meteo-daily', lat, lon],
    queryFn: () => fetchOpenMeteoDaily(lat, lon),
    enabled: enabled && lat !== 0 && lon !== 0,
    staleTime: 30 * 60 * 1000,  // 30분 (일별 데이터는 변동 적음)
    gcTime: 60 * 60 * 1000,     // 1시간
  });
}

// 5일 예보 쿼리 훅 — Open-Meteo 일별 min/max와 OWM 아이콘/날씨를 병합
export function useDailyForecast(
  lat: number,
  lon: number,
  options: QueryOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && lat !== 0 && lon !== 0;

  // OpenWeatherMap — 아이콘, 날씨 설명, 날짜
  const owmQuery = useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchForecast(lat, lon),
    select: transformDailyForecast,
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Open-Meteo — 정확한 일별 최저/최고 온도
  const meteoQuery = useOpenMeteoDaily(lat, lon, isEnabled);

  // 병합: OWM 아이콘/날씨 + Open-Meteo min/max
  // Open-Meteo 로딩 중이면 잘못된 OWM min/max 노출 방지를 위해 데이터 보류
  const data = useMemo(() => {
    if (!owmQuery.data) return undefined;
    if (meteoQuery.isLoading) return undefined;
    if (!meteoQuery.data) return owmQuery.data; // Open-Meteo 실패 시 OWM fallback

    const meteoDaily = meteoQuery.data.daily;
    return owmQuery.data.map((day) => {
      const dayDate = new Date(day.date * 1000).toISOString().slice(0, 10); // "YYYY-MM-DD"
      const meteoIdx = meteoDaily.time.indexOf(dayDate);
      if (meteoIdx === -1) return day;
      return {
        ...day,
        tempMin: meteoDaily.temperature_2m_min[meteoIdx],
        tempMax: meteoDaily.temperature_2m_max[meteoIdx],
      };
    });
  }, [owmQuery.data, meteoQuery.data, meteoQuery.isLoading]);

  return {
    data,
    isLoading: owmQuery.isLoading,
    error: owmQuery.error,
  };
}

// 오늘의 최저/최고 온도 훅 — 즐겨찾기 카드 등 간단한 min/max 표시용
export function useTodayMinMax(lat: number, lon: number, enabled: boolean = true) {
  const meteoQuery = useOpenMeteoDaily(lat, lon, enabled);

  const today = useMemo(() => {
    if (!meteoQuery.data) return undefined;
    // Open-Meteo 일별 데이터의 첫 번째 항목이 오늘
    return {
      tempMin: meteoQuery.data.daily.temperature_2m_min[0],
      tempMax: meteoQuery.data.daily.temperature_2m_max[0],
    };
  }, [meteoQuery.data]);

  return { data: today, isLoading: meteoQuery.isLoading };
}
