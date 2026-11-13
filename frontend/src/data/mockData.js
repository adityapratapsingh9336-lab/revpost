// Comprehensive mock data for XYZ - AI-Powered Social Media Management SaaS

export const mockWorkspaces = [
  { id: 'ws_1', name: 'Acme Growth Labs', tier: 'Pro Enterprise', membersCount: 6 },
  { id: 'ws_2', name: 'Nordic Brand Collective', tier: 'Starter', membersCount: 2 },
  { id: 'ws_3', name: 'Personal Studio', tier: 'Free', membersCount: 1 },
];

export const mockBrands = [
  {
    id: 'brand_1',
    name: 'PulseFit Athletics',
    slug: 'pulsefit',
    industry: 'Fitness & Activewear',
    tagline: 'Engineering Human Movement & Precision Performance',
    description: 'A modern, science-backed athletic wear brand focused on minimalist technical gear for high-output athletes and fitness enthusiasts.',
    primaryColor: '#0F172A',
    accentColor: '#3B82F6',
    secondaryColor: '#F8FAFC',
    fontCategory: 'Modern Geometric Sans',
    activeDNAVersion: 'v1.4',
    referencesCount: 18,
    creativesCount: 42,
    scheduledPostsCount: 8,
    products: [
      { id: 'prod_1', name: 'AeroCore Seamless Leggings', category: 'Apparel', usp: '4-way targeted compression with moisture-wicking weave' },
      { id: 'prod_2', name: 'HydraVent Half-Zip', category: 'Outerwear', usp: 'Ultralight thermo-regulating technical fabric' },
      { id: 'prod_3', name: 'Apex Grip Lifting Strap', category: 'Accessories', usp: 'Silicone micro-embossed heavy duty support' },
    ],
    audience: {
      demographics: 'Ages 22–38, urban & suburban professionals, daily athletes',
      interests: ['Functional fitness', 'Endurance training', 'Clean nutrition', 'Minimalist aesthetics'],
      painPoints: 'Low-quality gym wear that wears out, overhyped fitness marketing, lack of breathable fabric in high-heat workouts',
    },
    voice: {
      tone: ['Empowering', 'Direct', 'Science-backed', 'Unpretentious'],
      targetReadingLevel: 'Grade 8-10 (Clean and punchy)',
      approvedWords: ['Precision', 'Kinetic', 'Relentless', 'Endurance', 'Focus', 'Built to perform'],
      prohibitedWords: ['Miracle', 'Secret hack', 'Skinny', 'Cheap', 'Guaranteed gains', 'Binge'],
    },
    restrictions: [
      'Never make unverified medical recovery claims.',
      'Always attribute athlete imagery to verified PulseFit team athletes.',
      'Maintain at least 15% clear margin space around the primary wordmark.',
    ],
    assets: [
      { id: 'ast_1', name: 'PulseFit Wordmark Vector', type: 'SVG', size: '24 KB', date: '2026-10-15' },
      { id: 'ast_2', name: 'AeroCore Studio Packshot', type: 'PNG (2000x2000)', size: '3.4 MB', date: '2026-10-20' },
      { id: 'ast_3', name: 'Lookbook High-Contrast Model', type: 'JPG (2400x3000)', size: '5.1 MB', date: '2026-10-28' },
    ]
  },
  {
    id: 'brand_2',
    name: 'Nordic Roast Co.',
    slug: 'nordic-roast',
    industry: 'Specialty Coffee & Lifestyle',
    tagline: 'Light-Roast Single Origins with Clean Traceability',
    description: 'Ethically sourced Scandinavian light roast coffee beans roasted in small batches with full origin transparency.',
    primaryColor: '#262626',
    accentColor: '#D97706',
    secondaryColor: '#F5F5F4',
    fontCategory: 'Neo-Grotesque Clean Sans',
    activeDNAVersion: 'v1.1',
    referencesCount: 12,
    creativesCount: 26,
    scheduledPostsCount: 4,
  },
  {
    id: 'brand_3',
    name: 'Aether Cloud Data',
    slug: 'aether-cloud',
    industry: 'B2B Software & Infrastructure',
    tagline: 'Instant Zero-Latency Data Federation for Engineers',
    description: 'Distributed database federation engine designed for high-throughput AI inference pipelines.',
    primaryColor: '#09090B',
    accentColor: '#6366F1',
    secondaryColor: '#FAFAFA',
    fontCategory: 'Monospace & Technical Sans',
    activeDNAVersion: 'v1.0',
    referencesCount: 9,
    creativesCount: 15,
    scheduledPostsCount: 2,
  }
];

