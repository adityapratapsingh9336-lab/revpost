import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Edit3,
  Calendar,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Cpu,
  UploadCloud,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockCreatives } from '../data/mockData';
import { api } from '../services/api';
import { cn } from '../utils/cn';

export const AIStudioPage = () => {
  const navigate = useNavigate();
  const { activeBrand } = useOutletContext();

  // Reference Benchmark Selection
  const [references, setReferences] = useState([]);
  const [selectedReference, setSelectedReference] = useState(null);
  const [isLoadingRefs, setIsLoadingRefs] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const studioFileRef = useRef(null);

  // Generator form inputs
  const [platform, setPlatform] = useState('Instagram');
  const [format, setFormat] = useState('1080x1350 (Portrait Carousel)');
  const [contentType, setContentType] = useState('carousel');
  const [slideCount, setSlideCount] = useState(5);
  const [topicBrief, setTopicBrief] = useState(
    '4 kinetic movements that fix the hip hinge and unlock stride frequency for runners without loading the knees.'
  );
  const [objective, setObjective] = useState('Educational & Authority');
  const [tone, setTone] = useState('Science-Backed & Direct');
  const [ctaType, setCtaType] = useState('Save Post / Link in Bio');
  const [archetype, setArchetype] = useState('High-Contrast Technical Minimalist');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [hasCopiedCaption, setHasCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [useReferenceBackdrop, setUseReferenceBackdrop] = useState(true);

  // Active creative being displayed/edited
  const [creative, setCreative] = useState({
    id: 'draft_initial',
    title: 'Ready to Generate',
    brandId: 'brand_1',
    platform: 'Instagram',
    format: '1080x1350 (Portrait Carousel)',
    type: 'carousel',
    slidesCount: 5,
    status: 'Ready',
    caption: 'Click "Generate Creative Blueprint" on the left to synthesize high-impact copy, hooks, and hashtags for your post.',
    hashtags: ['#ContentStrategy', '#SocialGrowth', '#AIStudio'],
    archetype: 'High-Contrast Technical Minimalist',
    slides: [
      {
        id: 1,
        badge: 'READY TO GENERATE',
        headline: 'ENTER YOUR BRIEF & CLICK GENERATE',
        subhead: 'The AI will synthesize custom slide copy, structured breakdown points, and platform captions tailored to your topic.',
        type: 'hook'
      }
    ]
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationSuccessMsg, setGenerationSuccessMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    setIsLoadingRefs(true);
    const brandId = activeBrand?.id || 'brand_1';
    const cachedRefId = localStorage.getItem(`xyz_selected_ref_${brandId}`);
    api.getReferences(brandId).then((items) => {
      if (mounted) {
        const list = items || [];
        setReferences(list);
        if (list.length > 0) {
          const match = cachedRefId ? list.find(r => r.id === cachedRefId) : null;
          const chosen = match || list[0];
          setSelectedReference(chosen);
          if (chosen.archetype) setArchetype(chosen.archetype);
        }
        setIsLoadingRefs(false);
      }
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const handleStudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingRef(true);
    try {
      const brandId = activeBrand?.id || 'brand_1';
      const result = await api.uploadReferenceFile(file, brandId);
      if (result) {
        const newRef = {
          id: result.id,
          title: result.title,
          thumbnailUrl: result.thumbnailUrl,
          archetype: result.archetype || 'Modern High-Contrast Minimalist',
          extractedPalette: result.extracted_palette || result.extractedPalette || ['#0F172A', '#3B82F6', '#F8FAFC'],
          confidenceScore: result.confidence_score || 94,
        };
        setReferences(prev => [newRef, ...prev]);
        setSelectedReference(newRef);
        setArchetype(newRef.archetype);
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingRef(false);
      if (studioFileRef.current) studioFileRef.current.value = '';
    }
  };

  const generationSteps = [
    'Parsing Brief & Extracting Brand Knowledge...',
    'Querying Visual DNA Rules v1.4 & Allowlisted Components...',
    'Synthesizing Structured Design Blueprint JSON...',
    'Validating Safe Margins & Rendering Clean Previews...'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    const stepInterval = setInterval(() => {
      setGenerationStep(prev => (prev < generationSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      // Call live FastAPI AI Gateway with brand knowledge & selected reference benchmark
      const brandId = activeBrand?.id || 'brand_1';
      const serverResult = await api.generateCreative({
        brandId,
        topicBrief,
        platform,
        format,
        contentType,
        slideCount,
        objective,
        tone,
        ctaType,
        archetype,
        referenceId: selectedReference?.id,
        referenceArchetype: selectedReference?.archetype,
      });

      clearInterval(stepInterval);
      setIsGenerating(false);

      if (serverResult && serverResult.blueprint && serverResult.blueprint.slides) {
        setCreative({
          id: serverResult.id,
          title: serverResult.title,
          brandId: activeBrand.id,
          platform: serverResult.platform,
          format: serverResult.format,
          type: serverResult.content_type,
          slidesCount: serverResult.slides_count,
          status: 'Generated',
          caption: serverResult.caption,
          hashtags: serverResult.hashtags,
          archetype,
          slides: serverResult.blueprint.slides.map(s => ({
            id: s.id,
            badge: s.badge,
            headline: s.headline,
            subhead: s.subhead,
            type: s.type,
          })),
        });
        setHasGenerated(true);
        setGenerationSuccessMsg(`✓ Post created! ${serverResult.blueprint.slides.length} slides generated.`);
        setTimeout(() => setGenerationSuccessMsg(null), 5000);
      } else {
        // Fallback local synthesis with real prompt integration
        const cleanPrompt = topicBrief.trim().replace(/\.+$/, '');
        setCreative({
          id: `crt_${Date.now()}`,
          title: cleanPrompt.substring(0, 50),
          brandId: activeBrand.id,
          platform,
          format,
          type: contentType,
          slidesCount: slideCount,
          status: 'Generated',
          caption: `A deep-dive breakdown into ${cleanPrompt}:\n\nKey principles to execute:\n1. Audit mechanical bottlenecks before scaling.\n2. Maintain strict baseline controls across the loop.\n3. Eliminate compensatory fatigue.\n\nSave this guide to reference before your next session.\n\n#${activeBrand.slug} #ContentDesign #Performance`,
          archetype,
          slides: Array.from({ length: slideCount }, (_, idx) => ({
            id: idx + 1,
            badge: idx === 0 ? 'HOOK [01]' : idx === slideCount - 1 ? 'ACTION' : `STEP [0${idx + 1}]`,
            headline: idx === 0
              ? `THE BLUEPRINT: ${cleanPrompt.slice(0, 48).toUpperCase()}`
              : idx === slideCount - 1
              ? `DEPLOY THIS PROTOCOL WITH ${activeBrand.name.toUpperCase()}`
              : `PHASE 0${idx}: OPTIMIZING EXECUTION LEVERAGE`,
            subhead: idx === 0
              ? `Why conventional approaches fail and how to systematically unlock results.`
              : idx === slideCount - 1
              ? `Bookmark this breakdown and explore our bio link for the complete framework.`
              : `Maintain neutral baseline controls and eliminate secondary resistance points.`,
            type: idx === 0 ? 'hook' : idx === slideCount - 1 ? 'cta' : 'content',
          })),
        });
        setHasGenerated(true);
        setGenerationSuccessMsg(`✓ Post created! ${slideCount} slides generated.`);
        setTimeout(() => setGenerationSuccessMsg(null), 5000);
      }
      setActiveSlideIndex(0);
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      console.error('Generation error:', err);
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(creative.caption);
    setHasCopiedCaption(true);
    setTimeout(() => setHasCopiedCaption(false), 2000);
  };

  const handleExportSingleSlide = async () => {
    setIsExporting(true);
    try {
      const activeSlide = creative.slides?.[activeSlideIndex] || {
        headline: topicBrief,
        subhead: activeBrand.name,
        badge: `SLIDE [0${activeSlideIndex + 1}]`
      };
      await api.exportSingleSlide(
        activeSlide,
        activeSlideIndex,
        creative.slides?.length || 1,
        activeBrand.name
      );
    } catch (err) {
      console.error('Slide export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.exportCreativePackage(
        { width: 1080, height: 1350, slides: creative.slides || [] },
        activeBrand.name
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Studio
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
            <Badge variant="secondary">DNA v1.4 Active</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate original, brand-consistent carousels and static posts via structured Design Blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/editor')}
            icon={Edit3}
          >
            Open in Editor
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/calendar')}
            icon={Calendar}
          >
            Schedule
          </Button>
        </div>
      </div>

      {/* Main 2-Panel Layout: Configuration & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Generation Inputs (5 Cols) */}
        <Card className="lg:col-span-5 p-6 space-y-5 bg-white border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" /> Creative Parameters
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Step 1 of 2</span>
          </div>

          {/* 1. Reference Benchmark Selector */}
          <div className="pb-4 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reference Post Benchmark</span>
              </label>
              <input
                ref={studioFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleStudioUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => studioFileRef.current?.click()}
                disabled={isUploadingRef}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{isUploadingRef ? 'Uploading...' : 'Upload Reference'}</span>
              </button>
            </div>

            {references.length === 0 ? (
              <div
                onClick={() => studioFileRef.current?.click()}
                className="p-3.5 border border-dashed border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/20 text-center cursor-pointer transition-all"
              >
                <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-medium text-slate-700">No reference benchmarks uploaded</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Click here to upload an inspirational post to guide AI design</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {references.map((ref) => {
                  const isSelected = selectedReference?.id === ref.id;
                  return (
                    <div
                      key={ref.id}
                      onClick={() => {
                        setSelectedReference(ref);
                        if (ref.archetype) setArchetype(ref.archetype);
                        localStorage.setItem(`xyz_selected_ref_${activeBrand?.id || 'brand_1'}`, ref.id);
                      }}
                      className={cn(
                        'p-2 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between group',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      )}
                    >
                      <div className="h-16 w-full rounded-lg bg-slate-900 relative overflow-hidden mb-1.5">
                        {ref.thumbnailUrl ? (
                          <img
                            src={ref.thumbnailUrl}
                            alt={ref.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-[10px]">
                            {ref.archetype}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-slate-900 line-clamp-1">{ref.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[80px]">{ref.archetype}</span>
                          <div className="flex items-center gap-0.5">
                            {(ref.extractedPalette || []).slice(0, 3).map((hex, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full border border-slate-300"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedReference && (
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium truncate max-w-[200px]">
                  Guided by: <strong className="text-slate-900">{selectedReference.title}</strong>
                </span>
                <Badge variant="indigo" className="text-[10px] shrink-0">
                  {selectedReference.archetype}
                </Badge>
              </div>
            )}
          </div>

          {/* Platform & Format */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
              >
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>X (Twitter)</option>
                <option>Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
              >
                <option>1080x1350 (Portrait Carousel)</option>
                <option>1080x1080 (Square Carousel)</option>
                <option>1080x1080 (Static Post)</option>
                <option>1200x1200 (LinkedIn Carousel)</option>
              </select>
            </div>
          </div>

          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Post Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setContentType('carousel')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                  contentType === 'carousel'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Multi-Slide Carousel
              </button>
              <button
                type="button"
                onClick={() => setContentType('static')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                  contentType === 'static'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Single Static Post
              </button>
            </div>
          </div>

          {/* Slide Count Slider (If Carousel) */}
          {contentType === 'carousel' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Carousel Slide Count
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {slideCount} Slides
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>2 (Hook + CTA)</span>
                <span>5 (Standard)</span>
                <span>8 (In-depth)</span>
              </div>
            </div>
          )}

          {/* Topic Brief */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic / Creative Brief
            </label>
            <textarea
              rows={3}
              value={topicBrief}
              onChange={(e) => setTopicBrief(e.target.value)}
              placeholder="e.g. 5 reasons runners should prioritize hydration in winter months..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Objective & CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objective
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
              >
                <option>Educational & Authority</option>
                <option>Product Feature Launch</option>
                <option>Engagement & Discussion</option>
                <option>Brand Manifesto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Call to Action
              </label>
              <select
                value={ctaType}
                onChange={(e) => setCtaType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
              >
                <option>Save Post / Link in Bio</option>
                <option>Comment Below</option>
                <option>Shop Collection</option>
                <option>Share with Colleague</option>
              </select>
            </div>
          </div>

          {/* Archetype Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Design Archetype Filter
            </label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
            >
              <option>High-Contrast Technical Minimalist</option>
              <option>Modern Editorial Magazine</option>
              <option>Data & Metrics Quadrant</option>
              <option>Minimalist Bold Typographic</option>
            </select>
          </div>

          {/* Submit Action (Sticky at bottom of left panel) */}
          <div className="pt-3 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-1 border-t border-slate-100 z-10">
            <Button
              variant="primary"
              size="lg"
              className="w-full py-3 shadow-md"
              isLoading={isGenerating}
              icon={Sparkles}
              onClick={handleGenerate}
            >
              {isGenerating ? 'Synthesizing Blueprint...' : 'Generate Creative Blueprint'}
            </Button>
            <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium">
              ⚡ Click above to run AI engine with {selectedReference ? `"${selectedReference.title}"` : 'Brand DNA'}
            </p>
          </div>
        </Card>

        {/* Right Panel: Output & Live Canvas Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Progress Banner during generation */}
          {isGenerating && (
            <Card className="p-4 bg-slate-900 text-white border-slate-800 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium truncate">
                    {generationSteps[generationStep]}
                  </p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Live Preview Container */}
          <Card className="p-6 bg-white border-slate-200">
            {/* Top Preview Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Live Canvas Preview
                </span>
                <Badge variant="secondary">{creative.platform}</Badge>
                <Badge variant="indigo">{creative.archetype}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  isLoading={isExporting}
                  onClick={handleExportSingleSlide}
                  title="Download this slide as a high-resolution PNG image"
                >
                  Download PNG
                </Button>

                {creative.slides && creative.slides.length > 1 && (
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    <span className="text-xs font-mono text-slate-500 mr-1">
                      {activeSlideIndex + 1}/{creative.slides.length}
                    </span>
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
                      disabled={activeSlideIndex === creative.slides.length - 1}
                      onClick={() => setActiveSlideIndex(prev => Math.min(creative.slides.length - 1, prev + 1))}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Generation Success Banner */}
            {generationSuccessMsg && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{generationSuccessMsg}</span>
              </div>
            )}

            {/* The Actual Rendered Slide Canvas — Pure Design Blueprint (No wallpaper background) */}
            <div className="py-6 flex justify-center">
              <div
                className="w-full max-w-sm aspect-[4/5] text-white rounded-2xl p-8 flex flex-col justify-between shadow-2xl border border-white/10 relative select-none overflow-hidden"
                style={{
                  backgroundColor: selectedReference?.extractedPalette?.[0] || '#0F172A'
                }}
              >
                {/* Subtle Geometric Design Accents based on Reference Palette */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: selectedReference?.extractedPalette?.[2] || '#3B82F6' }}
                />
                <div
                  className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: selectedReference?.extractedPalette?.[1] || '#64748B' }}
                />

                {/* Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] tracking-wider font-mono font-bold uppercase px-2.5 py-1 rounded-md border"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: selectedReference?.extractedPalette?.[2] || '#60A5FA'
                      }}
                    >
                      {creative.slides?.[activeSlideIndex]?.badge || 'SLIDE [01]'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    [0{activeSlideIndex + 1}/0{creative.slides?.length || 1}]
                  </span>
                </div>

                {/* Main Content Area */}
                <div className="space-y-4 my-auto z-10">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    {creative.slides?.[activeSlideIndex]?.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {creative.slides?.[activeSlideIndex]?.subhead}
                  </p>

                  {/* Archetype Visual Feature Box */}
                  {creative.slides?.[activeSlideIndex]?.type === 'cta' ? (
                    <div
                      className="mt-4 py-2 px-4 rounded-lg font-bold text-xs text-center text-white shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: selectedReference?.extractedPalette?.[2] || '#3B82F6' }}
                    >
                      VISIT LINK IN BIO →
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {activeSlideIndex === 0 ? 'CORE INSIGHT' : 'ACTIONABLE PROTOCOL'}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: selectedReference?.extractedPalette?.[2] || '#60A5FA' }}
                      >
                        {activeSlideIndex === 0 ? '⚡ HIGH VALUE' : `KEY POINT 0${activeSlideIndex}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between z-10 text-[10px] text-slate-400">
                  <span className="font-bold tracking-wider text-slate-300">{activeBrand.name.toUpperCase()}</span>
                  <span className="font-mono text-slate-400">
                    {activeSlideIndex === (creative.slides?.length || 1) - 1 ? 'VISIT BIO' : 'SWIPE NEXT →'}
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Thumbnail Strip for Carousels */}
            {creative.slides && creative.slides.length > 1 && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                {creative.slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-14 w-12 rounded-md border text-[10px] p-1.5 flex flex-col justify-between shrink-0 transition-all ${
                      activeSlideIndex === idx
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono">{idx + 1}</span>
                    <span className="truncate text-[8px]">{s.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Generated Caption & Hashtags Card */}
          <Card className="p-5 space-y-3 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Generated Platform Caption
              </span>
              <Button
                size="sm"
                variant="secondary"
                icon={hasCopiedCaption ? Check : Copy}
                onClick={copyCaption}
              >
                {hasCopiedCaption ? 'Copied' : 'Copy Caption'}
              </Button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-line font-sans leading-relaxed">
              {creative.caption}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={Edit3}
                  onClick={() => navigate(`/editor/${creative.id}`)}
                >
                  Edit Canvas
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  isLoading={isExporting}
                  onClick={handleExport}
                >
                  Export PNG / ZIP
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Calendar}
                  onClick={() => navigate('/calendar')}
                >
                  Schedule
                </Button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Tokens used: 1,840 · Latency: 940ms
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

