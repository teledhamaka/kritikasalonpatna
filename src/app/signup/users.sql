create table public.users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  password_hash text null,
  auth_provider text not null default 'email'::text,
  provider_id text null,
  email_verified boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;