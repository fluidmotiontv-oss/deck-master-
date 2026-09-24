import React, { useState } from 'react';
import { Shot } from '../types/deck';
import { formatSecondsToTimecode } from '../utils/temporalMath';
import { audioEngine } from '../utils/audioEngine';
import {
  Copy,
  Check,
  Play,
  Volume2,
  Mic,
  Camera,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';

interface ShotDeckViewProps {
  shots: Shot[];
  currentShot: Shot;
  onSelectShot: (shot: Shot) => void;
  onSeek: (seconds: number) => void;
  onAuditionShot: (shot: Shot) => void;
}

export const ShotDeckView: React.FC<ShotDeckViewProps> = ({
  shots,
  currentShot,
  onSelectShot,
  onSeek,
  onAuditionShot,
}) => {
  const [filterAct, setFilterAct] = useState<'all' | 'act-01' | 'act-02' | 'act-03'>('all');
  const [filterSoftware, setFilterSoftware] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const filteredShots = shots.filter((shot) => {
    if (filterAct !== 'all' && shot.act !== filterAct) return false;
    if (filterSoftware !== 'all' && !shot.plasmaSpec.targetSoftware.toLowerCase().includes(filterSoftware.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${shot.title} ${shot.cameraMovement} ${shot.seedancePrompt.promptText} ${shot.plasmaSpec.specText} ${shot.characterPerformance.dialogue}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleCopyPrompt = (shot: Shot) => {
    navigator.clipboard.writeText(shot.seedancePrompt.promptText);
    setCopiedPromptId(shot.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0B0D14] border border-cyan-950/40 rounded-lg">
        {/* Act Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterAct('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAct === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Acts (18:00)
          </button>
          <button
            onClick={() => setFilterAct('act-01')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAct === 'act-01' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Act I (Bodega)
          </button>
          <button
            onClick={() => setFilterAct('act-02')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAct === 'act-02' ? 'bg-violet-500/20 text-violet-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Act II (Skyline)
          </button>
          <button
            onClick={() => setFilterAct('act-03')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAct === 'act-03' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Act III (Spire)
          </button>
        </div>

        {/* Engine Software Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterSoftware}
            onChange={(e) => setFilterSoftware(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All VFX Software</option>
            <option value="unreal">Unreal Engine 5.4 Niagara</option>
            <option value="houdini">Houdini Vellum / Pyro</option>
            <option value="blender">Blender Cycles / Mantaflow</option>
            <option value="after effects">After Effects Trapcode</option>
          </select>

          <input
            type="text"
            placeholder="Search shots, prompts, dialogue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Shot Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredShots.map((shot) => {
          const isSelected = shot.id === currentShot.id;
          const isCopied = copiedPromptId === shot.id;

          return (
            <div
              key={shot.id}
              className={`bg-[#0A0D16] border rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400/80 shadow-[0_0_25px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    SHOT {shot.shotNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <h3 className="text-base font-semibold text-slate-100">{shot.title}</h3>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">
                    [{formatSecondsToTimecode(shot.startTimeSec)} - {formatSecondsToTimecode(shot.endTimeSec)}]
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Clean unboxed metadata with dot separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-violet-300 font-medium">Flow: {shot.motionFlowScore}/10</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-cyan-300">{shot.audioSyncCue.frequencyHz}Hz</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{shot.actTitle.split(':')[0]}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectShot(shot);
                      onSeek(shot.startTimeSec);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Load in Cinema</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Visual Keyframe & Kinematics (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <div
                    onClick={() => {
                      onSelectShot(shot);
                      onSeek(shot.startTimeSec);
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer"
                  >
                    {shot.imageKeyframe ? (
                      <img
                        src={shot.imageKeyframe}
                        alt={shot.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 text-slate-500">
                        <Layers className="w-8 h-8 text-cyan-500/40 mb-1" />
                        <span className="text-xs">Procedural Keyframe</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-cyan-300 fill-current" />
                    </div>
                  </div>

                  {/* Camera Movement Details */}
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium uppercase tracking-wider">
                      <Camera className="w-3 h-3" />
                      <span>Camera Kinematics</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {shot.cameraMovement}
                    </p>
                  </div>
                </div>

                {/* Middle & Right Column: Seedance Diffusion & Plasma FX (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Seedance 2.5 Diffusion Prompt Box */}
                  <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          Seedance 2.5 Diffusion Prompt
                        </span>
                        <span className="text-slate-600">·</span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>--cfg {shot.seedancePrompt.cfg}</span>
                          <span>--motion {shot.seedancePrompt.motionScore}</span>
                          <span>--seed {shot.seedancePrompt.seed}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyPrompt(shot)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
                        title="Copy complete Seedance 2.5 prompt"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                      {shot.seedancePrompt.promptText}
                    </pre>
                  </div>

                  {/* Non-Seedance Plasma & Simulation Spec */}
                  <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        Plasma & Simulation Spec
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Target: <strong className="text-emerald-400">{shot.plasmaSpec.targetSoftware}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2 rounded border border-slate-800/60">
                      {shot.plasmaSpec.specText}
                    </p>
                  </div>

                  {/* Bottom Row: Character Performance & Audio Sync */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Character Performance */}
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-cyan-400 font-medium flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Dialogue Performance
                        </span>
                        <button
                          onClick={() => {
                            audioEngine.speakDialogue(shot.characterPerformance.dialogue);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Audition
                        </button>
                      </div>
                      <p className="font-medium text-slate-200 italic">
                        "{shot.characterPerformance.dialogue}"
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        <strong>Delivery:</strong> {shot.characterPerformance.deliveryNotes}
                      </p>
                    </div>

                    {/* Audio Sync Cue */}
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-violet-400 font-medium flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Audio Sync Cue
                        </span>
                        <button
                          onClick={() => {
                            audioEngine.playCue(shot.audioSyncCue.frequencyHz, shot.audioSyncCue.scaleType, shot.audioSyncCue.bpm);
                          }}
                          className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                          Audition {shot.audioSyncCue.frequencyHz}Hz
                        </button>
                      </div>
                      <p className="font-medium text-slate-200 font-mono">
                        {shot.audioSyncCue.title} ({shot.audioSyncCue.frequencyHz}Hz)
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {shot.audioSyncCue.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
