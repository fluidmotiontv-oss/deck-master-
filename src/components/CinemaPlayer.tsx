import React, { useState } from 'react';
import { Shot } from '../types/deck';
import { CanvasVisualizer } from './CanvasVisualizer';
import { TimelineScrubber } from './TimelineScrubber';
import { audioEngine } from '../utils/audioEngine';
import { calculateDragon9Time } from '../utils/temporalMath';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  Music,
  Tv,
  Eye,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface CinemaPlayerProps {
  shots: Shot[];
  currentShot: Shot;
  currentTimeSec: number;
  totalDurationSec: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSelectShot: (shot: Shot) => void;
  onNextShot: () => void;
  onPrevShot: () => void;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  shots,
  currentShot,
  currentTimeSec,
  totalDurationSec,
  isPlaying,
  onTogglePlay,
  onSeek,
  onSelectShot,
  onNextShot,
  onPrevShot,
}) => {
  const [viewMode, setViewMode] = useState<'keyframe' | 'plasma' | 'raymarch'>('keyframe');
  const [enableScanlines, setEnableScanlines] = useState<boolean>(true);
  const [enableChromatic, setEnableChromatic] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const dragonTime = calculateDragon9Time(currentTimeSec);

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      audioEngine.toggleMute();
    }
  };

  const handleAuditionAudioCue = () => {
    audioEngine.playCue(
      currentShot.audioSyncCue.frequencyHz,
      currentShot.audioSyncCue.scaleType,
      currentShot.audioSyncCue.bpm
    );
  };

  const handleSpeakDialogue = () => {
    if (isSpeaking) {
      audioEngine.stopDialogue();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioEngine.speakDialogue(
        currentShot.characterPerformance.dialogue,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top HUD: Dual Temporal Engine Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090C14] border border-cyan-950/60 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Temporal Engine</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
            {dragonTime.formattedDragon9}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Cycle {dragonTime.harmonicCycle} / 26.66
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">Earth SMPTE: <span className="text-slate-200">{dragonTime.formattedEarthSMPTE}</span></span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-amber-400/90">Dilation 1.111x (54m/hr)</span>
        </div>
      </div>

      {/* Main Cinema Viewport with Post-Process Overlays */}
      <div className="relative">
        <CanvasVisualizer
          currentShot={currentShot}
          viewMode={viewMode}
          enableScanlines={enableScanlines}
          enableChromatic={enableChromatic}
          isPlaying={isPlaying}
          currentTimeSec={currentTimeSec}
        />

        {/* Viewport Overlay: Shot HUD Info */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded border border-cyan-900/60 text-xs">
            <span className="font-mono font-bold text-cyan-400">
              SHOT {currentShot.shotNumber.toString().padStart(2, '0')}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{currentShot.title}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded">
            <span>{currentShot.actTitle.split(':')[0]}</span>
            <span>·</span>
            <span>Motion Flow {currentShot.motionFlowScore}/10</span>
          </div>
        </div>

        {/* Viewport Controls: Mode Switcher & Post-Process Toggles */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setViewMode('keyframe')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'keyframe' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Anime Diffusion Keyframe View"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Keyframe</span>
          </button>
          <button
            onClick={() => setViewMode('plasma')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'plasma' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Niagara Coronal Plasma & SPH Mercury Simulator"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Plasma FX</span>
          </button>
          <button
            onClick={() => setViewMode('raymarch')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'raymarch' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Voronoi Raymarching Wireframe View"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Raymarch</span>
          </button>

          <span className="w-px h-3.5 bg-slate-700 mx-0.5" />

          {/* CRT Scanlines Toggle */}
          <button
            onClick={() => setEnableScanlines(!enableScanlines)}
            className={`p-1 rounded text-xs transition-colors ${
              enableScanlines ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle CRT Phosphor Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          {/* Chromatic Aberration Toggle */}
          <button
            onClick={() => setEnableChromatic(!enableChromatic)}
            className={`p-1 rounded text-xs transition-colors ${
              enableChromatic ? 'text-violet-400 bg-violet-950/40' : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Chromatic Glitch Aberration"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Subtitle / Character Voice Banner */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-black/85 backdrop-blur-md rounded-lg border border-cyan-950/80">
          <div className="space-y-0.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
              <span>Dragon Character Lead</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal lowercase">{currentShot.characterPerformance.tone}</span>
            </div>
            <p className="text-sm font-medium text-slate-100 italic">
              "{currentShot.characterPerformance.dialogue}"
            </p>
            <p className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Delivery:</strong> {currentShot.characterPerformance.deliveryNotes}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSpeakDialogue}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Speaking...' : 'Audition Voice'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0B0D14] border border-cyan-950/40 rounded-lg">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevShot}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
            title="Previous Shot"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(Math.max(0, currentTimeSec - 5))}
            className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
            title="Rewind 5 seconds"
          >
            -5s
          </button>

          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            title={isPlaying ? 'Pause' : 'Play Master Deck'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSeek(Math.min(totalDurationSec, currentTimeSec + 5))}
            className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
            title="Forward 5 seconds"
          >
            +5s
          </button>

          <button
            onClick={onNextShot}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
            title="Next Shot"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 ml-2 bg-slate-900 p-0.5 rounded border border-slate-800 text-xs">
            {[0.4, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded font-mono ${
                  playbackSpeed === spd ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Frequency Synthesizer Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAuditionAudioCue}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded transition-colors"
            title="Audition Solfeggio & Harmonic Frequency Synthesizer"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Synth {currentShot.audioSyncCue.frequencyHz}Hz</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline Scrubber Component */}
      <TimelineScrubber
        shots={shots}
        currentShot={currentShot}
        currentTimeSec={currentTimeSec}
        totalDurationSec={totalDurationSec}
        onSeek={onSeek}
        onSelectShot={onSelectShot}
      />
    </div>
  );
};
