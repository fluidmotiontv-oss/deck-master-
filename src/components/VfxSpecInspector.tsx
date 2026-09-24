import React, { useState } from 'react';
import { Shot } from '../types/deck';
import { Zap, Copy, Check, Sliders, Cpu, Terminal, Sparkles } from 'lucide-react';

interface VfxSpecInspectorProps {
  shots: Shot[];
  currentShot: Shot;
  onSelectShot: (shot: Shot) => void;
}

export const VfxSpecInspector: React.FC<VfxSpecInspectorProps> = ({
  shots,
  currentShot,
  onSelectShot,
}) => {
  const [voltageKV, setVoltageKV] = useState<number>(currentShot.plasmaSpec.voltageKV || 60);
  const [viscosity, setViscosity] = useState<number>(currentShot.plasmaSpec.viscosity || 1.8);
  const [ior, setIor] = useState<number>(currentShot.plasmaSpec.ior || 1.52);
  const [raymarchBands, setRaymarchBands] = useState<number>(3);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  const unrealNiagaraScript = `// UNREAL ENGINE 5.4 // NIAGARA NATIVE PLASMA EMITTER
// Module: Dragon9_CoronalMicroArc_Emitter
// Target: GPU Compute Sim / Raymarched SSR

UNiagaraSystem* Dragon9System = UNiagaraSystem::LoadFromAsset(TEXT("/Game/VFX/Dragon9_PlasmaCore"));

struct FPlasmaArcParameters
{
    float CoronalVoltageKV = ${voltageKV}.0f;
    float FluidViscosity = ${viscosity}f;
    float RefractiveIOR = ${ior}f;
    int32 RaymarchBands = ${raymarchBands};
    FLinearColor PlasmaColor = FLinearColor(0.0f, 0.949f, 0.996f, 1.0f); // 528Hz Aqua
};

// Niagara Scratch Pad HLSL:
void SimulateCoronalArc_Emitter(
    in float3 InPosition,
    in float InNormalizedAge,
    out float3 OutPosition,
    out float OutDischargeIntensity
) {
    float NoiseVal = PerlinNoise3D(InPosition * 0.05f + NiagaraTime * 2.4f);
    OutPosition = InPosition + (NoiseVal * ${voltageKV * 0.25}f);
    OutDischargeIntensity = saturate(sin(InNormalizedAge * 3.14159f)) * (${voltageKV} / 100.0f);
}`;

  const houdiniVellumSnippet = `# HOUDINI 20 // VELLUM & BLENDER GEOMETRY NODES
# Zero-Gravity Mercury Droplet & Voronoi Dispersion Solver

int pt = @ptnum;
vector P = @P;
float ior = ${ior};
float visc = ${viscosity};

// Electrostatic arc repulsion
vector arc_force = curlnoise(P * 0.12 + @Time * 1.5) * ${voltageKV * 0.8};
v@v += arc_force * @TimeInc;

// SPH Surface tension calculation
f@surface_tension = 0.485 * (1.0 / visc);
v@Cd = set(0.1, 0.8, 0.95); // 432Hz Cyan`;

  const handleCopyCode = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="p-5 bg-[#0B0D14] border border-cyan-950/40 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Non-Seedance Native Plasma FX & Niagara Specs</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Unreal Engine 5.4 Niagara, Houdini Vellum & Cycles Compositor Pipeline
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          The non-seedance pipeline provides deterministic physics solvers: volumetric 3-band raymarched fog,
          Screen-Space Reflections (SSR) on wet asphalt, 45kV–160kV coronal micro-arcs along neon glass tubes,
          and zero-gravity SPH mercury fluid dynamics.
        </p>
      </div>

      {/* Shot Selector for VFX Specs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {shots.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onSelectShot(s);
              if (s.plasmaSpec.voltageKV) setVoltageKV(s.plasmaSpec.voltageKV);
              if (s.plasmaSpec.viscosity) setViscosity(s.plasmaSpec.viscosity);
              if (s.plasmaSpec.ior) setIor(s.plasmaSpec.ior);
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors border ${
              s.id === currentShot.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            S{s.shotNumber.toString().padStart(2, '0')}: {s.plasmaSpec.targetSoftware.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Parameters & Code Exporters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parametric Shader Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-[#0A0D16] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Parametric Physics Tuner</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Shot {currentShot.shotNumber} Target
            </span>
          </div>

          {/* Slider 1: Coronal Discharge Voltage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Coronal Arc Voltage</span>
              <span className="font-mono text-cyan-400 font-bold">{voltageKV} kV</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={voltageKV}
              onChange={(e) => setVoltageKV(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Governs electrostatic arc branch count and dielectric breakdown speed along neon conduits.
            </p>
          </div>

          {/* Slider 2: SPH Mercury Viscosity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Fluid Viscosity (Navier-Stokes)</span>
              <span className="font-mono text-violet-400 font-bold">{viscosity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={viscosity}
              onChange={(e) => setViscosity(parseFloat(e.target.value))}
              className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Controls droplet surface tension coalescence and hoverboard slipstream damping.
            </p>
          </div>

          {/* Slider 3: Voronoi Refractive Index (IOR) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Glassmorphism IOR (Dispersion)</span>
              <span className="font-mono text-amber-400 font-bold">{ior.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.02"
              value={ior}
              onChange={(e) => setIor(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Index of refraction for mid-air celestial dial widgets and chromatic caustics.
            </p>
          </div>

          {/* Slider 4: Raymarching Volumetric Bands */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Atmospheric Raymarch Bands</span>
              <span className="font-mono text-emerald-400 font-bold">{raymarchBands} Bands</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={raymarchBands}
              onChange={(e) => setRaymarchBands(parseInt(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Light extinction depth penetration passes for Bodega deli neon volumetric haze.
            </p>
          </div>

          {/* Current Shot's Native Spec Box */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Active Shot Specification:</span>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              {currentShot.plasmaSpec.specText}
            </p>
          </div>
        </div>

        {/* Right Column: Code Snippets & Engine Modules (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Unreal 5.4 Niagara Snippet Box */}
          <div className="bg-[#0A0D16] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-200">
                  Unreal Engine 5.4 Niagara Module
                </h4>
              </div>

              <button
                onClick={() => handleCopyCode('niagara', unrealNiagaraScript)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
              >
                {copiedCodeType === 'niagara' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Module</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto leading-relaxed select-all">
              {unrealNiagaraScript}
            </pre>
          </div>

          {/* Houdini Vellum Snippet Box */}
          <div className="bg-[#0A0D16] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs font-semibold text-slate-200">
                  Houdini 20 Vellum & Cycles Shader Nodes
                </h4>
              </div>

              <button
                onClick={() => handleCopyCode('houdini', houdiniVellumSnippet)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
              >
                {copiedCodeType === 'houdini' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy VEX</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto leading-relaxed select-all">
              {houdiniVellumSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
