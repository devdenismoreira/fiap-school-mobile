# T03 — Domínio, dados locais e utilitários

**Depende de:** T01 · **Specs:** `02-data-model.md`, `01-architecture.md` §4

## Objetivo

Modelar entidades, ler o JSON por trás de um repositório e implementar as funções puras de CPF, datas e notas, todas com testes.

## Escopo

1. Mover `src/responsaveis.json` → `src/data/datasources/local/responsaveis.json`.
2. Tipos DTO (`ResponsavelDTO` …) e entidades (`Guardian`, `Student`, …).
3. `guardianMapper` (remove `cpf`/`senha`/`email`).
4. Interfaces `GuardianRepository` e `SessionRepository`; implementações `LocalGuardianRepository` (com latência configurável) e `AsyncStorageSessionRepository` (com validação do formato salvo).
5. `core/utils`: `cpf.ts` (`onlyDigits`, `formatCpf`, `isValidCpf`), `formatDayLabel.ts`, `formatGrade.ts` (`formatGrade`, `formatAbsences`).
6. `core/errors`: `InvalidCredentialsError`.

## Fora de escopo

Use cases, contexto e UI.

## Critérios de aceite

- [x] Nenhuma entidade de domínio expõe CPF, senha ou e-mail (garantido por tipo e teste).
- [x] `findByCredentials` aceita só CPF normalizado e retorna `null` para qualquer divergência.
- [x] `AsyncStorageSessionRepository.load` retorna `null` para JSON inválido, versão desconhecida ou tipos errados.
- [x] `formatDayLabel('2025-03-17') === '17 de março, segunda-feira'`, independente do fuso.
- [x] `formatGrade(8) === '8,0'`, `formatGrade(9.5) === '9,5'`, `formatGrade(null) === '-'`.
- [x] Cobertura dos casos de borda de `02-data-model.md` §7 que se aplicam a esta camada.

## Validação

typecheck, lint, testes (rodar também com `TZ=UTC` e `TZ=America/Sao_Paulo`).

## Status (2026-11-04) — concluída

Ajustes em relação ao escopo original (specs atualizadas):

- A comparação de credenciais ficou no `GuardianLocalDataSource.signIn`, que se comporta como uma API de login e devolve o DTO **sem** `cpf`/`senha`/`email`. O mapper só traduz PT → EN.
- A latência configurável (`signInLatencyMs`) fica no datasource e vale só para `signIn`, igual em sucesso e falha. O repositório passou a se chamar `GuardianRepositoryImpl`.
- Não foi criada classe base `AppError` (sem benefício concreto por enquanto).
- `KeyValueStorage` (interface em `core/storage`) permite testar o repositório de sessão com storage em memória.

Validação executada:

- `npm run typecheck`, `npm run lint`: ok.
- `jest`: 9 suítes, 68 testes passando.
- Fuso horário: o teste roda `formatDayLabel` com `TZ` = UTC, America/Sao_Paulo, Pacific/Kiritimati e Pacific/Pago_Pago. Conferido que a implementação ingênua (`new Date('2025-03-16').getDay()` com TZ=America/Sao_Paulo) retorna sábado em vez de domingo, ou seja, o teste pegaria esse bug.
- Credenciais: os testes leem CPF/senha do fixture em tempo de execução; varredura confirmou que nenhum CPF ou e-mail do JSON aparece em `src/`, testes, specs ou tasks.
