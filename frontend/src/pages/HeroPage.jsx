import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Dna,
  Layers,
  Calendar,
  Send,
  Share2,
  BarChart3,
  Cpu,
  Building2,
  ChevronRight,
  CheckCircle2,
  Eye,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { mockCreatives, mockVisualDNA } from '../data/mockData';

export const HeroPage = () => {
  const navigate = useNavigate();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isTopBarHovered, setIsTopBarHovered] = useState(false);
  const sampleCreative = mockCreatives[0]; // PulseFit mobility carousel

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-slate-200">
      {/* 
        TOP TASK BAR:
        Clean, minimalist top taskbar where buttons and controls smoothly appear when hovering over the top bar area!
      */}
      <header
        onMouseEnter={() => setIsTopBarHovered(true)}
        onMouseLeave={() => setIsTopBarHovered(false)}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-100 group hover:border-slate-200 hover:shadow-subtle py-3 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              XYZ
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold hidden sm:inline">
              Social Engine
            </span>
          </div>

          {/* Center: Navigation Links that smoothly appear on hover */}
          <nav
            className={`flex items-center gap-1 sm:gap-2 transition-all duration-300 ${
              isTopBarHovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-1 pointer-events-none md:opacity-20'
            }`}
          >
            <Link
              to="/overview"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Overview
            </Link>
            <Link
              to="/brands"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Brand Studio
            </Link>
            <Link
              to="/visual-dna"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Visual DNA
            </Link>
            <Link
              to="/ai-studio"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              AI Studio
            </Link>
            <Link
              to="/calendar"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Calendar
            </Link>
          </nav>

          {/* Right Action Buttons that smoothly appear on hover */}
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${
              isTopBarHovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline mr-2">
              hover detected · taskbar active
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/editor')}
            >
              Open Canvas
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/overview')}
            >
              Launch App
            </Button>
          </div>
        </div>
      </header>

      {/* Main Clean Hero Content */}
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* Subtle Top Hint for hover interaction */}
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hover top taskbar to reveal navigation controls</span>
          </div>
        </div>

        {/* Clean Hero Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
            Precision AI Content Engine for Social Media.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Grounded in your brand knowledge and visual references. Generates original,
            multi-slide carousels and static posts through structured Design Blueprints — fully
            editable, brand-compliant, and ready to publish.
          </p>

          {/* Smoother CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="primary"
              icon={Sparkles}
              onClick={() => navigate('/overview')}
              className="px-6"
            >
              Enter Workspace Overview
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={ArrowRight}
              onClick={() => navigate('/ai-studio')}
              className="px-6"
            >
              Open AI Studio
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> V1 Static & Carousels
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> Structured Design Blueprints
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> Official OAuth APIs
            </span>
          </div>
        </div>

        {/* Interactive Live Preview of AI-Generated Creative */}
        <section className="mt-14 w-full max-w-5xl">
          <Card className="border border-slate-200/80 rounded-2xl p-6 sm:p-8 bg-white shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">PulseFit Athletics</Badge>
                  <Badge variant="secondary">Instagram 1080x1350 Carousel</Badge>
                  <span className="text-xs text-slate-400 font-mono">Blueprint #BP-9204</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mt-1.5">
                  {sampleCreative.title}
                </h2>
              </div>

              {/* Slide controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">
                  Slide {activeSlideIndex + 1} of {sampleCreative.slides.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="iconSm"
                    variant="secondary"
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="iconSm"
                    variant="secondary"
                    disabled={activeSlideIndex === sampleCreative.slides.length - 1}
                    onClick={() => setActiveSlideIndex(prev => Math.min(sampleCreative.slides.length - 1, prev + 1))}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Canvas Mockup */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: The rendered slide frame */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-sm aspect-[4/5] bg-slate-900 text-white rounded-xl p-8 flex flex-col justify-between shadow-dropdown border border-slate-800 relative overflow-hidden">
                  {/* Subtle grid line accent */}
                  <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-xl m-2" />

                  {/* Header of slide */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] tracking-wider font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      {sampleCreative.slides[activeSlideIndex].badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      [0{activeSlideIndex + 1}/05]
                    </span>
                  </div>

                  {/* Body of slide */}
                  <div className="space-y-4 z-10 my-auto">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                      {sampleCreative.slides[activeSlideIndex].headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {sampleCreative.slides[activeSlideIndex].subhead}
                    </p>
                  </div>

                  {/* Footer of slide */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400">
                      PULSEFIT ATHLETICS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      SWIPE FOR DRILL →
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Architecture & Inspection breakdown */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                  Blueprint Metadata
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Design Archetype</span>
                    <span className="text-xs font-semibold text-slate-900">High-Contrast Technical</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">DNA Compliance</span>
                    <Badge variant="success">98% Match</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Typography Scale</span>
                    <span className="text-xs font-mono text-slate-700">Inter Display 700 / 400</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Safe Margin Bounds</span>
                    <span className="text-xs font-mono text-slate-700">80px Padding Checked</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/editor')}
                    className="w-full"
                  >
                    Edit in Canvas Editor
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* PRD Modules Directory Grid */}
        <section className="mt-20 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Complete System Architecture & Modules
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Every page specified in the PRD documentation is fully wired and functional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { path: '/overview', title: '1. Overview Dashboard', desc: 'Workspaces, recent creatives, scheduled posts, and onboarding checklist.', icon: Layers },
              { path: '/brands', title: '2. Brand Studio', desc: 'Comprehensive knowledge base: products, audience, voice rules, and visual tokens.', icon: Building2 },
              { path: '/reference-studio', title: '3. Reference Studio', desc: 'Reference image upload dropzone, OCR extraction, and visual palette breakdown.', icon: Eye },
              { path: '/visual-dna', title: '4. Visual DNA Rules', desc: 'Structured design parameters, typography hierarchy, margins, and archetype logic.', icon: Dna },
              { path: '/ai-studio', title: '5. AI Studio', desc: 'Structured prompt briefs, multi-slide carousel generation, and live preview.', icon: Sparkles },
              { path: '/editor', title: '6. Creative Editor', desc: 'Canvas editor with slide management, element layer tree, and inspector.', icon: Sliders },
              { path: '/calendar', title: '7. Content Calendar', desc: 'Month, week, and list views with scheduling dialog and timezone support.', icon: Calendar },
              { path: '/publishing', title: '8. Publishing Queue', desc: 'Approval gates, pause toggle, official API queue status, and retry flow.', icon: Send },
              { path: '/social-accounts', title: '9. Social Accounts', desc: 'Official OAuth connection status for Instagram, LinkedIn, X, and Facebook.', icon: Share2 },
              { path: '/analytics', title: '10. Analytics', desc: 'KPI cards, impressions & engagement charts, and top post rankings.', icon: BarChart3 },
              { path: '/ai-control', title: '11. AI Control Center', desc: 'Multi-provider routing (Anthropic, OpenAI, Gemini), fallback keys, and usage.', icon: Cpu },
              { path: '/settings', title: '12. Settings', desc: 'Workspace team roles, member management, and export presets.', icon: CheckCircle2 },
            ].map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.path}
                  hoverable
                  onClick={() => navigate(module.path)}
                  className="cursor-pointer group hover:border-slate-400 transition-all p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {module.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-100 py-6 px-6 md:px-12 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>XYZ Social Media SaaS — Built to PRD Specification</span>
          <div className="flex items-center gap-4">
            <Link to="/overview" className="hover:text-slate-700 transition-colors">App Dashboard</Link>
            <Link to="/ai-studio" className="hover:text-slate-700 transition-colors">AI Studio</Link>
            <Link to="/settings" className="hover:text-slate-700 transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

