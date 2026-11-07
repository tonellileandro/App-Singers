-- Etapa 2: tabelas, segurança (RLS) e bucket de áudios.
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.

create extension if not exists pgcrypto;

-- ALUNOS -----------------------------------------------------------------
create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text,
  grupo smallint not null check (grupo in (1, 2)),
  regiao_vocal text not null check (regiao_vocal in ('grave', 'medio', 'agudo')),
  classificacao_vocal text,
  token_publico uuid not null unique default gen_random_uuid(),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ANAMNESE (dados de saúde — LGPD: nunca sai do painel) -------------------
create table public.anamneses (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb,
  consentimento_texto text not null,
  consentimento_em timestamptz not null,
  criado_em timestamptz not null default now()
);

-- EIXOS DO RADAR (Grupo 1) — configuráveis pela professora ----------------
create table public.eixos_avaliacao (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ordem int not null default 0,
  ativo boolean not null default true
);
insert into public.eixos_avaliacao (nome, ordem) values ('Afinação', 1), ('Ritmo', 2);

-- AVALIAÇÕES --------------------------------------------------------------
create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  data date not null default current_date,
  notas jsonb not null default '{}'::jsonb, -- { "Afinação": 7, "Ritmo": 8 }
  observacoes text,
  criado_em timestamptz not null default now()
);

-- EXERCÍCIOS --------------------------------------------------------------
create table public.exercicios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  instrucoes text,
  pilares text[] not null default '{}'
    check (pilares <@ array['respiracao', 'fonacao', 'articulacao']),
  tags text[] not null default '{}',
  grupo_alvo smallint check (grupo_alvo in (1, 2)), -- null = ambos
  criado_em timestamptz not null default now()
);
create index exercicios_tags_idx on public.exercicios using gin (tags);
create index exercicios_pilares_idx on public.exercicios using gin (pilares);

create table public.audios_exercicio (
  id uuid primary key default gen_random_uuid(),
  exercicio_id uuid not null references public.exercicios(id) on delete cascade,
  regiao text not null check (regiao in ('grave', 'medio', 'agudo')),
  caminho_storage text not null,
  criado_em timestamptz not null default now(),
  unique (exercicio_id, regiao)
);

-- FICHAS ------------------------------------------------------------------
create table public.fichas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  titulo text not null,
  data date not null default current_date,
  observacoes text,
  criado_em timestamptz not null default now()
);

create table public.ficha_itens (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid not null references public.fichas(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id) on delete restrict,
  ordem int not null,
  observacao text
);
create index ficha_itens_ficha_idx on public.ficha_itens (ficha_id, ordem);

-- SEGURANÇA: RLS em todas as tabelas --------------------------------------
-- Só usuários logados acessam. Como o cadastro público fica DESLIGADO no
-- Supabase, a única usuária logada é a professora. Visitantes (anon) não
-- leem nada; a página pública da ficha lê pelo servidor.
do $$
declare t text;
begin
  foreach t in array array['alunos','anamneses','eixos_avaliacao','avaliacoes',
                           'exercicios','audios_exercicio','fichas','ficha_itens']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "professora_acesso_total" on public.%I
         for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- BUCKET DE ÁUDIOS (privado, até 50 MB, só MP3/WAV) ------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audios', 'audios', false, 52428800,
        array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'])
on conflict (id) do nothing;

create policy "professora_le_audios" on storage.objects
  for select to authenticated using (bucket_id = 'audios');
create policy "professora_envia_audios" on storage.objects
  for insert to authenticated with check (bucket_id = 'audios');
create policy "professora_altera_audios" on storage.objects
  for update to authenticated using (bucket_id = 'audios');
create policy "professora_apaga_audios" on storage.objects
  for delete to authenticated using (bucket_id = 'audios');
