import React, { useState, useEffect } from 'react';
import { calculateDragon9Time, formatSecondsToTimecode } from '../utils/temporalMath';
import { audioEngine } from '../utils/audioEngine';
import { Clock, Disc, Sparkles, Volume2, Compass, ArrowRightLeft } from 'lucide-react';

interface TemporalEngineWidgetProps {
  currentTimeSec: number;
  onSeek: (seconds: number) => void;
}

export const TemporalEngineWidget: React.FC<TemporalEngineWidgetProps> = ({
  currentTimeSec,
  onSeek,
}) => {
  const [earthInputSec, setEarthInputSec] = useState<number>(currentTimeSec);
  const [dialAngle, setDialAngle] = useState<number>(0);

  useEffect(() => {
    setEarthInputSec(currentTimeSec);
  }, [currentTimeSec]);

  const liveD9Time = calculateDragon9Time(currentTimeSec);
  const calculatedD9Time = calculateDragon9Time(earthInputSec);

  // Animate circular celestial dial
  useEffect(() => {
    const interval = setInterval(() => {
      setDialAngle((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#0B0D14] border border-cyan-950/40 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>DRAGON 9 Temporal Engine & Harmonic Calibration</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          54-Minute Hour / 26.66-Hour Harmonic Cycle
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Earth time is obsolete. DRAGON 9 operates on a 54-minute harmonic hour with 26.66 cycles per planetary spin,
          tuned to 432Hz theta frequencies and 528Hz Solfeggio DNA healing nodes.
        </p>
      </div>

      {/* Main Grid: Celestial Dial Display & Math Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Celestial Dimensional Dial (6 cols) */}
        <div className="lg:col-span-6 bg-[#0A0D16] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-5">
          <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Celestial Dial in Mid-Air (Shot 02)</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {liveD9Time.formattedDragon9}
            </span>
          </div>

          {/* Interactive Celestial Dial graphic */}
          <div className="relative w-72 h-72 flex items-center justify-center select-none">
            {/* Outer Ring: 54-Minute Divisions */}
            <div
              style={{ transform: `rotate(${dialAngle}deg)` }}
              className="absolute inset-0 rounded-full border-2 border-cyan-500/30 border-dashed transition-transform duration-75"
            />

            {/* Inner Ring: 26.66 Harmonic Cycle Markers */}
            <div
              style={{ transform: `rotate(-${dialAngle * 1.5}deg)` }}
              className="absolute inset-4 rounded-full border border-violet-500/40 transition-transform duration-75"
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-8px)`,
                  }}
                  className="absolute inset-0 flex justify-center text-[9px] font-mono text-violet-300"
                >
                  ·
                </div>
              ))}
            </div>

            {/* Central Glassmorphic Core */}
            <div className="relative z-10 w-44 h-44 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-5 h-5 text-cyan-400 mb-1 animate-pulse" />
              <div className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                Cycle {liveD9Time.harmonicCycle}
              </div>
              <div className="font-mono text-lg font-bold text-white tabular-nums my-0.5">
                {liveD9Time.harmonicMinute.toString().padStart(2, '0')}:
                {liveD9Time.harmonicSecond.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-cyan-300">
                54-Min Resonance
              </div>
            </div>

            {/* Rotating indicator needles */}
            <div
              style={{ transform: `rotate(${dialAngle * 3}deg)` }}
              className="absolute w-1 h-32 bg-gradient-to-t from-transparent via-cyan-400 to-white -top-2 origin-bottom rounded-full pointer-events-none"
            />
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Dilation Factor: <strong className="text-cyan-400 font-mono">1.111x (60/54)</strong></span>
            <span>Harmonic Lock: <strong className="text-emerald-400 font-mono">26.66 Cycles</strong></span>
          </div>
        </div>

        {/* Right Column: Interactive Timecode Converter & Frequency Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Converter Box */}
          <div className="bg-[#0A0D16] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Earth ⇋ Dragon 9 Dimensional Converter</span>
              </h3>
            </div>

            {/* Earth Seconds Input Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Master Reel Position (Seconds)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {earthInputSec}s ({formatSecondsToTimecode(earthInputSec)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1080"
                step="1"
                value={earthInputSec}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEarthInputSec(val);
                  onSeek(val);
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Results Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Earth Standard</span>
                <div className="text-base font-mono font-bold text-slate-200">
                  {calculatedD9Time.formattedEarthSMPTE}
                </div>
                <div className="text-[10px] text-slate-500">60 mins / hour · 24 hr/day</div>
              </div>

              <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-900/60 space-y-1">
                <span className="text-[11px] text-cyan-400 uppercase tracking-wider">Dragon 9 Harmonic</span>
                <div className="text-base font-mono font-bold text-cyan-300">
                  {calculatedD9Time.formattedDragon9}
                </div>
                <div className="text-[10px] text-cyan-400/80">54 mins / hour · 26.66 cycles</div>
              </div>
            </div>
          </div>

          {/* Solfeggio & Harmonic Frequency Matrix */}
          <div className="bg-[#0A0D16] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Harmonic Resonance Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 432 Hz Card */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-cyan-400">432 Hz</div>
                  <div className="text-[11px] text-slate-400">Theta Wave / 808 Sub-Drop</div>
                </div>
                <button
                  onClick={() => audioEngine.playCue(432, 'theta')}
                  className="p-1.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 transition-colors"
                  title="Audition 432Hz Theta Tone"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 528 Hz Card */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-emerald-400">528 Hz</div>
                  <div className="text-[11px] text-slate-400">Solfeggio DNA Healing Tone</div>
                </div>
                <button
                  onClick={() => audioEngine.playCue(528, 'solfeggio')}
                  className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 transition-colors"
                  title="Audition 528Hz Solfeggio Tone"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
