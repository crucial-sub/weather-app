// Open-Meteo API — 일별 최저/최고 온도 전용

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export interface OpenMeteoDailyResponse {
  daily: {
    time: string[];                  // ["2026-03-01", "2026-03-02", ...]
    temperature_2m_max: number[];    // [13.0, 15.2, ...]
    temperature_2m_min: number[];    // [4.0, 6.1, ...]
  };
}

// Open-Meteo 일별 최저/최고 온도 조회
export async function fetchOpenMeteoDaily(
  lat: number,
  lon: number,
  days: number = 6
): Promise<OpenMeteoDailyResponse> {
  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Seoul&forecast_days=${days}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Open-Meteo 일별 예보를 가져올 수 없습니다.');
  return response.json();
}
