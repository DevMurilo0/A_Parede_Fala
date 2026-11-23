
-- Participantes sao numerados pela primeira entrada, nao pela ordem de tempo no ranking.
create sequence if not exists public.wall_player_counter_seq start with 1 increment by 1;
create table if not exists public.wall_registrations (
  id uuid primary key,
  player_number bigint not null unique default nextval('public.wall_player_counter_seq'::regclass),
  created_at timestamptz not null default now()
);
alter table public.wall_registrations enable row level security;
revoke all on public.wall_registrations from PUBLIC, anon, authenticated;
grant select, insert on public.wall_registrations to service_role;

create or replace function public.wall_register_player(p_player_id uuid)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare v_player_number bigint;
begin
  if p_player_id is null then raise exception 'player id required'; end if;
  -- A ordem dos Player N e definida de forma atomica no servidor.
  perform pg_advisory_xact_lock(1703010001::bigint);
  select player_number into v_player_number
    from public.wall_registrations where id = p_player_id;
  if v_player_number is null then
    insert into public.wall_registrations(id)
    values(p_player_id) returning player_number into v_player_number;
  end if;
  return v_player_number;
end;
$$;
revoke all on function public.wall_register_player(uuid) from PUBLIC, anon, authenticated;
grant execute on function public.wall_register_player(uuid) to service_role;

-- Mantem jogadores antigos sem mudar id ou recordes.
insert into public.wall_registrations(id)
  select id from public.wall_players order by updated_at, id
on conflict (id) do nothing;
update public.wall_players p
set nickname = 'Player ' || r.player_number::text
from public.wall_registrations r where r.id = p.id
  and p.nickname is distinct from 'Player ' || r.player_number::text;

create or replace function public.wall_save_result(
  p_session_id uuid, p_player_id uuid, p_nickname text, p_ms integer
) returns integer
language plpgsql security definer set search_path = public
as $$
declare
  v_best integer;
  v_number bigint;
  v_label text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));
  if p_ms < 7500 or p_ms > 7200000 then
    raise exception 'invalid score';
  end if;

  if exists (select 1 from public.wall_submissions where session_id = p_session_id) then
    select best_ms into v_best from public.wall_players where id = p_player_id;
    return v_best;
  end if;

  -- Ignora nomes vindos do cliente, inclusive de sessoes antigas.
  v_number := public.wall_register_player(p_player_id);
  v_label := 'Player ' || v_number::text;

  insert into public.wall_players(id, nickname, best_ms, attempts, updated_at)
  values(p_player_id, v_label, p_ms, 1, now())
  on conflict (id) do update set
    nickname = excluded.nickname,
    best_ms = least(public.wall_players.best_ms, excluded.best_ms),
    attempts = public.wall_players.attempts + 1,
    updated_at = now();

  insert into public.wall_submissions(session_id, player_id, elapsed_ms)
  values(p_session_id, p_player_id, p_ms)
  on conflict (session_id) do nothing;

  select best_ms into v_best from public.wall_players where id = p_player_id;
  return v_best;
end;
$$;
revoke all on function public.wall_save_result(uuid,uuid,text,integer)
  from PUBLIC, anon, authenticated;
grant execute on function public.wall_save_result(uuid,uuid,text,integer) to service_role;
