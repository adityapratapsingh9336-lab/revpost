import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Share2,
  Eye,
  Bookmark,
  MousePointer,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockAnalytics } from '../data/mockData';

export const AnalyticsPage = () => {
  const { activeBrand } = useOutletContext();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');

  const maxImpression = Math.max(...mockAnalytics.chartData.map(d => d.impressions));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Analytics & Insights
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated official engagement metrics synchronized directly from platform Webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>

          <Button variant="secondary" size="sm" icon={Download}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAnalytics.kpis.map((kpi, idx) => (
          <Card key={idx} className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
              <Badge variant="success">{kpi.change}</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              vs preceding 30-day period
            </span>
          </Card>
        ))}
      </div>

      {/* Trend Chart (Clean SVG Matte Bar & Line chart) */}
      <Card className="p-6 bg-white border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Impression & Reach Trajectory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily impressions across Instagram, LinkedIn, and X channels.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-900" /> Impressions
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Engagements
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="pt-6 h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {mockAnalytics.chartData.map((bar, i) => {
            const heightPercent = Math.round((bar.impressions / maxImpression) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(bar.impressions / 1000).toFixed(1)}k
                </div>
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden transition-all h-full max-h-[180px]">
                  <div
                    className="w-full bg-slate-900 group-hover:bg-slate-800 transition-all rounded-t-md"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 font-mono">
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Performing Creatives Leaderboard */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Top Performing Content Assets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by combined engagement rate and save velocity.
            </p>
          </div>
          <Badge variant="indigo">Official Webhook Sync: 10m ago</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Creative Title</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Impressions</th>
                <th className="py-3 px-4 text-right">Engagements</th>
                <th className="py-3 px-4 text-right">Engagement Rate</th>
                <th className="py-3 px-5 text-right">Saves / Bookmarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {mockAnalytics.topPosts.map((post, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {post.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="secondary">{post.platform}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">{post.impressions}</td>
                  <td className="py-3.5 px-4 text-right font-mono">{post.engagements}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                    {post.rate}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono">{post.saves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

