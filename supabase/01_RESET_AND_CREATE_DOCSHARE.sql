-- ================================================================
-- DOCSHARE PRO V50 - FULL RESET + CREATE
-- Chạy trong Supabase > SQL Editor > New query.
-- CẢNH BÁO: Xóa và tạo lại toàn bộ bảng DocShare trong schema public.
-- KHÔNG xóa tài khoản trong auth.users.
-- Chỉ seed danh mục và quà hệ thống, không tạo user/tài liệu/bài viết giả.
-- ================================================================

reset role;

begin;

create extension if not exists pgcrypto;

-- 0. Dọn cấu trúc DocShare cũ

drop view if exists public.document_stats cascade;
drop view if exists public.post_stats cascade;

drop table if exists public.admin_logs cascade;
drop table if exists public.direct_messages cascade;
drop table if exists public.support_tickets cascade;
drop table if exists public.reports cascade;
drop table if exists public.notifications cascade;
drop table if exists public.activity_history cascade;
drop table if exists public.premium_subscriptions cascade;
drop table if exists public.payment_requests cascade;
drop table if exists public.bank_accounts cascade;
drop table if exists public.credit_transactions cascade;
drop table if exists public.gift_transactions cascade;
drop table if exists public.gifts cascade;
drop table if exists public.post_comment_reactions cascade;
drop table if exists public.post_comments cascade;
drop table if exists public.post_bookmarks cascade;
drop table if exists public.post_likes cascade;
drop table if exists public.posts cascade;
drop table if exists public.follows cascade;
drop table if exists public.document_purchases cascade;
drop table if exists public.document_ratings cascade;
drop table if exists public.document_comment_reactions cascade;
drop table if exists public.document_comments cascade;
drop table if exists public.document_bookmarks cascade;
drop table if exists public.document_likes cascade;
drop table if exists public.document_views cascade;
drop table if exists public.document_files cascade;
drop table if exists public.documents cascade;
drop table if exists public.categories cascade;
drop table if exists public.wallets cascade;
drop table if exists public.profiles cascade;

drop sequence if exists public.user_public_id_seq cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.can_access_document(uuid) cascade;
drop function if exists public.can_access_document_path(text) cascade;
drop function if exists public.record_document_view(uuid) cascade;
drop function if exists public.purchase_document(uuid) cascade;
drop function if exists public.send_gift(uuid, uuid, text, uuid) cascade;
drop function if exists public.admin_process_payment_request(uuid, text, text) cascade;
drop function if exists public.admin_update_user(uuid, text, text) cascade;
drop function if exists public.log_document_activity() cascade;

-- 1. Hàm dùng chung

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create sequence public.user_public_id_seq start 100000;

-- 2. Hồ sơ và ví

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_id text not null unique default ('DS-' || lpad(nextval('public.user_public_id_seq')::text, 8, '0')),
  email text unique,
  full_name text not null default '',
  username text not null unique,
  phone text,
  school_name text,
  faculty text,
  major text,
  bio text not null default '',
  avatar_path text,
  cover_path text,
  role text not null default 'user' check (role in ('user', 'teacher', 'admin')),
  verified boolean not null default false,
  premium boolean not null default false,
  premium_expires_at timestamptz,
  level integer not null default 1 check (level >= 1),
  status text not null default 'active' check (status in ('active', 'locked', 'banned')),
  locked_until timestamptz,
  lock_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  cash_balance numeric(14,2) not null default 0 check (cash_balance >= 0),
  updated_at timestamptz not null default now()
);

create trigger wallets_set_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_full_name text;
  v_username text;
begin
  v_full_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Người dùng DocShare');
  v_username := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'user_' || substr(new.id::text, 1, 8));

  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (
    id, email, full_name, username, phone, school_name, faculty, major
  ) values (
    new.id,
    new.email,
    v_full_name,
    v_username,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'school_name', ''),
    nullif(new.raw_user_meta_data ->> 'faculty', ''),
    nullif(new.raw_user_meta_data ->> 'major', '')
  ) on conflict (id) do nothing;

  insert into public.wallets(user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Bổ sung profile/ví cho tài khoản đã có trước khi chạy SQL.
insert into public.profiles (id, email, full_name, username)
select
  u.id,
  u.email,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1), 'Người dùng DocShare'),
  'user_' || substr(u.id::text, 1, 8)
from auth.users u
on conflict (id) do nothing;

