create table if not exists public.news_comments (
  id bigint generated always as identity primary key,
  news_id text not null check (char_length(news_id) between 1 and 64),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default 'Visitante'
    check (char_length(btrim(author_name)) between 1 and 40),
  body text not null check (char_length(btrim(body)) between 3 and 500),
  created_at timestamptz not null default now()
);

create index if not exists news_comments_by_story
  on public.news_comments (news_id, created_at desc);

create table if not exists public.news_likes (
  news_id text not null check (char_length(news_id) between 1 and 64),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (news_id, user_id)
);

alter table public.news_comments enable row level security;
alter table public.news_likes enable row level security;

grant select, insert on public.news_comments to authenticated;
grant usage, select on sequence public.news_comments_id_seq to authenticated;
grant select, insert, delete on public.news_likes to authenticated;

drop policy if exists news_comments_read on public.news_comments;
create policy news_comments_read on public.news_comments
  for select to authenticated using (true);

drop policy if exists news_comments_add_own on public.news_comments;
create policy news_comments_add_own on public.news_comments
  for insert to authenticated
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists news_likes_read_own on public.news_likes;
create policy news_likes_read_own on public.news_likes
  for select to authenticated using (user_id = auth.uid());

drop policy if exists news_likes_add_own on public.news_likes;
create policy news_likes_add_own on public.news_likes
  for insert to authenticated
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists news_likes_remove_own on public.news_likes;
create policy news_likes_remove_own on public.news_likes
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.limit_news_comment_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_comments integer;
begin
  new.created_at := now();
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.user_id::text));

  select count(*) into recent_comments
  from public.news_comments as c
  where c.user_id = new.user_id
    and c.created_at > now() - interval '10 minutes';

  if recent_comments >= 5 then
    raise exception 'Has publicado varios comentarios. Espera unos minutos antes de intentar de nuevo.';
  end if;

  return new;
end;
$$;

revoke all on function public.limit_news_comment_rate() from public, anon, authenticated;

drop trigger if exists news_comments_rate_limit on public.news_comments;
create trigger news_comments_rate_limit
  before insert on public.news_comments
  for each row execute function public.limit_news_comment_rate();

create or replace function public.get_news_like_summary(p_news_id text)
returns table (total bigint, liked_by_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::bigint,
    coalesce(pg_catalog.bool_or(l.user_id = auth.uid()), false)
  from public.news_likes as l
  where l.news_id = p_news_id;
$$;

revoke all on function public.get_news_like_summary(text) from public, anon, authenticated;
grant execute on function public.get_news_like_summary(text) to authenticated;
