-- XYZ starter schema for PostgreSQL / Supabase.
-- Review and apply through Alembic or Supabase migrations.
-- Supabase Auth users are referenced by auth.users(id).
-- Enable pgcrypto and pgvector in the Supabase project first.

create extension if not exists pgcrypto;
create extension if not exists vector;

create type public.workspace_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'retry_wait');
create type public.content_status as enum ('draft', 'in_review', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'archived');
create type public.social_account_status as enum ('connected', 'reauth_required', 'permission_error', 'disabled');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  industry text,
  website_url text,
  logo_asset_id uuid,
  default_language text not null default 'en',
  brand_profile jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brand_knowledge (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  category text not null,
  title text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Use the embedding dimension of the selected embedding model consistently.
-- 768 is an example dimension; change before migration if the chosen model differs.
create table public.brand_knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  knowledge_id uuid not null references public.brand_knowledge(id) on delete cascade,
  chunk_text text not null,
  embedding vector(768),
  embedding_model text not null,
  created_at timestamptz not null default now(),
  unique(knowledge_id)
);

create table public.reference_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  storage_path text not null,
  original_filename text,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  width integer,
  height integer,
  source_url text,
  permission_notes text,
  processing_status public.job_status not null default 'queued',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.reference_analysis (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  reference_id uuid not null references public.reference_assets(id) on delete cascade,
  vision_provider text,
  vision_model text,
  ocr_text text,
  ocr_blocks jsonb not null default '[]'::jsonb,
  palette_json jsonb not null default '{}'::jsonb,
  layout_json jsonb not null default '{}'::jsonb,
  analysis_json jsonb not null default '{}'::jsonb,
  status public.job_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.visual_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  version integer not null default 1,
  palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  layout_rules jsonb not null default '{}'::jsonb,
  visual_dna_json jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(brand_id, version)
);

create table public.design_archetypes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  description text,
  archetype_type text not null,
  blueprint_template jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.content_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text not null,
  objective text,
  platform text,
  content_type text not null default 'static_post',
  language text,
  brief jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.content_projects(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text,
  caption text,
  description text,
  hashtags text[] not null default '{}',
  blueprint_json jsonb not null default '{}'::jsonb,
  content_status public.content_status not null default 'draft',
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_slides (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.generated_posts(id) on delete cascade,
  slide_number integer not null check (slide_number > 0),
  blueprint_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, slide_number)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid references public.generated_posts(id) on delete cascade,
  slide_id uuid references public.post_slides(id) on delete cascade,
  storage_path text not null,
  asset_type text not null,
  mime_type text not null,
  width integer,
  height integer,
  file_size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (post_id is not null or slide_id is not null)
);

alter table public.brands
  add constraint brands_logo_asset_fk
  foreign key (logo_asset_id) references public.media_assets(id) on delete set null;

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.generated_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating smallint check (rating between 1 and 5),
  feedback text,
  feedback_type text,
  created_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null,
  platform_user_id text not null,
  account_name text,
  account_type text,
  status public.social_account_status not null default 'connected',
  granted_scopes text[] not null default '{}',
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, platform, platform_user_id)
);

create table public.social_tokens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  encryption_key_version text not null,
  updated_at timestamptz not null default now(),
  unique(social_account_id)
);

create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.generated_posts(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  scheduled_at timestamptz not null,
  timezone text not null,
  status public.content_status not null default 'scheduled',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  calendar_id uuid not null references public.content_calendar(id) on delete cascade,
  status public.job_status not null default 'queued',
  idempotency_key text not null unique,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 4 check (max_attempts > 0),
  next_attempt_at timestamptz,
  locked_until timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.published_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.generated_posts(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform_post_id text,
  platform_permalink text,
  published_at timestamptz,
  platform_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.post_analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  published_post_id uuid not null references public.published_posts(id) on delete cascade,
  metric_name text not null,
  metric_value numeric,
  recorded_at timestamptz not null default now(),
  source_metadata jsonb not null default '{}'::jsonb
);

create table public.ai_provider_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  display_name text,
  encrypted_api_key text,
  encryption_key_version text,
  is_enabled boolean not null default true,
  credential_status text not null default 'unknown',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, provider, display_name)
);

