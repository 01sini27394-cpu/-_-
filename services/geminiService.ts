import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TargetType, Recommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecommendations = async (profile: UserProfile): Promise<Recommendation[]> => {
  const genderInstruction = profile.gender === 'male'
    ? "**절대 규칙**: 학생의 성별이 남성입니다. '여자대학교'(예: 이화여대, 숙명여대, 동덕여대 등)는 추천 결과에서 반드시 제외하십시오."
    : "학생의 성별은 여성입니다. 여자대학교를 포함하여 추천해도 좋습니다.";

  const isNoInterest = profile.majorInterest.includes('없음') || profile.majorInterest.length === 0;

  // Logic for handling 'None' interest
  const interestInstruction = isNoInterest
    ? `**핵심 지침**: 학생이 희망 전공으로 '없음'을 선택했습니다. 이는 특정 학과보다 **대학 간판이나 합격 가능성**을 더 중요하게 생각한다는 의미입니다.
       따라서 전공 적합성을 따지지 말고, 오직 **내신/수능 성적**을 기준으로 지원 가능한 대학을 찾으십시오.
       추천 학과는 해당 대학에서 **취업률이 높거나**, **유망한 학과**, 또는 **합격 가능성이 가장 높은 학과**를 AI가 판단하여 선정해 추천하십시오.`
    : `관심 분야: ${profile.majorInterest.join(', ')}. 이 분야와 연관성이 높은 학과를 최우선으로 추천하십시오.`;

  const twoYearCriteria = isNoInterest
    ? "전공 무관. 취업률이 높거나 학교의 대표 학과 위주 추천"
    : "**흥미와 적성(전공 적합성)**이 가장 중요한 기준입니다";

  // CSAT and Admission Type Logic
  let admissionStrategyInstruction = "";
  let gradeInfo = "";

  if (profile.csatParticipation) {
    if (profile.admissionPreference === 'susi') {
      admissionStrategyInstruction = `
        [수시 지원 전략 (수능 응시함)]
        1. **수능 최저학력기준 활용**: 학생이 수능에 응시하므로, 수능 최저기준이 있는 전형을 적극 고려하십시오. 최저를 충족할 경우 내신 경쟁력이 다소 낮아도 합격 가능성이 높아집니다.
        2. **전형 선택**: '특성화고 특별전형'을 1순위로 보되, 선발 인원이 적다면 최저가 있는 '일반 학생부 교과 전형'을 차선책으로 추천하십시오.
        3. **학생부 종합 지양**: 특성화고 학생의 경우 '학생부 종합 전형'은 준비가 어렵고 합격률이 낮으므로 후순위로 미루십시오.
      `;
      gradeInfo = `내신 등급: ${profile.gpa}등급 (수능 최저 고려 가능)`;
    } else {
      admissionStrategyInstruction = `
        [정시 지원 전략 (수능 위주)]
        1. **모의고사 성적 중심**: 내신 성적보다 **모의고사 등급(${profile.mockExamGrade})**을 절대적인 기준으로 삼으십시오.
        2. **전형 선택**: 
           - '특성화고교 졸업자 전형(정시)'이 있다면 우선 고려하십시오 (직업탐구 반영 등 유리할 수 있음).
           - 없다면 '일반 수능 전형'을 추천하되, 탐구 영역 반영 방식이 학생에게 유리한 곳을 찾으십시오.
      `;
      gradeInfo = `모의고사 평균 등급: ${profile.mockExamGrade}등급 (내신 ${profile.gpa}등급은 참고용)`;
    }
  } else {
    admissionStrategyInstruction = `
      [수시 지원 전략 (수능 미응시)]
      1. **수능 최저 미적용**: 반드시 수능 최저학력기준이 **없는** 대학/전형만 추천해야 합니다.
      2. **전형 선택**: '특성화고 특별전형' 또는 최저가 없는 '학생부 교과 면접 전형' 등을 위주로 추천하십시오.
    `;
    gradeInfo = `내신 등급: ${profile.gpa}등급 (수능 미응시)`;
  }

  const systemInstruction = `
    당신은 대한민국 특성화고등학교 학생들을 위한 전문 진학 컨설턴트입니다.
    학생의 성적, 선호 지역, 관심 분야를 바탕으로 총 10개의 대학을 추천하고, 지원 가능성에 따라 4가지 등급으로 분류해야 합니다.
    
    [중요] 분석 및 추천 가중치:
    1. ${TargetType.FOUR_YEAR} 선택 시: 
       - 아래의 [지원 전략]을 엄격히 따르십시오.
    2. ${TargetType.TWO_YEAR} 선택 시: 
       - ${twoYearCriteria}.

    [성별 기준]
    ${genderInstruction}

    [특성화고 성적 산출 특이사항 (매우 중요)]
    특성화고는 3학년 교육과정상 '보통교과'를 이수하지 않는 경우가 많습니다. 
    일부 4년제 대학(특히 교과전형)은 3학년 보통교과 성적이 없으면 **3학년 1학기 성적을 9등급(최하점)으로 처리**하는 불이익이 있을 수 있습니다.
    따라서 대학 추천 시 이 점을 반드시 고려하여, 3학년 보통교과가 필수인 대학은 **합격 가능성을 보수적으로(낮게) 평가**하여 '소신'이나 '상향'으로 분류하십시오.

    [전형 선택 및 추천 사유 작성 가이드 (Feature)]
    대학 추천 시 단순히 학교만 나열하지 말고, **학생에게 가장 유리한 구체적 전형**을 선택하여 제안해야 합니다.
    1. **특성화고교 졸업자 특별전형**: 
       - 모집 단위에 TO가 있고 지원 자격이 된다면 1순위로 추천합니다.
    2. **학생부 교과 (일반/고교추천 등)**: 
       - 특별전형이 없거나 경쟁률이 과도할 때 추천합니다. 
       - 단, 특성화고 학생 지원 가능 여부를 확인하고, 내신 산출 시 불이익이 없는지 판단하십시오.
    3. **수능 위주 (일반/우수자/특별전형)**:
       - 정시 지원 시, 수능 100% 전형이나 특성화고 특별전형 정시 모집 중 유리한 것을 선택하십시오.

    [지원 전략 및 성적 기준]
    ${admissionStrategyInstruction}

    [관심 분야 처리]
    ${interestInstruction}

    [추천 분류 기준 (총 10개 필수)]
    성적 기준(${gradeInfo})에 맞춰 대학을 배분하십시오:
    1. **상향 (2개)**: 합격 확률 20~30% (도전)
    2. **소신 (2개)**: 합격 확률 40~50% (적정보다 약간 높음)
    3. **적정 (4개)**: 합격 확률 70~80% (안정권 진입)
    4. **안정 (2개)**: 합격 확률 90% 이상 (확실한 합격 예상)
    
    입력된 성적 정보: ${gradeInfo}
    선호 지역: ${profile.region.join(', ')}
    관심 분야: ${profile.majorInterest.join(', ')}
    추가 정보: ${profile.details}

    반드시 한국 실제 대학 데이터를 기반으로 추천하십시오. 입학처 링크는 정확한 실제 URL을 제공하세요.
  `;

  const prompt = `
    위 학생에게 적합한 ${profile.targetType}를 **총 10곳** 추천해주세요.
    반드시 다음 분포를 지키세요: 상향 2개, 소신 2개, 적정 4개, 안정 2개.
    결과는 JSON 형식으로 반환해야 합니다.
    
    각 대학별로 다음 정보가 필수입니다:
    - admissionType: 추천하는 구체적인 전형 명칭 (예: '학생부교과(일반전형)', '수시(특성화고교졸업자전형)', '정시(수능우수자전형)')
    - reason: **이 대학의 이 전형을 선택한 이유**를 구체적으로 설명. (예: "특성화고 전형 선발 인원이 없어, 내신 불이익이 없는 일반 교과전형으로 추천함", "수능 최저 충족 시 합격 가능성 높음")
    - universityName: 대학 이름
    - majorName: 학과 이름
    - location: 지역
    - matchScore: 적합도 점수
    - tags: 태그 3개
    - admissionUrl: 입학처 홈페이지 URL
    - previousResult: 전년도 입결
    - category: 지원 가능성 분류 (상향/소신/적정/안정)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              universityName: { type: Type.STRING, description: "대학 이름" },
              majorName: { type: Type.STRING, description: "학과 이름" },
              location: { type: Type.STRING, description: "지역 (시/군/구)" },
              matchScore: { type: Type.NUMBER, description: "학생 적합도 점수 (0-100)" },
              reason: { type: Type.STRING, description: "이 전형을 선택한 이유 및 학과 추천 사유" },
              admissionType: { type: Type.STRING, description: "추천 전형 이름 (예: 일반전형, 특성화고 특별전형)" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "핵심 태그 3개" },
              admissionUrl: { type: Type.STRING, description: "대학 입학처 홈페이지 URL (https:// 포함)" },
              previousResult: { type: Type.STRING, description: "전년도 입시결과 요약" },
              category: { type: Type.STRING, enum: ["상향", "소신", "적정", "안정"], description: "지원 가능성 분류" }
            },
            required: [
              "universityName", "majorName", "location", "matchScore", "reason", 
              "admissionType", "tags", "admissionUrl", "previousResult", "category"
            ]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText) as Recommendation[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("추천 정보를 불러오는 데 실패했습니다.");
  }
};
