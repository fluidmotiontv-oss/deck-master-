/**
 * Dragon 9 Temporal Engine
 * Temporal Engine: 54-Minute Hour / 26.66-Hour Harmonic Cycle
 * Calculates dimensional harmonics, cycle offsets, and time dilation ratios.
 */

export interface Dragon9TimeCode {
  harmonicCycle: number;
  harmonicHour: number;
  harmonicMinute: number;
  harmonicSecond: number;
  harmonicCentisecond: number;
  dilationRatio: number;
  formattedDragon9: string;
  formattedEarthSMPTE: string;
}

export function calculateDragon9Time(totalSeconds: number): Dragon9TimeCode {
  // Standard Earth SMPTE
  const earthHours = Math.floor(totalSeconds / 3600);
  const earthMinutes = Math.floor((totalSeconds % 3600) / 60);
  const earthSecs = Math.floor(totalSeconds % 60);
  const earthFrames = Math.floor((totalSeconds % 1) * 60);

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  const formattedEarthSMPTE = `${pad2(earthHours)}:${pad2(earthMinutes)}:${pad2(earthSecs)}:${pad2(earthFrames)}`;

  // Dragon 9 Engine:
  // 1 Harmonic Hour = 54 Earth minutes = 3240 seconds (54 * 60)
  // 1 Full Harmonic Spin/Cycle = 26.66 Harmonic Hours = 26.66 * 3240 = 86,378.4 seconds (near 1 Earth day 86400s)
  const SECONDS_PER_D9_HOUR = 54 * 60; // 3,240s
  const HOURS_PER_D9_CYCLE = 26.66;
  const SECONDS_PER_D9_CYCLE = HOURS_PER_D9_CYCLE * SECONDS_PER_D9_HOUR; // 86,378.4s

  const cycleProgress = (totalSeconds % SECONDS_PER_D9_CYCLE) / SECONDS_PER_D9_CYCLE;
  const currentHarmonicHour = (totalSeconds / SECONDS_PER_D9_HOUR) % HOURS_PER_D9_CYCLE;
  const d9HourInt = Math.floor(currentHarmonicHour);
  const d9MinutesFloat = (currentHarmonicHour - d9HourInt) * 54;
  const d9MinInt = Math.floor(d9MinutesFloat);
  const d9SecFloat = (d9MinutesFloat - d9MinInt) * 60;
  const d9SecInt = Math.floor(d9SecFloat);
  const d9Centis = Math.floor((d9SecFloat - d9SecInt) * 100);

  const formattedDragon9 = `D9 · ${pad2(d9HourInt)}H ${pad2(d9MinInt)}M ${pad2(d9SecInt)}.${pad2(d9Centis)}S`;

  // Dilation ratio: Earth 60m / Dragon 54m = 1.111x harmonic dilation
  const dilationRatio = 60 / 54;

  return {
    harmonicCycle: Math.floor(totalSeconds / SECONDS_PER_D9_CYCLE) + 1,
    harmonicHour: currentHarmonicHour,
    harmonicMinute: d9MinInt,
    harmonicSecond: d9SecInt,
    harmonicCentisecond: d9Centis,
    dilationRatio,
    formattedDragon9,
    formattedEarthSMPTE,
  };
}

/**
 * Format raw seconds to MM:SS display
 */
export function formatSecondsToTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
