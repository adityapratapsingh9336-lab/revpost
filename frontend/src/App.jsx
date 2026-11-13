import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HeroPage } from './pages/HeroPage';
import { OverviewPage } from './pages/OverviewPage';
import { BrandsPage } from './pages/BrandsPage';
import { ReferenceStudioPage } from './pages/ReferenceStudioPage';
import { VisualDNAPage } from './pages/VisualDNAPage';
import { AIStudioPage } from './pages/AIStudioPage';
import { CreativeEditorPage } from './pages/CreativeEditorPage';
import { CreativeLibraryPage } from './pages/CreativeLibraryPage';
import { ContentCalendarPage } from './pages/ContentCalendarPage';
import { PublishingPage } from './pages/PublishingPage';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIControlCenterPage } from './pages/AIControlCenterPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Clean Hero Landing Page with Top Taskbar Hover Action */}
        <Route path="/" element={<HeroPage />} />

        {/* Application Layout Shell for all SaaS Modules */}
        <Route element={<AppLayout />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/reference-studio" element={<ReferenceStudioPage />} />
          <Route path="/visual-dna" element={<VisualDNAPage />} />
          <Route path="/ai-studio" element={<AIStudioPage />} />
          <Route path="/editor" element={<CreativeEditorPage />} />
          <Route path="/editor/:creativeId" element={<CreativeEditorPage />} />
          <Route path="/creatives" element={<CreativeLibraryPage />} />
          <Route path="/calendar" element={<ContentCalendarPage />} />
          <Route path="/publishing" element={<PublishingPage />} />
          <Route path="/social-accounts" element={<SocialAccountsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ai-control" element={<AIControlCenterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Hero */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

