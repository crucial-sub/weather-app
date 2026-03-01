# 즐겨찾기 및 예보 UI/UX 개선

## 날짜: 2026-03-01

## 수행한 작업

### 1. 즐겨찾기 카드 버튼 UX 통합
- **파일**: `src/widgets/favorites-grid/ui/favorite-card.tsx`
- X 삭제 버튼 + Pencil 편집 버튼 → `EllipsisVertical` DropdownMenu로 통합
- `group-hover` 패턴 제거 → 항상 표시되는 더보기 버튼 (모바일 접근성 확보)
- 편집 Input에 `autoFocus`, Enter/Escape 키보드 지원 추가
- 카드에 `min-h-[100px]` 추가, 날씨 없음 상태 `h-[48px]` 고정
- DropdownMenu 트리거에 `aria-label="즐겨찾기 옵션"` 접근성 속성 추가

### 2. 검색 모달 즐겨찾기 상태 표시 & 토글
- **파일**: `src/features/manage-favorites/model/store.ts`, `src/widgets/search-modal/ui/search-modal.tsx`
- 스토어에 `isFavoriteByFullName`, `removeFavoriteByFullName` 메서드 추가
- `handleAddToFavorites` → `handleToggleFavorite`로 변경 (추가/제거 토글)
- Star 아이콘 조건부 스타일: 즐겨찾기됨 `fill-yellow-400 text-yellow-400`, 미등록 `text-gray-400`
- 검색 결과 행에 `active:bg-gray-200`, `touch-manipulation` 추가
- Star 버튼에 조건부 `aria-label` 설정

### 3. 시간대별 예보 스크롤바 온도 가림 수정
- **파일**: `src/widgets/hourly-forecast/ui/hourly-forecast.tsx`
- flex 컨테이너에 `pb-3` 추가하여 스크롤바와 온도 텍스트 간격 확보

### 4. 5일 예보 그라디언트 바 오버플로우 수정
- **파일**: `src/widgets/weekly-forecast/ui/weekly-forecast.tsx`
- `Math.max(widthPercent, 10)` → `Math.min(Math.max(rawWidth, 10), 100 - leftPercent)`로 clamp
- 바 컨테이너에 `overflow-hidden` CSS 안전장치 추가
- 온도 바에 `role="img"`, `aria-label` 접근성 속성 추가

## 설치된 의존성
- `@radix-ui/react-dropdown-menu` (shadcn dropdown-menu 컴포넌트)

## 수정 파일 목록
| 파일 | 변경 유형 |
|------|----------|
| `src/shared/ui/dropdown-menu.tsx` | 신규 (shadcn CLI) |
| `src/shared/ui/index.ts` | DropdownMenu export 추가 |
| `src/features/manage-favorites/model/store.ts` | fullName 기반 메서드 2개 추가 |
| `src/widgets/favorites-grid/ui/favorite-card.tsx` | DropdownMenu 통합 리팩토링 |
| `src/widgets/search-modal/ui/search-modal.tsx` | 즐겨찾기 토글 및 Star 스타일링 |
| `src/widgets/hourly-forecast/ui/hourly-forecast.tsx` | pb-3 패딩 추가 |
| `src/widgets/weekly-forecast/ui/weekly-forecast.tsx` | clamp + overflow-hidden |

## 검증 결과
- `npm run build` 성공 (에러 없음)

## 향후 권장 작업
- 브라우저에서 수동 테스트 수행 (특히 모바일 375px 뷰포트)
- E2E 테스트 추가 고려 (즐겨찾기 추가/제거 플로우)
