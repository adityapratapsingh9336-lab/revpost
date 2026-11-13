import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Globe
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { mockCalendarEvents, mockCreatives } from '../data/mockData';
import { api } from '../services/api';

const MONTHS = ['October 2026', 'November 2026', 'December 2026'];

export const ContentCalendarPage = () => {
  const { activeBrand } = useOutletContext();
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
  const [monthIdx, setMonthIdx] = useState(1); // November 2026 default
  const [events, setEvents] = useState(mockCalendarEvents);
  const [creatives, setCreatives] = useState(mockCreatives);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Filters
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New post modal form
  const [selectedCreativeId, setSelectedCreativeId] = useState(mockCreatives[0].id);
  const [scheduleDate, setScheduleDate] = useState('2026-11-20');
  const [scheduleTime, setScheduleTime] = useState('16:00');
  const [targetPlatform, setTargetPlatform] = useState('Instagram Business (@pulsefit.athletics)');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getCalendarEvents(),
      api.getCreatives(activeBrand?.id)
    ]).then(([evtList, crtList]) => {
      if (!mounted) return;
      if (evtList) setEvents(evtList);
      if (crtList && crtList.length > 0) {
        setCreatives(crtList);
        setSelectedCreativeId(crtList[0].id);
      }
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    const crt = creatives.find(c => c.id === selectedCreativeId) || creatives[0];
    const saved = await api.schedulePost({
      creative_id: crt.id,
      title: crt.title,
      date: scheduleDate,
      time: scheduleTime,
      platform: targetPlatform.split(' ')[0],
      target_account: targetPlatform,
    });
    const newEvent = saved || {
      id: `cal_${Date.now()}`,
      title: crt.title,
      date: scheduleDate,
      time: scheduleTime,
      platform: targetPlatform.split(' ')[0],
      status: 'Scheduled',
      format: crt.type === 'carousel' ? 'Carousel' : 'Static Post',
    };
    setEvents(prev => [...prev, newEvent]);
    setIsScheduleModalOpen(false);
  };

  const filteredEvents = events.filter(evt => {
    const matchesPlatform = platformFilter === 'All' || (evt.platform || '').toLowerCase().includes(platformFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (evt.status || '').toLowerCase().includes(statusFilter.toLowerCase());
    return matchesPlatform && matchesStatus;
  });

  const currentMonthYearPrefix = monthIdx === 0 ? '2026-10' : monthIdx === 1 ? '2026-11' : '2026-12';
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = [
    { label: 'Mon', dayNum: 9, dateStr: '2026-11-09' },
    { label: 'Tue', dayNum: 10, dateStr: '2026-11-10' },
    { label: 'Wed', dayNum: 11, dateStr: '2026-11-11' },
    { label: 'Thu', dayNum: 12, dateStr: '2026-11-12' },
    { label: 'Fri', dayNum: 13, dateStr: '2026-11-13' },
    { label: 'Sat', dayNum: 14, dateStr: '2026-11-14' },
    { label: 'Sun', dayNum: 15, dateStr: '2026-11-15' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Content Calendar
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Timezone: UTC+05:30 (India Standard Time)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
            {['month', 'week', 'list'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                  viewMode === mode ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Calendar Controls Bar */}
      <Card className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 w-32">{MONTHS[monthIdx]}</h2>
          <div className="flex items-center gap-1">
            <Button
              size="iconSm"
              variant="secondary"
              disabled={monthIdx === 0}
              onClick={() => setMonthIdx(prev => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="iconSm"
              variant="secondary"
              disabled={monthIdx === MONTHS.length - 1}
              onClick={() => setMonthIdx(prev => Math.min(MONTHS.length - 1, prev + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="All">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X">X (Twitter)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
            <option value="Review">In Review</option>
          </select>
        </div>
      </Card>

      {/* Month Grid View */}
      {viewMode === 'month' && (
        <Card className="p-0 overflow-hidden bg-white border-slate-200">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2 text-xs font-semibold text-slate-600">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {daysInMonth.map((day) => {
              const dateString = `${currentMonthYearPrefix}-${String(day).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(e => e.date === dateString);

              return (
                <div key={day} className="p-2 min-h-[90px] flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-700">{day}</span>
                    {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                  </div>

                  <div className="space-y-1 my-1">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="px-1.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-800 truncate leading-tight hover:bg-slate-200/80 cursor-pointer transition-colors"
                        title={`${evt.title} (${evt.time})`}
                      >
                        <span className="font-semibold text-slate-900 mr-1">{evt.time}</span>
                        <span>{evt.title}</span>
                      </div>
                    ))}
                  </div>
                  <div />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((wd) => {
            const dayEvents = filteredEvents.filter(e => e.date === wd.dateStr);
            return (
              <Card key={wd.dateStr} className="p-3 bg-white min-h-[260px] flex flex-col space-y-3">
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{wd.label}</span>
                  <span className="text-xs font-mono text-slate-500">Nov {wd.dayNum}</span>
                </div>
                <div className="space-y-2 flex-1">
                  {dayEvents.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic pt-4 text-center">No posts</p>
                  ) : (
                    dayEvents.map(evt => (
                      <div key={evt.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{evt.time}</span>
                          <span>{evt.platform}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2">{evt.title}</p>
                        <Badge variant={evt.status === 'Published' ? 'success' : 'info'}>{evt.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="divide-y divide-slate-100 p-0 overflow-hidden bg-white border-slate-200">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 text-center font-mono text-slate-500">
                  <div className="font-bold text-slate-900">{evt.date}</div>
                  <div className="text-[10px]">{evt.time}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{evt.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    <span>{evt.platform}</span>
                    <span>·</span>
                    <span>{evt.format}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={evt.status === 'Published' ? 'success' : evt.status === 'Scheduled' ? 'info' : 'warning'}>
                  {evt.status}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Schedule Post Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Creative to Official Queue"
        description="Select creative, target date, and destination social channel."
      >
        <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Creative
            </label>
            <select
              value={selectedCreativeId}
              onChange={(e) => setSelectedCreativeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white"
            >
              {creatives.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Time (HH:MM)
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Social Destination
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white"
            >
              <option>Instagram Business (@pulsefit.athletics)</option>
              <option>LinkedIn Company (PulseFit Performance)</option>
              <option>X / Twitter v2 (@PulseFitGear)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Confirm & Queue Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
