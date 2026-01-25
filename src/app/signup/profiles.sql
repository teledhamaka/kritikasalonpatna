create table public.profiles (
  id uuid not null,
  full_name text not null,
  first_name text null,
  last_name text null,
  email text not null,
  phone text null,
  birthday date null,
  age integer null,
  anniversary_date date null,
  marital_status text null default 'single'::text,
  skin_type text null,
  hair_type text null,
  profile_image_url text null,
  loyalty_points integer null default 0,
  total_bookings integer null default 0,
  total_spent numeric(10, 2) null default 0.00,
  theme_style text null default 'pink'::text,
  enable_period_tracker boolean null default false,
  notification_preferences jsonb null default '{"sms": false, "push": true, "email": true}'::jsonb,
  login_count integer null default 0,
  last_login_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  is_premium boolean null default false,
  wallet_balance numeric(10, 2) null default 0.00,
  total_referrals integer null default 0,
  signup_method text null default 'email'::text,
  membership_tier text null default 'bronze'::text,
  password_hash text null,
  google_id text null,
  password_reset_otp text null,
  password_reset_otp_expiry timestamp with time zone null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_google_id_key unique (google_id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_login_count_check check ((login_count >= 0)),
  constraint profiles_loyalty_points_check check ((loyalty_points >= 0)),
  constraint profiles_marital_status_check check (
    (
      marital_status = any (
        array[
          'single'::text,
          'married'::text,
          'engaged'::text,
          'other'::text
        ]
      )
    )
  ),
  constraint profiles_membership_tier_check check (
    (
      membership_tier = any (
        array[
          'bronze'::text,
          'silver'::text,
          'gold'::text,
          'diamond'::text
        ]
      )
    )
  ),
  constraint profiles_signup_method_check check (
    (
      signup_method = any (
        array[
          'email'::text,
          'mobile'::text,
          'google'::text,
          'facebook'::text
        ]
      )
    )
  ),
  constraint profiles_skin_type_check check (
    (
      skin_type = any (
        array[
          'dry'::text,
          'oily'::text,
          'combination'::text,
          'normal'::text,
          'sensitive'::text
        ]
      )
    )
  ),
  constraint profiles_theme_style_check check (
    (
      theme_style = any (
        array[
          'pink'::text,
          'purple'::text,
          'blue'::text,
          'green'::text,
          'gold'::text
        ]
      )
    )
  ),
  constraint profiles_total_bookings_check check ((total_bookings >= 0)),
  constraint profiles_total_referrals_check check ((total_referrals >= 0)),
  constraint profiles_total_spent_check check ((total_spent >= (0)::numeric)),
  constraint profiles_age_check check (
    (
      (age >= 0)
      and (age <= 150)
    )
  ),
  constraint profiles_wallet_balance_check check ((wallet_balance >= (0)::numeric)),
  constraint profiles_email_check check ((email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)),
  constraint profiles_full_name_check check (
    (
      length(
        TRIM(
          both
          from
            full_name
        )
      ) > 0
    )
  ),
  constraint profiles_hair_type_check check (
    (
      hair_type = any (
        array[
          'straight'::text,
          'wavy'::text,
          'curly'::text,
          'coily'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default;

create index IF not exists idx_profiles_loyalty_points on public.profiles using btree (loyalty_points desc) TABLESPACE pg_default;

create index IF not exists idx_profiles_created_at on public.profiles using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_profiles_password_reset_otp on public.profiles using btree (password_reset_otp) TABLESPACE pg_default
where
  (password_reset_otp is not null);

create index IF not exists idx_profiles_google_id on public.profiles using btree (google_id) TABLESPACE pg_default;

create index IF not exists idx_profiles_membership_tier on public.profiles using btree (membership_tier) TABLESPACE pg_default;

create index IF not exists idx_profiles_is_premium on public.profiles using btree (is_premium) TABLESPACE pg_default;

create index IF not exists idx_profiles_signup_method on public.profiles using btree (signup_method) TABLESPACE pg_default;

create trigger trigger_profiles_age_calculation BEFORE INSERT
or
update OF birthday on profiles for EACH row
execute FUNCTION handle_age_calculation ();

create trigger trigger_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION handle_updated_at ();