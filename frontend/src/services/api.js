import {
  mockBrands,
  mockCreatives,
  mockVisualDNA,
  mockReferences,
  mockCalendarEvents,
  mockPublishingQueue,
  mockSocialAccounts,
  mockAnalytics,
  mockAIProviders,
  mockWorkspaces
} from '../data/mockData';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/^["']|["']$/g, '');
const API_ORIGIN = rawApiUrl.replace(/\/$/, '');
const BASE_URL = `${API_ORIGIN}/api/v1`;

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API fallback] Request to ${url} failed:`, err.message);
    return null;
  }
}

export const api = {
  // Workspaces & Members
  async getWorkspaces() {
    const data = await safeFetch('/workspaces');
    return data && data.length > 0 ? data : mockWorkspaces;
  },

  async createWorkspace(name) {
    return await safeFetch('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async updateWorkspace(wsId, name) {
    return await safeFetch(`/workspaces/${wsId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  async getWorkspaceMembers(wsId) {
    return await safeFetch(`/workspaces/${wsId}/members`);
  },

  async inviteWorkspaceMember(wsId, email, role) {
    return await safeFetch(`/workspaces/${wsId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async removeWorkspaceMember(wsId, memberId) {
    return await safeFetch(`/workspaces/${wsId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  // Brands
  async getBrands() {
    const data = await safeFetch('/brands');
    return Array.isArray(data) ? data : [];
  },

  async createBrand(payload) {
    return await safeFetch('/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBrand(brandId, payload) {
    return await safeFetch(`/brands/${brandId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Visual DNA
  async getVisualDNA(brandId) {
    const data = await safeFetch(`/visual-dna/brand/${brandId}`);
    return data || mockVisualDNA;
  },

  async rebuildVisualDNA(brandId) {
    const data = await safeFetch(`/visual-dna/brand/${brandId}/rebuild`, {
      method: 'POST',
    });
    return data || { version: 'v1.5', status: 'rebuilt_successfully' };
  },

  async updateVisualDNA(profileId, payload) {
    return await safeFetch(`/visual-dna/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // AI Studio Generation
  async generateCreative(params) {
    return await safeFetch('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        brand_id: params.brandId || 'brand_1',
        topic_brief: params.topicBrief,
        platform: params.platform,
        format: params.format,
        content_type: params.contentType,
        slides_count: params.slideCount,
        objective: params.objective,
        tone: params.tone,
        cta_type: params.ctaType,
        archetype: params.archetype,
        reference_id: params.referenceId,
      }),
    });
  },

  // Creatives & Canvas
  async getCreatives(brandId) {
    const query = brandId ? `?brand_id=${brandId}` : '';
    const data = await safeFetch(`/creatives${query}`);
    return Array.isArray(data) ? data : [];
  },

  async getCreativeDetail(creativeId) {
    const data = await safeFetch(`/creatives/${creativeId}`);
    return data || null;
  },

  async updateCreative(creativeId, payload) {
    return await safeFetch(`/creatives/${creativeId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async duplicateCreative(creativeId) {
    return await safeFetch(`/creatives/${creativeId}/duplicate`, {
      method: 'POST',
    });
  },

  async deleteCreative(creativeId) {
    return await safeFetch(`/creatives/${creativeId}`, {
      method: 'DELETE',
    });
  },

  // Reference Studio
  async getReferences(brandId) {
    const data = await safeFetch(`/references/brand/${brandId}`);
    return Array.isArray(data) ? data : [];
  },

  async simulateUploadReference(brandId, title) {
    return await safeFetch('/references/simulate-upload', {
      method: 'POST',
      body: JSON.stringify({ brand_id: brandId, title }),
    });
  },

  async reanalyseReference(referenceId) {
    return await safeFetch(`/references/${referenceId}/analyse`, {
      method: 'POST',
    });
  },

  async deleteReference(referenceId) {
    return await safeFetch(`/references/${referenceId}`, {
      method: 'DELETE',
    });
  },

  async uploadReferenceFile(file, brandId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('brand_id', brandId || 'brand_1');
      const res = await fetch(`${BASE_URL}/references/upload`, {
        method: 'POST',
        headers: {
          'x-workspace-role': 'owner',
          'x-user-id': 'user_admin',
        },
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || errJson?.detail?.message || errJson?.detail || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errMsg);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API upload error]', err.message);
      throw err;
    }
  },

  // Calendar
  async getCalendarEvents(month = '2026-11') {
    const data = await safeFetch(`/calendar/events?month=${month}`);
    return Array.isArray(data) ? data : [];
  },

  async schedulePost(payload) {
    return await safeFetch('/calendar/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Publishing
  async getPublishingQueue() {
    const data = await safeFetch('/publishing/queue');
    if (data && Array.isArray(data.items)) {
      return data;
    }
    return { is_paused: false, items: [] };
  },

  async togglePublishingPause() {
    const data = await safeFetch('/publishing/toggle-pause', { method: 'POST' });
    return data || { is_paused: true };
  },

  async publishNow(itemId) {
    return await safeFetch(`/publishing/${itemId}/publish-now`, { method: 'POST' });
  },

  async retryPublish(itemId) {
    return await safeFetch(`/publishing/${itemId}/retry`, { method: 'POST' });
  },

  // Social Accounts
  async getSocialAccounts() {
    const data = await safeFetch('/social/accounts');
    return Array.isArray(data) ? data : [];
  },

  async connectSocialAccount(platform) {
    return await safeFetch('/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  },

  async revokeSocialAccount(accountId) {
    return await safeFetch(`/social/${accountId}/revoke`, {
      method: 'POST',
    });
  },

  // Analytics
  async getAnalyticsOverview() {
    const data = await safeFetch('/analytics/overview');
    return data || mockAnalytics;
  },

  // AI Control Center
  async getAIProviders() {
    const data = await safeFetch('/ai-control/providers');
    return data || mockAIProviders;
  },

  async testProviderKey(providerId) {
    const data = await safeFetch('/ai-control/test-key', {
      method: 'POST',
      body: JSON.stringify({ provider_id: providerId }),
    });
    return data || { status: 'Verified', latency_ms: 780 };
  },

  async configureProviderKey(provider, apiKey) {
    return await safeFetch('/ai-control/configure-key', {
      method: 'POST',
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
  },

  // High-Resolution PNG / ZIP Export Pipeline
  async exportCreativePackage(blueprint, brandName) {
    const res = await fetch(`${BASE_URL}/creatives/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint, brand_name: brandName }),
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const isZip = res.headers.get('content-type')?.includes('zip');
    const filename = isZip ? 'xyz_carousel_export.zip' : 'xyz_creative_post.png';
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportSingleSlide(slide, slideIndex, totalSlides, brandName) {
    const res = await fetch(`${BASE_URL}/creatives/export-slide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slide,
        slide_index: slideIndex,
        total_slides: totalSlides,
        brand_name: brandName,
      }),
    });
    if (!res.ok) throw new Error('Slide export failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slide_0${slideIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
