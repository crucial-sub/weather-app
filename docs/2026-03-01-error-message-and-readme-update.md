# 에러 메시지 분리 처리 및 README 재작성

## 작업 일자
2026-03-01

## 수행한 작업

### 1. 상세 페이지 에러 메시지 변경 (`src/app/location/[id]/page.tsx`)
- "날씨 정보를 불러올 수 없습니다" → "해당 장소의 정보가 제공되지 않습니다."
- "잠시 후 다시 시도해주세요." → "다른 장소를 검색해보세요."

### 2. 홈 페이지 에러 분리 처리 (`src/app/page.tsx`)
- 기존: `const error = geoError || weatherError`로 합산하여 단일 에러 블록으로 처리
- 변경: geoError와 weatherError를 분리하여 각각의 에러 UI 제공
  - **위치 에러** (`geoError`): "위치 정보를 가져올 수 없습니다" + 위치 권한 허용 안내 (조건: `geoError && !currentWeather && !selectedLocation`)
  - **날씨 API 에러** (`weatherError`): "해당 장소의 정보가 제공되지 않습니다." + 장소 검색 버튼 (조건: `weatherError && !currentWeather`)
- 위치 권한 안내 블록의 조건도 `!error` → `!geoError && !weatherError`로 수정

### 3. README.md 재작성
- **기술 스택 버전 수정**: Next.js 14 → 16, React 19 추가
- **누락 라이브러리 추가**: date-fns, Sonner, Lucide React, next-themes
- **주요 기능 상세화**: 다크 모드, 반응형 디자인, 에러 처리, 새로고침 기능 반영
- **기술적 의사결정 섹션 신규 추가**: FSD, TanStack Query, Zustand, Tailwind + shadcn/ui, 로컬 검색 데이터 선택 이유
- **프로젝트 구조 트리 업데이트**: theme-provider, globals.css, ThemeToggle 반영

## 수정 파일 목록
| 파일 | 변경 유형 |
|------|----------|
| `src/app/location/[id]/page.tsx` | 에러 메시지 텍스트 변경 |
| `src/app/page.tsx` | geoError/weatherError 분리 처리 |
| `README.md` | 전체 재작성 |

## 검증
- `npm run build` 성공 확인
