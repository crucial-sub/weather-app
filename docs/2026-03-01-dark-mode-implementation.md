# 다크모드/라이트모드 구현 완료

## 작업 일자
2026-03-01

## 수행한 작업

### Phase 1: 기반 설정
1. **`src/app/globals.css`** — 22개 CSS 변수 쌍 (라이트/다크) 추가
   - `:root`에 라이트 모드 값, `.dark`에 다크 모드 값 정의
   - `@theme inline` 블록에 Tailwind 색상 매핑 (`--color-weather-*`) 추가
   - `@layer base`에 `theme-transitioning` 클래스 기반 전환 트랜지션 (200ms) 추가
   - `prefers-reduced-motion: reduce` 미디어 쿼리로 접근성 존중

2. **`src/app/providers/theme-provider.tsx`** — 신규 생성
   - `next-themes`의 `NextThemesProvider` 래핑
   - `attribute="class"`, `defaultTheme="system"`, `enableSystem` 설정
   - FOUC 방지를 위한 인라인 스크립트 자동 삽입 (next-themes 내장)

3. **`src/shared/ui/theme-toggle.tsx`** — 신규 생성
   - Sun/Moon 아이콘 전환 (Framer Motion `AnimatePresence` + rotate/scale 애니메이션)
   - `mounted` 상태로 hydration 불일치 방지
   - 토글 시 `theme-transitioning` 클래스 추가 → 200ms 후 제거
   - `aria-label`로 접근성 확보

### Phase 2: Provider 통합
4. **`src/app/providers/index.ts`** — `ThemeProvider` export 추가
5. **`src/app/layout.tsx`**:
   - `suppressHydrationWarning` 추가
   - `ThemeProvider`로 `QueryProvider` 래핑
   - `viewport.themeColor`를 light/dark 미디어 쿼리 배열로 변경
6. **`src/shared/ui/index.ts`** — `ThemeToggle` export 추가

### Phase 3: 컴포넌트 색상 마이그레이션 (8개 파일)
하드코딩된 Tailwind 색상 클래스를 CSS 변수 기반 클래스로 교체:
- `src/app/page.tsx` — 15개 색상 교체 + ThemeToggle 헤더 삽입
- `src/app/location/[id]/page.tsx` — 14개 색상 교체 + ThemeToggle 헤더 삽입
- `src/widgets/weather-card/ui/weather-card.tsx` — 6개 색상 교체
- `src/widgets/hourly-forecast/ui/hourly-forecast.tsx` — 4개 색상 교체
- `src/widgets/weekly-forecast/ui/weekly-forecast.tsx` — 8개 색상 교체
- `src/widgets/favorites-grid/ui/favorites-grid.tsx` — 4개 색상 교체
- `src/widgets/favorites-grid/ui/favorite-card.tsx` — 4개 색상 교체
- `src/widgets/search-modal/ui/search-modal.tsx` — 7개 색상 교체

### Phase 4: 검증
- `next build` 성공 확인 (TypeScript 에러 없음, 정적 페이지 생성 완료)

## 설계 결정 근거
- **`theme-transitioning` 클래스 기반 트랜지션**: 전역 상시 transition 대신 토글 시에만 적용하여 페이지 로드 시 불필요한 전환 효과 방지, Framer Motion의 transform/opacity 애니메이션과 충돌 방지
- **CSS 변수 기반 색상 시스템**: Tailwind의 `dark:` prefix 대신 CSS 변수를 사용하여 테마 확장 용이성 확보
- **`defaultTheme="system"`**: 사용자의 OS 테마 설정을 자동 감지하여 최초 방문 시 적절한 테마 적용

## 향후 권장 작업
- 다크 모드에서 날씨 아이콘의 가시성 확인 및 필요시 필터 적용
- 사용자 테마 선호도 localStorage 저장 확인 (next-themes 기본 제공)
- 다크 모드에서의 Skeleton 컴포넌트 색상 확인 (shadcn 기본 CSS 변수 기반이므로 정상 동작 예상)

## 전체 수정 파일 (14개)
| # | 파일 | 상태 |
|:--:|---|:--:|
| 1 | `src/app/globals.css` | 수정 |
| 2 | `src/app/providers/theme-provider.tsx` | 신규 |
| 3 | `src/app/providers/index.ts` | 수정 |
| 4 | `src/app/layout.tsx` | 수정 |
| 5 | `src/shared/ui/theme-toggle.tsx` | 신규 |
| 6 | `src/shared/ui/index.ts` | 수정 |
| 7 | `src/app/page.tsx` | 수정 |
| 8 | `src/app/location/[id]/page.tsx` | 수정 |
| 9 | `src/widgets/weather-card/ui/weather-card.tsx` | 수정 |
| 10 | `src/widgets/hourly-forecast/ui/hourly-forecast.tsx` | 수정 |
| 11 | `src/widgets/weekly-forecast/ui/weekly-forecast.tsx` | 수정 |
| 12 | `src/widgets/favorites-grid/ui/favorites-grid.tsx` | 수정 |
| 13 | `src/widgets/favorites-grid/ui/favorite-card.tsx` | 수정 |
| 14 | `src/widgets/search-modal/ui/search-modal.tsx` | 수정 |
