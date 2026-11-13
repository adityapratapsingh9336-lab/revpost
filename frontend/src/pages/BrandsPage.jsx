import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building2,
  Package,
  Users,
  MessageSquare,
  Palette,
  ShieldAlert,
  FileCheck,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';

const buildInitialForm = (brand) => ({
  name: brand?.name || '',
  tagline: brand?.tagline || '',
  industry: brand?.industry || '',
  description: brand?.description || '',
  primaryColor: brand?.primaryColor || '#0F172A',
  accentColor: brand?.accentColor || '#3B82F6',
  secondaryColor: brand?.secondaryColor || '#F8FAFC',
  fontCategory: brand?.fontCategory || 'Modern Geometric Sans',
  audienceDemographics: brand?.audience?.demographics || 'Ages 22-38, active urban professionals',
  audiencePainPoints: brand?.audience?.painPoints || 'Low-quality gear and overhyped marketing',
  voiceTone: Array.isArray(brand?.voice?.tone) ? brand.voice.tone.join(', ') : 'Empowering, Direct, Science-backed',
  approvedWords: Array.isArray(brand?.voice?.approvedWords) ? brand.voice.approvedWords.join(', ') : 'Precision, Kinetic, Focus',
  prohibitedWords: Array.isArray(brand?.voice?.prohibitedWords) ? brand.voice.prohibitedWords.join(', ') : 'Cheap, Miracle, Guaranteed gains',
  restrictions: brand?.restrictions || [
    'Never make unverified medical recovery claims.',
    'Always attribute athlete imagery to verified brand athletes.'
  ],
  products: brand?.products || [
    { id: 'p1', name: 'Core Flagship Product', category: 'Apparel', usp: 'High-precision durability' }
  ]
});

