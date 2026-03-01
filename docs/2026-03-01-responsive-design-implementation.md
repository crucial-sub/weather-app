# 반응형 디자인 전환 구현

## 날짜: 2026-03-01

## 현재 상황

기존 모바일 전용 레이아웃(`max-w-lg`, 512px)에서 데스크탑 반응형 레이아웃으로 전환 완료. 모바일 UI는 기존과 동일하게 유지되며, `lg:` (1024px+) 브레이크포인트에서 데스크탑 레이아웃이 활성화됩니다.

## 수행한 작업

### Phase 1: 기반 작업
- `globals.css`: `responsive-transition` 유틸리티 클래스 추가 (max-width, padding, gap에 300ms ease 트랜지션)
- `globals.css`: `prefers-reduced-motion: reduce` 미디어 쿼리로 트랜지션 비활성화 지원
- `layout.tsx`: `maximumScale: 1` 제거 (데스크탑 확대/축소 허용)

### Phase 2: 페이지 레이아웃 전환
- `page.tsx` (메인 페이지):
  - 헤더/메인 컨테이너: `max-w-lg` → `max-w-lg lg:max-w-6xl`, `px-4` → `px-4 lg:px-8`
  - 날씨 콘텐츠: 12-column 그리드 레이아웃 (`lg:grid lg:grid-cols-12 lg:gap-6`)
  - WeatherCard: `lg:col-span-4 lg:sticky lg:top-20` (좌측 고정 패널)
  - 예보+즐겨찾기: `lg:col-span-8` (우측 스크롤 패널)
  - `LayoutGroup` + `motion.div layout`으로 레이아웃 전환 애니메이션
- `location/[id]/page.tsx` (상세 페이지): 동일 패턴 적용 (4곳 `max-w-lg` 변경 + 12-col 그리드)

### Phase 3: 위젯 반응형 확장
- `weather-card.tsx`:
  - 패딩 `lg:p-8`, 아이콘 `lg:w-32 lg:h-32`, 온도 `lg:text-7xl`
  - 데스크탑 전용 상세 정보 (`hidden lg:grid grid-cols-3`): 체감온도, 습도, 풍속
- `hourly-forecast.tsx`: 패딩 `lg:p-6`, 간격 `lg:gap-6`, 아이템 `lg:min-w-[72px]`, 아이콘 `lg:w-12 lg:h-12`
- `weekly-forecast.tsx`: 패딩/간격 확장, 요일 너비 `lg:w-16`, 데스크탑 전용 날씨 설명 (`hidden lg:inline`), 온도 바 `lg:h-1.5` + `transition-all duration-300`
- `favorites-grid.tsx`: `lg:grid-cols-4`, 간격 `lg:gap-4`
- `favorite-card.tsx`: `lg:hover:shadow-md lg:transition-shadow lg:duration-200`

### Phase 4: 모달 + 검증
- `search-modal.tsx`: `lg:max-w-lg`, 검색 결과 `lg:max-h-[400px]`
- `npm run build` 성공 (TypeScript/빌드 에러 없음)

## 설계 결정 근거

1. **Breakpoint 전략**: Tailwind의 `lg:` (1024px)을 사용. 태블릿까지는 모바일 UI가 더 적합하고, 1024px부터 2-column 레이아웃이 효과적.
2. **12-column 그리드**: `col-span-4` + `col-span-8` 비율로 좌측 날씨 카드(sticky)와 우측 콘텐츠 패널 분리.
3. **Progressive Enhancement**: 모든 데스크탑 변경은 `lg:` 접두사로 분기하여 모바일 UI에 영향 없음.
4. **기존 데이터 활용**: Weather 타입의 `feelsLike`, `humidity`, `windSpeed` 필드를 데스크탑 상세 정보에 활용.

## 수정 파일 목록 (총 10개)

| 파일 | 변경 |
|------|------|
| `src/app/globals.css` | responsive-transition + prefers-reduced-motion |
| `src/app/layout.tsx` | maximumScale 제거 |
| `src/app/page.tsx` | 반응형 컨테이너 + 12-col 그리드 + LayoutGroup |
| `src/app/location/[id]/page.tsx` | 동일 반응형 패턴 |
| `src/widgets/weather-card/ui/weather-card.tsx` | 데스크탑 확장 + 상세 정보 |
| `src/widgets/hourly-forecast/ui/hourly-forecast.tsx` | 크기/간격 반응형 |
| `src/widgets/weekly-forecast/ui/weekly-forecast.tsx` | 날씨 설명 + 온도바 확장 |
| `src/widgets/favorites-grid/ui/favorites-grid.tsx` | grid-cols-4 |
| `src/widgets/favorites-grid/ui/favorite-card.tsx` | 호버 효과 |
| `src/widgets/search-modal/ui/search-modal.tsx` | 모달 크기 확장 |

## 향후 권장 작업

1. **시각적 검증**: 브라우저 DevTools에서 375px, 768px, 1024px, 1440px 각 브레이크포인트별 레이아웃 확인
2. **트랜지션 확인**: 1024px 경계에서 레이아웃 전환이 부드럽게 이루어지는지 확인
3. **다크 모드 대응**: 데스크탑 상세 정보의 border, text 색상이 다크 모드에서도 적절한지 검토
4. **접근성 테스트**: `prefers-reduced-motion: reduce` 설정 시 트랜지션 비활성화 확인
5. **XL 브레이크포인트**: 1440px+ 초대형 화면에서 추가 최적화 필요 시 `xl:` 클래스 추가 검토