export const mockVisualDNA = {
  brandId: 'brand_1',
  version: 'v1.4',
  updatedAt: '2026-11-04T10:30:00Z',
  archetype: 'High-Contrast Technical Minimalist',
  confidenceScore: 94,
  palette: [
    { hex: '#0F172A', name: 'Deep Graphite Charcoal', role: 'Dominant Background / High-Priority Text', rgb: '15, 23, 42' },
    { hex: '#F8FAFC', name: 'Matte Ghost White', role: 'Canvas Surface / Clean Contrast', rgb: '248, 250, 252' },
    { hex: '#3B82F6', name: 'Cobalt Performance Blue', role: 'Accent Highlights & Tactical CTAs', rgb: '59, 130, 246' },
    { hex: '#64748B', name: 'Slate Gray', role: 'Secondary Hierarchy & Subtle Gridlines', rgb: '100, 116, 139' },
    { hex: '#E2E8F0', name: 'Soft Matte Divider', role: 'Container Borders & Slide Framing', rgb: '226, 232, 240' },
  ],
  typography: {
    headingFontCategory: 'Geometric Sans Serif (Inter Display / Space Grotesk)',
    bodyFontCategory: 'Clean Sans Serif (Inter)',
    headingWeight: '700 (Bold)',
    bodyWeight: '400 (Regular)',
    headlineTransform: 'Title Case or Upper Bold Hook',
    lineHeightScale: '1.15 headline, 1.5 body',
  },
  layoutRules: {
    gridType: '12-column asymmetric or 2x2 split quadrant',
    slideMargins: '80px safe margins (on 1080x1080 canvas)',
    hookPlacement: 'Top-left or center-top on Slide 1',
    brandingPlacement: 'Subtle lower left footer or top right badge',
    ctaStyle: 'Matte pill or crisp rectangular button with high contrast text',
  },
  compositionMood: [
    'Generous negative space (minimum 40% breathing room)',
    'Strict monochrome hierarchy with 1 singular accent color pop',
    'Matte finish — no high-gloss or unnecessary gradient flare',
    'Data-driven badges (e.g., "[01/05]", "METRIC: 42%")',
  ],
  versionHistory: [
    { version: 'v1.4', date: '2026-11-04', notes: 'Refined mobile carousel contrast and added 8pt baseline rule.' },
    { version: 'v1.3', date: '2026-10-18', notes: 'Calibrated Cobalt accent against dark mode backgrounds.' },
    { version: 'v1.0', date: '2026-09-30', notes: 'Initial extraction from 12 brand reference creatives.' },
  ]
};

export const mockReferences = [
  {
    id: 'ref_1',
    title: 'High-Performance Carousel Slide 1 Hook',
    source: 'Instagram Feed Benchmark',
    uploadedAt: '2026-11-02',
    status: 'Processed',
    confidenceScore: 96,
    tags: ['Carousel', 'Hook Slide', 'Dark Theme', 'Metrics'],
    ocrText: 'STOP WASTING 40% OF YOUR SQUAT CAPACITY. The mechanical hinge flaw most lifters ignore.',
    extractedPalette: ['#0F172A', '#F8FAFC', '#3B82F6', '#64748B'],
    archetype: 'Hook + Big Stat Highlight',
  },
  {
    id: 'ref_2',
    title: 'Minimalist Product Grid Showcase',
    source: 'Brand Lookbook 2026',
    uploadedAt: '2026-11-04',
    status: 'Processed',
    confidenceScore: 92,
    tags: ['Product Showcase', 'Grid', 'Light Background'],
    ocrText: 'PRECISION SEAMS. ZERO FRICTION. BUILT FOR ULTRA-MARATHONS.',
    extractedPalette: ['#FFFFFF', '#0F172A', '#94A3B8', '#E2E8F0'],
    archetype: 'Minimalist Editorial',
  },
  {
    id: 'ref_3',
    title: 'LinkedIn Educational Carousel Framework',
    source: 'LinkedIn Industry Post',
    uploadedAt: '2026-11-05',
    status: 'Processed',
    confidenceScore: 89,
    tags: ['Educational', 'Multi-Slide', 'B2B/Pro'],
    ocrText: 'How modern textile engineering reduces metabolic heat trap during high-cadence work.',
    extractedPalette: ['#0B132B', '#1C2541', '#48CAE4', '#FFFFFF'],
    archetype: 'Step-by-Step Educational Breakdown',
  },
  {
    id: 'ref_4',
    title: 'Quote & Social Proof Card',
    source: 'Customer Story Asset',
    uploadedAt: '2026-11-06',
    status: 'Processing',
    confidenceScore: 78,
    tags: ['Social Proof', 'Quote', 'Minimal'],
    ocrText: 'Extracting text and structural components...',
    extractedPalette: ['#1E293B', '#F1F5F9', '#CBD5E1'],
    archetype: 'Direct Testimonial Focus',
  }
];

