import React from 'react';
import { Recommendation, AdmissionCategory } from '../types';
import { MapPin, Trophy, BookOpen, ExternalLink, BarChart3, Target, TrendingUp, Anchor, CheckCircle, Bookmark } from 'lucide-react';

interface ResultCardProps {
  rec: Recommendation;
  rank?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const getCategoryStyle = (category: AdmissionCategory) => {
  switch (category) {
    case '상향':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-100',
        badge: 'bg-rose-100 text-rose-700',
        icon: TrendingUp
      };
    case '소신':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
        badge: 'bg-amber-100 text-amber-700',
        icon: Target
      };
    case '적정':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        badge: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle
      };
    case '안정':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        badge: 'bg-blue-100 text-blue-700',
        icon: Anchor
      };
  }
};

const ResultCard: React.FC<ResultCardProps> = ({ rec, isBookmarked = false, onToggleBookmark }) => {
  const styles = getCategoryStyle(rec.category);
  const CategoryIcon = styles.icon;

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 flex flex-col h-full animate-fadeIn ${styles.border}`}>
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
              <CategoryIcon className="w-3 h-3" />
              {rec.category} 지원
            </span>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {rec.location}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-xl font-black ${styles.text}`}>
              {rec.matchScore}
              <span className="text-xs font-normal text-slate-400">점</span>
            </div>
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                title={isBookmarked ? "보관함에서 제거" : "보관함에 저장"}
              >
                <Bookmark 
                  className={`w-5 h-5 transition-all ${
                    isBookmarked ? 'fill-indigo-600 text-indigo-600 scale-110' : 'text-slate-300 hover:text-indigo-400'
                  }`} 
                />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
          {rec.universityName}
        </h3>
        <div className="text-slate-600 font-medium text-sm flex items-center gap-1 mb-4">
            <BookOpen className="w-4 h-4 text-slate-400" />
            {rec.majorName}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {rec.tags.map((tag, idx) => (
            <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-500 text-[11px] px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {/* Details */}
        <div className={`space-y-2 ${styles.bg} p-3 rounded-lg mt-auto border ${styles.border}`}>
          <div className="flex justify-between items-center pb-2 border-b border-white/50">
             <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> 전형
            </div>
            <div className="text-xs font-bold text-slate-700">{rec.admissionType}</div>
          </div>
           <div className="pb-2 border-b border-white/50">
             <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
              <BarChart3 className="w-3 h-3" /> 입결
            </div>
            <div className="text-xs text-slate-700 leading-tight">{rec.previousResult}</div>
          </div>
          <div className="pt-1">
            <div className="text-xs text-slate-700 leading-tight">
              <span className="font-semibold text-slate-500 mr-1">이유:</span>
              {rec.reason}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <a 
        href={rec.admissionUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-slate-50 p-3 text-center text-xs font-bold text-slate-600 border-t border-slate-100 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
      >
        <span className="flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" /> 입학처 홈페이지
        </span>
      </a>
    </div>
  );
};

export default ResultCard;
