import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Image as ImageIcon,
  Dna,
  Sparkles,
  Layers,
  Edit3,
  Calendar,
  Send,
  Share2,
  BarChart3,
  Cpu,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { mockWorkspaces, mockBrands } from '../../data/mockData';

const navItems = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/brands', label: 'Brands', icon: Building2 },
  { path: '/reference-studio', label: 'Reference Studio', icon: ImageIcon },
  { path: '/visual-dna', label: 'Visual DNA', icon: Dna },
  { path: '/ai-studio', label: 'AI Studio', icon: Sparkles, badge: 'Core' },
  { path: '/creatives', label: 'Creative Library', icon: Layers },
  { path: '/editor', label: 'Creative Editor', icon: Edit3 },
  { path: '/calendar', label: 'Content Calendar', icon: Calendar },
  { path: '/publishing', label: 'Publishing Queue', icon: Send },
  { path: '/social-accounts', label: 'Social Accounts', icon: Share2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai-control', label: 'AI Control Center', icon: Cpu },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  activeBrand,
  setActiveBrand,
  workspaces = mockWorkspaces,
  activeWorkspace = mockWorkspaces[0],
  setActiveWorkspace = () => {}
}) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-slate-200/90 flex flex-col transition-all duration-200 select-none z-30 shrink-0 sticky top-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Workspace Header */}
      <div className="h-16 px-3.5 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="relative w-full">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {activeWorkspace.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate">
                    {activeWorkspace.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                    {activeWorkspace.tier}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceOpen && (
              <div className="absolute top-12 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-dropdown py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Switch Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors',
                      ws.id === activeWorkspace.id ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'
                    )}
                  >
                    <span>{ws.name}</span>
                    {ws.id === activeWorkspace.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              XYZ
            </div>
          </div>
        )}
      </div>

      {/* Brand Context Indicator */}
      {!isCollapsed && (
        <div className="px-3.5 pt-3 pb-1">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBrand?.accentColor || '#3b82f6' }} />
              <span className="text-xs font-medium text-slate-700 truncate">
                {activeBrand?.name || 'PulseFit Athletics'}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
              {activeBrand?.activeDNAVersion || 'v1.4'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive: matchActive }) =>
                cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative',
                  matchActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                  isCollapsed && 'justify-center px-0'
                )
              }
            >
              {({ isActive: matchActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      matchActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded font-mono',
                        matchActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Toggle & Clean Landing link */}
      <div className="p-2.5 border-t border-slate-100 space-y-1">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors',
            isCollapsed && 'justify-center px-0'
          )}
          title="Return to Clean Hero Page"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span className="truncate">Hero Page View</span>}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4 text-slate-400" />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4 text-slate-400" />
              <span className="truncate">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

