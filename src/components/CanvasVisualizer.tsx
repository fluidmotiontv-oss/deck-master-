import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { Shot } from '../types/deck';

interface CanvasVisualizerProps {
  currentShot: Shot;
  viewMode: 'keyframe' | 'plasma' | 'raymarch';
  enableScanlines: boolean;
  enableChromatic: boolean;
  isPlaying: boolean;
  currentTimeSec: number;
}

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({
  currentShot,
  viewMode,
  enableScanlines,
  enableChromatic,
  isPlaying,
  currentTimeSec,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const imageCache = useRef<{ [url: string]: HTMLImageElement }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const analyser = audioEngine.getAnalyser();
    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 128);

    // Preload image
    if (currentShot.imageKeyframe && !imageCache.current[currentShot.imageKeyframe]) {
      const img = new Image();
      img.src = currentShot.imageKeyframe;
      img.onload = () => {
        imageCache.current[currentShot.imageKeyframe!] = img;
      };
    }

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Audio analysis data
      let audioEnergy = 0;
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        audioEnergy = sum / dataArray.length / 255;
      }

      ctx.clearRect(0, 0, width, height);

      if (viewMode === 'keyframe' && currentShot.imageKeyframe && imageCache.current[currentShot.imageKeyframe]) {
        const img = imageCache.current[currentShot.imageKeyframe];
        
        // Subtle camera truck-in zoom based on shot progress
        const shotProgress = (currentTimeSec - currentShot.startTimeSec) / Math.max(1, currentShot.durationSec);
        const zoom = 1 + (shotProgress % 1) * 0.05 + audioEnergy * 0.03;
        
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Liquid chrome reflection overlay
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(0, 242, 254, 0.03)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
        grad.addColorStop(1, 'rgba(79, 172, 254, 0.04)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

      } else if (viewMode === 'plasma') {
        // Pure Niagara & Plasma Simulation Canvas
        ctx.fillStyle = '#06080F';
        ctx.fillRect(0, 0, width, height);

        // Grid lines with perspective
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
        ctx.lineWidth = 1;
        const horizon = height * 0.65;
        
        // Vanishing perspective lines
        for (let x = -width; x <= width * 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(width / 2, horizon);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal depth grid
        for (let y = horizon; y <= height; y += (height - horizon) / 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Plasma coronal discharge arcs (Niagara simulation)
        const voltage = currentShot.plasmaSpec.voltageKV || 60;
        const arcCount = Math.floor(voltage / 25);

        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00F2FE';

        for (let a = 0; a < arcCount; a++) {
          ctx.beginPath();
          ctx.strokeStyle = a % 2 === 0 ? 'rgba(0, 242, 254, 0.9)' : 'rgba(168, 85, 247, 0.85)';
          
          let curX = width * 0.2 + (a * width * 0.6) / arcCount;
          let curY = height * 0.3;
          ctx.moveTo(curX, curY);

          for (let seg = 0; seg < 14; seg++) {
            const nextX = curX + (Math.sin(time * 3 + seg + a) * 35) + (Math.random() - 0.5) * 20;
            const nextY = curY + 25 + Math.cos(time * 2 + seg) * 10;
            ctx.lineTo(nextX, nextY);
            curX = nextX;
            curY = nextY;
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Zero-gravity mercury fluid droplets
        const numDroplets = 24;
        for (let i = 0; i < numDroplets; i++) {
          const dropX = (Math.sin(time * 0.8 + i) * 0.4 + 0.5) * width;
          const dropY = (Math.cos(time * 0.5 + i * 1.5) * 0.35 + 0.45) * height;
          const radius = (Math.sin(time + i) * 4 + 8) + audioEnergy * 10;

          // Liquid chrome mercury gradient
          const dropGrad = ctx.createRadialGradient(dropX - radius * 0.3, dropY - radius * 0.3, radius * 0.1, dropX, dropY, radius);
          dropGrad.addColorStop(0, '#FFFFFF');
          dropGrad.addColorStop(0.4, '#C0C0C8');
          dropGrad.addColorStop(0.75, '#4FACFE');
          dropGrad.addColorStop(1, '#000000');

          ctx.fillStyle = dropGrad;
          ctx.beginPath();
          ctx.arc(dropX, dropY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Live Audio Spectrum Ripple at center
        if (analyser) {
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const cx = width / 2;
          const cy = height * 0.45;
          const baseRadius = 60 + audioEnergy * 40;

          for (let i = 0; i < 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const val = (dataArray[i % dataArray.length] / 255) * 50;
            const r = baseRadius + val;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

      } else {
        // Raymarch & Node Graph Wireframe Mode
        ctx.fillStyle = '#05070D';
        ctx.fillRect(0, 0, width, height);

        // 3D Voronoi Cellular Grid
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
        ctx.lineWidth = 1;
        const cols = 8;
        const rows = 6;
        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c <= cols; c++) {
            const x = (c / cols) * width;
            const y = (r / rows) * height;
            const jitterX = Math.sin(time + r * 2 + c) * 15;
            const jitterY = Math.cos(time + c * 2 + r) * 15;

            ctx.strokeRect(x + jitterX - 20, y + jitterY - 20, 40, 40);

            // Connect nodes
            if (c < cols) {
              const nx = ((c + 1) / cols) * width + Math.sin(time + r * 2 + (c + 1)) * 15;
              const ny = (r / rows) * height + Math.cos(time + (c + 1) * 2 + r) * 15;
              ctx.beginPath();
              ctx.moveTo(x + jitterX, y + jitterY);
              ctx.lineTo(nx, ny);
              ctx.stroke();
            }
          }
        }

        // Raymarching camera ray indicators
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(width / 2, height);
        ctx.lineTo(width * 0.15, height * 0.2);
        ctx.moveTo(width / 2, height);
        ctx.lineTo(width * 0.5, height * 0.15);
        ctx.moveTo(width / 2, height);
        ctx.lineTo(width * 0.85, height * 0.2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Post-Process Pass 1: Chromatic Aberration
      if (enableChromatic) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 80, 0.04)';
        ctx.fillRect(-2, 0, width + 4, height);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.04)';
        ctx.fillRect(2, 0, width + 4, height);
        ctx.restore();
      }

      // Post-Process Pass 2: CRT Phosphor Scanline Overlay
      if (enableScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [currentShot, viewMode, enableScanlines, enableChromatic, isPlaying, currentTimeSec]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-cyan-950/60 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