create table public.ai_model_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider_config_id uuid not null references public.ai_provider_configs(id) on delete cascade,
  model_name text not null,
  capabilities text[] not null default '{}',
  task_type text not null,
  priority integer not null default 100,
  is_enabled boolean not null default true,
  max_cost_per_task numeric,
  created_at timestamptz not null default now()
);

create table public.ai_model_usage (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid,
  provider text not null,
  model_name text not null,
  task_type text not null,
  input_tokens bigint,
  output_tokens bigint,
  estimated_cost numeric,
  latency_ms integer,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.ai_job_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null,
  attempt_number integer not null,
  provider text,
  model_name text,
  status text not null,
  error_code text,
  error_message_redacted text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_workspace_members_user on public.workspace_members(user_id);
create index idx_brands_workspace on public.brands(workspace_id);
create index idx_brand_knowledge_brand on public.brand_knowledge(brand_id);
create index idx_reference_assets_brand on public.reference_assets(brand_id, created_at desc);
create index idx_content_projects_brand on public.content_projects(brand_id, created_at desc);
create index idx_generated_posts_brand on public.generated_posts(brand_id, created_at desc);
create index idx_generated_posts_status on public.generated_posts(workspace_id, content_status);
create index idx_calendar_due on public.content_calendar(status, scheduled_at);
create index idx_publishing_jobs_due on public.publishing_jobs(status, next_attempt_at);
create index idx_ai_usage_workspace_date on public.ai_model_usage(workspace_id, created_at desc);
create index idx_audit_logs_workspace_date on public.audit_logs(workspace_id, created_at desc);

create trigger set_workspaces_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();
create trigger set_brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();
create trigger set_brand_knowledge_updated_at before update on public.brand_knowledge
for each row execute function public.set_updated_at();
create trigger set_content_projects_updated_at before update on public.content_projects
for each row execute function public.set_updated_at();
create trigger set_generated_posts_updated_at before update on public.generated_posts
for each row execute function public.set_updated_at();

-- SECURITY NOTE:
-- The following RLS policies are a starter baseline, not a complete authorization system.
-- Backend must still enforce roles and workspace membership.
-- Never trust a client-supplied workspace_id without verifying membership.
-- Create policies for every tenant-owned table and test them with multiple users.
-- Avoid exposing social_tokens and encrypted provider credentials to browser roles.
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brands enable row level security;
alter table public.brand_knowledge enable row level security;
alter table public.reference_assets enable row level security;
alter table public.reference_analysis enable row level security;
alter table public.visual_profiles enable row level security;
alter table public.design_archetypes enable row level security;
alter table public.content_projects enable row level security;
alter table public.generated_posts enable row level security;
alter table public.post_slides enable row level security;
alter table public.media_assets enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_tokens enable row level security;
alter table public.content_calendar enable row level security;
alter table public.publishing_jobs enable row level security;
alter table public.published_posts enable row level security;
alter table public.post_analytics enable row level security;
alter table public.ai_provider_configs enable row level security;
alter table public.ai_model_configs enable row level security;
alter table public.ai_model_usage enable row level security;
alter table public.ai_job_logs enable row level security;
alter table public.audit_logs enable row level security;

-- Example membership helper for RLS policies.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
  );
$$;

-- Example read policies. Add role-specific write policies and test thoroughly.
create policy "members can read workspaces"
on public.workspaces for select
using (public.is_workspace_member(id) or owner_id = auth.uid());

create policy "members can read workspace members"
on public.workspace_members for select
using (public.is_workspace_member(workspace_id));

create policy "members can read brands"
on public.brands for select
using (public.is_workspace_member(workspace_id));

create policy "members can read brand knowledge"
on public.brand_knowledge for select
using (public.is_workspace_member(workspace_id));

create policy "members can read references"
on public.reference_assets for select
using (public.is_workspace_member(workspace_id));

create policy "members can read generated posts"
on public.generated_posts for select
using (public.is_workspace_member(workspace_id));

create policy "members can read social accounts"
on public.social_accounts for select
using (public.is_workspace_member(workspace_id));

-- Intentionally no browser policies for social_tokens or encrypted provider secrets.
-- Access those only through trusted backend/service-role code.
