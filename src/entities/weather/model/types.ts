// 날씨 엔티티 타입 정의

export interface Weather {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  time: number;
  temperature: number;
  icon: string;
}

export interface DailyForecast {
  date: number;
  tempMin: number;
  tempMax: number;
  icon: string;
  condition: string;
}
