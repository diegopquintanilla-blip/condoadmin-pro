-- CondoAdmin Pro - online payments foundation (SANDBOX ONLY)
-- REVIEW BEFORE APPLYING. This migration does not alter existing recibos or pagos.
-- No production credentials or real charges. All new tables are private to backend.
create table if not exists public.payment_merchants (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null unique references public.condominios(id) on delete restrict,
 provider text not null default 'culqi' check (provider = 'culqi'),
 environment text not null default 'sandbox' check (environment = 'sandbox'),
 merchant_reference text,
 enabled boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id,condominio_id)
);
-- Never put secret keys in this table. Store credentials in a server-side vault only.
create table if not exists public.payment_orders (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null,
 merchant_id uuid not null,
 recibo_id uuid not null,
 created_by uuid references auth.users(id),
 amount_minor bigint not null check (amount_minor between 1 and 999999999),
 currency text not null default 'PEN' check (currency='PEN'),
 status text not null default 'created' check (status in ('created','pending','confirmed','failed','cancelled','expired','refunded')),
 idempotency_key text not null,
 external_reference text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint payment_orders_merchant_tenant_fk foreign key (merchant_id,condominio_id) references public.payment_merchants(id,condominio_id),
 constraint payment_orders_recibo_tenant_fk foreign key (condominio_id,recibo_id) references public.recibos(condominio_id,id),
 unique (condominio_id,idempotency_key),
 unique (id,condominio_id)
);
create unique index if not exists payment_orders_external_reference_unique on public.payment_orders(merchant_id,external_reference) where external_reference is not null;
create index if not exists payment_orders_recibo_status_idx on public.payment_orders(condominio_id,recibo_id,status);
create table if not exists public.payment_transactions (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null,
 order_id uuid not null,
 merchant_id uuid not null,
 provider_transaction_id text,
 amount_minor bigint not null check (amount_minor>0),
 currency text not null default 'PEN' check(currency='PEN'),
 status text not null check(status in ('pending','confirmed','failed','refunded')),
 created_at timestamptz not null default now(),
 constraint payment_transactions_order_fk foreign key (order_id,condominio_id) references public.payment_orders(id,condominio_id),
 constraint payment_transactions_merchant_fk foreign key (merchant_id,condominio_id) references public.payment_merchants(id,condominio_id)
);
create unique index if not exists payment_transactions_provider_id_unique on public.payment_transactions(merchant_id,provider_transaction_id) where provider_transaction_id is not null;
create unique index if not exists payment_transactions_order_confirmed_unique on public.payment_transactions(order_id) where status='confirmed';
create table if not exists public.payment_webhook_events (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null,
 merchant_id uuid not null,
 event_id text not null,
 event_type text not null,
 payload_hash text not null,
 verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','rejected')),
 processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
 received_at timestamptz not null default now(),
 constraint payment_webhook_merchant_fk foreign key (merchant_id,condominio_id) references public.payment_merchants(id,condominio_id),
 unique (merchant_id,event_id)
);
-- RLS deny by default; no browser access until vetted policies and service API exist.
alter table public.payment_merchants enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_webhook_events enable row level security;
revoke all on public.payment_merchants,public.payment_orders,public.payment_transactions,public.payment_webhook_events from anon,authenticated;
-- Service-side components must authenticate users, enforce tenant authorization and verify payments.
-- Never update existing public.pagos/public.recibos from a browser callback.
