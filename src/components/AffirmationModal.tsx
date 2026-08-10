import React, { useState } from 'react';
import { Sparkles, Heart, Share2, RefreshCw, X, Check, Coffee } from 'lucide-react';

interface AffirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart?: () => void;
  onOpenDonation?: () => void;
}

const AFFIRMATION_QUOTES = [
  "오늘 하루 마음고생 정말 많으셨어요. 당신의 잘못이 아니니 스스로를 너무 자책하지 마세요.",
  "모든 무거운 고민과 걱정들이 공기 중으로 깨끗이 사라졌습니다. 당신은 이미 충분히 멋진 사람입니다.",
  "잠시 숨을 고르고 따뜻한 차 한 잔을 마셔보세요. 오늘 밤은 꼭 편안하고 따뜻한 꿈을 꾸길 바랄게요.",
  "남들의 시선이나 기대보다, 지금 이 순간 내 마음이 편안한 것이 가장 중요합니다.",
  "잘 해내고 계십니다. 버거운 날이 지나면 반드시 마음이 눈부시게 밝아질 거예요.",
  "마음을 채우는 것보다 비워내는 것이 진짜 용기입니다. 오늘 큰 용기를 내어 잘 비워내셨습니다.",
  "어두운 밤이 지나면 어김없이 아침 햇살이 비추듯, 당신의 마음에도 곧 따스한 볕이 들 것입니다."
];

export const AffirmationModal: React.FC<AffirmationModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onOpenDonation,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(() => Math.floor(Math.random() * AFFIRMATION_QUOTES.length));

  if (!isOpen) return null;

  const currentQuote = AFFIRMATION_QUOTES[quoteIndex];

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`[마음비움 3D] 따뜻한 위로의 한마디:\n\n"${currentQuote}"\n\nhttps://ai.studio/build`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % AFFIRMATION_QUOTES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/40 p-6 text-slate-100 flex flex-col items-center text-center space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Floating Glow Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-amber-400 p-1 shadow-xl shadow-cyan-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400/30" />
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            마음 비움 완결 & 따뜻한 위로
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-2">
            모든 무거운 마음이 사라졌습니다
          </h3>
        </div>

        {/* Comfort Quote Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative group">
          <p className="text-sm font-medium text-amber-200/90 leading-relaxed italic">
            "{currentQuote}"
          </p>

          <button
            onClick={handleNextQuote}
            className="text-[11px] text-slate-500 hover:text-cyan-400 inline-flex items-center gap-1 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>다른 위로글 보기</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyQuote}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>위로의 글 공유</span>
                </>
              )}
            </button>

            {onRestart && (
              <button
                onClick={() => {
                  onRestart();
                  onClose();
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>한 번 더 비우기</span>
              </button>
            )}
          </div>

          {onOpenDonation && (
            <button
              onClick={() => {
                onClose();
                onOpenDonation();
              }}
              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>따뜻함을 느끼셨나요? 개발자 응원 후원하기 ☕</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
