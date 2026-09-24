export interface SeedancePrompt {
  promptText: string;
  motionScore: number;
  cfg: number;
  aspectRatio: string;
  seed: number;
  fps: number;
}

export interface PlasmaSpec {
  targetSoftware: string;
  specText: string;
  voltageKV?: number;
  viscosity?: number;
  ior?: number;
  shaderType: string;
}

export interface CharacterPerformance {
  dialogue: string;
  deliveryNotes: string;
  spanishPhrases?: string;
  tone: string;
}

export interface AudioSyncCue {
  title: string;
  frequencyHz: number;
  description: string;
  bpm?: number;
  scaleType: 'solfeggio' | 'theta' | '808-trap' | 'crystal-soundbath' | 'phonk' | 'synthwave';
}

export interface Shot {
  id: string;
  shotNumber: number;
  title: string;
  act: 'act-01' | 'act-02' | 'act-03';
  actTitle: string;
  startTimeSec: number;
  endTimeSec: number;
  durationSec: number;
  cameraMovement: string;
  motionFlowScore: number;
  seedancePrompt: SeedancePrompt;
  plasmaSpec: PlasmaSpec;
  characterPerformance: CharacterPerformance;
  audioSyncCue: AudioSyncCue;
  imageKeyframe?: string;
  keyVisualElements: string[];
}

export interface TemporalCycle {
  minutesPerHour: number; // 54
  cyclesPerSpin: number; // 26.66
  harmonicBaseFreq: number; // 432
  solfeggioFreq: number; // 528
}
