-- Execute uma vez no SQL Editor do seu projeto Supabase.
-- O acesso publico direto e bloqueado; apenas a funcao Vercel com chave secreta
-- pode consultar e atualizar a classificacao.

create table if not exists public.wall_players (
  id uuid primary key,
  nickname text not null check (char_length(nickname) between 2 and 22),
  best_ms integer not null check (best_ms between 7500 and 7200000),
  attempts integer not null default 1 check (attempts > 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.wall_submissions (
  session_id uuid primary key,
  player_id uuid not null references public.wall_players(id),
  elapsed_ms integer not null check (elapsed_ms between 7500 and 7200000),
  created_at timestamptz not null default now()
);
create index if not exists wall_players_ranking_idx on public.wall_players(best_ms,updated_at,id);
alter table public.wall_players enable row level security;
alter table public.wall_submissions enable row level security;
revoke all on public.wall_players, public.wall_submissions from PUBLIC, anon, authenticated;
grant select, insert, update on public.wall_players to service_role;
grant select, insert on public.wall_submissions to service_role;

-- Uma submissao por sessao assinada, com atualizacao atomica do recorde.
create or replace function public.wall_save_result(
  p_session_id uuid, p_player_id uuid, p_nickname text, p_ms integer
) returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  v_best integer;
begin
  -- Serializa envios da mesma sessao e impede tentativas duplicadas em paralelo.
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));
  if p_ms < 7500 or p_ms > 7200000
     or char_length(p_nickname) < 2 or char_length(p_nickname) > 22 then
    raise exception 'invalid score';
  end if;

  -- Primeiro registre o jogador para satisfazer a chave estrangeira.
  -- Em repeticoes da mesma sessao, nunca incremente o total novamente.
  if exists (select 1 from wall_submissions where session_id = p_session_id) then
    select best_ms into v_best from wall_players where id = p_player_id;
    return v_best;
  end if;

  insert into wall_players(id, nickname, best_ms, attempts, updated_at)
  values(p_player_id, p_nickname, p_ms, 1, now())
  on conflict (id) do update set
    nickname = excluded.nickname,
    best_ms = least(wall_players.best_ms, excluded.best_ms),
    attempts = wall_players.attempts + 1,
    updated_at = now();

  insert into wall_submissions(session_id, player_id, elapsed_ms)
  values(p_session_id, p_player_id, p_ms)
  on conflict (session_id) do nothing;

  -- A funcao e transacional; atualizacoes concorrentes da mesma sessao
  -- podem entrar por duas requisicoes. A funcao aplica lock no registro.
  select best_ms into v_best from wall_players where id = p_player_id;
  return v_best;
end;
$$;

create or replace function public.wall_player_position(p_player_id uuid)
returns integer
language sql stable security definer set search_path = public
as $$
  select (1 + (
    select count(*)::integer
    from wall_players earlier
    where earlier.best_ms < mine.best_ms
       or (earlier.best_ms = mine.best_ms and earlier.updated_at < mine.updated_at)
       or (earlier.best_ms = mine.best_ms and earlier.updated_at = mine.updated_at
           and earlier.id < mine.id)
  ))::integer
  from wall_players mine where mine.id = p_player_id;
$$;

revoke all on function public.wall_save_result(uuid,uuid,text,integer) from PUBLIC, anon, authenticated;
revoke all on function public.wall_player_position(uuid) from PUBLIC, anon, authenticated;
grant execute on function public.wall_save_result(uuid,uuid,text,integer) to service_role;
grant execute on function public.wall_player_position(uuid) to service_role;
