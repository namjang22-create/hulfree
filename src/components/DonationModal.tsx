import React, { useState, useEffect } from 'react';
import { Heart, Coffee, QrCode, Copy, Check, Sparkles, X, Gift, ShieldCheck, CreditCard, Upload, Settings, RefreshCw, Lock, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'account'>('qr');
  const [donationAmount, setDonationAmount] = useState<number>(1900);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Security / Admin Lock state
  const [adminPin, setAdminPin] = useState<string>('1234');
  const [isPinAuthOpen, setIsPinAuthOpen] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // New PIN Change State
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState<boolean>(false);

  // Custom QR code & Account state stored in localStorage
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [accountInfo, setAccountInfo] = useState<string>('카카오뱅크 3333-01-2345678 (예금주: 마음비움)');

  useEffect(() => {
    const savedQr = localStorage.getItem('custom_donation_qr');
    const savedAccount = localStorage.getItem('custom_donation_account');
    const savedPin = localStorage.getItem('admin_donation_pin');
    if (savedQr) setQrImageUrl(savedQr);
    if (savedAccount) setAccountInfo(savedAccount);
    if (savedPin) setAdminPin(savedPin);
  }, []);

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSettingsRequest = () => {
    if (isAdminAuthenticated) {
      setIsEditMode(!isEditMode);
    } else {
      setInputPin('');
      setPinError('');
      setIsPinAuthOpen(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === adminPin) {
      setIsAdminAuthenticated(true);
      setIsPinAuthOpen(false);
      setIsEditMode(true);
      setPinError('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }
    setAdminPin(newPin);
    localStorage.setItem('admin_donation_pin', newPin);
    setPinChangeSuccess(true);
    setTimeout(() => {
      setPinChangeSuccess(false);
      setIsChangingPin(false);
      setNewPin('');
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('이미지 파일 크기는 3MB 이하로 선택해 주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQrImageUrl(base64String);
        localStorage.setItem('custom_donation_qr', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAccount = (newAccount: string) => {
    setAccountInfo(newAccount);
    localStorage.setItem('custom_donation_account', newAccount);
  };

  const handleResetQr = () => {
    setQrImageUrl('');
    localStorage.removeItem('custom_donation_qr');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                개발자에게 따뜻한 커피 한 잔 후원 <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                '마음비움 3D'는 100% 무료·비수집으로 운영됩니다
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenSettingsRequest}
              title={isAdminAuthenticated ? "후원 설정" : "🔒 관리자 전용 후원 설정"}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                isEditMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              {!isAdminAuthenticated && (
                <Lock className="w-2.5 h-2.5 text-amber-400 absolute top-1 right-1" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Admin PIN Verification Modal Overlay */}
          {isPinAuthOpen && (
            <div className="bg-slate-950/95 border border-amber-500/40 rounded-2xl p-5 space-y-4 text-center animate-fade-in shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">🔒 관리자 전용 암호 잠금</h4>
                <p className="text-xs text-slate-400 mt-1">
                  후원 QR 및 계좌 설정 변경은 관리자 본인만 가능합니다.<br/>관리자 비밀번호를 입력해 주세요. (기본 초기 비밀번호: <span className="text-amber-400 font-bold">1234</span>)
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-3 max-w-xs mx-auto">
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="비밀번호 입력 (초기: 1234)"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl text-center text-sm text-slate-100 tracking-widest focus:outline-none"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPinAuthOpen(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    인증하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Mode Setup Panel (Only visible after PIN verification) */}
          {isEditMode && isAdminAuthenticated ? (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Settings className="w-4 h-4" />
                  <span>관리자 후원 정보 (QR & 계좌) 설정</span>
                </div>
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>비밀번호 변경</span>
                </button>
              </div>

              {/* Password Change Sub-panel */}
              {isChangingPin && (
                <form onSubmit={handleChangePinSubmit} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    새 관리자 비밀번호 설정
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="새 비밀번호 (4자리 이상)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      저장
                    </button>
                  </div>
                  {pinChangeSuccess && (
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>비밀번호가 성공적으로 변경되었습니다!</span>
                    </p>
                  )}
                </form>
              )}

              {/* 1. Upload Custom QR Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  실제 카카오페이 / 토스 QR 이미지 업로드
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-semibold text-amber-300 flex items-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>QR 이미지 파일 선택</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {qrImageUrl && (
                    <button
                      onClick={handleResetQr}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>초기화</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 카카오톡 앱(카카오페이 &gt; 송금 &gt; 내 QR) 또는 토스 앱에서 QR 코드를 다운로드받아 등록하시면 바로 스캔할 수 있습니다.
                </p>
              </div>

              {/* 2. Edit Bank Account */}
              <div className="space-y-2 pt-2 border-t border-amber-500/20">
                <label className="text-xs font-semibold text-slate-300 block">
                  후원 계좌 정보 입력
                </label>
                <input
                  type="text"
                  value={accountInfo}
                  onChange={(e) => handleSaveAccount(e.target.value)}
                  placeholder="예: 카카오뱅크 3333-01-2345678 (예금주: 홍길동)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setIsEditMode(false)}
                className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                설정 완료 및 모달 적용
              </button>
            </div>
          ) : null}

          {/* Standard Donation View (Shown when not in Edit Mode or PIN Modal) */}
          {!isEditMode && !isPinAuthOpen && (
            <>
              {/* Preset Donation Amounts */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  후원 금액 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { amount: 1900, label: '☕ 커피 한 잔', desc: '1,900원' },
                    { amount: 3900, label: '🍰 케이크 한 조각', desc: '3,900원' },
                    { amount: 10000, label: '🎁 큰 응원 선물', desc: '10,000원' },
                  ].map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => setDonationAmount(preset.amount)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        donationAmount === preset.amount
                          ? 'bg-gradient-to-b from-amber-500/20 to-rose-500/20 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/40'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-semibold">{preset.label}</span>
                      <span className="text-sm font-bold text-slate-100">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="space-y-3">
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'qr'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR 코드 간편 스캔</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('account')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'account'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>계좌 이체 복사</span>
                  </button>
                </div>

                {/* TAB 1: QR CODE DISPLAY */}
                {activeTab === 'qr' && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                    
                    {qrImageUrl ? (
                      /* User Uploaded Real QR Image */
                      <div className="relative p-2 bg-white rounded-2xl shadow-xl border-4 border-amber-400/50 max-w-[200px]">
                        <img
                          src={qrImageUrl}
                          alt="실제 송금 QR 코드"
                          className="w-44 h-44 object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      /* Placeholder & Easy Upload Prompt */
                      <div className="w-full bg-slate-900/90 border border-dashed border-amber-500/40 rounded-2xl p-6 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-300">
                            카카오페이 / 토스 QR코드 간편 후원
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-xs">
                            개발자의 따뜻한 한 잔을 응원해 주셔서 진심으로 감사드립니다!
                          </p>
                        </div>

                        <button
                          onClick={handleOpenSettingsRequest}
                          className="mt-1 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>관리자 QR 이미지 등록/변경</span>
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-300">
                        카카오페이 / 토스 / 은행 카메라로 QR 스캔
                      </p>
                      <p className="text-[11px] text-slate-400">
                        스마트폰 카메라인 카카오톡, 토스, 은행 앱을 통해 스캔하시면 연결됩니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACCOUNT NUMBER COPY */}
                {activeTab === 'account' && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-[11px] text-slate-400">후원 계좌번호</p>
                        <p className="text-sm font-bold text-slate-100 mt-0.5 select-all">
                          {accountInfo}
                        </p>
                      </div>

                      <button
                        onClick={handleCopyAccount}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>계좌 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>개발자 직접 후원 계좌입니다. 함께해 주셔서 감사드립니다.</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>선택 후원금: <strong className="text-amber-300">{donationAmount.toLocaleString()}원</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};


