import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  UploadCloud,
  Filter,
  Eye,
  RefreshCw,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockReferences } from '../data/mockData';
import { api } from '../services/api';

export const ReferenceStudioPage = () => {
  const { activeBrand } = useOutletContext();
  const [references, setReferences] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isReanalysing, setIsReanalysing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api.getReferences(activeBrand?.id || 'brand_1').then((items) => {
      if (mounted && items) setReferences(items);
    });
    return () => { mounted = false; };
  }, [activeBrand?.id]);

  const handleReanalyse = async (refId) => {
    setIsReanalysing(true);
    try {
      const updated = await api.reanalyseReference(refId);
      if (updated) {
        setReferences(prev => prev.map(r => r.id === refId ? updated : r));
        setSelectedRef(updated);
      }
    } finally {
      setIsReanalysing(false);
    }
  };

  const handleDelete = async (refId) => {
    await api.deleteReference(refId);
    setReferences(prev => prev.filter(r => r.id !== refId));
    setSelectedRef(null);
  };

  const filteredRefs = statusFilter === 'all'
    ? references
    : references.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());

  const handleRealFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await api.uploadReferenceFile(file, activeBrand.id);
      if (result) {
        const newRef = {
          id: result.id,
          title: result.title,
          source: `Uploaded File (${result.dimensions})`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'Processed',
          confidenceScore: result.confidence_score || 93.5,
          tags: ['Real Upload', result.dimensions, 'Palette Extracted'],
          ocrText: result.ocr_text,
          extractedPalette: result.extracted_palette || ['#0F172A', '#F8FAFC'],
          archetype: result.archetype,
        };
        setReferences(prev => [newRef, ...prev]);
        setSelectedRef(newRef);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSimulatedUpload = async (e) => {
    e.stopPropagation();
    const serverResult = await api.simulateUploadReference(activeBrand.id, 'Uploaded Benchmark Creative');
    const newRef = {
      id: serverResult?.id || `ref_${Date.now()}`,
      title: serverResult?.title || 'Uploaded Creative Benchmark',
      source: 'Direct Upload',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Processed',
      confidenceScore: serverResult?.confidence_score || 92,
      tags: ['Benchmark', 'Editorial Layout', 'High Contrast'],
      ocrText: 'RECOVER 2X FASTER. The compression architecture proven in endurance trials.',
      extractedPalette: ['#0F172A', '#F8FAFC', '#2563EB', '#94A3B8'],
      archetype: serverResult?.archetype || 'Editorial Stat Callout',
    };
    setReferences([newRef, ...references]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reference Studio
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload top-performing visual references for automatic OCR, palette extraction, and archetype classification.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleRealFileUpload}
          className="hidden"
        />

        <Button
          variant="primary"
          size="sm"
          icon={UploadCloud}
          isLoading={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Image (PNG/JPG/WebP)
        </Button>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl bg-white hover:bg-slate-50/50 transition-all cursor-pointer text-center group"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center mx-auto mb-3 transition-colors">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          Click to upload benchmark carousel slides or static graphics (PNG, JPG, WebP)
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          The backend analyzes pixel color distribution, dimensions, and aspect ratios via Pillow without duplicating third-party artwork.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Select Local File
          </Button>
          <Button size="sm" variant="secondary" onClick={handleSimulatedUpload}>
            Simulate Sample Ingestion
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
          {['all', 'processed', 'processing'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredRefs.length} references indexed
        </span>
      </div>

      {/* Reference Cards Grid */}
      {filteredRefs.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <UploadCloud className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No reference assets uploaded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Upload visual benchmarks or top-performing carousels above. The backend will extract palettes, fonts, and layout rules.
          </p>
          <Button size="sm" variant="primary" icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>
            Upload First Reference
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRefs.map((item) => (
            <Card
              key={item.id}
              hoverable
              onClick={() => setSelectedRef(item)}
              className="cursor-pointer group flex flex-col justify-between p-5 space-y-4"
            >
            <div>
              {/* Card visual banner preview */}
              <div className="h-32 rounded-lg bg-slate-900 text-white p-4 flex flex-col justify-between border border-slate-800 relative overflow-hidden mb-3">
                <div className="flex items-center justify-between z-10">
                  <Badge variant="primary" className="bg-white/20 border-white/20 text-white text-[10px]">
                    {item.archetype}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-400">
                    Score: {item.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-white/90 line-clamp-2 z-10">
                  "{item.ocrText}"
                </p>
                <div className="flex items-center gap-1.5 z-10">
                  {item.extractedPalette.map((col, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={item.status === 'Processed' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
                <span className="text-[11px] text-slate-400">{item.uploadedAt}</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mt-2 group-hover:text-slate-950">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Source: {item.source}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Inspect Extraction</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Slide-out Reference Detail Drawer */}
      {selectedRef && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRef(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedRef.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Extraction & Computer Vision Analysis</p>
                </div>
                <button
                  onClick={() => setSelectedRef(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Archetype & Score */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Archetype Classification</span>
                  <Badge variant="indigo">{selectedRef.archetype}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Vision Confidence</span>
                  <span className="text-xs font-mono font-bold text-slate-900">{selectedRef.confidenceScore}%</span>
                </div>
              </div>

              {/* OCR Extracted Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  OCR Extracted Copy Structure
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed">
                  {selectedRef.ocrText}
                </div>
              </div>

              {/* Extracted Color Palette */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Extracted Palette Distribution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRef.extractedPalette.map((hex, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 text-xs"
                    >
                      <span
                        className="w-5 h-5 rounded-md border border-slate-300 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-slate-800">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rights and Attribution Note */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                <strong>Source & IP Note:</strong> Reference assets are strictly utilized for mathematical layout feature extraction and never duplicated verbatim into production blueprints.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                isLoading={isReanalysing}
                onClick={() => handleReanalyse(selectedRef.id)}
                className="flex-1"
              >
                Re-Analyze
              </Button>
              <Button
                variant="destructive"
                size="sm"
                icon={Trash2}
                onClick={() => handleDelete(selectedRef.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

