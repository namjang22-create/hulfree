import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Flame, BellRing, X, Moon, Clock, Sparkles } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { SoundState } from '../types';

interface SoundMixerProps {
  soundState: SoundState;
  setSoundState: React.Dispatch<React.SetStateAction<SoundState>>;
  isOpen: boolean;
  onClose: () => void;
}

export const SoundMixer: React.FC<SoundMixerProps> = ({
  soundState,
  setSoundState,
  isOpen,
  onClose,
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Sleep Timer countdown effect
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer finished -> Shut off all active sounds
          setSoundState((s) => ({
            ...s,
            rain: false,
            ocean: false,
            bowl: false,
          }));
          audioSynth.toggleRain(false);
          audioSynth.toggleOcean(false);
          audioSynth.toggleBowl(false);
          setTimerMinutes(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, setSoundState]);

  const handleSetTimer = (mins: number) => {
    setTimerMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const toggleSound = (key: 'rain' | 'ocean' | 'fire' | 'bowl') => {
    setSoundState((prev) => {
      const nextVal = !prev[key];
      const newState = { ...prev, [key]: nextVal };

      if (key === 'rain') audioSynth.toggleRain(nextVal, prev.rainVol);
      if (key === 'ocean') audioSynth.toggleOcean(nextVal, prev.oceanVol);
      if (key === 'bowl') audioSynth.toggleBowl(nextVal, prev.bowlVol);

      return newState;
    });
    setActivePreset(null);
  };

  const updateVol = (key: 'rainVol' | 'oceanVol' | 'fireVol' | 'bowlVol', val: number) => {
    setSoundState((prev) => {
      const newState = { ...prev, [key]: val };
      if (key === 'rainVol' && prev.rain) audioSynth.toggleRain(true, val);
      if (key === 'oceanVol' && prev.ocean) audioSynth.toggleOcean(true, val);
      if (key === 'bowlVol' && prev.bowl) audioSynth.toggleBowl(true, val);
      return newState;
    });
  };

  const toggleMute = () => {
    const nextMuted = !soundState.isMuted;
    setSoundState((prev) => ({ ...prev, isMuted: nextMuted }));
    audioSynth.setMuted(nextMuted, soundState.masterVol);
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    let newRain = false, newOcean = false, newBowl = false;
    let rVol = 0.5, oVol = 0.5, bVol = 0.4;

    if (presetName === 'rainy_night') {
      newRain = true;
      rVol = 0.7;
    } else if (presetName === 'deep_meditation') {
      newBowl = true;
      bVol = 0.6;
    } else if (presetName === 'ocean_relax') {
      newOcean = true;
      oVol = 0.6;
    } else if (presetName === 'nature_blend') {
      newRain = true;
      newOcean = true;
      newBowl = true;
      rVol = 0.4;
      oVol = 0.4;
      bVol = 0.3;
    }

    setSoundState((prev) => ({
      ...prev,
      rain: newRain,
      rainVol: rVol,
      ocean: newOcean,
      oceanVol: oVol,
      bowl: newBowl,
      bowlVol: bVol,
      isMuted: false
    }));

    audioSynth.toggleRain(newRain, rVol);
    audioSynth.toggleOcean(newOcean, oVol);
    audioSynth.toggleBowl(newBowl, bVol);
    audioSynth.setMuted(false, soundState.masterVol);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">ASMR 백색소음 & 힐링 사운드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sleep Timer & Mute Control */}
        <div className="my-4 p-3 bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-700/50">
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
              soundState.isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {soundState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{soundState.isMuted ? '음소거 됨' : '소리 켜짐'}</span>
          </button>

          {/* Sleep Timer Options */}
          <div className="flex items-center gap-1.5 text-xs">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">수면 타이머:</span>
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-700">
              {[0, 10, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetTimer(mins)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    timerMinutes === mins
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins}분`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Countdown Badge if active */}
        {remainingSeconds > 0 && (
          <div className="mb-3 px-3 py-2 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>수면 타이머 가동 중 (자동 오디오 종료)</span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-400 mb-2 block">추천 프리셋</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'rainy_night', label: '🌧️ 밤비 소리' },
              { id: 'ocean_relax', label: '🌊 해변 파도' },
              { id: 'deep_meditation', label: '🔔 528Hz 솔페지오' },
              { id: 'nature_blend', label: '🍃 풀숲 과 자연' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  activePreset === p.id
                    ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 font-semibold'
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Controls Grid */}
        <div className="space-y-4 my-2">
          {/* Rain */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center gap-3">
            <button
              onClick={() => toggleSound('rain')}
              className={`p-2.5 rounded-xl border transition-all ${
                soundState.rain
                  ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <CloudRain className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={soundState.rain ? 'text-blue-300' : 'text-slate-400'}>🌧️ 빗소리 (Rain)</span>
                <span className="text-slate-500">{Math.round(soundState.rainVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.rainVol}
                onChange={(e) => updateVol('rainVol', parseFloat(e.target.value))}
                disabled={!soundState.rain}
                className="w-full accent-blue-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

          {/* Ocean */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center gap-3">
            <button
              onClick={() => toggleSound('ocean')}
              className={`p-2.5 rounded-xl border transition-all ${
                soundState.ocean
                  ? 'bg-teal-500/30 border-teal-400 text-teal-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <Waves className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={soundState.ocean ? 'text-teal-300' : 'text-slate-400'}>🌊 파도 소리 (Waves)</span>
                <span className="text-slate-500">{Math.round(soundState.oceanVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.oceanVol}
                onChange={(e) => updateVol('oceanVol', parseFloat(e.target.value))}
                disabled={!soundState.ocean}
                className="w-full accent-teal-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

          {/* Singing Bowl */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center gap-3">
            <button
              onClick={() => toggleSound('bowl')}
              className={`p-2.5 rounded-xl border transition-all ${
                soundState.bowl
                  ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <BellRing className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className={soundState.bowl ? 'text-indigo-300' : 'text-slate-400'}>🔔 528Hz 싱잉볼 & 바이노럴</span>
                <span className="text-slate-500">{Math.round(soundState.bowlVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.bowlVol}
                onChange={(e) => updateVol('bowlVol', parseFloat(e.target.value))}
                disabled={!soundState.bowl}
                className="w-full accent-indigo-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
