import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Dna,
  Palette,
  Type,
  Grid,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  Sliders,
  History
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockVisualDNA } from '../data/mockData';
import { api } from '../services/api';

export const VisualDNAPage = () => {
  const { activeBrand } = useOutletContext();
  const [dna, setDna] = useState(mockVisualDNA);
  const [isSaved, setIsSaved] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);

  useEffect(() => {
    let mounted = true;
    const brandId = activeBrand?.id || 'brand_1';
    const localKey = `xyz_visual_dna_${brandId}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.palette) setDna(parsed);
      } catch (e) {}
    }

    api.getVisualDNA(brandId).then((res) => {
      if (mounted && res && res.palette) {
        if (!cached) setDna(res);
      }
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const persistDnaChanges = async (nextDna) => {
    const target = nextDna || dna;
    const brandId = activeBrand?.id || 'brand_1';
    localStorage.setItem(`xyz_visual_dna_${brandId}`, JSON.stringify(target));
    setIsSaved(true);
    if (target.id) {
      try {
        const updated = await api.updateVisualDNA(target.id, {
          palette: target.palette,
          archetype: target.archetype,
          typography: target.typography,
          layoutRules: target.layoutRules,
        });
        if (updated && updated.palette) {
          setDna(updated);
          localStorage.setItem(`xyz_visual_dna_${brandId}`, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Visual DNA sync error:', err);
      }
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRebuildFromReferences = async () => {
    setIsRebuilding(true);
    try {
      const res = await api.rebuildVisualDNA(activeBrand?.id || 'brand_1');
      if (res && res.palette) {
        setDna(res);
        const brandId = activeBrand?.id || 'brand_1';
        localStorage.setItem(`xyz_visual_dna_${brandId}`, JSON.stringify(res));
      }
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleUpdate = () => {
    persistDnaChanges(dna);
  };

  const handleSwatchHexChange = (index, newHex) => {
    setDna(prev => {
      const nextPalette = [...prev.palette];
      nextPalette[index] = { ...nextPalette[index], hex: newHex.toUpperCase() };
      const updated = { ...prev, palette: nextPalette };
      persistDnaChanges(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Visual DNA Rules
            </h1>
            <Badge variant="indigo">{dna.version} Active</Badge>
            <Badge variant="success">{dna.confidenceScore}% Model Confidence</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            The core design rules synthesized from brand guidelines and processed references.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            isLoading={isRebuilding}
            onClick={handleRebuildFromReferences}
          >
            Rebuild from References
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleUpdate}
          >
            {isSaved ? 'Approved & Saved' : 'Approve & Save Rules'}
          </Button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <Card className="p-5 bg-white border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Dominant Archetype: {dna.archetype}
            </h3>
            <p className="text-xs text-slate-500">
              Last synthesized on {new Date(dna.updatedAt).toLocaleDateString()} from 18 verified references.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
            Strict Component Allowlist: Active
          </span>
        </div>
      </Card>

      {/* Section 1: Color Palette Swatches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" /> 1. Palette Swatches & Roles
          </h2>
          <span className="text-xs text-slate-400 font-mono">5 Roles Configured</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {dna.palette.map((swatch, idx) => (
            <Card key={idx} className="p-3.5 space-y-2.5 bg-white border-slate-200">
              <div
                className="w-full h-16 rounded-lg border border-slate-200 shadow-xs flex items-end justify-between p-2 relative"
                style={{ backgroundColor: swatch.hex }}
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    swatch.hex === '#F8FAFC' || swatch.hex === '#E2E8F0' || swatch.hex === '#FFFFFF'
                      ? 'bg-slate-900/10 text-slate-900'
                      : 'bg-black/40 text-white'
                  }`}
                >
                  {swatch.hex}
                </span>
                <input
                  type="color"
                  value={swatch.hex.startsWith('#') ? swatch.hex : '#0F172A'}
                  onChange={(e) => handleSwatchHexChange(idx, e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  title="Edit swatch hex"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 truncate">{swatch.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{swatch.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2: Typography Hierarchy & Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typography */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-500" /> 2. Typography Hierarchy
          </h2>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="pt-2 first:pt-0">
              <span className="text-xs text-slate-400 font-medium">Headline Category</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {dna.typography.headingFontCategory}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Weight: {dna.typography.headingWeight}</p>
            </div>

            <div className="pt-3">
              <span className="text-xs text-slate-400 font-medium">Body & Support Copy</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {dna.typography.bodyFontCategory}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Weight: {dna.typography.bodyWeight}</p>
            </div>

            <div className="pt-3">
              <span className="text-xs text-slate-400 font-medium">Text Transformations</span>
              <p className="text-xs font-mono text-slate-700 mt-0.5">
                {dna.typography.headlineTransform}
              </p>
            </div>
          </div>
        </Card>

        {/* Layout & Composition Rules */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Grid className="w-4 h-4 text-slate-500" /> 3. Layout Patterns & Safe Margins
          </h2>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="pt-2 first:pt-0">
              <span className="text-xs text-slate-400 font-medium">Canvas Safe Margins</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {dna.layoutRules.slideMargins}
              </p>
            </div>

            <div className="pt-3">
              <span className="text-xs text-slate-400 font-medium">Grid Structure</span>
              <p className="text-xs font-mono text-slate-700 mt-0.5">
                {dna.layoutRules.gridType}
              </p>
            </div>

            <div className="pt-3">
              <span className="text-xs text-slate-400 font-medium">CTA Button Pattern</span>
              <p className="text-xs text-slate-700 mt-0.5">
                {dna.layoutRules.ctaStyle}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 3: Visual Directives & Version History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Directives */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-500" /> 4. AI Design Directives
          </h2>
          <div className="space-y-2">
            {dna.compositionMood.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Version History Log */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> 5. Blueprint Evolution
          </h2>
          <div className="space-y-3">
            {dna.versionHistory.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">{item.version}</span>
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{item.notes}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

