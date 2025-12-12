import React, { useState, useEffect } from 'react';
import { TargetType, UserProfile, Recommendation, AdmissionCategory } from './types';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import { getRecommendations } from './services/geminiService';
import { School, RefreshCw, AlertCircle, TrendingUp, Target, CheckCircle, Anchor, Bookmark, List } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    targetType: TargetType.FOUR_YEAR,
    gender: 'male',
    gpa: '',
    csatParticipation: false,
    admissionPreference: 'susi',
    mockExamGrade: '',
    region: [],
    majorInterest: [],
    details: ''
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedList, setSavedList] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('unipath_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'search' | 'saved'>('search');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    localStorage.setItem('unipath_saved', JSON.stringify(savedList));
  }, [savedList]);

  const toggleBookmark = (rec: Recommendation) => {
    setSavedList(prev => {
      // Use a composite key check for uniqueness
      const isSaved = prev.some(item => 
        item.universityName === rec.universityName && 
        item.majorName === rec.majorName && 
        item.admissionType === rec.admissionType
      );

      if (isSaved) {
        return prev.filter(item => !(
          item.universityName === rec.universityName && 
          item.majorName === rec.majorName && 
          item.admissionType === rec.admissionType
        ));
      } else {
        return [...prev, rec];
      }
    });
  };

  const isBookmarked = (rec: Recommendation) => {
    return savedList.some(item => 
      item.universityName === rec.universityName && 
      item.majorName === rec.majorName && 
      item.admissionType === rec.admissionType
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getRecommendations(profile);
      setRecommendations(results);
      setShowResults(true);
      setViewMode('search');
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setRecommendations([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSection = (title: string, category: AdmissionCategory, icon: React.ReactNode, description: string, colorClass: string) => {
    const filtered = recommendations.filter(r => r.category === category);
    if (filtered.length === 0) return null;

    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
             {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((rec, index) => (
            <ResultCard 
              key={`${category}-${index}`} 
              rec={rec} 
              isBookmarked={isBookmarked(rec)}
              onToggleBookmark={() => toggleBookmark(rec)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setViewMode('search')}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <School className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
              UniPath AI
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setViewMode('saved')}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                 viewMode === 'saved' 
                   ? 'bg-indigo-100 text-indigo-700' 
                   : 'text-slate-500 hover:bg-slate-100'
               }`}
             >
               <Bookmark className="w-4 h-4" />
               <span className="hidden sm:inline">관심 대학</span>
               {savedList.length > 0 && (
                 <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full min-w-[1.2rem] text-center">
                   {savedList.length}
                 </span>
               )}
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'saved' ? (
          <div className="fade-in">
             <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
                 <Bookmark className="w-6 h-6" />
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-slate-800">관심 대학 보관함</h1>
                 <p className="text-slate-500">저장한 대학 리스트를 확인하세요.</p>
               </div>
             </div>

             {savedList.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                 <List className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-slate-700 mb-2">보관된 대학이 없습니다.</h3>
                 <p className="text-slate-500 mb-6">검색 결과에서 마음에 드는 대학을 저장해보세요!</p>
                 <button 
                   onClick={() => setViewMode('search')}
                   className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                 >
                   대학 찾으러 가기
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {savedList.map((rec, index) => (
                   <ResultCard 
                     key={`saved-${index}`} 
                     rec={rec} 
                     isBookmarked={true}
                     onToggleBookmark={() => toggleBookmark(rec)}
                   />
                 ))}
               </div>
             )}
          </div>
        ) : (
          /* Search Mode View */
          <>
            {!showResults ? (
              <div className="fade-in-up">
                <div className="text-center mb-10">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
                    나에게 딱 맞는 <br className="sm:hidden" />
                    <span className="text-indigo-600">대학 지원 전략</span>을 세워보세요
                  </h1>
                  <p className="text-slate-600 max-w-xl mx-auto text-lg">
                    내신 등급, 수능/모의고사 성적을 종합적으로 분석하여<br />
                    최적의 합격 전략을 제시해 드립니다.
                  </p>
                </div>
                <InputForm 
                  profile={profile}
                  setProfile={setProfile}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        🎯 맞춤형 지원 전략 리포트
                      </h2>
                      <p className="text-slate-500">
                        <span className="font-bold text-indigo-600">
                          {profile.admissionPreference === 'jeongsi' && profile.csatParticipation 
                            ? `모의고사 ${profile.mockExamGrade}등급` 
                            : `내신 ${profile.gpa}등급`}
                        </span> 
                        {' '}/ {profile.region.join(', ')} / {profile.gender === 'male' ? '남학생' : '여학생'} 
                        {profile.csatParticipation && profile.admissionPreference === 'susi' && <span className="text-xs ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">수능최저 고려</span>}
                      </p>
                  </div>
                  <button 
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 flex items-center gap-2 transition-colors"
                  >
                      <RefreshCw className="w-4 h-4" />
                      조건 다시 설정
                  </button>
                </div>

                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {renderSection('상향 지원 (도전)', '상향', <TrendingUp className="w-6 h-6 text-rose-600" />, '합격 확률 20~30% | 도전해볼 만한 대학', 'bg-rose-500')}
                    {renderSection('소신 지원 (목표)', '소신', <Target className="w-6 h-6 text-amber-600" />, '합격 확률 40~50% | 추가 합격을 노려볼 수 있는 목표 대학', 'bg-amber-500')}
                    {renderSection('적정 지원 (합격권)', '적정', <CheckCircle className="w-6 h-6 text-emerald-600" />, '합격 확률 70~80% | 무난하게 지원 가능한 대학', 'bg-emerald-500')}
                    {renderSection('안정 지원 (보험)', '안정', <Anchor className="w-6 h-6 text-blue-600" />, '합격 확률 90% 이상 | 확실한 합격을 기대할 수 있는 대학', 'bg-blue-500')}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">추천 결과가 없습니다. 조건을 조금 더 넓혀보세요.</p>
                  </div>
                )}
                
                <div className="mt-12 bg-indigo-50 border border-indigo-100 p-8 rounded-2xl text-center">
                  <h4 className="text-indigo-900 font-bold text-lg mb-2">📢 입시 지원 가이드</h4>
                  <p className="text-indigo-700 mb-4">
                    {profile.csatParticipation && profile.admissionPreference === 'jeongsi' 
                        ? "정시는 가/나/다군 각 1회씩 총 3회 지원 가능합니다. 군별로 적절히 분산하여 지원하세요."
                        : "일반적으로 4년제 수시 지원은 6회까지 가능하므로, 상향/소신/적정/안정을 조합하여 지원하세요."}
                  </p>
                  <p className="text-sm text-slate-500">
                      * 본 결과는 AI 분석에 기반한 참고용 자료입니다. 반드시 담임 선생님과 상담 후 최종 결정하세요.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="fixed bottom-6 right-6 bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-xl border border-red-100 flex items-center gap-3 animate-bounce-in z-50">
             <AlertCircle className="w-6 h-6" />
             {error}
             <button onClick={() => setError(null)} className="ml-2 font-bold hover:text-red-800">×</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
