import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CinemaPlayer } from './components/CinemaPlayer';
import { ShotDeckView } from './components/ShotDeckView';
import { VfxSpecInspector } from './components/VfxSpecInspector';
import { TemporalEngineWidget } from './components/TemporalEngineWidget';
import { DeckExporterModal } from './components/DeckExporterModal';
import { SHOTS_DATA, MASTER_DECK_METADATA } from './data/shotsData';
import { Shot } from './types/deck';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'shots' | 'vfx' | 'temporal'>('player');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const totalDurationSec = MASTER_DECK_METADATA.runtimeSeconds; // 1,080s (18:00)

  // Find active shot based on currentTimeSec
  const currentShot: Shot =
    SHOTS_DATA.find(
      (s) => currentTimeSec >= s.startTimeSec && currentTimeSec < s.endTimeSec
    ) || SHOTS_DATA[0];

  const prevShotIdRef = useRef<string>(currentShot.id);

  // Playback timer loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTimeSec((prev) => {
          const next = prev + delta;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDurationSec]);

  // Audio cue trigger when shot changes during playback
  useEffect(() => {
    if (isPlaying && currentShot.id !== prevShotIdRef.current) {
      prevShotIdRef.current = currentShot.id;
      audioEngine.playCue(
        currentShot.audioSyncCue.frequencyHz,
        currentShot.audioSyncCue.scaleType,
        currentShot.audioSyncCue.bpm
      );
    }
  }, [currentShot, isPlaying]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTimeSec - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(totalDurationSec, currentTimeSec + 5));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        audioEngine.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTimeSec, totalDurationSec, isPlaying]);

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      audioEngine.playCue(
        currentShot.audioSyncCue.frequencyHz,
        currentShot.audioSyncCue.scaleType,
        currentShot.audioSyncCue.bpm
      );
    } else {
      audioEngine.stopAllSound();
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(totalDurationSec, seconds));
    setCurrentTimeSec(clamped);
  };

  const handleSelectShot = (shot: Shot) => {
    setCurrentTimeSec(shot.startTimeSec);
  };

  const handleNextShot = () => {
    const currentIndex = SHOTS_DATA.findIndex((s) => s.id === currentShot.id);
    if (currentIndex < SHOTS_DATA.length - 1) {
      handleSelectShot(SHOTS_DATA[currentIndex + 1]);
    }
  };

  const handlePrevShot = () => {
    const currentIndex = SHOTS_DATA.findIndex((s) => s.id === currentShot.id);
    if (currentIndex > 0) {
      handleSelectShot(SHOTS_DATA[currentIndex - 1]);
    }
  };

  const handleAuditionShot = (shot: Shot) => {
    handleSelectShot(shot);
    setActiveTab('player');
    audioEngine.playCue(
      shot.audioSyncCue.frequencyHz,
      shot.audioSyncCue.scaleType,
      shot.audioSyncCue.bpm
    );
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Universal 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeFrequency={currentShot.audioSyncCue.frequencyHz}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'player' && (
          <CinemaPlayer
            shots={SHOTS_DATA}
            currentShot={currentShot}
            currentTimeSec={currentTimeSec}
            totalDurationSec={totalDurationSec}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onSelectShot={handleSelectShot}
            onNextShot={handleNextShot}
            onPrevShot={handlePrevShot}
          />
        )}

        {activeTab === 'shots' && (
          <ShotDeckView
            shots={SHOTS_DATA}
            currentShot={currentShot}
            onSelectShot={handleSelectShot}
            onSeek={handleSeek}
            onAuditionShot={handleAuditionShot}
          />
        )}

        {activeTab === 'vfx' && (
          <VfxSpecInspector
            shots={SHOTS_DATA}
            currentShot={currentShot}
            onSelectShot={handleSelectShot}
          />
        )}

        {activeTab === 'temporal' && (
          <TemporalEngineWidget
            currentTimeSec={currentTimeSec}
            onSeek={handleSeek}
          />
        )}
      </main>

      {/* Production Deck Footer */}
      <footer className="mt-auto border-t border-cyan-950/40 bg-[#090C14] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">DRAGON 9</span>
            <span aria-hidden="true">·</span>
            <span>Non-Seedance Native Plasma FX & Niagara Specs</span>
            <span aria-hidden="true">·</span>
            <span>54-Minute Hour Harmonic Engine</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>Export Date: 22/09/2026</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400/80">1,080 Seconds Master Arc</span>
          </div>
        </div>
      </footer>

      {/* Export Specifications Modal */}
      <DeckExporterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        shots={SHOTS_DATA}
      />
    </div>
  );
}
