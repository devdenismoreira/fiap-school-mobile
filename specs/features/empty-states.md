# Feature — Estados vazios e de erro

> Status: **implementada e validada em aparelho** (T14) · Decisões: D-38 · Referência visual: ilustração da Agenda do Figma

## 1. Objetivo

Tratar com a mesma linguagem visual os casos sem dados e as falhas de carga: responsável sem alunos, boletim vazio ou com erro, agenda com erro.

## 2. Componente `EmptyState`

Props: `title`, `description?`, `actionLabel?`, `onAction?`, `actionLoading?`, `testID?`. Usa a ilustração da Agenda, o título e a descrição em tipografia do tema e, quando há ação, um botão primário (fundo `primary`, raio `m`, altura `sizes.dropdownHeight`) com loading.

## 3. Situações

| Situação | Tela | Texto | Ação |
|---|---|---|---|
| Responsável sem alunos | `NoStudentsScreen`, sem as abas e sem a barra de navegação | "Nenhum aluno vinculado" / "Fale com a secretaria da FIAP School para vincular seus alunos." | SAIR continua na `AppActionBar` |
| Boletim sem dados ou erro ao carregar | Aba Boletim | mensagem objetiva | TENTAR NOVAMENTE (recarrega) |
| Erro ao carregar a agenda | Aba Agenda | mensagem objetiva | TENTAR NOVAMENTE |
| Carregando | `LoadingState` (`records-loading`) | — | — |

## 4. Critérios de aceite

Testes: `EmptyState` (texto, ação, loading), `MainTabs` sem alunos (sem abas), erro e nova tentativa em Agenda e Boletim, aluno sem boletim.
Manual: conferido pelo desenvolvedor em aparelho (com um responsável sem alunos e um aluno sem boletim).
