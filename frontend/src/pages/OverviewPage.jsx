import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Send,
  Share2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import { mockCreatives, mockCalendarEvents, mockSocialAccounts } from '../data/mockData';
import { api } from '../services/api';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const { activeBrand, setActiveBrand, brands = [], refreshData } = useOutletContext();
  const [creatives, setCreatives] = useState(mockCreatives);
  const [events, setEvents] = useState(mockCalendarEvents);
  const [accounts, setAccounts] = useState(mockSocialAccounts);

  // New Automation Modal
  const [isNewAutomationOpen, setIsNewAutomationOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPlatform, setNewProjectPlatform] = useState('Instagram');
  const [newProjectIndustry, setNewProjectIndustry] = useState('Tech & Business');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getCreatives(activeBrand?.id),
      api.getCalendarEvents(),
      api.getSocialAccounts(),
    ]).then(([cList, eList, aList]) => {
      if (!mounted) return;
      if (cList) setCreatives(cList);
      if (eList) setEvents(eList);
      if (aList) setAccounts(aList);
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const handleCreateAutomation = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const created = await api.createBrand({
        name: newProjectName.trim(),
        industry: newProjectIndustry,
        tagline: `Automated ${newProjectPlatform} Growth Pipeline`,
        description: `Automated content project for ${newProjectPlatform}.`,
        primaryColor: '#0F172A',
        accentColor: '#3B82F6',
        secondaryColor: '#F8FAFC',
        fontCategory: 'Modern Geometric Sans',
      });
      if (created) {
        await refreshData();
        setActiveBrand(created);
      }
      setIsNewAutomationOpen(false);
      setNewProjectName('');
      // Navigate directly to the social accounts connect page as the default first section
      navigate('/social-accounts');
    } catch (err) {
      alert(`Could not start automation: ${err.message}`);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleEnterProject = (brand) => {
    setActiveBrand(brand);
    // Enter the automation project at the social connection page
    navigate('/social-accounts');
  };

  const draftCount = creatives.filter(c => (c.status || '').toLowerCase() === 'draft').length;
  const reviewCount = creatives.filter(c => (c.status || '').toLowerCase().includes('review')).length;
  const scheduledCount = creatives.filter(c => (c.status || '').toLowerCase() === 'scheduled').length;
  const publishedCount = creatives.filter(c => (c.status || '').toLowerCase() === 'published').length;

  const [onboardingSteps, setOnboardingSteps] = useState([
    { id: 1, title: 'Create workspace & organization', completed: true, path: '/settings' },
    { id: 2, title: 'Configure brand identity & voice', completed: true, path: '/brands' },
    { id: 3, title: 'Upload reference images for OCR & styling', completed: true, path: '/reference-studio' },
    { id: 4, title: 'Review & approve Visual DNA rules', completed: true, path: '/visual-dna' },
    { id: 5, title: 'Generate your first multi-slide carousel', completed: true, path: '/ai-studio' },
    { id: 6, title: 'Connect official social accounts', completed: false, path: '/social-accounts' },
  ]);

  const completedCount = onboardingSteps.filter(s => s.completed).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Overview
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of your content pipeline, schedule, and connected services.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/calendar')}
            icon={Calendar}
          >
            View Calendar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/ai-studio')}
            icon={Sparkles}
          >
            Generate Creative
          </Button>
        </div>
      </div>

      {/* 1. Start a New Automation Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-7 border-none shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] uppercase font-bold">
              Multi-Page Automation Hub
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Manage & Automate Multiple Social Media Pages
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch a dedicated automation pipeline for each of your Instagram accounts, LinkedIn pages, or Twitter channels. Connect accounts, define visual DNA, and run scheduled publishing.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shrink-0 shadow-sm"
            icon={Plus}
            onClick={() => setIsNewAutomationOpen(true)}
          >
            Start a New Automation
          </Button>
        </div>
      </Card>

      {/* 2. Active Automation Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Active Automation Projects ({brands.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Click a project to enter its social connection & publishing suite</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => {
            const isActive = activeBrand?.id === b.id;
            return (
              <Card
                key={b.id}
                hoverable
                onClick={() => handleEnterProject(b)}
                className={cn(
                  'p-5 cursor-pointer flex flex-col justify-between transition-all group relative',
                  isActive ? 'ring-2 ring-indigo-500/30 border-indigo-200 bg-indigo-50/10' : 'bg-white'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0"
                      style={{ backgroundColor: b.accentColor || '#3B82F6' }}
                    />
                    <Badge variant={isActive ? 'indigo' : 'default'} className="text-[10px]">
                      {isActive ? 'Current Project' : 'Automation Project'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {b.description || `${b.industry || 'Social Media'} automation pipeline.`}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-indigo-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Connect Social Media</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    DNA {b.brand_profile?.activeDNAVersion || 'v1.0'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {completedCount < onboardingSteps.length && (
        <Card className="border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Workspace Setup Checklist</h3>
                <span className="text-xs font-mono text-slate-500">
                  {completedCount} of {onboardingSteps.length} complete
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete these initial milestones to unlock automated multi-platform publishing.
              </p>
            </div>
            <div className="w-full md:w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / onboardingSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {onboardingSteps.map((step) => (
              <div
                key={step.id}
                onClick={() => navigate(step.path)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  step.completed
                    ? 'bg-slate-50/50 border-slate-100 text-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 font-medium'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    step.completed ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                />
                <span className="leading-snug">{step.title}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Status Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Drafts', count: draftCount, badge: 'In Progress', variant: 'secondary' },
          { label: 'In Review', count: reviewCount, badge: 'Needs Signoff', variant: 'warning' },
          { label: 'Scheduled', count: scheduledCount, badge: 'Ready to Run', variant: 'info' },
          { label: 'Published', count: publishedCount, badge: 'All Systems Live', variant: 'success' },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
              <Badge variant={kpi.variant}>{kpi.badge}</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {kpi.count}
            </div>
          </Card>
        ))}
      </div>

      {/* Main 2-Column Section: Upcoming Posts & Recently Generated Creatives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Scheduled Posts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Upcoming Scheduled Posts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
            >
              Calendar View →
            </Button>
          </div>

          <div className="space-y-3">
            {events.slice(0, 4).map((evt) => (
              <Card key={evt.id} hoverable className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      {evt.date.split('-')[1]}/{evt.date.split('-')[2]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {evt.time}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer" onClick={() => navigate('/editor')}>
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500">{evt.platform}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500">{evt.format}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={evt.status === 'Scheduled' ? 'info' : 'warning'}>
                    {evt.status}
                  </Badge>
                  <Button
                    size="iconSm"
                    variant="ghost"
                    onClick={() => navigate('/editor')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Quick Insights & Service Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Social Accounts Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-slate-500" /> Official Social Accounts
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/social-accounts')}
              >
                Manage →
              </Button>
            </div>

            <Card className="p-4 divide-y divide-slate-100">
              {accounts.map((acc) => (
                <div key={acc.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{acc.avatar}</span>
                    <div>
                      <span className="font-semibold text-slate-800">{acc.accountName}</span>
                      <div className="text-[11px] text-slate-400">{acc.platform}</div>
                    </div>
                  </div>
                  <Badge variant={acc.status === 'Connected' ? 'success' : 'danger'}>
                    {acc.status}
                  </Badge>
                </div>
              ))}
            </Card>
          </div>

          {/* AI Usage Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-500" /> AI Provider Gateway
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/ai-control')}
              >
                Config →
              </Button>
            </div>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Monthly Token Budget</span>
                <span className="font-mono text-slate-800 font-semibold">2,790,000 / 10,000,000</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full rounded-full" style={{ width: '27.9%' }} />
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Primary: Anthropic Sonnet 3.5</span>
                <span className="text-emerald-700 font-medium">Gateway Active</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Recently Generated Creatives Gallery */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recently Generated Creatives
            </h2>
            <p className="text-xs text-slate-500">
              Blueprints created through the AI Studio engine.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/creatives')}
          >
            View Creative Library →
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creatives.slice(0, 4).map((crt) => (
            <Card
              key={crt.id}
              hoverable
              onClick={() => navigate(`/editor/${crt.id}`)}
              className="cursor-pointer group p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{crt.platform}</Badge>
                  <span className="text-[11px] font-mono text-slate-400">
                    {crt.type === 'carousel' ? `${crt.slidesCount} slides` : 'Static'}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 line-clamp-2">
                  {crt.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Badge variant={crt.status === 'Scheduled' ? 'info' : crt.status === 'Published' ? 'success' : 'default'}>
                  {crt.status}
                </Badge>
                <span className="group-hover:translate-x-0.5 transition-transform">Edit →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal: Start a New Automation Project */}
      <Modal
        isOpen={isNewAutomationOpen}
        onClose={() => setIsNewAutomationOpen(false)}
        title="Start a New Automation Project"
      >
        <form onSubmit={handleCreateAutomation} className="space-y-4">
          <p className="text-xs text-slate-500">
            Create an independent automation pipeline for another Instagram account or social media page.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Automation Project / Page Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Tech Instagram or Founder Personal Brand"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Platform
              </label>
              <select
                value={newProjectPlatform}
                onChange={(e) => setNewProjectPlatform(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>X (Twitter)</option>
                <option>TikTok</option>
                <option>Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry / Niche
              </label>
              <input
                type="text"
                placeholder="e.g. Fitness, SaaS, E-Commerce"
                value={newProjectIndustry}
                onChange={(e) => setNewProjectIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewAutomationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingProject}
            >
              Create & Connect Social Media →
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

