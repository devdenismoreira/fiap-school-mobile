# T13 — Agenda e boletins pelas rotas de alunos

**Depende de:** T11 · **Branch:** `develop` · **Specs:** `features/records-from-student-routes.md`, D-38, `../FiapSchoolApi/specs/03-api-contract.md`

## Objetivo

Ler agenda e boletins do aluno selecionado pelas rotas `/v1/alunos/{rm}/agenda` e `/boletins`, com carga ao entrar e ao trocar de aluno e pull-to-refresh, e enxugar o `/me` e o login na API.

## Escopo

1. DTOs, mapper (`toScheduleDay`, `toReportCard`) e `GuardianDataSource.getSchedule/getReportCards`.
2. `GuardianRepository` e o use case `loadStudentRecords`.
3. `SessionProvider`: `recordsStatus`, `reloadRecords` e carga do aluno selecionado.
4. `useRecordsReload` e `RefreshControl` nas abas.
5. `createFakeApi` com rotas por vínculo; testes de contrato com o `openapi.yaml`.
6. API: `/me` e login só com responsável e alunos (D-28); contrato e OpenAPI atualizados.

## Critérios de aceite

Os de `features/records-from-student-routes.md` §4.

## Status

**Concluída em 2026-11-05.** Validada em aparelho pelo desenvolvedor. App: 273 testes em 42 suítes; API: 277 unitários e 139 de integração. `yarn typecheck` e `yarn lint` passando.

Ordem de publicação: app primeiro, depois a API enxuta.