insert into public.wallets(user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- 3. Danh mục hệ thống

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon_key text not null default 'leaf',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.categories(name, slug, description, icon_key, sort_order) values
('Công nghệ thông tin', 'cong-nghe-thong-tin', 'Tài liệu nền tảng và chuyên ngành công nghệ thông tin.', 'technology', 10),
('Lập trình', 'lap-trinh', 'Ngôn ngữ lập trình, thuật toán và phát triển phần mềm.', 'code', 20),
('Phát triển Web', 'phat-trien-web', 'Frontend, backend, UI/UX và công nghệ web.', 'web', 30),
('Cơ sở dữ liệu', 'co-so-du-lieu', 'SQL, PostgreSQL, Supabase và thiết kế dữ liệu.', 'database', 40),
('Trí tuệ nhân tạo', 'tri-tue-nhan-tao', 'AI, máy học, học sâu và khoa học dữ liệu.', 'ai', 50),
('An toàn thông tin', 'an-toan-thong-tin', 'Bảo mật hệ thống, mạng và dữ liệu.', 'security', 60),
('Toán học', 'toan-hoc', 'Giải tích, đại số, xác suất và toán ứng dụng.', 'math', 70),
('Vật lý', 'vat-ly', 'Cơ học, điện từ, quang học và vật lý hiện đại.', 'physics', 80),
('Hóa học', 'hoa-hoc', 'Hóa đại cương, hữu cơ, vô cơ và thí nghiệm.', 'chemistry', 90),
('Sinh học', 'sinh-hoc', 'Sinh học cơ bản, phân tử, di truyền và sinh thái.', 'biology', 100),
('Kinh tế', 'kinh-te', 'Kinh tế vi mô, vĩ mô và kinh tế ứng dụng.', 'economics', 110),
('Quản trị kinh doanh', 'quan-tri-kinh-doanh', 'Quản trị, marketing, nhân sự và chiến lược.', 'business', 120),
('Kế toán - Kiểm toán', 'ke-toan-kiem-toan', 'Nguyên lý kế toán, kiểm toán và báo cáo tài chính.', 'accounting', 130),
('Tài chính - Ngân hàng', 'tai-chinh-ngan-hang', 'Tài chính doanh nghiệp, đầu tư và ngân hàng.', 'finance', 140),
('Ngoại ngữ', 'ngoai-ngu', 'Tiếng Anh, Nhật, Hàn, Trung và ngôn ngữ khác.', 'language', 150),
('Luật', 'luat', 'Luật dân sự, hình sự, kinh tế và hành chính.', 'law', 160),
('Y - Dược', 'y-duoc', 'Y học, dược học, điều dưỡng và sức khỏe.', 'medicine', 170),
('Điện - Điện tử', 'dien-dien-tu', 'Mạch điện, điện tử, tự động hóa và viễn thông.', 'electricity', 180),
('Cơ khí', 'co-khi', 'Thiết kế máy, chế tạo và kỹ thuật cơ khí.', 'mechanics', 190),
('Xây dựng - Kiến trúc', 'xay-dung-kien-truc', 'Kết cấu, công trình, kiến trúc và quy hoạch.', 'construction', 200),
('Giáo dục', 'giao-duc', 'Phương pháp giảng dạy, sư phạm và quản lý giáo dục.', 'education', 210),
('Kỹ năng mềm', 'ky-nang-mem', 'Giao tiếp, thuyết trình, quản lý thời gian và nghề nghiệp.', 'softskills', 220);

-- 4. Tài liệu

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null default '',
  subject text,
  school_name text,
  faculty text,
  major text,
  isbn text,
  academic_year integer,
  tags text[] not null default '{}',
  language text not null default 'vi',
  price_credit integer not null default 0 check (price_credit >= 0),
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected', 'deleted')),
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_author_idx on public.documents(author_id);
create index documents_category_idx on public.documents(category_id);
create index documents_status_idx on public.documents(status);
create index documents_created_idx on public.documents(created_at desc);
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();

create table public.document_files (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  file_kind text not null check (file_kind in ('cover', 'demo', 'full', 'attachment')),
  storage_bucket text not null,
  storage_path text not null unique,
  original_name text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);
create index document_files_document_idx on public.document_files(document_id);

create table public.document_views (
  id bigint generated by default as identity primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
create index document_views_document_idx on public.document_views(document_id);
create index document_views_user_idx on public.document_views(user_id, viewed_at desc);

create table public.document_likes (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(document_id, user_id)
);

create table public.document_bookmarks (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(document_id, user_id)
);

create table public.document_comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.document_comments(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index document_comments_document_idx on public.document_comments(document_id, created_at);
create trigger document_comments_set_updated_at before update on public.document_comments for each row execute function public.set_updated_at();

create table public.document_comment_reactions (
  comment_id uuid not null references public.document_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'heart',
  created_at timestamptz not null default now(),
  primary key(comment_id, user_id)
);

create table public.document_ratings (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(document_id, user_id)
);
create trigger document_ratings_set_updated_at before update on public.document_ratings for each row execute function public.set_updated_at();

create table public.document_purchases (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  price_credit integer not null check (price_credit >= 0),
  created_at timestamptz not null default now(),
  unique(document_id, buyer_id)
);

-- 5. Bảng tin

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null check (char_length(trim(content)) > 0),
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'private')),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_author_idx on public.posts(author_id);
create index posts_created_idx on public.posts(created_at desc);
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id)
);

