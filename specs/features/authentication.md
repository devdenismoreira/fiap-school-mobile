# Feature — Autenticação e sessão

> Status: **aprovada e implementada** (T04) · Figma: página "Login" (`2:6`, `3:1216`, `3:1246`, `3:1232`, `3:1262`) · Dados: `02-data-model.md`

## 1. Objetivo

Permitir que o responsável entre com CPF e senha validados pela API (na entrega, contra o JSON local), manter a sessão entre aberturas do app e encerrá-la por "SAIR".

## 2. Layout (frame 414 × 736)

| Elemento | Posição / medidas | Estilo |
|---|---|---|
| Logo | Centralizado, topo a 100 pt, 306 × 49 | PNG |
| Rótulo "CPF" | Topo a 229 pt, centralizado | `fieldLabel` |
| Valor do CPF | Centralizado, ~49 pt abaixo do rótulo | `inputValue` |
| Sublinhado do CPF | Margens laterais de 48 pt, 96 pt abaixo do topo do rótulo | 1 pt; `inputLine` (vazio) / `inputLineFilled` (preenchido) |
| Rótulo "SENHA" | 40 pt abaixo do sublinhado do CPF | `fieldLabel` |
| Valor da senha | Igual ao CPF, mascarado | `inputValue` |
| Mensagem de erro | 32 pt abaixo do sublinhado da senha, centralizada, 2 linhas | `bodyMedium`, cor `primary` |
| Botão "FAZER LOGIN" | Largura total, 60 pt, colado na base | `PrimaryButton` |

## 3. Estados (mapeados ao Figma)

| Estado | Frame | Regras visuais |
|---|---|---|
| Inicial | `2:6` | Campos vazios, sublinhados `inputLine`, botão desabilitado (texto `#777777`) |
| CPF com máscara | `3:1216` | CPF exibido como `000.000.000-00`; sublinhado do CPF branco; botão ainda desabilitado |
| Senha preenchida, botão ativo | `3:1246` | Ambos os sublinhados brancos; texto do botão preto |
| Carregando | `3:1232` | Botão sem texto e sem indicador, como no Figma; dura a latência simulada de 800 ms (D-04); campos não editáveis; `accessibilityState.busy` |
| Erro | `3:1262` | Mensagem "Usuário ou senha inválida. Pode tentar novamente?"; campos mantêm os valores; botão habilitado |
| Sucesso | — | Navega para as abas (sem frame próprio) |

## 4. Regras

1. **CPF**
   - Aceita só dígitos; qualquer outro caractere é descartado. Colar "123.456.789-09" ou "123 456 789 09" resulta nos mesmos 11 dígitos.
   - Máximo de 11 dígitos; o excedente é ignorado.
   - Máscara progressiva na UI (`000.000.000-00`); o valor de domínio é sempre a string de 11 dígitos.
   - Teclado numérico (`number-pad`) e `textContentType="username"`/`autoComplete="username"` para gerenciadores de senha.
2. **Senha**: `secureTextEntry`, sem `trim`, teclado padrão (o JSON tem senhas numéricas, mas não há regra que obrigue isso). O valor vive só no estado da tela e é descartado após o envio.
3. **Botão habilitado** quando o CPF tem 11 dígitos **e** a senha não está vazia (comportamento dos frames `3:1216` → `3:1246`).
4. **Validação no envio (D-13)**: CPF com dígito verificador inválido gera o mesmo erro genérico, sem consultar os dados. Credenciais que não batem geram o mesmo erro. A UI nunca indica qual campo está errado.
5. **Erro some** assim que o usuário edita qualquer campo.
6. **Envio duplo** é bloqueado enquanto carrega.
7. **Teclado**: o botão sobe junto com o teclado (`KeyboardAvoidingView`/insets); a ação "Concluir" do campo senha dispara o login se o botão estiver habilitado; "Próximo" no CPF leva o foco à senha.
8. **Sucesso**: salva `{ version, guardianId, selectedStudentRm: primeiro aluno }` e entra no estado `signedIn`.

## 5. Sessão

| Situação | Comportamento |
|---|---|
| App abre sem sessão salva | Login |
| App abre com sessão válida | Abas, com o aluno salvo selecionado, sem passar pelo Login |
| Sessão corrompida, versão desconhecida ou responsável inexistente | Limpa o storage e mostra o Login |
| RM salvo não pertence mais ao responsável | Seleciona o primeiro aluno e regrava |
| Durante a restauração | Tela preta vazia (D-14) |
| Toque em "SAIR" (D-03: barra `3:908` ou `17:14`) | Limpa o storage e volta ao Login com campos vazios; sem diálogo de confirmação (não existe no Figma) |
| Falha ao gravar no storage | Sessão segue em memória; nenhum dado pessoal em log |

## 6. Segurança

- Persistir apenas `guardianId` e `selectedStudentRm`.
- Nada de CPF, senha, nome ou e-mail em AsyncStorage, logs, mensagens de erro ou analytics.
- Comparação feita na camada de dados com o CPF normalizado; as entidades que chegam à UI não contêm CPF nem senha.
- A autenticação é simulada e não representa segurança de produção. Isso deve constar no README.

## 7. Critérios de aceite

- [ ] Com o campo CPF vazio ou incompleto, o botão fica desabilitado e o texto em `#777777`.
- [ ] Digitar 11 dígitos exibe `000.000.000-00`, e colar um CPF já mascarado produz o mesmo resultado.
- [ ] Com CPF completo + senha não vazia, o botão habilita (texto preto).
- [ ] Credenciais válidas do JSON levam às abas exibindo o primeiro aluno do responsável.
- [ ] Senha errada, CPF inexistente ou CPF com dígito verificador inválido exibem a mesma mensagem do Figma.
- [ ] Editar um campo após o erro remove a mensagem.
- [ ] Durante o carregamento, os campos e o botão não respondem e o estado é anunciado por acessibilidade.
- [ ] Fechar e reabrir o app com sessão ativa abre direto nas abas, no mesmo aluno.
- [ ] "SAIR" leva ao Login; reabrir o app depois disso também abre no Login.
- [ ] Nenhum CPF ou senha aparece no AsyncStorage (verificado em teste).

## 8. Testes previstos

- `cpf.ts`: `onlyDigits`, `formatCpf` progressivo, `isValidCpf` (válido, dígitos repetidos, tamanho errado, DV errado).
- `authenticateGuardian`: sucesso; senha errada; CPF inexistente; CPF inválido; CPF com máscara.
- `restoreSession`: sem sessão; válida; JSON corrompido; versão desconhecida; responsável inexistente; RM inexistente.
- `LoginScreen` (RNTL): habilitação do botão, máscara, loading, erro, limpeza do erro, sucesso.
- Navegação: sessão salva → abas; logout → Login.

## 9. Diferenças conhecidas em relação ao Figma

- Senha mascarada com o caractere nativo (bolinhas) em vez de asteriscos: manter `secureTextEntry` preserva gerenciadores de senha e leitores de tela.
- No iOS, o teclado numérico (`number-pad`) não tem tecla "Próximo"; o foco na senha é por toque.

## 10. Decisões aplicadas

- D-03: "SAIR" conforme as variantes do Figma (`3:908` com 2+ alunos, `17:14` com 1 aluno).
- D-04: latência de 800 ms; botão vazio durante o carregamento, como no Figma.
- D-06: dados servidos por datasource local assíncrono (ver `01-architecture.md` §4).
