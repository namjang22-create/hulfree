import React from 'react';
import { Flame, CircleDot, Waves, Sparkles, Volume2, Coffee, BarChart3, DoorOpen } from 'lucide-react';
import { StressMode, SoundState } from '../types';
import appIconImg from '../assets/images/hulfree_app_icon_1795656996207.jpg';

interface NavbarProps {
  mode: StressMode;
  setMode: (mode: StressMode) => void;
  onOpenSoundMixer: () => void;
  onOpenDonationModal: () => void;
  onOpenMindLog: () => void;
  onOpenGate: () => void;
  soundState: SoundState;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  onOpenSoundMixer,
  onOpenDonationModal,
  onOpenMindLog,
  onOpenGate,
  soundState,
}) => {
  const isAnySoundActive =
    !soundState.isMuted && (soundState.rain || soundState.ocean || soundState.bowl);

  return (
    <header className="bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 overflow-hidden shrink-0">
              <img
                src={appIconImg}
                alt="훌프리 앱 아이콘"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight flex items-center gap-2">
                훌프리 <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">HulFree 3D</span>
              </h1>
              <p className="text-[11px] text-slate-400">스트레스 쌓일 때 마음을 훌훌, 자유롭게 · 100% 익명 3D 공간</p>
            </div>
          </div>

          {/* Mobile Sound & Donation buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenDonationModal}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>후원</span>
            </button>
            <button
              onClick={onOpenSoundMixer}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                isAnySoundActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-none justify-start md:justify-center">
          <button
            onClick={() => setMode('thought')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              mode === 'thought'
                ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>🔥 고민 소멸실</span>
          </button>

          <button
            onClick={() => setMode('bubble')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              mode === 'bubble'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CircleDot className="w-4 h-4 text-cyan-400" />
            <span>🟢 버블 팝 & 말랑이</span>
          </button>

          <button
            onClick={() => setMode('neon')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              mode === 'neon'
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>✨ 네온폭죽</span>
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenGate}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="마음대문 보기"
          >
            <DoorOpen className="w-4 h-4 text-cyan-400" />
            <span>마음대문</span>
          </button>

          <button
            onClick={onOpenMindLog}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-teal-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>마음 일지</span>
          </button>

          <button
            onClick={onOpenSoundMixer}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
              isAnySoundActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isAnySoundActive ? 'animate-pulse text-cyan-400' : ''}`} />
            <span>ASMR 사운드</span>
            {isAnySoundActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
          </button>

          <button
            onClick={onOpenDonationModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950/30 cursor-pointer"
          >
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>☕ 개발자 후원 (QR)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