create table public.post_bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id)
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.post_comments(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger post_comments_set_updated_at before update on public.post_comments for each row execute function public.set_updated_at();

create table public.post_comment_reactions (
  comment_id uuid not null references public.post_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'heart',
  created_at timestamptz not null default now(),
  primary key(comment_id, user_id)
);

-- 6. Quà, ví, thanh toán và Premium

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default '🎁',
  credit_price integer not null check (credit_price > 0),
  creator_share_percent smallint not null default 30 check (creator_share_percent between 0 and 100),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.gifts(name, icon, credit_price, creator_share_percent, sort_order) values
('Cảm ơn', '☕', 5, 30, 10),
('Hoa xanh', '🪴', 10, 30, 20),
('Tri thức', '📚', 20, 35, 30),
('Ngôi sao', '⭐', 50, 35, 40),
('Vinh danh', '🏆', 100, 40, 50),
('Truyền cảm hứng', '💡', 200, 40, 60),
('Vòng nguyệt quế', '🌿', 500, 45, 70),
('Cây tri thức', '🌳', 1000, 50, 80);

create table public.gift_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete restrict,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('document', 'post', 'profile')),
  target_id uuid,
  cost_credit integer not null check (cost_credit > 0),
  receiver_credit integer not null check (receiver_credit >= 0),
  created_at timestamptz not null default now()
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_idx on public.credit_transactions(user_id, created_at desc);

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bank_code text not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('topup', 'withdraw', 'premium')),
  amount_vnd numeric(14,2) not null default 0 check (amount_vnd >= 0),
  credit_amount integer not null default 0 check (credit_amount >= 0),
  plan_code text,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  transfer_note text not null,
  proof_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  admin_note text,
  processed_by uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.premium_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  payment_request_id uuid references public.payment_requests(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. Lịch sử, thông báo, hỗ trợ, tin nhắn, admin

create table public.activity_history (
  id bigint generated by default as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  target_type text not null,
  target_id uuid,
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_history_user_idx on public.activity_history(user_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'system',
  title text not null,
  content text not null,
  target_url text,
  is_read boolean not null default false,
  important boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  detail text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  content text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger support_tickets_set_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);
create index direct_messages_pair_idx on public.direct_messages(sender_id, receiver_id, created_at);

create table public.admin_logs (
  id bigint generated by default as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  detail text,
  created_at timestamptz not null default now()
);

-- 8. View thống kê

create view public.document_stats
with (security_invoker = true)
as
select
  d.id as document_id,
  (select count(*) from public.document_views v where v.document_id = d.id)::bigint as view_count,
  (select count(*) from public.document_likes l where l.document_id = d.id)::bigint as like_count,
  (select count(*) from public.document_comments c where c.document_id = d.id and c.status = 'visible')::bigint as comment_count,
  (select count(*) from public.document_purchases p where p.document_id = d.id)::bigint as purchase_count,
  (select round(avg(r.rating)::numeric, 2) from public.document_ratings r where r.document_id = d.id) as average_rating,
  (select count(*) from public.document_ratings r where r.document_id = d.id)::bigint as rating_count
from public.documents d;

create view public.post_stats
with (security_invoker = true)
as
select
  p.id as post_id,
  (select count(*) from public.post_likes l where l.post_id = p.id)::bigint as like_count,
  (select count(*) from public.post_comments c where c.post_id = p.id and c.status = 'visible')::bigint as comment_count
from public.posts p;

-- 9. Hàm nghiệp vụ an toàn

create or replace function public.can_access_document(p_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.documents d
    where d.id = p_document_id
      and (
        d.author_id = auth.uid()
        or public.is_admin()
        or d.price_credit = 0
        or exists (
          select 1 from public.document_purchases p
          where p.document_id = d.id and p.buyer_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_access_document_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1 from public.documents d
    where d.id::text = (storage.foldername(p_name))[2]
      and (
        d.author_id = auth.uid()
        or public.is_admin()
        or d.price_credit = 0
        or exists (
          select 1 from public.document_purchases p
          where p.document_id = d.id and p.buyer_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.record_document_view(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_title text;
begin
  if v_user is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select title into v_title from public.documents
  where id = p_document_id and (status = 'published' or author_id = v_user or public.is_admin());
  if v_title is null then raise exception 'DOCUMENT_NOT_FOUND'; end if;

  insert into public.document_views(document_id, user_id) values (p_document_id, v_user);
  insert into public.activity_history(user_id, action_type, target_type, target_id, title)
  values (v_user, 'view', 'document', p_document_id, 'Đã xem ' || v_title);
end;
$$;

create or replace function public.purchase_document(p_document_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid := auth.uid();
  v_doc public.documents%rowtype;
  v_buyer_balance integer;
  v_buyer_new integer;
  v_seller_new integer;
begin
  if v_buyer is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into v_doc from public.documents where id = p_document_id and status = 'published';
  if not found then return jsonb_build_object('ok', false, 'code', 'DOCUMENT_NOT_FOUND'); end if;
  if v_doc.author_id = v_buyer or public.is_admin() then return jsonb_build_object('ok', true, 'code', 'ALREADY_HAS_ACCESS'); end if;
  if v_doc.price_credit = 0 then return jsonb_build_object('ok', true, 'code', 'FREE_DOCUMENT'); end if;
  if exists (select 1 from public.document_purchases where document_id = p_document_id and buyer_id = v_buyer) then
    return jsonb_build_object('ok', true, 'code', 'ALREADY_PURCHASED');
  end if;

  select credit_balance into v_buyer_balance from public.wallets where user_id = v_buyer for update;
  if coalesce(v_buyer_balance, 0) < v_doc.price_credit then
    return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_CREDIT', 'balance', coalesce(v_buyer_balance, 0), 'price', v_doc.price_credit);
  end if;

  update public.wallets set credit_balance = credit_balance - v_doc.price_credit where user_id = v_buyer returning credit_balance into v_buyer_new;
  update public.wallets set credit_balance = credit_balance + v_doc.price_credit where user_id = v_doc.author_id returning credit_balance into v_seller_new;

  insert into public.document_purchases(document_id, buyer_id, seller_id, price_credit)
  values (p_document_id, v_buyer, v_doc.author_id, v_doc.price_credit);

  insert into public.credit_transactions(user_id, type, amount, balance_after, reference_type, reference_id, note)
  values
    (v_buyer, 'document_purchase', -v_doc.price_credit, v_buyer_new, 'document', p_document_id, 'Mua tài liệu: ' || v_doc.title),
    (v_doc.author_id, 'document_sale', v_doc.price_credit, v_seller_new, 'document', p_document_id, 'Bán tài liệu: ' || v_doc.title);

  insert into public.activity_history(user_id, action_type, target_type, target_id, title)
  values (v_buyer, 'purchase', 'document', p_document_id, 'Đã mua ' || v_doc.title);

  insert into public.notifications(user_id, kind, title, content, target_url, important)
  values (v_doc.author_id, 'credit', 'Tài liệu vừa được mua', 'Một người dùng đã mua tài liệu ' || v_doc.title || '.', '/documents/' || p_document_id::text, true);

  return jsonb_build_object('ok', true, 'code', 'PURCHASED', 'remaining_balance', v_buyer_new);
end;
$$;

create or replace function public.send_gift(p_gift_id uuid, p_receiver_id uuid, p_target_type text, p_target_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_gift public.gifts%rowtype;
  v_sender_balance integer;
  v_sender_new integer;
  v_receiver_new integer;
  v_receiver_credit integer;
begin
  if v_sender is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if v_sender = p_receiver_id then return jsonb_build_object('ok', false, 'code', 'CANNOT_GIFT_SELF'); end if;
  if p_target_type not in ('document', 'post', 'profile') then return jsonb_build_object('ok', false, 'code', 'INVALID_TARGET'); end if;

  select * into v_gift from public.gifts where id = p_gift_id and active = true;
  if not found then return jsonb_build_object('ok', false, 'code', 'GIFT_NOT_FOUND'); end if;
  if not exists (select 1 from public.profiles where id = p_receiver_id) then return jsonb_build_object('ok', false, 'code', 'RECEIVER_NOT_FOUND'); end if;

  v_receiver_credit := floor(v_gift.credit_price * v_gift.creator_share_percent / 100.0)::integer;
  select credit_balance into v_sender_balance from public.wallets where user_id = v_sender for update;
  if coalesce(v_sender_balance, 0) < v_gift.credit_price then
    return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_CREDIT', 'balance', coalesce(v_sender_balance, 0), 'price', v_gift.credit_price);
  end if;

  update public.wallets set credit_balance = credit_balance - v_gift.credit_price where user_id = v_sender returning credit_balance into v_sender_new;
  update public.wallets set credit_balance = credit_balance + v_receiver_credit where user_id = p_receiver_id returning credit_balance into v_receiver_new;

  insert into public.gift_transactions(gift_id, sender_id, receiver_id, target_type, target_id, cost_credit, receiver_credit)
  values (p_gift_id, v_sender, p_receiver_id, p_target_type, p_target_id, v_gift.credit_price, v_receiver_credit);

  insert into public.credit_transactions(user_id, type, amount, balance_after, reference_type, reference_id, note)
  values
    (v_sender, 'gift_sent', -v_gift.credit_price, v_sender_new, p_target_type, p_target_id, 'Đã gửi quà ' || v_gift.name),
    (p_receiver_id, 'gift_received', v_receiver_credit, v_receiver_new, p_target_type, p_target_id, 'Đã nhận quà ' || v_gift.name);

  insert into public.activity_history(user_id, action_type, target_type, target_id, title)
  values (v_sender, 'gift', p_target_type, p_target_id, 'Đã gửi quà ' || v_gift.name);

  insert into public.notifications(user_id, kind, title, content, target_url, important)
  values (p_receiver_id, 'gift', 'Bạn nhận được quà', 'Bạn vừa nhận được ' || v_gift.name || '.', case when p_target_type = 'document' then '/documents/' || p_target_id::text when p_target_type = 'post' then '/feed' else '/profile/' || p_receiver_id::text end, v_gift.credit_price >= 500);

  return jsonb_build_object('ok', true, 'code', 'GIFT_SENT', 'remaining_balance', v_sender_new);
end;
$$;

create or replace function public.admin_update_user(p_user_id uuid, p_role text default null, p_status text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_role is not null and p_role not in ('user', 'teacher', 'admin') then raise exception 'INVALID_ROLE'; end if;
  if p_status is not null and p_status not in ('active', 'locked', 'banned') then raise exception 'INVALID_STATUS'; end if;

  update public.profiles
  set role = coalesce(p_role, role), status = coalesce(p_status, status)
  where id = p_user_id;

  insert into public.admin_logs(admin_id, action, target_type, target_id, detail)
  values (auth.uid(), 'UPDATE_USER', 'user', p_user_id, 'role=' || coalesce(p_role, '-') || ', status=' || coalesce(p_status, '-'));
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_process_payment_request(p_request_id uuid, p_action text, p_admin_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.payment_requests%rowtype;
  v_balance integer;
  v_cash numeric(14,2);
  v_months integer;
  v_start timestamptz;
  v_end timestamptz;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_action not in ('approve', 'reject') then raise exception 'INVALID_ACTION'; end if;

  select * into v_request from public.payment_requests where id = p_request_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Không tìm thấy yêu cầu.'); end if;
  if v_request.status <> 'pending' then return jsonb_build_object('ok', false, 'message', 'Yêu cầu đã được xử lý.'); end if;

  if p_action = 'reject' then
    update public.payment_requests set status = 'rejected', admin_note = p_admin_note, processed_by = auth.uid(), processed_at = now() where id = p_request_id;
  else
    if v_request.type = 'topup' then
      update public.wallets set credit_balance = credit_balance + v_request.credit_amount where user_id = v_request.user_id returning credit_balance into v_balance;
      insert into public.credit_transactions(user_id, type, amount, balance_after, reference_type, reference_id, note)
      values (v_request.user_id, 'topup', v_request.credit_amount, v_balance, 'payment_request', v_request.id, 'Nạp credit được Admin duyệt');
    elsif v_request.type = 'premium' then
      v_months := case v_request.plan_code when 'premium_1m' then 1 when 'premium_3m' then 3 when 'premium_6m' then 6 when 'premium_12m' then 12 else 1 end;
      select greatest(now(), coalesce(premium_expires_at, now())) into v_start from public.profiles where id = v_request.user_id for update;
      v_end := v_start + make_interval(months => v_months);
      update public.profiles set premium = true, premium_expires_at = v_end where id = v_request.user_id;
      insert into public.premium_subscriptions(user_id, plan_code, starts_at, ends_at, status, payment_request_id)
      values (v_request.user_id, v_request.plan_code, v_start, v_end, 'active', v_request.id);
    elsif v_request.type = 'withdraw' then
      select cash_balance into v_cash from public.wallets where user_id = v_request.user_id for update;
      if coalesce(v_cash, 0) < v_request.amount_vnd then
        return jsonb_build_object('ok', false, 'message', 'Số dư tiền tác giả không đủ để duyệt rút.');
      end if;
      update public.wallets set cash_balance = cash_balance - v_request.amount_vnd where user_id = v_request.user_id;
    end if;

    update public.payment_requests set status = 'approved', admin_note = p_admin_note, processed_by = auth.uid(), processed_at = now() where id = p_request_id;
    insert into public.notifications(user_id, kind, title, content, target_url, important)
    values (v_request.user_id, 'payment', 'Yêu cầu đã được duyệt', 'Yêu cầu ' || v_request.type || ' của bạn đã được duyệt.', '/wallet', true);
  end if;

  insert into public.admin_logs(admin_id, action, target_type, target_id, detail)
  values (auth.uid(), upper(p_action) || '_PAYMENT', 'payment_request', p_request_id, coalesce(p_admin_note, ''));

  return jsonb_build_object('ok', true);
end;
$$;

-- 10. Trigger ghi lịch sử tương tác

create or replace function public.log_document_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_doc uuid;
  v_action text;
  v_title text;
begin
  if tg_table_name = 'document_likes' then v_user := new.user_id; v_doc := new.document_id; v_action := 'like';
  elsif tg_table_name = 'document_comments' then v_user := new.user_id; v_doc := new.document_id; v_action := 'comment';
  elsif tg_table_name = 'document_ratings' then v_user := new.user_id; v_doc := new.document_id; v_action := 'rating';
  else return new;
  end if;
  select title into v_title from public.documents where id = v_doc;
  insert into public.activity_history(user_id, action_type, target_type, target_id, title)
  values (v_user, v_action, 'document', v_doc, case v_action when 'like' then 'Đã thích ' when 'comment' then 'Đã bình luận ' else 'Đã đánh giá ' end || coalesce(v_title, 'tài liệu'));
  return new;
end;
$$;

create trigger history_document_like after insert on public.document_likes for each row execute function public.log_document_activity();
create trigger history_document_comment after insert on public.document_comments for each row execute function public.log_document_activity();
create trigger history_document_rating after insert on public.document_ratings for each row execute function public.log_document_activity();

-- 11. Bật RLS

do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' and tablename in (
    'profiles','wallets','categories','documents','document_files','document_views','document_likes','document_bookmarks','document_comments','document_comment_reactions','document_ratings','document_purchases','follows','posts','post_likes','post_bookmarks','post_comments','post_comment_reactions','gifts','gift_transactions','credit_transactions','bank_accounts','payment_requests','premium_subscriptions','activity_history','notifications','reports','support_tickets','direct_messages','admin_logs'
  ) loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- 12. Policies

create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy wallets_select on public.wallets for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy categories_select on public.categories for select to authenticated using (true);

create policy documents_select on public.documents for select to authenticated using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy documents_insert on public.documents for insert to authenticated with check (author_id = auth.uid());
create policy documents_update on public.documents for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy documents_delete on public.documents for delete to authenticated using (author_id = auth.uid() or public.is_admin());

create policy document_files_select on public.document_files for select to authenticated using (file_kind in ('cover','demo') or public.can_access_document(document_id));
create policy document_files_insert on public.document_files for insert to authenticated with check (owner_id = auth.uid() and exists (select 1 from public.documents d where d.id = document_id and d.author_id = auth.uid()));
create policy document_files_delete on public.document_files for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

create policy document_views_select on public.document_views for select to authenticated using (true);
create policy document_views_insert on public.document_views for insert to authenticated with check (user_id = auth.uid());

create policy document_likes_select on public.document_likes for select to authenticated using (true);
create policy document_likes_insert on public.document_likes for insert to authenticated with check (user_id = auth.uid());
create policy document_likes_delete on public.document_likes for delete to authenticated using (user_id = auth.uid());

create policy document_bookmarks_select on public.document_bookmarks for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy document_bookmarks_insert on public.document_bookmarks for insert to authenticated with check (user_id = auth.uid());
create policy document_bookmarks_delete on public.document_bookmarks for delete to authenticated using (user_id = auth.uid());

create policy document_comments_select on public.document_comments for select to authenticated using (status = 'visible' or user_id = auth.uid() or public.is_admin());
create policy document_comments_insert on public.document_comments for insert to authenticated with check (user_id = auth.uid());
create policy document_comments_update on public.document_comments for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy document_comments_delete on public.document_comments for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy document_comment_reactions_select on public.document_comment_reactions for select to authenticated using (true);
create policy document_comment_reactions_insert on public.document_comment_reactions for insert to authenticated with check (user_id = auth.uid());
create policy document_comment_reactions_delete on public.document_comment_reactions for delete to authenticated using (user_id = auth.uid());

create policy document_ratings_select on public.document_ratings for select to authenticated using (true);
create policy document_ratings_insert on public.document_ratings for insert to authenticated with check (user_id = auth.uid());
create policy document_ratings_update on public.document_ratings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy document_ratings_delete on public.document_ratings for delete to authenticated using (user_id = auth.uid());

create policy document_purchases_select on public.document_purchases for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy follows_select on public.follows for select to authenticated using (true);
create policy follows_insert on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy posts_select on public.posts for select to authenticated using ((status = 'visible' and (visibility = 'public' or author_id = auth.uid() or (visibility = 'followers' and exists (select 1 from public.follows f where f.following_id = author_id and f.follower_id = auth.uid())))) or public.is_admin());
create policy posts_insert on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy posts_update on public.posts for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy posts_delete on public.posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());

create policy post_likes_select on public.post_likes for select to authenticated using (true);
create policy post_likes_insert on public.post_likes for insert to authenticated with check (user_id = auth.uid());
create policy post_likes_delete on public.post_likes for delete to authenticated using (user_id = auth.uid());

create policy post_bookmarks_select on public.post_bookmarks for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy post_bookmarks_insert on public.post_bookmarks for insert to authenticated with check (user_id = auth.uid());
create policy post_bookmarks_delete on public.post_bookmarks for delete to authenticated using (user_id = auth.uid());

create policy post_comments_select on public.post_comments for select to authenticated using (status = 'visible' or user_id = auth.uid() or public.is_admin());
create policy post_comments_insert on public.post_comments for insert to authenticated with check (user_id = auth.uid());
create policy post_comments_update on public.post_comments for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy post_comments_delete on public.post_comments for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy post_comment_reactions_select on public.post_comment_reactions for select to authenticated using (true);
create policy post_comment_reactions_insert on public.post_comment_reactions for insert to authenticated with check (user_id = auth.uid());
create policy post_comment_reactions_delete on public.post_comment_reactions for delete to authenticated using (user_id = auth.uid());

create policy gifts_select on public.gifts for select to authenticated using (active = true or public.is_admin());
create policy gift_transactions_select on public.gift_transactions for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());
create policy credit_transactions_select on public.credit_transactions for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy bank_accounts_select on public.bank_accounts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy bank_accounts_insert on public.bank_accounts for insert to authenticated with check (user_id = auth.uid());
create policy bank_accounts_update on public.bank_accounts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy bank_accounts_delete on public.bank_accounts for delete to authenticated using (user_id = auth.uid());

create policy payment_requests_select on public.payment_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy payment_requests_insert on public.payment_requests for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

create policy premium_subscriptions_select on public.premium_subscriptions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy activity_history_select on public.activity_history for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy notifications_select on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy notifications_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy reports_select on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());

create policy support_tickets_select on public.support_tickets for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy support_tickets_insert on public.support_tickets for insert to authenticated with check (user_id = auth.uid());
create policy support_tickets_update on public.support_tickets for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy direct_messages_select on public.direct_messages for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy direct_messages_insert on public.direct_messages for insert to authenticated with check (sender_id = auth.uid() and receiver_id <> auth.uid());
create policy direct_messages_update on public.direct_messages for update to authenticated using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());
create policy direct_messages_delete on public.direct_messages for delete to authenticated using (sender_id = auth.uid() or public.is_admin());

create policy admin_logs_select on public.admin_logs for select to authenticated using (public.is_admin());

-- 13. GRANT quyền bảng (RLS vẫn là lớp bảo vệ chính)

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, username, phone, school_name, faculty, major, bio, avatar_path, cover_path, updated_at) on public.profiles to authenticated;
grant select on public.wallets to authenticated;
grant select on public.categories to authenticated;

grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, delete on public.document_files to authenticated;
grant select, insert on public.document_views to authenticated;
grant select, insert, delete on public.document_likes to authenticated;
grant select, insert, delete on public.document_bookmarks to authenticated;
grant select, insert, update, delete on public.document_comments to authenticated;
grant select, insert, delete on public.document_comment_reactions to authenticated;
grant select, insert, update, delete on public.document_ratings to authenticated;
grant select on public.document_purchases to authenticated;

grant select, insert, delete on public.follows to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.post_likes to authenticated;
grant select, insert, delete on public.post_bookmarks to authenticated;
grant select, insert, update, delete on public.post_comments to authenticated;
grant select, insert, delete on public.post_comment_reactions to authenticated;

grant select on public.gifts to authenticated;
grant select on public.gift_transactions to authenticated;
grant select on public.credit_transactions to authenticated;
grant select, insert, update, delete on public.bank_accounts to authenticated;
grant select, insert on public.payment_requests to authenticated;
grant select on public.premium_subscriptions to authenticated;
grant select on public.activity_history to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert on public.reports to authenticated;
grant select, insert, update on public.support_tickets to authenticated;
grant select, insert, update, delete on public.direct_messages to authenticated;
grant select on public.admin_logs to authenticated;
grant select on public.document_stats, public.post_stats to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 14. Storage buckets

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
('document-covers', 'document-covers', true, 8388608, array['image/jpeg','image/png','image/webp']),
('document-demos', 'document-demos', true, 52428800, array['application/pdf']),
('documents-private', 'documents-private', false, 524288000, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip'
])
on conflict(id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_upload_own on storage.objects;
drop policy if exists avatars_update_own on storage.objects;
drop policy if exists avatars_delete_own on storage.objects;
drop policy if exists covers_upload_own on storage.objects;
drop policy if exists covers_update_own on storage.objects;
drop policy if exists covers_delete_own on storage.objects;
drop policy if exists demos_upload_own on storage.objects;
drop policy if exists demos_update_own on storage.objects;
drop policy if exists demos_delete_own on storage.objects;
drop policy if exists private_upload_own on storage.objects;
drop policy if exists private_select_allowed on storage.objects;
drop policy if exists private_update_own on storage.objects;
drop policy if exists private_delete_own on storage.objects;

create policy avatars_upload_own on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update_own on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete_own on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy covers_upload_own on storage.objects for insert to authenticated with check (bucket_id = 'document-covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_update_own on storage.objects for update to authenticated using (bucket_id = 'document-covers' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'document-covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_delete_own on storage.objects for delete to authenticated using (bucket_id = 'document-covers' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy demos_upload_own on storage.objects for insert to authenticated with check (bucket_id = 'document-demos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy demos_update_own on storage.objects for update to authenticated using (bucket_id = 'document-demos' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'document-demos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy demos_delete_own on storage.objects for delete to authenticated using (bucket_id = 'document-demos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy private_upload_own on storage.objects for insert to authenticated with check (
  bucket_id = 'documents-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.documents d where d.id::text = (storage.foldername(name))[2] and d.author_id = auth.uid())
);
create policy private_select_allowed on storage.objects for select to authenticated using (bucket_id = 'documents-private' and public.can_access_document_path(name));
create policy private_update_own on storage.objects for update to authenticated using (bucket_id = 'documents-private' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'documents-private' and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_delete_own on storage.objects for delete to authenticated using (bucket_id = 'documents-private' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- 15. Quyền gọi hàm

revoke all on function public.is_admin() from public;
revoke all on function public.can_access_document(uuid) from public;
revoke all on function public.can_access_document_path(text) from public;
revoke all on function public.record_document_view(uuid) from public;
revoke all on function public.purchase_document(uuid) from public;
revoke all on function public.send_gift(uuid, uuid, text, uuid) from public;
revoke all on function public.admin_update_user(uuid, text, text) from public;
revoke all on function public.admin_process_payment_request(uuid, text, text) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_document(uuid) to authenticated;
grant execute on function public.can_access_document_path(text) to authenticated;
grant execute on function public.record_document_view(uuid) to authenticated;
grant execute on function public.purchase_document(uuid) to authenticated;
grant execute on function public.send_gift(uuid, uuid, text, uuid) to authenticated;
grant execute on function public.admin_update_user(uuid, text, text) to authenticated;
grant execute on function public.admin_process_payment_request(uuid, text, text) to authenticated;

commit;

-- KIỂM TRA SAU KHI CHẠY
select 'profiles' as bang, count(*) as so_dong from public.profiles
union all select 'categories', count(*) from public.categories
union all select 'gifts', count(*) from public.gifts
union all select 'documents', count(*) from public.documents
union all select 'posts', count(*) from public.posts;
