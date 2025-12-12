export enum TargetType {
  FOUR_YEAR = '4년제 대학교',
  TWO_YEAR = '전문대학(2-3년제)',
}

export type Gender = 'male' | 'female';

export type AdmissionCategory = '상향' | '소신' | '적정' | '안정';

export interface UserProfile {
  targetType: TargetType;
  gender: Gender; // 성별
  gpa: string; // 내신 등급
  csatParticipation: boolean; // 수능 응시 여부
  admissionPreference: 'susi' | 'jeongsi'; // 수시 vs 정시
  mockExamGrade: string; // 모의고사 등급 (정시 선택 시)
  region: string[]; // 선호 지역 (다중 선택)
  majorInterest: string[]; // 관심 분야/학과 (다중 선택)
  details: string; // 추가 사항 (자격증, 구체적 희망 등)
}

export interface Recommendation {
  universityName: string;
  majorName: string;
  location: string;
  matchScore: number; // 0-100
  reason: string;
  admissionType: string; // 전형 유형 (예: 특성화고 특별전형)
  tags: string[];
  admissionUrl: string; // 입학처 홈페이지 링크
  previousResult: string; // 입시결과 (텍스트 설명)
  category: AdmissionCategory; // 지원 가능성 분류
}

export const REGIONS = [
  "서울", "경기/인천", "강원", "충청/대전", "전라/광주", "경상/부산/대구/울산", "제주", "전국(기숙사 가능)"
];

export const INTERESTS = [
  "없음", "IT/소프트웨어", "디자인/예술", "경영/회계/금융", "보건/간호", 
  "공학/엔지니어링", "조리/외식", "뷰티/미용", "관광/호텔", "유아교육/사회복지", "반려동물"
];
