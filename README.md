# 날씨 앱

현재 위치 기반 날씨 정보 및 즐겨찾기 기능을 제공하는 날씨 웹 애플리케이션입니다.

## 프로젝트 실행 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd weather-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 [OpenWeatherMap](https://openweathermap.org/api)에서 발급받은 API 키를 입력합니다:

```
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
```

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm run start
```

> PWA(오프라인 캐싱, 홈 화면 설치)는 프로덕션 빌드에서만 동작합니다.

---

## 구현 기능

### 핵심 기능

- **현재 위치 날씨**: 브라우저 Geolocation API를 통한 현재 위치 감지 및 실시간 날씨 표시 (기온, 체감온도, 습도, 풍속)
- **시간대별 예보**: 향후 24시간(3시간 간격, 8개) 기온 및 날씨 아이콘 표시
- **5일 주간 예보**: Open-Meteo API 기반 정확한 일별 최저/최고 기온과 날씨 상태 표시
- **장소 검색**: 로컬 행정구역 데이터(시/군/구/동) 기반 즉각적인 검색, 선택 시 Geocoding API로 좌표 변환
- **즐겨찾기**: 최대 6개 장소 등록, 별칭 수정, 카드 UI에 실시간 날씨 표시, 상세 페이지 이동

### 추가 기능

- **다크 모드**: 시스템 설정 자동 연동 및 수동 전환 (CSS 변수 기반 테마 시스템)
- **반응형 디자인**: 모바일/태블릿/데스크톱 레이아웃 자동 전환
- **날씨 텍스트 한글화**: OpenWeatherMap 날씨 ID 기반 자체 한글 매핑 (API 번역 품질 문제 해결)
- **온도 보정**: 현재 기온을 오늘 최고/최저 계산에 포함하여 정확도 향상
- **에러 처리**: 위치 권한 거부, 날씨 API 실패 등 상황별 분리된 에러 안내
- **새로고침**: 현재 날씨 정보 수동 새로고침 (토스트 알림 피드백)
- **PWA 지원**: Service Worker 기반 오프라인 캐싱, 홈 화면 설치 가능
- **성능 최적화**: 동적 import, React.memo, 스켈레톤 호이스팅, Query 캐싱 전략

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.6 |
| UI 라이브러리 | React | 19.2.3 |
| 언어 | TypeScript | 5 |
| 서버 상태 관리 | TanStack Query | 5 |
| 클라이언트 상태 관리 | Zustand (persist) | 5 |
| 스타일링 | Tailwind CSS | 4 |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반) | - |
| 애니메이션 | Framer Motion | 12 |
| 다크 모드 | next-themes | 0.4 |
| 날짜 처리 | date-fns | 4 |
| 토스트 알림 | Sonner | 2 |
| 아이콘 | Lucide React | 0.575 |

### API

| API | 용도 |
|-----|------|
| OpenWeatherMap Current Weather | 현재 날씨 조회 |
| OpenWeatherMap 5 Day Forecast | 시간대별/주간 예보 |
| OpenWeatherMap Geocoding | 지역명 ↔ 좌표 변환 |
| Open-Meteo Forecast | 일별 최저/최고 온도 (정확도 보완) |
| Nominatim (OpenStreetMap) | Reverse Geocoding (동/리 단위 상세 주소) |

### 아키텍처: FSD (Feature Sliced Design)

```
src/
├── app/              # 라우팅, 레이아웃, Provider 통합
├── widgets/          # 페이지 구성 위젯 (WeatherCard, HourlyForecast 등)
├── features/         # 사용자 시나리오 (검색, 즐겨찾기, 위치감지)
├── entities/         # 비즈니스 엔티티 (weather, location 타입/쿼리)
└── shared/           # 공용 유틸리티, UI 컴포넌트, API 클라이언트
```

상위 → 하위 단방향 import 규칙: `app → widgets → features → entities → shared`

---

## 기술적 의사결정 및 이유

### FSD (Feature Sliced Design) 아키텍처

- **선택 이유**: 기능 단위 모듈화로 코드 응집도를 높이고, 의존성 방향을 단방향으로 강제하여 유지보수성 향상
- **대안 대비**: 일반적인 폴더 구조(components/pages/hooks)보다 기능 간 경계가 명확하고 대규모 확장에 유리

### TanStack Query (vs SWR)

- **선택 이유**: staleTime/gcTime으로 세밀한 캐시 제어, 자동 리페칭, devtools 지원, 쿼리 무효화 등 서버 상태 관리에 최적화
- **적용**: 날씨 데이터 5분 캐싱, 일별 예보 30분 캐싱, Reverse Geocoding 영구 캐싱 등 데이터 특성별 차별화 전략

### Zustand (vs Redux, Context API)

- **선택 이유**: 보일러플레이트 최소화, persist 미들웨어로 localStorage 영속화 간편 구현, 경량 번들 사이즈
- **대안 대비**: Redux는 오버엔지니어링, Context API는 리렌더링 최적화 부재로 즐겨찾기 상태 관리에 부적합

### Tailwind CSS + shadcn/ui

- **선택 이유**: Tailwind v4의 CSS 변수 기반 테마 시스템으로 다크 모드 구현이 용이하고, shadcn/ui는 Radix UI 기반으로 접근성(WAI-ARIA) 준수
- **대안 대비**: CSS Modules는 테마 전환 구현이 복잡하고, MUI/Ant Design은 번들 사이즈가 과도

### 로컬 행정구역 데이터 기반 검색

- **선택 이유**: 외부 API 의존 없이 즉각적인 검색 응답, 한국 행정구역(시/군/구/동) 특화 데이터로 정확한 결과 반환
- **동작 방식**: 1단계 로컬 검색(즉시 응답) → 2단계 좌표 조회(선택 시 Geocoding API)

### Open-Meteo API 병합 (일별 온도)

- **선택 이유**: OpenWeatherMap Forecast API는 현재 시점 이후 3시간 간격 데이터만 반환하여, 오전 데이터가 누락되는 문제 발생
- **해결**: Open-Meteo의 정확한 일별 최저/최고 온도를 OWM 아이콘/날씨 설명과 병합하여 제공

### 날씨 텍스트 자체 한글 매핑

- **선택 이유**: OpenWeatherMap의 `lang=kr` 번역이 부정확 ("overcast clouds" → "온흐림", "broken clouds" → "튼구름")
- **해결**: 날씨 condition ID(200~804) 기반 자체 한글 매핑 테이블로 자연스러운 한글 표시 ("맑음", "흐림", "구름 많음" 등)

### 성능 최적화 전략

- **동적 import**: SearchModal을 초기 번들에서 분리, hover/focus 시 프리로드
- **React.memo**: WeatherCard, HourlyForecast, WeeklyForecast, FavoritesGrid에 적용하여 불필요한 리렌더링 방지
- **optimizePackageImports**: lucide-react, framer-motion 트리셰이킹으로 번들 사이즈 감소
- **스켈레톤 호이스팅**: 정적 로딩 UI를 컴포넌트 외부에 선언하여 매 렌더링 재생성 방지

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃 (Provider 통합, PWA 메타)
│   ├── page.tsx                   # 메인 페이지 (현재 위치 날씨)
│   ├── globals.css                # 글로벌 스타일 (다크 모드 CSS 변수)
│   ├── providers/
│   │   ├── query-provider.tsx     # TanStack Query Provider
│   │   ├── theme-provider.tsx     # 다크 모드 Theme Provider
│   │   └── index.ts
│   └── location/[id]/
│       └── page.tsx               # 즐겨찾기 상세 페이지
│
├── widgets/
│   ├── weather-card/              # 현재 날씨 카드
│   ├── hourly-forecast/           # 시간대별 예보
│   ├── weekly-forecast/           # 5일 주간 예보
│   ├── favorites-grid/            # 즐겨찾기 그리드
│   └── search-modal/              # 장소 검색 모달
│
├── features/
│   ├── geolocation/               # 현재 위치 감지
│   ├── search-location/           # 장소 검색
│   └── manage-favorites/          # 즐겨찾기 관리 (Zustand)
│
├── entities/
│   ├── weather/                   # 날씨 타입, 쿼리 훅
│   └── location/                  # 위치 타입, 쿼리 훅
│
└── shared/
    ├── api/                       # API 클라이언트 (OWM, Open-Meteo, Nominatim)
    ├── ui/                        # shadcn/ui 컴포넌트, ThemeToggle
    ├── lib/                       # 유틸리티 (포맷팅, 날씨 한글 매핑, SW 등록)
    ├── hooks/                     # 공통 훅 (useDebounce)
    └── constants/                 # 한국 행정구역 데이터
```

