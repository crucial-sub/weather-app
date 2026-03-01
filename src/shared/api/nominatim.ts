// Nominatim(OpenStreetMap) Reverse Geocoding API 클라이언트
// 한국 주소의 동/리 단위까지 반환 가능

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Nominatim reverse geocoding 응답 타입
export interface NominatimAddress {
  quarter?: string;        // 동 (예: "석촌동")
  suburb?: string;         // 동/면 대체
  neighbourhood?: string;  // 인근 지역
  borough?: string;        // 구 (예: "송파구") - 한국 주소에서 주로 사용
  city_district?: string;  // 구 대체
  city?: string;           // 시 (예: "서울특별시")
  county?: string;         // 군
  state?: string;          // 도/광역시
  country?: string;        // 국가
}

export interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
}

// 좌표 → 상세 지역명 조회 (Reverse Geocoding)
export async function fetchNominatimReverse(lat: number, lon: number): Promise<NominatimResponse> {
  const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=ko`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WeatherApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('위치 정보를 가져올 수 없습니다.');
  }

  return response.json();
}
