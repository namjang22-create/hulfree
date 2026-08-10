import React from 'react';
import { Flame, CircleDot, Waves, Sparkles, Volume2, BarChart3, Coffee, Heart } from 'lucide-react';
import { StressMode, SoundState } from '../types';

interface FloatingQuickBarProps {
  mode: StressMode;
  setMode: (mode: StressMode) => void;
  onOpenSoundMixer: () => void;
  onOpenMindLog: () => void;
  onOpenDonation: () => void;
  soundState: SoundState;
}

export const FloatingQuickBar: React.FC<FloatingQuickBarProps> = ({
  mode,
  setMode,
  onOpenSoundMixer,
  onOpenMindLog,
  onOpenDonation,
  soundState,
}) => {
  const isSoundPlaying = !soundState.isMuted && (soundState.rain || soundState.ocean || soundState.bowl);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-2 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-full shadow-2xl shadow-slate-950/90 flex items-center gap-1.5 max-w-[95vw] overflow-x-auto scrollbar-none animate-bounce-subtle">
      
      {/* Mode Buttons */}
      <button
        onClick={() => setMode('thought')}
        title="고민 소멸실"
        className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          mode === 'thought'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Flame className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">고민소멸</span>
      </button>

      <button
        onClick={() => setMode('bubble')}
        title="버블 팝 & 말랑이"
        className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          mode === 'bubble'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <CircleDot className="w-4 h-4 text-cyan-400" />
        <span className="hidden sm:inline">버블팝</span>
      </button>

      <button
        onClick={() => setMode('neon')}
        title="네온폭죽"
        className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          mode === 'neon'
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="hidden sm:inline">네온폭죽</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800 mx-0.5"></div>

      {/* Mind Log Button */}
      <button
        onClick={onOpenMindLog}
        title="마음 비움 일지 & 통계"
        className="px-3 py-2 rounded-full text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <BarChart3 className="w-4 h-4 text-teal-400" />
        <span className="hidden md:inline">마음일지</span>
      </button>

      {/* ASMR Sound Toggle Button */}
      <button
        onClick={onOpenSoundMixer}
        title="ASMR 사운드 설정"
        className={`p-2 rounded-full border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
          isSoundPlaying
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Coffee Support Button */}
      <button
        onClick={onOpenDonation}
        title="개발자 응원 후원"
        className="px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <Coffee className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">후원</span>
      </button>

    </div>
  );
};