---

## 배포

- **배포 URL**: https://weather-app-crucialsubs-projects.vercel.app/
- **GitHub**: https://github.com/crucial-sub/weather-app

### Vercel 배포 방법

1. [Vercel](https://vercel.com)에 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정: `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY`
4. 배포 완료 (main 브랜치 push 시 자동 배포)

---

## PWA (Progressive Web App) 사용법

이 앱은 PWA를 지원하여 네이티브 앱처럼 설치하고 오프라인에서도 사용할 수 있습니다.

### 앱 설치

**Chrome (데스크톱)**
1. 배포 URL 접속
2. 주소창 오른쪽의 설치 아이콘(⊕) 클릭
3. "설치" 확인

**Chrome (Android)**
1. 배포 URL 접속
2. 브라우저 메뉴(⋮) → "앱 설치" 또는 "홈 화면에 추가" 선택

**Safari (iOS)**
1. 배포 URL 접속
2. 하단 공유 버튼(↑) 탭
3. "홈 화면에 추가" 선택

### 오프라인 지원

- 한번 방문한 페이지는 Service Worker가 캐싱하여 네트워크 없이도 접근 가능합니다.
- 오프라인 상태에서는 마지막으로 캐싱된 날씨 데이터가 표시됩니다.
- 네트워크 복구 시 최신 데이터로 자동 갱신됩니다.

> PWA 기능(오프라인 캐싱, 설치)은 **프로덕션 빌드**에서만 동작합니다. 로컬 개발 시에는 `npm run build && npm start`로 확인할 수 있습니다.