export const BrandsPage = () => {
  const { activeBrand, setActiveBrand, refreshData } = useOutletContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState(() => buildInitialForm(activeBrand));

  // Modals for creating Brand, Product, and Restriction Rule
  const [isNewBrandOpen, setIsNewBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandIndustry, setNewBrandIndustry] = useState('');

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Apparel');
  const [newProdUsp, setNewProdUsp] = useState('');

  const [newRuleText, setNewRuleText] = useState('');

  useEffect(() => {
    setFormData(buildInitialForm(activeBrand));
    setIsDirty(false);
  }, [activeBrand?.id]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsSaved(true);
    setIsDirty(false);
    const updated = await api.updateBrand(activeBrand.id, {
      name: formData.name,
      tagline: formData.tagline,
      industry: formData.industry,
      description: formData.description,
      brand_profile: {
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        secondaryColor: formData.secondaryColor,
        fontCategory: formData.fontCategory,
        audience: {
          demographics: formData.audienceDemographics,
          painPoints: formData.audiencePainPoints,
        },
        voice: {
          tone: formData.voiceTone.split(',').map(s => s.trim()).filter(Boolean),
          approvedWords: formData.approvedWords.split(',').map(s => s.trim()).filter(Boolean),
          prohibitedWords: formData.prohibitedWords.split(',').map(s => s.trim()).filter(Boolean),
        },
        restrictions: formData.restrictions,
        products: formData.products,
      }
    });
    if (updated) {
      setActiveBrand(updated);
    }
    if (refreshData) await refreshData();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const created = await api.createBrand({
      name: newBrandName.trim(),
      industry: newBrandIndustry.trim() || 'Consumer Brand',
      tagline: 'Engineered for clarity and growth.',
      description: `${newBrandName.trim()} official social content workspace.`
    });
    if (created) {
      if (refreshData) await refreshData();
      setActiveBrand(created);
    }
    setNewBrandName('');
    setNewBrandIndustry('');
    setIsNewBrandOpen(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const nextProducts = [
      ...formData.products,
      { id: `prod_${Date.now()}`, name: newProdName.trim(), category: newProdCategory, usp: newProdUsp.trim() }
    ];
    handleFieldChange('products', nextProducts);
    setNewProdName('');
    setNewProdUsp('');
    setIsAddProductOpen(false);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;
    handleFieldChange('restrictions', [...formData.restrictions, newRuleText.trim()]);
    setNewRuleText('');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'products', label: 'Products & Services', icon: Package },
    { id: 'audience', label: 'Audience & ICP', icon: Users },
    { id: 'voice', label: 'Voice & Language', icon: MessageSquare },
    { id: 'visual', label: 'Visual Identity', icon: Palette },
    { id: 'restrictions', label: 'Restrictions & Claims', icon: ShieldAlert },
    { id: 'assets', label: 'Approved Assets', icon: FileCheck },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Brand Studio
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
            {isDirty && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
            {isSaved && (
              <Badge variant="success">Saved to Knowledge Base</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure structured brand parameters used to guide AI creative generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsNewBrandOpen(true)}
          >
            New Brand
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!isDirty}
            onClick={() => {
              setFormData(buildInitialForm(activeBrand));
              setIsDirty(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
          >
            {isSaved ? 'Saved!' : 'Save Brand DNA'}
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry & Category
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Brand Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Core Mission & Brand Story
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supplied to the AI engine to preserve brand integrity in copy and hooks.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 2: Products & Services */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Registered products that can be featured in carousel campaigns.
            </p>
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => setIsAddProductOpen(true)}>
              Add Product
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.products.map((prod, idx) => (
              <Card key={prod.id || idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{prod.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{prod.category}</Badge>
                    <button
                      onClick={() => handleFieldChange('products', formData.products.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-light">
                  <span className="font-medium text-slate-700">USP: </span>
                  {prod.usp}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audience */}
      {activeTab === 'audience' && (
        <Card className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Demographics & Psychographics
            </label>
            <textarea
              rows={3}
              value={formData.audienceDemographics}
              onChange={(e) => handleFieldChange('audienceDemographics', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer Pain Points & Objections
            </label>
            <textarea
              rows={3}
              value={formData.audiencePainPoints}
              onChange={(e) => handleFieldChange('audiencePainPoints', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </Card>
      )}

      {/* Tab 4: Voice & Language */}
      {activeTab === 'voice' && (
        <Card className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tone of Voice Attributes (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.voiceTone}
              onChange={(e) => handleFieldChange('voiceTone', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approved Brand Keywords
              </label>
              <textarea
                rows={3}
                value={formData.approvedWords}
                onChange={(e) => handleFieldChange('approvedWords', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1.5">
                Prohibited / Banned Vocabulary
              </label>
              <textarea
                rows={3}
                value={formData.prohibitedWords}
                onChange={(e) => handleFieldChange('prohibitedWords', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-rose-200 bg-rose-50/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Visual Identity */}
      {activeTab === 'visual' && (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Accent Pop Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Font Category
              </label>
              <input
                type="text"
                value={formData.fontCategory}
                onChange={(e) => handleFieldChange('fontCategory', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Restrictions */}
      {activeTab === 'restrictions' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900">
            Mandatory Compliance & Claims Guardrails
          </h3>

          <form onSubmit={handleAddRule} className="flex gap-2">
            <input
              type="text"
              placeholder="Add compliance guardrail (e.g., Avoid unverified percentage claims)..."
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
            <Button type="submit" size="sm" variant="secondary" icon={Plus}>
              Add Rule
            </Button>
          </form>

          <div className="space-y-2">
            {formData.restrictions.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleFieldChange('restrictions', formData.restrictions.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 7: Approved Assets */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              Upload approved logos, brand badges, or product packshots
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supported: SVG, high-res PNG, JPG (up to 20MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(activeBrand.assets || [
              { id: 'ast_1', name: `${activeBrand.name} Wordmark Vector`, type: 'SVG', size: '24 KB' }
            ]).map((ast) => (
              <Card key={ast.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">{ast.name}</p>
                    <p className="text-[10px] text-slate-400">{ast.type} · {ast.size}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create New Brand Modal */}
      <Modal
        isOpen={isNewBrandOpen}
        onClose={() => setIsNewBrandOpen(false)}
        title="Create New Brand Profile"
        description="Add a separate brand entity under this workspace."
      >
        <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g., Zenith Labs"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              value={newBrandIndustry}
              onChange={(e) => setNewBrandIndustry(e.target.value)}
              placeholder="e.g., B2B SaaS"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewBrandOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Brand</Button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="Add Brand Product"
        description="Products appear in AI Studio campaign briefs."
      >
        <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="e.g., AeroCore Windbreaker"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Value Proposition (USP)</label>
            <textarea
              rows={2}
              value={newProdUsp}
              onChange={(e) => setNewProdUsp(e.target.value)}
              placeholder="What sets this product apart?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Add Product (Remember to Save)</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
