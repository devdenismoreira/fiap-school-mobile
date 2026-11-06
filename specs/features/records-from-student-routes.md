# Feature — Agenda e boletins pelas rotas de alunos

> Status: **implementada e validada em aparelho** (T13) · Decisões: D-38 (e D-28 da API) · Contrato: `../FiapSchoolApi/specs/03-api-contract.md`

## 1. Objetivo

Ler a agenda e os boletins do aluno selecionado pelas rotas que garantem a autorização pelo vínculo entre responsável e aluno (`GET /v1/alunos/{rm}/agenda` e `/boletins`), em vez de receber tudo no `/me`.

## 2. Requisitos

| # | Requisito |
|---|---|
| R1 | O login e o `/me` devolvem só o responsável e a lista de alunos (`rm`, `turma`, `periodo`, nome). A agenda e os boletins não vêm mais nesses payloads |
| R2 | Ao entrar, restaurar a sessão ou trocar de aluno, o app busca a agenda e os boletins do aluno selecionado |
| R3 | Enquanto busca, as abas mostram o `LoadingState`; se falhar, mostram o estado de erro com TENTAR NOVAMENTE (ver `empty-states.md`) |
| R4 | Puxar a tela para baixo (`RefreshControl`) busca de novo; o indicador acompanha a requisição |
| R5 | Um RM que não pertence ao responsável devolve 404 `ALUNO_NAO_ENCONTRADO`, tratado como erro de carregamento |
| R6 | Falha de renovação da sessão (`SessionExpiredError`) leva ao Login com o aviso de sessão expirada |

## 3. Implementação

- Domínio: use case `loadStudentRecords`; `GuardianRepository.findStudentSchedule` e `findStudentReportCards`.
- Dados: `GuardianDataSource.getSchedule/getReportCards`; `GuardianRemoteDataSource` com `schedulePath` e `reportCardsPath`; DTOs `AgendaRespostaDTO` e `BoletinsRespostaDTO`; o `toStudent` cria o aluno com agenda e boletins vazios, e `toScheduleDay` e `toReportCard` mapeiam as respostas.
- Sessão: `SessionProvider` expõe `recordsStatus` (`loading | ready | error`) e `reloadRecords()`; o aluno selecionado junta os dados carregados. Hook `useRecordsReload` para o pull-to-refresh.

## 4. Critérios de aceite

Automatizados: carga ao entrar e ao trocar de aluno; erro e nova tentativa; pull-to-refresh nas duas abas; 404 de aluno não vinculado; sessão expirada durante a carga; a API simulada `createFakeApi` serve as rotas por vínculo; o verificador de contrato confere as respostas com o `openapi.yaml`.

Manuais (feitos pelo desenvolvedor em aparelho): carregamento ao trocar de aluno, puxar para atualizar, erro com a API fora do ar.

## 5. Riscos

- Mudança incompatível em `/v1` (sem `/v2`). Sem impacto prático: o app não é publicado em loja, a entrega é só o repositório, e não há versões antigas em uso.
