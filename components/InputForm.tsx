import React, { useState } from 'react';
import { TargetType, UserProfile, REGIONS, INTERESTS, Gender } from '../types';
import { GraduationCap, BookOpen, MapPin, Calculator, Sparkles, CheckCircle2, User, Pencil, Plus, X } from 'lucide-react';

interface InputFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ profile, setProfile, onSubmit, isLoading }) => {
  const [customInterest, setCustomInterest] = useState('');

  const handleTypeChange = (type: TargetType) => {
    setProfile(prev => ({ ...prev, targetType: type }));
  };

  const handleGenderChange = (gender: Gender) => {
    setProfile(prev => ({ ...prev, gender }));
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Generic multi-select toggle
  const toggleSelection = (field: 'region' | 'majorInterest', item: string) => {
    setProfile(prev => {
      const list = prev[field];
      
      // Handle '없음' exclusivity for majorInterest
      if (field === 'majorInterest') {
        if (item === '없음') {
          // If '없음' selected, clear others
          return { ...prev, [field]: ['없음'] };
        } else {
          // If other item selected, remove '없음' if it exists
          let newList = list.filter(i => i !== '없음');
          
          if (newList.includes(item)) {
            return { ...prev, [field]: newList.filter(i => i !== item) };
          } else {
            return { ...prev, [field]: [...newList, item] };
          }
        }
      }

      // Default toggle behavior (for region)
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      // Remove '없음' if adding a custom interest
      setProfile(prev => {
        const newList = prev.majorInterest.filter(i => i !== '없음');
        return { ...prev, majorInterest: [...newList, customInterest.trim()] };
      });
      setCustomInterest('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const removeCustomInterest = (item: string) => {
    setProfile(prev => ({
      ...prev,
      majorInterest: prev.majorInterest.filter(i => i !== item)
    }));
  };

  // Identify which selected interests are custom (not in the predefined list)
  const customInterests = profile.majorInterest.filter(i => !INTERESTS.includes(i));

  const isValid = 
    profile.gpa && 
    profile.region.length > 0 && 
    profile.majorInterest.length > 0 && 
    !(profile.admissionPreference === 'jeongsi' && profile.csatParticipation && !profile.mockExamGrade);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="w-8 h-8" />
          진학 희망 조사
        </h2>
        <p className="opacity-90">
          여러분의 꿈에 맞는 학교를 AI가 찾아드립니다. 솔직한 정보를 입력해주세요.
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* Step 1: Target Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            1. 희망하는 진로 방향을 선택해주세요
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeChange(TargetType.FOUR_YEAR)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                profile.targetType === TargetType.FOUR_YEAR
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-2 relative z-10">
                <span className={`text-xl font-bold ${profile.targetType === TargetType.FOUR_YEAR ? 'text-indigo-700' : 'text-slate-700'}`}>
                  4년제 대학교
                </span>
                <span className="text-sm text-slate-500">
                  학업 심화, 이론 중심, 다양한 전공
                </span>
                <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded w-fit">
                  내신 성적 비중 높음
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeChange(TargetType.TWO_YEAR)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                profile.targetType === TargetType.TWO_YEAR
                  ? 'border-emerald-600 bg-emerald-50 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-2 relative z-10">
                <span className={`text-xl font-bold ${profile.targetType === TargetType.TWO_YEAR ? 'text-emerald-700' : 'text-slate-700'}`}>
                  전문대학 (2-3년제)
                </span>
                <span className="text-sm text-slate-500">
                  실무 중심, 빠른 취업, 전문 기술
                </span>
                <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded w-fit">
                  흥미 및 적성 비중 높음
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Gender & GPA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
            <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
               <User className="w-5 h-5 text-indigo-600" />
               2. 성별
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleGenderChange('male')}
                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                  profile.gender === 'male'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                남학생
              </button>
              <button
                onClick={() => handleGenderChange('female')}
                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                  profile.gender === 'female'
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                여학생
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Calculator className="w-5 h-5 text-indigo-600" />
               3. 내신 등급 (평균)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="9.0"
                value={profile.gpa}
                onChange={(e) => handleChange('gpa', e.target.value)}
                placeholder="예: 3.5"
                className="w-full p-4 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">등급</span>
            </div>
            <p className="text-xs text-slate-500">
              * 정시를 선택하더라도 참고용으로 입력해주세요.
            </p>
          </div>
        </div>

        {/* Step 3: CSAT & Admission Type */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
           <div className="space-y-4">
            <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Pencil className="w-5 h-5 text-indigo-600" />
               4. 수능 응시 여부
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  handleChange('csatParticipation', true);
                  // Default to 'susi' if CSAT is selected initially
                  if(!profile.admissionPreference) handleChange('admissionPreference', 'susi');
                }}
                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                  profile.csatParticipation
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                응시함 (O)
              </button>
              <button
                onClick={() => {
                   handleChange('csatParticipation', false);
                   handleChange('admissionPreference', 'susi'); // Reset to susi if no CSAT
                }}
                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                  !profile.csatParticipation
                    ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                응시안함 (X)
              </button>
            </div>
          </div>

          {/* Conditional: Admission Type (Only if CSAT is Yes) */}
          {profile.csatParticipation && (
            <div className="space-y-4 animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700">
                👉 주력 전형 선택
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleChange('admissionPreference', 'susi')}
                  className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                    profile.admissionPreference === 'susi'
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  수시 (최저학력기준 고려)
                </button>
                <button
                  onClick={() => handleChange('admissionPreference', 'jeongsi')}
                  className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                    profile.admissionPreference === 'jeongsi'
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  정시 (수능 위주)
                </button>
              </div>
              
              {profile.admissionPreference === 'susi' && (
                <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                  * 수능 최저학력기준을 충족할 수 있는 대학을 포함하여 추천합니다. <br/>
                  * <b>학생부 종합 전형</b>은 특성화고 합격 가능성이 낮으므로 <b>후순위</b>로 추천됩니다.
                </p>
              )}
            </div>
          )}

          {/* Conditional: Mock Exam Grade (Only if Jeongsi is Yes) */}
          {profile.csatParticipation && profile.admissionPreference === 'jeongsi' && (
             <div className="space-y-4 animate-fadeIn">
                <label className="block text-sm font-semibold text-slate-700">
                  👉 최근 모의고사 평균 등급
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="9.0"
                    value={profile.mockExamGrade}
                    onChange={(e) => handleChange('mockExamGrade', e.target.value)}
                    placeholder="예: 3.5"
                    className="w-full p-4 pl-4 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">등급</span>
                </div>
                 <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                  * 정시 지원 시 내신보다 모의고사(수능) 성적이 결정적입니다. 입력한 등급을 기준으로 대학을 추천합니다.
                </p>
             </div>
          )}
        </div>

        {/* Step 4: Region */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            5. 희망 지역 (중복 선택 가능)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REGIONS.map((region) => {
              const isSelected = profile.region.includes(region);
              return (
                <button
                  key={region}
                  onClick={() => toggleSelection('region', region)}
                  className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-200'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
          {profile.region.length === 0 && (
            <p className="text-xs text-rose-500 mt-1">* 최소 1개 이상의 지역을 선택해주세요.</p>
          )}
        </div>

        {/* Step 5: Major Interest */}
        <div className="space-y-4">
           <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              6. 관심 계열 (중복 선택 가능)
           </label>
           <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = profile.majorInterest.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleSelection('majorInterest', interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
              
              {/* Chips for Custom Interests */}
              {customInterests.map((interest) => (
                <div 
                  key={interest} 
                  className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white shadow-md transform scale-105 flex items-center gap-2"
                >
                  {interest}
                  <button onClick={() => removeCustomInterest(interest)} className="hover:text-indigo-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
           </div>
           
           {/* Custom Interest Input */}
           <div className="flex gap-2 mt-2">
             <input 
                type="text" 
                placeholder="직접 입력 (예: 제과제빵, 항공정비)"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
             />
             <button 
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center"
             >
                <Plus className="w-4 h-4" />
             </button>
           </div>
           {profile.majorInterest.length === 0 && (
            <p className="text-xs text-rose-500 mt-1">* 최소 1개 이상의 관심 계열을 선택해주세요.</p>
          )}
        </div>
        
        {/* Step 6: Details */}
        <div className="space-y-4">
           <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              7. 추가 참고 사항 (선택)
           </label>
           <textarea
             value={profile.details}
             onChange={(e) => handleChange('details', e.target.value)}
             placeholder="예: 취득한 자격증(전산회계 1급 등), 선호하는 대학 분위기, 기숙사 필수 여부 등"
             className="w-full p-4 border border-slate-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
           />
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || !isValid}
          className={`w-full py-5 rounded-xl text-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
             isLoading || !isValid
             ? 'bg-slate-300 cursor-not-allowed shadow-none'
             : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-indigo-500/30'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI가 학교를 분석 중입니다...
            </span>
          ) : (
            '맞춤형 대학 추천받기'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
