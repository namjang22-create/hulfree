import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="bg-slate-900/95 border-b border-cyan-500/20 text-slate-200 px-4 py-2 text-xs backdrop-blur-md relative z-30 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-emerald-300">100% 완전 익명 & 로컬 처리</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            회원가입, 쿠키, 위치, 개인정보 수집이 전혀 없는 순수 힐링 샌드박스입니다.
          </span>
        </div>

        <button
          onClick={() => setShowDetail(!showDetail)}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>보안 안내</span>
        </button>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">개인정보 보호 다짐</h3>
                <p className="text-xs text-slate-400">Zero Data Collection Policy</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                본 앱은 사용자의 어떤 데이터(IP, 이름, 작성글, 로그)도 외부 서버로 전송하지 않습니다.
              </p>
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>회원가입 불필요:</strong> 로그인 및 계정 시스템이 존재하지 않습니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>메모리 소멸:</strong> 입력한 고민과 텍스트는 3D 파티클 연출 직후 즉시 메모리에서 제거됩니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>안전한 세션:</strong> 브라우저 창을 닫으면 모든 흔적이 깔끔하게 지워집니다.</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">
                마음 편히 생각과 스트레스를 털어내세요.
              </p>
            </div>

            <button
              onClick={() => setShowDetail(false)}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-900/30"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