export const mockCreatives = [
  {
    id: 'crt_1',
    title: 'The 4-Step Pre-Run Mobility Routine',
    brandId: 'brand_1',
    platform: 'Instagram',
    format: '1080x1350 (Portrait Carousel)',
    type: 'carousel',
    slidesCount: 5,
    status: 'Scheduled',
    scheduledFor: '2026-11-10T15:00:00Z',
    caption: 'Most runners skip thoracic rotation before hitting pace. Here are 4 kinetic movements that unlock stride frequency without fatigue. Save this for your morning warmup.\n\n#RunningMechanics #PulseFit #EnduranceAthlete #MobilityTraining',
    archetype: 'Step-by-Step Educational',
    previewSlide: {
      headline: '4 KINETIC DRILLS TO UNLOCK STRIDE DEPTH',
      subhead: 'Fix your hip hinge before your first mile.',
      tag: 'TECHNIQUE 01',
      slideNumber: '1 / 5',
    },
    slides: [
      { id: 1, headline: '4 KINETIC DRILLS TO UNLOCK STRIDE DEPTH', subhead: 'Fix your hip hinge before your first mile.', badge: 'TECHNIQUE 01', type: 'hook' },
      { id: 2, headline: '01. 90/90 HIP EXTENSION', subhead: '30 seconds each side. Activates glute medius without loading patella.', badge: 'MOBILITY', type: 'content' },
      { id: 3, headline: '02. ANKLE DORSIFLEXION WALL DRIVE', subhead: 'Restores ankle range so your knees don’t cave on footstrike.', badge: 'ALIGNMENT', type: 'content' },
      { id: 4, headline: '03. THORACIC ROTATION PRAYER', subhead: 'Opens your ribcage for unrestricted oxygen intake during tempo pace.', badge: 'AEROBIC', type: 'content' },
      { id: 5, headline: 'READY TO RUN WITH ZERO COMPROMISE?', subhead: 'Gear up with the AeroCore Series. Built for athletes who demand precision.', badge: 'CTA', type: 'cta' },
    ]
  },
  {
    id: 'crt_2',
    title: 'Fabric Breakdown: Why Micro-Perforated Nylon Outperforms Spandex',
    brandId: 'brand_1',
    platform: 'LinkedIn',
    format: '1200x1200 (Square Carousel)',
    type: 'carousel',
    slidesCount: 4,
    status: 'Draft',
    scheduledFor: null,
    caption: 'Material science in activewear has shifted. Traditional spandex traps 3x more heat than micro-perforated warp knits.\n\nHere is how we engineered the new AeroCore yarn to maximize thermal dissipation.',
    archetype: 'Scientific Product Teardown',
    previewSlide: {
      headline: 'THE DEATH OF SYNTHETIC HEAT TRAPPING',
      subhead: 'How warp-knit nylon redefined athletic durability.',
      tag: 'TEXTILE SCIENCE',
      slideNumber: '1 / 4',
    },
    slides: [
      { id: 1, headline: 'THE DEATH OF SYNTHETIC HEAT TRAPPING', subhead: 'How warp-knit nylon redefined athletic durability.', badge: 'TEXTILE SCIENCE', type: 'hook' },
      { id: 2, headline: 'THE PROBLEM WITH STANDARD SPANDEX', subhead: 'Polyurethane fibers degrade after 40 wash cycles and hold moisture.', badge: 'PROBLEM', type: 'content' },
      { id: 3, headline: 'THE AEROCORE WARP WEAVE', subhead: 'Interlocking 40D nylon yarns allow constant cross-airflow while under tension.', badge: 'SOLUTION', type: 'content' },
      { id: 4, headline: 'EXPLORE THE LAB WHITE PAPER', subhead: 'Read the full thermodynamic report on pulsefitathletics.com', badge: 'TAKEAWAY', type: 'cta' },
    ]
  },
  {
    id: 'crt_3',
    title: 'Quote: Discipline Over Mood',
    brandId: 'brand_1',
    platform: 'Instagram',
    format: '1080x1080 (Square Post)',
    type: 'static',
    slidesCount: 1,
    status: 'Published',
    scheduledFor: '2026-11-07T12:00:00Z',
    caption: 'Motivation comes and goes. Consistency is purely a system.\n\n#PulseFit #Discipline #Endurance',
    archetype: 'High-Impact Typography',
    previewSlide: {
      headline: '“DISCIPLINE IS THE DECISION TO DO WHAT YOU HATE LIKE YOU LOVE IT.”',
      subhead: '— Training Camp Notes, Week 08',
      tag: 'MINDSET',
      slideNumber: '1 / 1',
    },
    slides: [
      { id: 1, headline: '“DISCIPLINE IS THE DECISION TO DO WHAT YOU HATE LIKE YOU LOVE IT.”', subhead: '— Training Camp Notes, Week 08', badge: 'MINDSET', type: 'static' },
    ]
  },
  {
    id: 'crt_4',
    title: 'Winter Training Layering Protocol',
    brandId: 'brand_1',
    platform: 'X (Twitter)',
    format: '1600x900 (Landscape)',
    type: 'static',
    slidesCount: 1,
    status: 'In Review',
    scheduledFor: '2026-11-12T17:00:00Z',
    caption: 'Running in freezing temperatures? Don’t wear heavy coats. Follow the 3-layer thermodynamic rule.\n\n1. Hydrophobic base\n2. Micro-grid insulator\n3. Windproof shell',
    archetype: 'Informational Graphic',
    previewSlide: {
      headline: 'SUB-ZERO RUNNING: THE 3-LAYER RULE',
      subhead: 'Never sweat out your insulation on cold miles.',
      tag: 'WINTER GEAR',
      slideNumber: '1 / 1',
    },
    slides: [
      { id: 1, headline: 'SUB-ZERO RUNNING: THE 3-LAYER RULE', subhead: 'Never sweat out your insulation on cold miles.', badge: 'WINTER GEAR', type: 'static' },
    ]
  }
];

