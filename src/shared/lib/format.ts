// 포맷팅 유틸리티 함수

// 온도 포맷 (소수점 반올림)
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°`;
}

// 시간 포맷 (HH시)
export function formatHour(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getHours()}시`;
}

// 요일 포맷
export function formatDay(timestamp: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(timestamp * 1000);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }

  return `${days[date.getDay()]}요일`;
}

// 날씨 아이콘 URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
