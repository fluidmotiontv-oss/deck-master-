import React, { useState } from 'react';
import { Shot } from '../types/deck';
import { MASTER_DECK_METADATA } from '../data/shotsData';
import { formatSecondsToTimecode } from '../utils/temporalMath';
import { X, Download, FileText, Code, Check, Sparkles } from 'lucide-react';

interface DeckExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shots: Shot[];
}

export const DeckExporterModal: React.FC<DeckExporterModalProps> = ({
  isOpen,
  onClose,
  shots,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateMarkdown = (): string => {
    let md = `# DRAGON 9 // 18-MINUTE MASTER ANIMATION DECK\n\n`;
    md += `**Mode**: ${MASTER_DECK_METADATA.mode}\n`;
    md += `**Runtime**: ${MASTER_DECK_METADATA.runtimeFormatted}\n`;
    md += `**Temporal Engine**: ${MASTER_DECK_METADATA.temporalEngine}\n`;
    md += `**Export Date**: ${MASTER_DECK_METADATA.exportDate}\n\n---\n\n`;

    shots.forEach((shot) => {
      md += `## Shot ${shot.shotNumber.toString().padStart(2, '0')}: ${shot.title} [${formatSecondsToTimecode(shot.startTimeSec)} - ${formatSecondsToTimecode(shot.endTimeSec)}]\n\n`;
      md += `- **Act**: ${shot.act}\n`;
      md += `- **Camera Movement**: ${shot.cameraMovement}\n`;
      md += `- **Motion Flow Score**: ${shot.motionFlowScore}/10\n\n`;
      md += `### Seedance 2.5 Diffusion Prompt:\n\`\`\`text\n${shot.seedancePrompt.promptText} --motion ${shot.seedancePrompt.motionScore} --cfg ${shot.seedancePrompt.cfg} --ar ${shot.seedancePrompt.aspectRatio} --seed ${shot.seedancePrompt.seed}\n\`\`\`\n\n`;
      md += `### Non-Seedance Plasma & Simulation Spec:\n- **Target Software**: ${shot.plasmaSpec.targetSoftware}\n\`\`\`text\n${shot.plasmaSpec.specText}\n\`\`\`\n\n`;
      md += `### Character Performance:\n> "${shot.characterPerformance.dialogue}"\n\n*Delivery Notes*: ${shot.characterPerformance.deliveryNotes}\n\n`;
      md += `### Audio Sync Cue:\n${shot.audioSyncCue.title} (${shot.audioSyncCue.frequencyHz}Hz) - ${shot.audioSyncCue.description}\n\n---\n\n`;
    });

    return md;
  };

  const handleDownloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0B0D16] border border-cyan-900/60 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Export DRAGON 9 Master Deck Specifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Export the complete 18-minute master animation deck, Seedance 2.5 diffusion prompts,
            Unreal Engine 5.4 Niagara plasma specs, or character voice scripts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Markdown Master Deck */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <FileText className="w-4 h-4" />
                <span>Full Master Deck (.md)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Complete formatted Markdown deck with all shots, acts, Seedance prompts, and Niagara specs.
              </p>
              <button
                onClick={() => handleDownloadFile('DRAGON_9_MASTER_ANIMATION_DECK.md', generateMarkdown(), 'text/markdown')}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Markdown</span>
              </button>
            </div>

            {/* Option 2: JSON Production Manifest */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Code className="w-4 h-4" />
                <span>Production JSON (.json)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Raw structured JSON containing all 18 shots, timecodes, kinematics, and parametric data.
              </p>
              <button
                onClick={() => handleDownloadFile('dragon9_master_deck.json', JSON.stringify({ metadata: MASTER_DECK_METADATA, shots }, null, 2), 'application/json')}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>

            {/* Option 3: Seedance Batch Prompts */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Seedance 2.5 Batch Prompts (.txt)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Line-by-line diffusion prompts with CFG, motion scores, and seeds ready for batch rendering.
              </p>
              <button
                onClick={() => {
                  const promptBatch = shots.map((s) => `${s.seedancePrompt.promptText} --motion ${s.seedancePrompt.motionScore} --cfg ${s.seedancePrompt.cfg} --ar ${s.seedancePrompt.aspectRatio} --seed ${s.seedancePrompt.seed}`).join('\n\n');
                  handleDownloadFile('seedance_batch_prompts.txt', promptBatch, 'text/plain');
                }}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-violet-400 hover:bg-violet-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Batch Prompts</span>
              </button>
            </div>

            {/* Option 4: Niagara Simulation Preset */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Code className="w-4 h-4" />
                <span>Unreal 5.4 Niagara Manifest</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Parametric emitter manifest with voltage kV, viscosity, and raymarching configurations.
              </p>
              <button
                onClick={() => {
                  const niagaraManifest = shots.map((s) => ({
                    shot: s.shotNumber,
                    title: s.title,
                    software: s.plasmaSpec.targetSoftware,
                    voltageKV: s.plasmaSpec.voltageKV,
                    shaderType: s.plasmaSpec.shaderType,
                    spec: s.plasmaSpec.specText,
                  }));
                  handleDownloadFile('dragon9_niagara_manifest.json', JSON.stringify(niagaraManifest, null, 2), 'application/json');
                }}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Niagara Specs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