export const mockCalendarEvents = [
  { id: 'cal_1', title: '4-Step Pre-Run Mobility Routine', date: '2026-11-10', time: '15:00', platform: 'Instagram', status: 'Scheduled', format: 'Carousel (5 slides)' },
  { id: 'cal_2', title: 'Winter Layering Protocol', date: '2026-11-12', time: '17:00', platform: 'X', status: 'In Review', format: 'Static Post' },
  { id: 'cal_3', title: 'AeroCore Fabric Deep Dive', date: '2026-11-14', time: '10:30', platform: 'LinkedIn', status: 'Draft', format: 'Carousel (4 slides)' },
  { id: 'cal_4', title: 'Weekly Athlete Spotlight: Sarah Chen', date: '2026-11-17', time: '16:00', platform: 'Instagram', status: 'Scheduled', format: 'Carousel (6 slides)' },
  { id: 'cal_5', title: 'Hydration Science Behind Cold Workouts', date: '2026-11-19', time: '14:00', platform: 'X', status: 'Scheduled', format: 'Static Post' },
];

export const mockSocialAccounts = [
  {
    id: 'soc_1',
    platform: 'Instagram Business',
    accountName: '@pulsefit.athletics',
    status: 'Connected',
    tokenExpiresIn: '58 days',
    health: 'Optimal',
    permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
    followers: '48.2K',
    avatar: '📸',
  },
  {
    id: 'soc_2',
    platform: 'LinkedIn Company',
    accountName: 'PulseFit Performance Tech',
    status: 'Connected',
    tokenExpiresIn: '84 days',
    health: 'Optimal',
    permissions: ['w_member_social', 'r_organization_social', 'rw_organization_admin'],
    followers: '14.5K',
    avatar: '💼',
  },
  {
    id: 'soc_3',
    platform: 'X (Twitter) v2',
    accountName: '@PulseFitGear',
    status: 'Connected',
    tokenExpiresIn: '120 days',
    health: 'Optimal',
    permissions: ['tweet.read', 'tweet.write', 'users.read'],
    followers: '9.8K',
    avatar: '🐦',
  },
  {
    id: 'soc_4',
    platform: 'Facebook Page',
    accountName: 'PulseFit Official',
    status: 'Requires Reauth',
    tokenExpiresIn: 'Expired',
    health: 'Action Needed',
    permissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    followers: '22.1K',
    avatar: '📘',
  }
];

