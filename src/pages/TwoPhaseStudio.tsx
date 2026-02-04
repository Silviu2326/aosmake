import React from 'react';
import { PreCrafterPanel } from './PreCrafterPanel';
import { SpecPanel } from './SpecPanel';
import { CrafterPanel } from './CrafterPanel';
import { RunConsole } from '../components/global/RunConsole';

interface TwoPhaseStudioProps {
  isConsoleOpen: boolean;
  setIsConsoleOpen: (open: boolean) => void;
}

export const TwoPhaseStudio: React.FC<TwoPhaseStudioProps> = ({ isConsoleOpen, setIsConsoleOpen }) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Visual Handoff Overlay (SVG Layer) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
            </marker>
            <linearGradient id="handoffGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /> {/* Blue for PreCrafter */}
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" /> {/* Purple for Spec */}
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" /> {/* Green for Crafter */}
            </linearGradient>
          </defs>

          {/* Connection 1: PreCrafter Emitter to Spec Panel */}
          <path
            d="M 33 60 C 35 60, 36 50, 41.6 30"
            stroke="url(#handoffGradient)"
            strokeWidth="0.2"
            fill="none"
            strokeDasharray="1 1"
            className="animate-[dash_30s_linear_infinite]"
          />
          {/* Connection 2: Spec Panel to Crafter Input */}
          <path
            d="M 58.3 30 C 64 10, 65 9, 67 9"
            stroke="url(#handoffGradient)"
            strokeWidth="0.2"
            fill="none"
            strokeDasharray="1 1"
            markerEnd="url(#arrowhead)"
            className="animate-[dash_30s_linear_infinite]"
          />

          {/* Central "Knot" representing the Contract being the bridge */}
          <circle cx="50" cy="30" r="0.4" fill="#a855f7" className="animate-pulse" />
        </svg>
      </div>

      {/* Main 3-Column Grid */}
      <div className={`flex-1 grid grid-cols-12 divide-x divide-border transition-all duration-300 ${isConsoleOpen ? 'h-[60%]' : 'h-[calc(100%-56px)]'}`}>

        {/* Left: PreCrafter (4 cols) */}
        <div className="col-span-4 relative bg-background flex flex-col min-w-0 z-0">
          <PreCrafterPanel />
        </div>

        {/* Center: Instructions Spec (4 cols) */}
        <div className="col-span-4 relative bg-background/50 flex flex-col min-w-0 z-0 backdrop-blur-sm">
          <SpecPanel />
        </div>

        {/* Right: Crafter (4 cols) */}
        <div className="col-span-4 relative bg-background flex flex-col min-w-0 z-0">
          <CrafterPanel />
        </div>
      </div>

      {/* Bottom Console */}
      <div className={`border-t border-border bg-surface z-30 flex flex-col transition-all duration-300 ease-in-out absolute bottom-0 w-full ${isConsoleOpen ? 'h-[40%]' : 'h-[56px]'}`}>
        <RunConsole isOpen={isConsoleOpen} toggle={() => setIsConsoleOpen(!isConsoleOpen)} />
      </div>
    </div>
  );
};