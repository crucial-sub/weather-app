# 날씨 앱

현재 위치 기반 날씨 정보 및 즐겨찾기 기능을 제공하는 날씨 웹 애플리케이션입니다.

## 주요 기능

- **현재 위치 날씨**: 브라우저 Geolocation API를 통한 현재 위치 기반 실시간 날씨 정보 표시
- **시간대별 예보**: 향후 24시간 시간대별 기온 및 날씨 예보
- **주간 예보**: 5일간의 날씨 예보 (최저/최고 기온, 날씨 아이콘)
- **장소 검색**: 로컬 행정구역 데이터 기반 시/군/구/동 단위 장소 검색
- **즐겨찾기**: 최대 6개 장소 즐겨찾기 등록 (별칭 수정, 카드 UI, 실시간 날씨 표시)
- **다크 모드**: 시스템 설정 연동 및 수동 전환 지원 (next-themes 기반)
- **반응형 디자인**: 모바일/태블릿/데스크톱 레이아웃 자동 전환
- **에러 처리**: 위치 권한 거부, 날씨 API 실패 등 상황별 분리된 에러 안내
- **새로고침**: 현재 날씨 정보 수동 새로고침 기능
- **PWA 지원**: 홈 화면에 추가하여 앱처럼 사용 가능

## 기술 스택

### Frontend
- **Next.js 16** - React 프레임워크 (App Router)
- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 체크
- **TanStack Query v5** - 서버 상태 관리 (캐싱, 리페칭, 에러 핸들링)
- **Zustand v5** - 클라이언트 상태 관리 (즐겨찾기 persist)
- **Tailwind CSS v4** - 유틸리티 기반 스타일링
- **shadcn/ui** - 접근성 준수 UI 컴포넌트 (Radix UI 기반)
- **Framer Motion** - 페이지 전환 및 컴포넌트 애니메이션
- **date-fns** - 날짜/시간 포맷팅
- **Sonner** - 토스트 알림 (새로고침 성공/실패 등)
- **Lucide React** - 아이콘 라이브러리
- **next-themes** - 다크 모드 테마 관리

### 아키텍처
- **FSD (Feature Sliced Design)** - 기능 기반 모듈화 아키텍처

```
src/
├── app/              # 앱 라우팅, 레이아웃, 프로바이더
├── widgets/          # 페이지 구성 위젯 (WeatherCard, HourlyForecast 등)
├── features/         # 사용자 시나리오 기능 (검색, 즐겨찾기, 위치감지)
├── entities/         # 비즈니스 엔티티 (weather, location 타입/쿼리)
└── shared/           # 공용 유틸리티, UI 컴포넌트, API 클라이언트
```

### API
- **OpenWeatherMap API**
  - Current Weather Data - 현재 날씨
  - 5 Day / 3 Hour Forecast - 시간대별/주간 예보
  - Geocoding API - 좌표 ↔ 지명 변환

## 기술적 의사결정 및 이유

### FSD (Feature Sliced Design) 아키텍처
- **선택 이유**: 기능 단위 모듈화로 코드 응집도를 높이고 의존성 방향을 단방향(app → widgets → features → entities → shared)으로 강제하여 유지보수성 향상
- **대안 대비**: 일반적인 폴더 구조(components/pages/hooks) 대비 기능 간 경계가 명확하고 대규모 확장에 유리

### TanStack Query (vs SWR)
- **선택 이유**: 더 세밀한 캐시 제어(staleTime, gcTime), 자동 리페칭, devtools 지원, 쿼리 무효화 등 서버 상태 관리에 최적화
- **대안 대비**: SWR은 단순하지만 복잡한 캐시 전략이나 mutation 관리 시 TanStack Query가 더 유연

### Zustand (vs Redux, Context API)
- **선택 이유**: 보일러플레이트 최소화, persist 미들웨어로 localStorage 영속화 간편 구현, 번들 사이즈 경량
- **대안 대비**: Redux는 오버엔지니어링, Context API는 리렌더링 최적화 부재로 즐겨찾기 상태 관리에 부적합

### Tailwind CSS + shadcn/ui
- **선택 이유**: Tailwind v4의 CSS 변수 기반 테마 시스템으로 다크 모드 구현이 용이하고, shadcn/ui는 Radix UI 기반으로 접근성(WAI-ARIA) 표준 준수
- **대안 대비**: CSS Modules는 테마 전환 구현이 복잡하고, MUI/Ant Design은 번들 사이즈가 과도

### 로컬 행정구역 데이터 기반 검색
- **선택 이유**: 외부 검색 API 의존 없이 즉각적인 검색 응답 제공, 한국 행정구역(시/군/구/동) 특화 데이터로 정확한 결과 반환
- **대안 대비**: Google Places API/Nominatim은 네트워크 지연과 API 키 관리 비용 발생, 오프라인 사용 불가

## 시작하기

### 환경 설정

1. 저장소 클론
```bash
git clone <repository-url>
cd weather-app
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에 OpenWeatherMap API 키 입력:
```
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
```

4. 개발 서버 실행
```bash
npm run dev
```

### 빌드

```bash
npm run build
npm run start
```

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 메인 페이지
│   ├── globals.css          # 글로벌 스타일 (다크 모드 CSS 변수)
│   ├── providers/
│   │   ├── query-provider.tsx  # TanStack Query Provider
│   │   ├── theme-provider.tsx  # 다크 모드 Theme Provider
│   │   └── index.ts            # Provider 통합 export
│   └── location/[id]/       # 즐겨찾기 상세 페이지
│
├── widgets/
│   ├── weather-card/        # 현재 날씨 카드
│   ├── hourly-forecast/     # 시간대별 예보
│   ├── weekly-forecast/     # 주간 예보
│   ├── favorites-grid/      # 즐겨찾기 그리드 (카드 UI)
│   └── search-modal/        # 장소 검색 모달
│
├── features/
│   ├── geolocation/         # 현재 위치 감지
│   ├── search-location/     # 장소 검색
│   └── manage-favorites/    # 즐겨찾기 관리 (최대 6개 제한)
│
├── entities/
│   ├── weather/             # 날씨 데이터 타입 및 쿼리
│   └── location/            # 위치 데이터 타입 및 쿼리
│
└── shared/
    ├── api/                 # OpenWeatherMap API 클라이언트
    ├── ui/                  # shadcn/ui 컴포넌트, ThemeToggle
    ├── lib/                 # 유틸리티 함수
    └── constants/           # 한국 행정구역 데이터
```

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY`
4. 배포 완료

## 라이센스

MIT License