export const mockPublishingQueue = [
  {
    id: 'pub_1',
    postTitle: 'The 4-Step Pre-Run Mobility Routine',
    platform: 'Instagram',
    scheduledTime: 'Nov 10, 2026 · 15:00 UTC',
    status: 'Queued',
    approvalStatus: 'Approved by Lead',
    targetAccount: '@pulsefit.athletics',
    retryCount: 0,
  },
  {
    id: 'pub_2',
    postTitle: 'Winter Training Layering Protocol',
    platform: 'X (Twitter)',
    scheduledTime: 'Nov 12, 2026 · 17:00 UTC',
    status: 'Queued',
    approvalStatus: 'Pending Review',
    targetAccount: '@PulseFitGear',
    retryCount: 0,
  },
  {
    id: 'pub_3',
    postTitle: 'Fabric Breakdown: Warp Knit vs Spandex',
    platform: 'LinkedIn',
    scheduledTime: 'Nov 14, 2026 · 10:30 UTC',
    status: 'Draft / On Hold',
    approvalStatus: 'Needs Content Signoff',
    targetAccount: 'PulseFit Performance Tech',
    retryCount: 0,
  },
  {
    id: 'pub_4',
    postTitle: 'Quote: Discipline Over Mood',
    platform: 'Instagram',
    scheduledTime: 'Nov 07, 2026 · 12:00 UTC',
    status: 'Published',
    approvalStatus: 'Completed',
    targetAccount: '@pulsefit.athletics',
    retryCount: 0,
  }
];

export const mockAIProviders = [
  {
    id: 'prov_anthropic',
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    capabilities: ['Deep OCR & Visual Analysis', 'Design Blueprint Reasoning', 'Long Context'],
    status: 'Connected',
    apiKeyMasked: 'sk-ant-api03-••••••••••••••••••••94b',
    latencyAvg: '1,240 ms',
    role: 'Primary for Visual Analysis & Blueprint Synthesis',
    monthlyTokens: '1,420,000 / 5,000,000',
    monthlyCost: '$18.40',
  },
  {
    id: 'prov_openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini'],
    capabilities: ['Copywriting & Captions', 'JSON Schema Validation', 'Multimodal Vision'],
    status: 'Connected',
    apiKeyMasked: 'sk-proj-••••••••••••••••••••x78',
    latencyAvg: '980 ms',
    role: 'Primary for Copywriting & Captions',
    monthlyTokens: '950,000 / 5,000,000',
    monthlyCost: '$12.20',
  },
  {
    id: 'prov_gemini',
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    capabilities: ['High-Speed Inference', 'Large Multimodal Context', 'Fallback Redundancy'],
    status: 'Connected',
    apiKeyMasked: 'AIzaSy••••••••••••••••••••4kM',
    latencyAvg: '820 ms',
    role: 'Primary Fallback for All Pipelines',
    monthlyTokens: '420,000 / 3,000,000',
    monthlyCost: '$4.10',
  },
  {
    id: 'prov_deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    capabilities: ['Cost-Efficient Reasoning', 'Drafting Ideas'],
    status: 'Available (Key Required)',
    apiKeyMasked: 'Not configured',
    latencyAvg: '—',
    role: 'Secondary Backup Provider',
    monthlyTokens: '0',
    monthlyCost: '$0.00',
  }
];

export const mockAnalytics = {
  dateRange: 'Oct 11 – Nov 09, 2026',
  kpis: [
    { title: 'Total Impressions', value: '148,290', change: '+18.4%', trend: 'up' },
    { title: 'Average Engagement Rate', value: '4.92%', change: '+0.8%', trend: 'up' },
    { title: 'Profile / Link Clicks', value: '4,180', change: '+12.6%', trend: 'up' },
    { title: 'Creatives Published', value: '28', change: '+4 posts', trend: 'up' },
  ],
  topPosts: [
    { title: 'Discipline Over Mood Quote Card', platform: 'Instagram', impressions: '42,800', engagements: '3,120', rate: '7.3%', saves: '1,420' },
    { title: '4-Step Ankle Mobility for Runners', platform: 'Instagram', impressions: '38,500', engagements: '2,890', rate: '7.5%', saves: '2,110' },
    { title: 'Synthetic Fabrics vs Natural Warp Knit', platform: 'LinkedIn', impressions: '24,200', engagements: '1,440', rate: '5.9%', saves: '580' },
    { title: 'Sub-Zero Running Protocol', platform: 'X', impressions: '19,400', engagements: '890', rate: '4.6%', saves: '310' },
  ],
  chartData: [
    { day: 'Mon', impressions: 14200, engagements: 820 },
    { day: 'Tue', impressions: 18900, engagements: 1140 },
    { day: 'Wed', impressions: 22400, engagements: 1390 },
    { day: 'Thu', impressions: 19800, engagements: 1020 },
    { day: 'Fri', impressions: 28500, engagements: 1840 },
    { day: 'Sat', impressions: 24100, engagements: 1490 },
    { day: 'Sun', impressions: 20390, engagements: 1220 },
  ]
};

