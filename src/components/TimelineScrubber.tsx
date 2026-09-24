import React, { useRef } from 'react';
import { Shot } from '../types/deck';
import { formatSecondsToTimecode } from '../utils/temporalMath';
import { Activity, Radio, Cpu, Sparkles } from 'lucide-react';

interface TimelineScrubberProps {
  shots: Shot[];
  currentShot: Shot;
  currentTimeSec: number;
  totalDurationSec: number;
  onSeek: (seconds: number) => void;
  onSelectShot: (shot: Shot) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  shots,
  currentShot,
  currentTimeSec,
  totalDurationSec,
  onSeek,
  onSelectShot,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * totalDurationSec);
  };

  return (
    <div className="w-full bg-[#0B0D14] border border-cyan-950/40 rounded-lg p-3.5 space-y-2.5">
      {/* Top Track Header: Timecode readouts & Quick Jump */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold tabular-nums text-sm">
            {formatSecondsToTimecode(currentTimeSec)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-slate-400 tabular-nums">
            {formatSecondsToTimecode(totalDurationSec)} (18:00 Master)
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-sm">
            Shot {currentShot.shotNumber.toString().padStart(2, '0')}: {currentShot.title}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Act I (00:00-04:30)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-slate-400">Act II (04:30-11:30)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Act III (11:30-18:00)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Scrubber Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-11 bg-slate-950 rounded border border-slate-800/80 cursor-pointer overflow-hidden select-none"
      >
        {/* Shot Blocks */}
        <div className="absolute inset-0 flex">
          {shots.map((shot) => {
            const widthPct = (shot.durationSec / totalDurationSec) * 100;
            const isCurrent = currentShot.id === shot.id;
            const actColor =
              shot.act === 'act-01'
                ? isCurrent ? 'bg-cyan-500/30 border-cyan-400' : 'bg-cyan-950/40 border-cyan-900/60'
                : shot.act === 'act-02'
                ? isCurrent ? 'bg-violet-500/30 border-violet-400' : 'bg-violet-950/40 border-violet-900/60'
                : isCurrent ? 'bg-amber-500/30 border-amber-400' : 'bg-amber-950/40 border-amber-900/60';

            return (
              <div
                key={shot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(shot.startTimeSec);
                  onSelectShot(shot);
                }}
                style={{ width: `${widthPct}%` }}
                className={`h-full border-r relative group transition-colors flex flex-col justify-between p-1 overflow-hidden ${actColor}`}
                title={`Shot ${shot.shotNumber}: ${shot.title} [${formatSecondsToTimecode(shot.startTimeSec)} - ${formatSecondsToTimecode(shot.endTimeSec)}]`}
              >
                <div className="flex items-center justify-between text-[10px] leading-none">
                  <span className={`font-mono font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    S{shot.shotNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono opacity-70">
                    {shot.audioSyncCue.frequencyHz}Hz
                  </span>
                </div>

                <div className="text-[9px] text-slate-300 truncate font-mono opacity-80 group-hover:opacity-100">
                  {shot.motionFlowScore}/10
                </div>
              </div>
            );
          })}
        </div>

        {/* Playhead Marker */}
        <div
          style={{ left: `${(currentTimeSec / totalDurationSec) * 100}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20 pointer-events-none shadow-[0_0_8px_rgba(248,113,113,0.9)]"
        >
          <div className="w-2.5 h-2.5 -ml-1 -top-1 bg-red-400 transform rotate-45" />
        </div>
      </div>

      {/* Sub-Track: Audio Frequencies & Simulation Engines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900/60 border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Active Sync: <strong className="text-cyan-300 font-mono">{currentShot.audioSyncCue.frequencyHz}Hz</strong></span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900/60 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="truncate">Motion Score: <strong className="text-violet-300 font-mono">{currentShot.motionFlowScore}/10</strong></span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900/60 border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">VFX: <strong className="text-emerald-300 truncate">{currentShot.plasmaSpec.targetSoftware.split(' ')[0]}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900/60 border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Temporal: <strong className="text-amber-300 font-mono">54m / 26.66c</strong></span>
        </div>
      </div>
    </div>
  );
};
