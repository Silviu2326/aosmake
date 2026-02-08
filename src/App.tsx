import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { FlowsPage } from './pages/FlowsPage';
import { RunsPage } from './pages/RunsPage';
import { SandboxPage } from './pages/SandboxPage';
import { ImportPage } from './pages/ImportPage';
import { PreCrafterPanel } from './pages/PreCrafterPanel';
import { DashboardPage } from './pages/DashboardPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/flows" element={<FlowsPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/precrafter" element={<PreCrafterPanel />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;