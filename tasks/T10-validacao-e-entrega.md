# T10 — Validação final, README e entrega

**Depende de:** T09 · **Specs:** `CLAUDE.md` §14

## Objetivo

Garantir que a entrega cumpre os critérios do desafio e está documentada.

## Escopo

1. Revisão de cobertura dos testes prioritários (`CLAUDE.md` §10).
2. Builds de release locais: `assembleRelease` (Android) e build Release no simulador (iOS).
3. README: pré-requisitos (Node ≥ 22.11, Ruby/CocoaPods, JDK, Xcode), instalação, execução, dados de teste (conforme D-06), arquitetura, testes, decisões e limitações (autenticação simulada).
4. Atualizar `CLAUDE.md` com os links do Figma e do JSON (placeholders atuais) e com decisões tomadas.
5. Atualizar specs com o que mudou durante a implementação.
6. Remover `@react-native/new-app-screen` se não for mais usado — **requer aprovação** (aprovado e removido).

## Critérios de aceite

- [x] Todos os critérios de aceite das features marcados ou com pendência justificada (ver Status de cada tarefa).
- [x] typecheck, lint e testes passam; o app foi compilado e testado pelo desenvolvedor em Android e iOS. Builds de release ficam a cargo do desenvolvedor.
- [x] README cobre todos os itens de `CLAUDE.md` §14 sem expor credenciais.

## Validação

Execução completa dos comandos e roteiro manual: login → agenda → boletim → trocar aluno → fechar/reabrir → sair.

## Status (2026-11-04)

Feito:

- **Cobertura dos testes prioritários (`CLAUDE.md` §10):** todos cobertos. CPF (normalização, máscara, DV); login válido/inválido; restauração e logout; seleção e troca de aluno; dias de aula e navegação entre eles; boletim e regras dos períodos ("-" para não lançado, disciplina ausente); estados vazios (dia sem aula, agenda vazia, sem boletins); navegação essencial (fluxo integrado do `App`). Total: 25 suítes, 169 testes.
- **README** reescrito: funcionalidades, stack, pré-requisitos, instalação, execução, dados de teste (aponta o JSON, sem copiar credenciais), arquitetura e decisões, segurança, testes, diferenças do Figma, SDD.
- **`CLAUDE.md`:** link do Figma, caminho do JSON e repositório privado preenchidos (arquivo local, fora do git).

Atualização (2026-11-04, entrega):

- **Teste em aparelho** feito pelo desenvolvedor em Android e iOS. Os ajustes estão na T09: barra de ações fixa, animações, status bar, launch screen e ícones.
- **Testes:** 27 suítes, 176 testes.
- **Configuração de IA para a entrega:**
  - `CLAUDE.md` atualizado com o estado atual, as versões e as convenções;
  - `.claude/` com agentes, comandos do ciclo SDD e `settings.json` compartilhado;
  - `AI_USAGE.md`.
- **No git:** `specs/`, `tasks/` e `CLAUDE.md` saíram do `.git/info/exclude` e entram no repositório. O `.claude/settings.local.json` (configuração pessoal) fica fora, no `.gitignore`. O prompt inicial foi removido do projeto.
- **Yarn:** o projeto voltou ao Yarn 1, e o item sobre `corepack`/`.yarnrc.yml` deixou de se aplicar.
- **`@react-native/new-app-screen` removido** com aprovação. Era só JS, sem impacto nativo. typecheck, lint e testes continuam passando.

Pendente, depende do desenvolvedor:

1. **Rebuild nativo do iOS** para conferir no aparelho a status bar, a launch screen, o ícone e a ausência da piscada branca.
2. **Push da branch `develop`** e abertura do repositório na entrega.
