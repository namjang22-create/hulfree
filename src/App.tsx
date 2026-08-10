/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StressMode, SoundState } from './types';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Navbar } from './components/Navbar';
import { LandingGateModal } from './components/LandingGateModal';
import { SoundMixer } from './components/SoundMixer';
import { DonationModal } from './components/DonationModal';
import { MindLogModal } from './components/MindLogModal';
import { FloatingQuickBar } from './components/FloatingQuickBar';
import { ThoughtDestroyCanvas } from './components/ThreeCanvas/ThoughtDestroyCanvas';
import { SquishyBubblesCanvas } from './components/ThreeCanvas/SquishyBubblesCanvas';
import { NeonParticleCanvas } from './components/ThreeCanvas/NeonParticleCanvas';

export default function App() {
  const [mode, setMode] = useState<StressMode>('thought');
  const [isGateOpen, setIsGateOpen] = useState<boolean>(true);
  const [isSoundMixerOpen, setIsSoundMixerOpen] = useState<boolean>(false);
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);
  const [isMindLogOpen, setIsMindLogOpen] = useState<boolean>(false);

  const [soundState, setSoundState] = useState<SoundState>({
    rain: false,
    rainVol: 0.5,
    ocean: false,
    oceanVol: 0.5,
    fire: false,
    fireVol: 0.5,
    bowl: false,
    bowlVol: 0.4,
    wind: false,
    windVol: 0.4,
    masterVol: 0.8,
    isMuted: false,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 100% Privacy & Zero-Data Collection Banner */}
      <PrivacyBanner />

      {/* Main Navbar */}
      <Navbar
        mode={mode}
        setMode={setMode}
        onOpenSoundMixer={() => setIsSoundMixerOpen(true)}
        onOpenDonationModal={() => setIsDonationOpen(true)}
        onOpenMindLog={() => setIsMindLogOpen(true)}
        onOpenGate={() => setIsGateOpen(true)}
        soundState={soundState}
      />

      {/* Landing Gate Screen Modal */}
      <LandingGateModal
        isOpen={isGateOpen}
        onEnter={() => setIsGateOpen(false)}
      />

      {/* Main 3D Interactive Viewport */}
      <main className="flex-1 relative overflow-hidden pb-16">
        {mode === 'thought' && <ThoughtDestroyCanvas />}
        {mode === 'bubble' && <SquishyBubblesCanvas />}
        {mode === 'neon' && <NeonParticleCanvas />}
      </main>

      {/* Mobile & Desktop Floating Quick Bar */}
      <FloatingQuickBar
        mode={mode}
        setMode={setMode}
        onOpenSoundMixer={() => setIsSoundMixerOpen(true)}
        onOpenMindLog={() => setIsMindLogOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        soundState={soundState}
      />

      {/* Mind Log & Stats Modal */}
      <MindLogModal
        isOpen={isMindLogOpen}
        onClose={() => setIsMindLogOpen(false)}
      />

      {/* Sound Mixer Modal */}
      <SoundMixer
        isOpen={isSoundMixerOpen}
        onClose={() => setIsSoundMixerOpen(false)}
        soundState={soundState}
        setSoundState={setSoundState}
      />

      {/* Developer Donation / Support QR Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />

    </div>
  );
}
