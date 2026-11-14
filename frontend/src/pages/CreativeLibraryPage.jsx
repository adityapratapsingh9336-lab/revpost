import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  Calendar,
  Copy,
  Trash2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockCreatives } from '../data/mockData';
import { api } from '../services/api';

export const CreativeLibraryPage = () => {
  const navigate = useNavigate();
  const { activeBrand } = useOutletContext();
  const [creatives, setCreatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    api.getCreatives(activeBrand?.id).then((items) => {
      if (mounted) {
        setCreatives(items || []);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const handleDuplicate = async (id) => {
    const dup = await api.duplicateCreative(id);
    if (dup) setCreatives(prev => [dup, ...prev]);
  };

  const handleDelete = async (id) => {
    await api.deleteCreative(id);
    setCreatives(prev => prev.filter(c => c.id !== id));
  };

  const filtered = creatives.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || (item.platform || '').toLowerCase().includes(platformFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Creative Library
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage all drafted, scheduled, and published social assets.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/ai-studio')}
        >
          Generate New Creative
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by topic, keyword, or hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="All">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X">X (Twitter)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
            <option value="In Review">In Review</option>
          </select>
        </div>
      </Card>

      {/* Creative Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Layers className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {isLoading ? 'Loading creatives...' : 'No creatives yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            {isLoading
              ? 'Checking your database...'
              : 'Generate your first original carousel or single-slide post in AI Studio.'}
          </p>
          {!isLoading && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/ai-studio')}>
              Create in AI Studio
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <Card
              key={item.id}
              hoverable
              className="p-5 flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Visual Preview Header */}
                <div
                  onClick={() => navigate(`/editor/${item.id}`)}
                  className="h-36 rounded-lg bg-slate-900 text-white p-4 flex flex-col justify-between cursor-pointer border border-slate-800 relative overflow-hidden mb-3 group-hover:border-slate-700 transition-colors"
                >
                  {(item.imageUrl || item.image_url) && (
                    <img
                      src={api.getStorageAssetUrl(item.imageUrl || item.image_url)}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}
                  {(item.imageUrl || item.image_url) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30 z-0 pointer-events-none" />
                  )}
                  <div className="flex items-center justify-between z-10">
                    <Badge variant="primary" className="bg-white/10 text-[10px]">
                      {item.platform}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.type === 'carousel' ? `${item.slidesCount || 1} Slides` : 'Static'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white z-10 line-clamp-2">
                    {item.slides?.[0]?.headline || item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono z-10">
                    {activeBrand?.name || 'My Brand'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      (item.status || '').toLowerCase() === 'scheduled'
                        ? 'info'
                        : (item.status || '').toLowerCase() === 'published'
                        ? 'success'
                        : (item.status || '').toLowerCase().includes('review')
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{item.format}</span>
                </div>

                <h2 className="text-sm font-semibold text-slate-900 mt-2 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Edit3}
                  onClick={() => navigate(`/editor/${item.id}`)}
                >
                  Edit Canvas
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="iconSm"
                    variant="ghost"
                    title="Duplicate Creative"
                    onClick={() => handleDuplicate(item.id)}
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button
                    size="iconSm"
                    variant="ghost"
                    title="Schedule"
                    onClick={() => navigate('/calendar')}
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button
                    size="iconSm"
                    variant="ghost"
                    title="Delete Creative"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
