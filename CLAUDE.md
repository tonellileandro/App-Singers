# App de Aulas de Canto — briefing do projeto

## O que é
App web para uma professora de canto gerenciar alunos e enviar fichas de treino.
Só a professora faz login. Os alunos NÃO têm conta: recebem uma ficha em PDF com
links e QR Codes que abrem uma página pública da ficha deles, com os áudios.

Idioma da interface: português do Brasil. A usuária não é programadora: interface
simples, botões claros, mensagens de erro compreensíveis.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Postgres (dados), Storage (áudios), Auth (só a professora)
- Hospedagem: Vercel
- PDF: jsPDF + qrcode
- Gráfico radar: Recharts

## Regras importantes
- Segredos só em `.env.local` (nunca commitar). A chave `service_role` do Supabase
  nunca vai para o navegador.
- Row Level Security ligado em TODAS as tabelas. Só a professora autenticada lê e
  escreve. A página pública do aluno lê apenas o necessário via função/rota no
  servidor, usando o `token_publico` do aluno.
- O QR Code e os links do PDF apontam para `/ficha/[token_publico]`, NUNCA direto
  para o arquivo de áudio. Assim, trocar um áudio não invalida PDFs já entregues.
- `token_publico`: aleatório e longo (ex.: UUID v4), impossível de adivinhar.
- Anamnese contém dados de saúde (LGPD): nunca aparece na ficha nem na página
  pública. Registrar data e texto do consentimento do aluno.
- Áudios: aceitar MP3 e WAV; avisar se o arquivo for muito grande.
- Não transpor áudio por software. Cada exercício tem gravações reais de piano
  por região vocal, e o sistema escolhe a certa pela classificação do aluno.

## Grupos de alunos
- Grupo 1 — Iniciantes: afinação e ritmo, avaliação em radar com notas de 0 a 10.
  (Os eixos exatos do radar serão definidos pela professora: deixar configurável.)
- Grupo 2 — Geral (técnica vocal): exercícios marcados pelos pilares do Venn.

## Matriz de tags (Grupo 2)
Respiração: consciência corporal | resistência | força
Fonação:
  - firmeza: fortalecer | suavizar
  - registros: M1 | M2 | mix
  - modos: soproso | fluido | neutro | firme
Articulação: consoantes (dicção) | vogais horizontais | vogais verticais | ressonância

Interseções (derivadas das tags marcadas, não cadastradas à mão):
- Articulação + Fonação = ajuste fonte-filtro
- Articulação + Respiração = ETVSO
- Os três pilares = centro (alta performance)

## Modelo de dados (ponto de partida)
- alunos: id, nome, contato, grupo (1|2), regiao_vocal (grave|medio|agudo),
  classificacao_vocal (texto livre), token_publico, ativo, criado_em
- anamneses: id, aluno_id, respostas (jsonb), consentimento_texto,
  consentimento_em, criado_em
- avaliacoes: id, aluno_id, data, notas (jsonb: eixo -> 0..10), observacoes
- exercicios: id, titulo, instrucoes, pilares (text[]), tags (text[]), grupo_alvo
- audios_exercicio: id, exercicio_id, regiao (grave|medio|agudo), caminho_storage
- fichas: id, aluno_id, titulo, data, observacoes
- ficha_itens: id, ficha_id, exercicio_id, ordem, observacao

## Telas
Painel da professora (com login):
1. Alunos: lista, cadastro, edição, anamnese
2. Avaliações: formulário + radar (Grupo 1) e histórico
3. Biblioteca de exercícios: cadastro, tags, upload dos 3 áudios, filtros por tag
   e por interseção
4. Montar ficha: escolher aluno, adicionar e ordenar exercícios, gerar PDF

Página pública `/ficha/[token]`: nome do aluno, exercícios na ordem, instruções
e o player do áudio da região vocal dele. Funciona bem no celular.

## Ordem de construção
1. Projeto Next.js + conexão com Supabase + login da professora
2. Tabelas, RLS e bucket de áudios
3. CRUD de alunos e anamnese
4. Biblioteca de exercícios com tags e upload de áudios
5. Montagem de ficha + página pública
6. PDF com QR Code
7. Avaliações com radar
8. Deploy na Vercel

Trabalhar uma etapa por vez, explicar em linguagem simples o que foi feito e o
que a usuária precisa clicar/configurar (ex.: no painel do Supabase).
