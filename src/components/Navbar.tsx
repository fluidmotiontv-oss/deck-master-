import React from 'react';
import { Play, Download, Radio, Disc3 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'player' | 'shots' | 'vfx' | 'temporal';
  setActiveTab: (tab: 'player' | 'shots' | 'vfx' | 'temporal') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenExportModal: () => void;
  activeFrequency: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPlaying,
  onTogglePlay,
  onOpenExportModal,
  activeFrequency,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-[#090A0F]/90 backdrop-blur-md border-b border-cyan-950/40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#player"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('player');
          }}
          className="font-bold tracking-wider text-lg uppercase text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
          style={{ fontFamily: "'Chakra Petch', sans-serif" }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          DRAGON 9
        </a>
        <div className="hidden sm:flex items-center text-xs text-slate-400">
          <span>18-Min Master Deck</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="font-mono text-cyan-300/80 tabular-nums">{activeFrequency}Hz Sync</span>
        </div>
      </div>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('player')}
          className={`transition-colors relative py-1 hover:text-cyan-300 ${
            activeTab === 'player' ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400' : ''
          }`}
        >
          Timeline & Cinema
        </button>
        <button
          onClick={() => setActiveTab('shots')}
          className={`transition-colors relative py-1 hover:text-cyan-300 ${
            activeTab === 'shots' ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400' : ''
          }`}
        >
          Master Shot Deck
        </button>
        <button
          onClick={() => setActiveTab('vfx')}
          className={`transition-colors relative py-1 hover:text-cyan-300 ${
            activeTab === 'vfx' ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400' : ''
          }`}
        >
          Niagara & Plasma FX
        </button>
        <button
          onClick={() => setActiveTab('temporal')}
          className={`transition-colors relative py-1 hover:text-cyan-300 ${
            activeTab === 'temporal' ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400' : ''
          }`}
        >
          54-Min Harmonic Clock
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onTogglePlay}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-[0_0_15px_rgba(34,211,238,0.35)] whitespace-nowrap active:scale-95"
        >
          {isPlaying ? (
            <>
              <Disc3 className="w-3.5 h-3.5 animate-spin" />
              <span>Pause Reel</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Audition Reel</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-md transition-colors whitespace-nowrap"
          title="Export Deck Specifications"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Deck</span>
        </button>
      </div>
    </header>
  );
};
