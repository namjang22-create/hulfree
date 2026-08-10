import React, { useState } from 'react';
import { DoorOpen, Sparkles, Flame, CircleDot, Waves, Volume2, ShieldCheck, ArrowRight } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import gateHeroImg from '../assets/images/refresh_ocean_horizon_1785997502802.jpg';

interface LandingGateModalProps {
  isOpen: boolean;
  onEnter: () => void;
}

export const LandingGateModal: React.FC<LandingGateModalProps> = ({ isOpen, onEnter }) => {
  const [isOpening, setIsOpening] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDoorOpen = () => {
    setIsOpening(true);
    // Unmute & unlock Web Audio Context on first click interaction
    try {
      audioSynth.initCtx();
      audioSynth.playPop(1.2);
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      onEnter();
      setIsOpening(false);
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl transition-all duration-700 ${
        isOpening ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100 flex flex-col items-center text-center">
        
        {/* Top Hero Image Banner - Pure Open Refreshing Ocean View */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden group">
          <img
            src={gateHeroImg}
            alt="마음비움 3D 바다 수평선"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          {/* Subtle Floating Title Badge */}
          <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-slate-950/70 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-200 flex items-center gap-2 backdrop-blur-md shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>훌프리 (HulFree)</span>
          </div>
        </div>

        {/* Mode Highlights & Enter Action */}
        <div className="p-6 md:p-8 w-full space-y-6">
          {/* Quick Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center">
              <Flame className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs font-bold text-slate-200">고민 소멸실</span>
              <span className="text-[10px] text-slate-500">불꽃 소멸</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center">
              <CircleDot className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="text-xs font-bold text-slate-200">네온 버블팝</span>
              <span className="text-[10px] text-slate-500">수분 버블</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center">
              <Sparkles className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xs font-bold text-slate-200">네온폭죽</span>
              <span className="text-[10px] text-slate-500">터치 드로잉</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center">
              <Volume2 className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xs font-bold text-slate-200">입체 ASMR</span>
              <span className="text-[10px] text-slate-500">자연음 타임</span>
            </div>
          </div>

          {/* Big Gate Enter Button */}
          <div className="pt-2">
            <button
              onClick={handleDoorOpen}
              className="group relative w-full max-w-md mx-auto py-4 px-8 bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-black text-base md:text-lg rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden"
            >
              <DoorOpen className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>마음 날리러 가기</span>
              <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />

              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </button>
          </div>

          {/* Bottom Privacy Guarantee */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>서버 저장 없음 · 100% 익명 안전 보장</span>
          </div>
        </div>

      </div>
    </div>
  );
};
