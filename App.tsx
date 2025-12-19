import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TwoPhaseStudio } from './components/TwoPhaseStudio';
import { PreCrafterPanel } from './components/PreCrafterPanel';
import { CrafterPanel } from './components/CrafterPanel';
import { SpecPanel } from './components/SpecPanel';
import { RunsPanel } from './components/RunsPanel';
import { ArtifactsPanel } from './components/ArtifactsPanel';
import { DatasetsPanel } from './components/DatasetsPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { RunConsole } from './components/RunConsole';
import { View } from './types';
import { Layout, GitBranch, FlaskConical, Play, FileJson, Database, Blocks, Settings } from 'lucide-react';
import { useConsole } from './context/ConsoleContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STUDIO);
  const { isOpen: isConsoleOpen, setIsOpen: setIsConsoleOpen } = useConsole();

  // Simple placeholder for other views
  const renderContent = () => {
    switch (currentView) {
      case View.STUDIO:
        return <TwoPhaseStudio isConsoleOpen={isConsoleOpen} setIsConsoleOpen={setIsConsoleOpen} />;
      case View.PRECRAFTER:
        return (
          <div className="flex flex-col h-full w-full relative">
            <div className={`flex-1 transition-all duration-300 ${isConsoleOpen ? 'h-[60%]' : 'h-[calc(100%-56px)]'}`}>
              <PreCrafterPanel />
            </div>
            <div className={`border-t border-border bg-surface z-30 flex flex-col transition-all duration-300 ease-in-out absolute bottom-0 w-full ${isConsoleOpen ? 'h-[40%]' : 'h-[56px]'}`}>
              <RunConsole isOpen={isConsoleOpen} toggle={() => setIsConsoleOpen(!isConsoleOpen)} />
            </div>
          </div>
        );
      case View.CRAFTER:
        return (
          <div className="flex flex-col h-full w-full relative">
            <div className={`flex-1 transition-all duration-300 ${isConsoleOpen ? 'h-[60%]' : 'h-[calc(100%-56px)]'}`}>
              <CrafterPanel />
            </div>
            <div className={`border-t border-border bg-surface z-30 flex flex-col transition-all duration-300 ease-in-out absolute bottom-0 w-full ${isConsoleOpen ? 'h-[40%]' : 'h-[56px]'}`}>
              <RunConsole isOpen={isConsoleOpen} toggle={() => setIsConsoleOpen(!isConsoleOpen)} />
            </div>
          </div>
        );
      case View.SPEC:
        return (
          <div className="flex flex-col h-full w-full relative">
            <div className={`flex-1 transition-all duration-300 ${isConsoleOpen ? 'h-[60%]' : 'h-[calc(100%-56px)]'}`}>
              <SpecPanel />
            </div>
            <div className={`border-t border-border bg-surface z-30 flex flex-col transition-all duration-300 ease-in-out absolute bottom-0 w-full ${isConsoleOpen ? 'h-[40%]' : 'h-[56px]'}`}>
              <RunConsole isOpen={isConsoleOpen} toggle={() => setIsConsoleOpen(!isConsoleOpen)} />
            </div>
          </div>
        );
      case View.RUNS:
        return <RunsPanel />;
      case View.ARTIFACTS:
        return <ArtifactsPanel />;
      case View.DATASETS:
        return <DatasetsPanel />;
      case View.LIBRARY:
        return <LibraryPanel />;
      case View.SETTINGS:
        return <SettingsPanel />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-medium text-white/80">{currentView}</h2>
            <p>Component under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-sm text-gray-300 font-sans selection:bg-accent/30">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 relative overflow-hidden bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;