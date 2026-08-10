import React, { useState, useEffect } from 'react';
import { BarChart3, Heart, Flame, CircleDot, Clock, Trash2, X, Sparkles, TrendingDown, Smile, Frown } from 'lucide-react';
import { getMindLog, saveMindLog, MindLogData, updateMoodScore } from '../utils/mindLog';

interface MindLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindLogModal: React.FC<MindLogModalProps> = ({ isOpen, onClose }) => {
  const [logData, setLogData] = useState<MindLogData>({
    totalThoughtsDestroyed: 0,
    totalBubblesPopped: 0,
    totalZenMinutes: 0,
    currentMoodBefore: 8,
    currentMoodAfter: 3,
    destroyedHistory: [],
  });

  const [beforeMood, setBeforeMood] = useState<number>(8);
  const [afterMood, setAfterMood] = useState<number>(3);

  useEffect(() => {
    if (isOpen) {
      const data = getMindLog();
      setLogData(data);
      setBeforeMood(data.currentMoodBefore || 8);
      setAfterMood(data.currentMoodAfter || 3);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMoodSave = () => {
    updateMoodScore(beforeMood, afterMood);
    setLogData(getMindLog());
  };

  const handleClearHistory = () => {
    if (confirm('마음 비움 기록을 초기화하시겠습니까?')) {
      const empty: MindLogData = {
        totalThoughtsDestroyed: 0,
        totalBubblesPopped: 0,
        totalZenMinutes: 0,
        currentMoodBefore: 5,
        currentMoodAfter: 2,
        destroyedHistory: [],
      };
      saveMindLog(empty);
      setLogData(empty);
    }
  };

  const stressReliefPercent = Math.max(0, Math.round(((beforeMood - afterMood) / beforeMood) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-indigo-500/20 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-teal-300" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                나의 마음 비움 일지 & 통계 <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                마음을 비우며 일궈낸 나의 힐링 통계 기록
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">소멸된 고민</span>
              <span className="text-lg font-black text-amber-300 mt-0.5">
                {logData.totalThoughtsDestroyed}<span className="text-xs font-normal text-slate-400 ml-0.5">개</span>
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1">
                <CircleDot className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">터뜨린 버블</span>
              <span className="text-lg font-black text-cyan-300 mt-0.5">
                {logData.totalBubblesPopped}<span className="text-xs font-normal text-slate-400 ml-0.5">개</span>
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">호흡 명상</span>
              <span className="text-lg font-black text-teal-300 mt-0.5">
                {logData.totalZenMinutes}<span className="text-xs font-normal text-slate-400 ml-0.5">분</span>
              </span>
            </div>
          </div>

          {/* Mood Change Tracker Slider */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>오늘의 스트레스 지수 변화</span>
              </label>
              {stressReliefPercent > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>{stressReliefPercent}% 감소함!</span>
                </span>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-rose-300"><Frown className="w-3.5 h-3.5" /> 앱 사용 전 (스트레스)</span>
                  <span className="font-bold text-rose-400">{beforeMood} / 10점</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={beforeMood}
                  onChange={(e) => setBeforeMood(parseInt(e.target.value))}
                  onMouseUp={handleMoodSave}
                  onTouchEnd={handleMoodSave}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-emerald-300"><Smile className="w-3.5 h-3.5" /> 앱 사용 후 (가벼워짐)</span>
                  <span className="font-bold text-emerald-400">{afterMood} / 10점</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={afterMood}
                  onChange={(e) => setAfterMood(parseInt(e.target.value))}
                  onMouseUp={handleMoodSave}
                  onTouchEnd={handleMoodSave}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Destroyed Thoughts History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>최근 소멸시킨 고민 히스토리 ({logData.destroyedHistory.length}개)</span>
              </h4>
              {logData.destroyedHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>기록 삭제</span>
                </button>
              )}
            </div>

            {logData.destroyedHistory.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-1">
                <p>아직 소멸시킨 고민 기록이 없습니다.</p>
                <p className="text-[11px] text-slate-600">🔥 고민 소멸실에서 마음속 응어리를 시원하게태워보세요!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {logData.destroyedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200 line-clamp-1">{item.text}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-shrink-0">
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                        {item.method}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
