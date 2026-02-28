// 위치 엔티티 타입 정의

export interface Location {
  id: string;
  name: string;        // 표시명 (예: "종로구, 서울특별시")
  fullName: string;    // 전체명 (예: "서울특별시-종로구")
  lat: number;
  lon: number;
}

export interface Favorite extends Location {
  alias?: string;      // 사용자 지정 별칭
  createdAt: number;
}
