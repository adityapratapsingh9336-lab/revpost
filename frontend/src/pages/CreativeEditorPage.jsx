import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
  Undo,
  Redo,
  Save,
  Download,
  Plus,
  Trash2,
  Copy,
  Type,
  Square,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { mockCreatives } from '../data/mockData';
import { api } from '../services/api';

export const CreativeEditorPage = () => {
  const { creativeId } = useParams();
  const { activeBrand } = useOutletContext();

  const [creativeMeta, setCreativeMeta] = useState(mockCreatives[0]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [slides, setSlides] = useState(mockCreatives[0].slides);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([mockCreatives[0].slides]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedLayerId, setSelectedLayerId] = useState('headline');
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Visual style overrides per slide editor
  const [headlineAlign, setHeadlineAlign] = useState('left');
  const [headlineWeight, setHeadlineWeight] = useState('700');

  useEffect(() => {
    let mounted = true;
    const loadCreative = async () => {
      let loaded = null;
      if (creativeId) {
        loaded = await api.getCreativeDetail(creativeId);
      } else {
        const list = await api.getCreatives(activeBrand?.id);
        loaded = list && list.length > 0 ? list[0] : mockCreatives[0];
      }
      if (!mounted || !loaded) return;
      const loadedSlides = loaded.slides || loaded.blueprint?.slides || mockCreatives[0].slides;
      setCreativeMeta(loaded);
      setSlides(loadedSlides);
      setHistory([loadedSlides]);
      setHistoryIdx(0);
      setActiveSlideIdx(0);
    };
    loadCreative();
    return () => { mounted = false; };
  }, [creativeId, activeBrand?.id]);

  const commitSlidesChange = (nextSlides) => {
    const slicedHistory = history.slice(0, historyIdx + 1);
    setHistory([...slicedHistory, nextSlides]);
    setHistoryIdx(slicedHistory.length);
    setSlides(nextSlides);
  };

  const handleUndo = () => {
    if (historyIdx <= 0) return;
    const nextIdx = historyIdx - 1;
    setHistoryIdx(nextIdx);
    setSlides(history[nextIdx]);
    setActiveSlideIdx(prev => Math.min(prev, history[nextIdx].length - 1));
  };

  const handleRedo = () => {
    if (historyIdx >= history.length - 1) return;
    const nextIdx = historyIdx + 1;
    setHistoryIdx(nextIdx);
    setSlides(history[nextIdx]);
    setActiveSlideIdx(prev => Math.min(prev, history[nextIdx].length - 1));
  };

  const currentSlide = slides[activeSlideIdx] || slides[0];

  // Bounds & Overflow detection per PRD 06
  const hasHeadlineOverflow = (currentSlide?.headline || '').length > 75;
  const hasSubheadOverflow = (currentSlide?.subhead || '').length > 160;
  const hasBoundsWarning = hasHeadlineOverflow || hasSubheadOverflow;

  const handleUpdateSlideField = (field, value) => {
    const updated = slides.map((s, idx) =>
      idx === activeSlideIdx ? { ...s, [field]: value } : s
    );
    commitSlidesChange(updated);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      badge: `POINT [0${slides.length + 1}]`,
      headline: 'NEW SLIDE TITLE',
      subhead: 'Add structured supporting description or insight here.',
      type: 'content'
    };
    const next = [...slides, newSlide];
    commitSlidesChange(next);
    setActiveSlideIdx(next.length - 1);
  };

  const handleDuplicateSlide = () => {
    const clone = { ...currentSlide, id: Date.now(), badge: `${currentSlide.badge} COPY` };
    const next = [
      ...slides.slice(0, activeSlideIdx + 1),
      clone,
      ...slides.slice(activeSlideIdx + 1)
    ];
    commitSlidesChange(next);
    setActiveSlideIdx(activeSlideIdx + 1);
  };

  const handleMoveSlide = (direction) => {
    const targetIdx = activeSlideIdx + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const next = [...slides];
    const [moved] = next.splice(activeSlideIdx, 1);
    next.splice(targetIdx, 0, moved);
    commitSlidesChange(next);
    setActiveSlideIdx(targetIdx);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, idx) => idx !== activeSlideIdx);
    commitSlidesChange(updated);
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
  };

  const handleExportCurrentSlide = async () => {
    setIsExporting(true);
    try {
      await api.exportSingleSlide(currentSlide, activeSlideIdx, slides.length, activeBrand.name);
    } catch (err) {
      console.error('Export slide failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllSlides = async () => {
    setIsExporting(true);
    try {
      await api.exportCreativePackage(
        { width: 1080, height: 1350, slides },
        activeBrand.name
      );
    } catch (err) {
      console.error('Export carousel failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    setIsSaved(true);
    await api.updateCreative(creativeMeta.id, {
      title: creativeMeta.title,
      status: 'Draft',
      blueprint_json: {
        ...(creativeMeta.blueprint || {}),
        slides: slides.map((s, idx) => ({
          id: s.id,
          slide_number: idx + 1,
          badge: s.badge,
          headline: s.headline,
          subhead: s.subhead,
          type: s.type,
        })),
      },
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-3 animate-in fade-in duration-200">
      {/* Top Editor Toolbar */}
      <div className="h-14 bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between shrink-0 shadow-subtle">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="iconSm"
            variant="ghost"
            title="Undo"
            disabled={historyIdx <= 0}
            onClick={handleUndo}
          >
            <Undo className="w-4 h-4 text-slate-600" />
          </Button>
          <Button
            size="iconSm"
            variant="ghost"
            title="Redo"
            disabled={historyIdx >= history.length - 1}
            onClick={handleRedo}
          >
            <Redo className="w-4 h-4 text-slate-600" />
          </Button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <span className="text-xs font-semibold text-slate-900 truncate max-w-xs">
            {creativeMeta.title}
          </span>
          <Badge variant="secondary">1080x1350</Badge>
          {isSaved && <Badge variant="success">Saved to DB</Badge>}
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono text-slate-600 w-12 text-center">
            {zoomLevel}%
          </span>
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right: Save & Export */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Save}
            onClick={handleSave}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={Download}
            isLoading={isExporting}
            onClick={handleExportCurrentSlide}
          >
            Export Slide PNG
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Download}
            isLoading={isExporting}
            onClick={handleExportAllSlides}
          >
            Export Carousel ZIP
          </Button>
        </div>
      </div>

      {/* Main 3-Column Studio Editor Body */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left Panel: Slides & Layers (3 cols) */}
        <Card className="col-span-3 p-3 flex flex-col justify-between bg-white overflow-y-auto">
          <div className="space-y-4">
            {/* Slides Manager Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                Slides ({slides.length})
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="iconSm"
                  variant="ghost"
                  title="Move Slide Up"
                  disabled={activeSlideIdx === 0}
                  onClick={() => handleMoveSlide(-1)}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="iconSm"
                  variant="ghost"
                  title="Move Slide Down"
                  disabled={activeSlideIdx === slides.length - 1}
                  onClick={() => handleMoveSlide(1)}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="iconSm"
                  variant="ghost"
                  title="Duplicate Slide"
                  onClick={handleDuplicateSlide}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Plus}
                  onClick={handleAddSlide}
                  className="text-[11px] h-7 px-2"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Slides List */}
            <div className="space-y-2">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    activeSlideIdx === idx
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
                    <span className="truncate font-medium">{s.badge || 'Slide'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono opacity-80">{s.type}</span>
                </div>
              ))}
            </div>

            {/* Layers for current slide */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-900">Slide Element Layers</span>
              <div className="space-y-1">
                {[
                  { id: 'badge', name: 'Badge Pill', icon: Square },
                  { id: 'headline', name: 'Headline Hook', icon: Type },
                  { id: 'subhead', name: 'Body Subtext', icon: Type },
                  { id: 'footer', name: 'Brand Wordmark', icon: ImageIcon },
                ].map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedLayerId === layer.id
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{layer.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-rose-600 hover:bg-rose-50"
              icon={Trash2}
              disabled={slides.length <= 1}
              onClick={handleDeleteSlide}
            >
              Delete Slide
            </Button>
          </div>
        </Card>

        {/* Center Panel: Interactive Canvas (6 cols) */}
        <div className="col-span-6 bg-slate-100/70 rounded-xl border border-slate-200/80 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Safe Margins / Overflow Bounds Indicator Pill */}
          <div
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono shadow-xs ${
              hasBoundsWarning
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {hasBoundsWarning ? (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Text Overflow Warning: Shorten copy to prevent wrapping clip</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Safe Margin: 80px Respected</span>
              </>
            )}
          </div>

          {/* Canvas Box */}
          <div
            style={{ transform: `scale(${zoomLevel / 100})` }}
            className="w-full max-w-sm aspect-[4/5] bg-slate-900 text-white rounded-xl p-8 flex flex-col justify-between shadow-2xl border border-slate-800 transition-transform duration-200 relative select-none"
          >
            {/* Header */}
            <div
              onClick={() => setSelectedLayerId('badge')}
              className={`flex items-center justify-between cursor-pointer rounded p-1 transition-colors ${
                selectedLayerId === 'badge' ? 'ring-1 ring-blue-400 bg-white/5' : ''
              }`}
            >
              <span className="text-[10px] tracking-wider font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-slate-300">
                {currentSlide.badge}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                [0{activeSlideIdx + 1}/0{slides.length}]
              </span>
            </div>

            {/* Body */}
            <div className="space-y-4 my-auto" style={{ textAlign: headlineAlign }}>
              <div
                onClick={() => setSelectedLayerId('headline')}
                className={`cursor-pointer rounded p-1.5 transition-colors ${
                  selectedLayerId === 'headline' ? 'ring-1 ring-blue-400 bg-white/5' : ''
                }`}
              >
                <h3
                  className="text-xl tracking-tight text-white leading-tight"
                  style={{ fontWeight: headlineWeight }}
                >
                  {currentSlide.headline}
                </h3>
              </div>

              <div
                onClick={() => setSelectedLayerId('subhead')}
                className={`cursor-pointer rounded p-1.5 transition-colors ${
                  selectedLayerId === 'subhead' ? 'ring-1 ring-blue-400 bg-white/5' : ''
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {currentSlide.subhead}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              onClick={() => setSelectedLayerId('footer')}
              className={`pt-4 border-t border-white/10 flex items-center justify-between cursor-pointer rounded p-1 text-[10px] text-slate-400 transition-colors ${
                selectedLayerId === 'footer' ? 'ring-1 ring-blue-400 bg-white/5' : ''
              }`}
            >
              <span className="font-bold tracking-wider">{activeBrand.name.toUpperCase()}</span>
              <span className="font-mono">
                {activeSlideIdx === slides.length - 1 ? 'VISIT BIO' : 'SWIPE NEXT →'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Layer Inspector (3 cols) */}
        <Card className="col-span-3 p-4 bg-white space-y-4 overflow-y-auto">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Element Inspector
            </span>
            <Badge variant="primary">{selectedLayerId.toUpperCase()}</Badge>
          </div>

          {selectedLayerId === 'headline' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-medium">Headline Text</label>
                  <span className={`text-[10px] font-mono ${hasHeadlineOverflow ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {(currentSlide.headline || '').length}/75
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentSlide.headline}
                  onChange={(e) => handleUpdateSlideField('headline', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Typography Weight</label>
                <select
                  value={headlineWeight}
                  onChange={(e) => setHeadlineWeight(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="600">SemiBold (600)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setHeadlineAlign(align)}
                      className={`py-1 border rounded capitalize text-center ${
                        headlineAlign === align ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedLayerId === 'subhead' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-medium">Body Text</label>
                  <span className={`text-[10px] font-mono ${hasSubheadOverflow ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {(currentSlide.subhead || '').length}/160
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={currentSlide.subhead}
                  onChange={(e) => handleUpdateSlideField('subhead', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          )}

          {selectedLayerId === 'badge' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Badge Copy</label>
                <input
                  type="text"
                  value={currentSlide.badge}
                  onChange={(e) => handleUpdateSlideField('badge', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          )}

          {selectedLayerId === 'footer' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 text-[11px]">
                Brand wordmark adheres strictly to Visual DNA safe padding and aspect rules.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
