# 날씨 텍스트 한글화 및 온도 표시 수정

**날짜**: 2026-03-01

## 수행한 작업

### 문제 1: "온흐림", "튼구름" 등 부정확한 한글 번역 해결
- **원인**: OpenWeatherMap API의 `lang=kr` 번역 품질이 낮음
- **해결**: `src/shared/lib/weather-description.ts`에 날씨 condition ID → 한글 매핑 테이블 생성
- `getWeatherDescription(id)` 함수로 200~804 범위의 모든 날씨 상태를 자연스러운 한글로 변환
- `queries.ts`의 `transformCurrentWeather`에서 API 번역 대신 자체 매핑 사용

### 문제 2: 최고/최저 온도가 현재 온도를 반영하지 못함
- **원인**: forecast API가 현재 시점 이후 데이터만 반환하여, 이미 지난 시간의 온도가 누락
- **해결**: `weather-card.tsx`에서 현재 온도를 포함한 보정 로직 추가
  - `Math.max(현재온도, forecastMax)` / `Math.min(현재온도, forecastMin)`
- `page.tsx`, `location/[id]/page.tsx`에서 `dailyForecast[0]`의 최고/최저를 WeatherCard에 전달

### 문제 3: 주간 예보에 영어 텍스트("Rain", "Clouds") 표시
- **원인**: `weather[0].main` 필드는 번역되지 않음 (`description`만 번역)
- **해결**: `transformDailyForecast`에서 `weather[0].main` 대신 `getWeatherDescription(id)` 사용

## 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/shared/lib/weather-description.ts` | **신규** - 날씨 ID → 한글 매핑 유틸리티 |
| `src/shared/lib/index.ts` | re-export 추가 |
| `src/entities/weather/model/types.ts` | `Weather`, `DailyForecast`에 `weatherId` 필드 추가 |
| `src/entities/weather/api/queries.ts` | 변환 함수에서 한글 매핑 적용 |
| `src/widgets/weather-card/ui/weather-card.tsx` | 온도 보정 로직 + `todayTempMin/Max` props 추가 |
| `src/app/page.tsx` | WeatherCard에 오늘 최고/최저 온도 전달 |
| `src/app/location/[id]/page.tsx` | WeatherCard에 오늘 최고/최저 온도 전달 |

## 설계 결정 근거

- **자체 매핑 vs API 번역**: OpenWeatherMap의 한글 번역 품질이 불안정하므로 자체 매핑이 안정적
- **ID 기반 매핑**: `main`이나 `description` 문자열보다 `id`가 정확하고 일관적
- **온도 보정**: forecast API 한계를 현재 온도 포함으로 보완 (사용자 경험 개선)

## 향후 권장 작업
- 날씨 아이콘도 자체 아이콘 세트로 교체 고려 (OpenWeatherMap 아이콘 품질 개선)
- `lang=kr` 파라미터 제거 검토 (자체 매핑 사용 시 불필요)
