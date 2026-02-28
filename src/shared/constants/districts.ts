// 한국 행정구역 데이터 및 검색 유틸리티
import districtsData from './korea_districts.json';

export interface District {
  fullName: string;      // "서울특별시-종로구-청운동"
  city: string;          // "서울특별시"
  district?: string;     // "종로구"
  neighborhood?: string; // "청운동"
}

// 원본 데이터를 구조화된 형태로 변환
export const districts: District[] = (districtsData as string[]).map((name) => {
  const parts = name.split('-');
  return {
    fullName: name,
    city: parts[0],
    district: parts[1],
    neighborhood: parts[2],
  };
});

// 검색 함수 (시/구/동 모든 단위로 검색 가능)
export function searchDistricts(query: string): District[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase().trim();

  return districts
    .filter((d) => {
      const searchTarget = d.fullName.replace(/-/g, ' ').toLowerCase();
      const cityMatch = d.city.toLowerCase().includes(lowerQuery);
      const districtMatch = d.district?.toLowerCase().includes(lowerQuery);
      const neighborhoodMatch = d.neighborhood?.toLowerCase().includes(lowerQuery);

      return cityMatch || districtMatch || neighborhoodMatch || searchTarget.includes(lowerQuery);
    })
    .slice(0, 10); // 최대 10개 결과
}

// 표시용 이름 생성
export function getDisplayName(district: District): string {
  if (district.neighborhood) {
    return `${district.neighborhood}, ${district.district}`;
  }
  if (district.district) {
    return `${district.district}, ${district.city}`;
  }
  return district.city;
}
