import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { Button } from '../ui/Button';
import { mockBrands } from '../../data/mockData';
import { cn } from '../../utils/cn';

const routeTitleMap = {
  '/overview': 'Workspace Overview',
  '/brands': 'Brand Studio & Knowledge',
  '/reference-studio': 'Reference Studio',
  '/visual-dna': 'Visual DNA & Design Rules',
  '/ai-studio': 'AI Studio — Creative Generation',
  '/creatives': 'Creative Library',
  '/editor': 'Creative Canvas Editor',
  '/calendar': 'Content Calendar',
  '/publishing': 'Publishing Queue & Activity',
  '/social-accounts': 'Connected Social Accounts',
  '/analytics': 'Performance Analytics',
  '/ai-control': 'AI Provider Control Center',
  '/settings': 'Workspace Settings',
};

export const Navbar = ({ brands = mockBrands, activeBrand, setActiveBrand }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const currentTitle = routeTitleMap[location.pathname] || 'Workspace';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs & Current Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>XYZ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">{currentTitle}</span>
        </div>

        {/* Brand Selector Dropdown */}
        <div className="relative ml-3">
          <button
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg hover:bg-slate-100/70 transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeBrand?.accentColor || '#3B82F6' }}
            />
            <span>{activeBrand?.name || 'PulseFit Athletics'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isBrandDropdownOpen && (
            <div className="absolute top-9 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-dropdown py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400">
                Active Brand
              </div>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => {
                    setActiveBrand(brand);
                    setIsBrandDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors',
                    activeBrand?.id === brand.id ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: brand.accentColor }}
                    />
                    <span className="truncate">{brand.name}</span>
                  </div>
                  {activeBrand?.id === brand.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Search, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creatives, DNA rules..."
            className="w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-slate-900 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-dropdown p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Activity & Alerts</span>
                <span className="text-[10px] text-slate-400">3 unread</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors">
                  <p className="font-medium text-slate-800">Visual DNA v1.4 Approved</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reference analysis completed for PulseFit Athletics.</p>
                </div>
                <div className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors">
                  <p className="font-medium text-slate-800">Post Scheduled</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">"4-Step Pre-Run Mobility" set for Nov 10, 15:00 UTC.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Creative Quick Action */}
        <Button
          size="sm"
          variant="primary"
          icon={Sparkles}
          onClick={() => navigate('/ai-studio')}
        >
          Generate Post
        </Button>

        {/* User profile avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-medium text-xs text-slate-700 cursor-pointer hover:ring-2 hover:ring-slate-300 transition-all">
          AD
        </div>
      </div>
    </header>
  );
};

