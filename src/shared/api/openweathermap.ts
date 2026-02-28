// OpenWeatherMap API 클라이언트

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// API 응답 타입 정의
export interface CurrentWeatherResponse {
  coord: { lat: number; lon: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: { speed: number };
  name: string;
  dt: number;
}

export interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{ id: number; main: string; icon: string }>;
  }>;
  city: { name: string };
}

// 현재 날씨 조회
export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherResponse> {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('날씨 정보를 가져올 수 없습니다.');
  }

  return response.json();
}

// 시간대별 + 5일 예보 조회
export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('예보 정보를 가져올 수 없습니다.');
  }

  return response.json();
}

// 지역명으로 좌표 검색 (Geocoding)
export interface GeocodingResponse {
  name: string;
  local_names?: { ko?: string };
  lat: number;
  lon: number;
  country: string;
}

export async function fetchGeocode(query: string): Promise<GeocodingResponse[]> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)},KR&limit=5&appid=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('위치 정보를 가져올 수 없습니다.');
  }

  return response.json();
}

// 좌표로 지역명 조회 (Reverse Geocoding)
export async function fetchReverseGeocode(lat: number, lon: number): Promise<GeocodingResponse[]> {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('위치 정보를 가져올 수 없습니다.');
  }

  return response.json();
}
