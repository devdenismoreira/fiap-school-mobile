# Feature — Identificação e seleção de aluno

> Status: **aprovada e implementada** (T05, T06) · Figma: página "Mudança de Aluno" (`2:5`) e cabeçalho (`3:930`, variantes `3:908`, `17:14`)

## 1. Objetivo

Exibir quem está logado e qual aluno está sendo visualizado, e permitir trocar o aluno numa rota acima das abas, voltando à tela de origem com os dados atualizados.

## 2. Cabeçalho (`AppActionBar` e `StudentGreeting`) — Agenda e Boletim

| Elemento | Conteúdo | Estilo |
|---|---|---|
| Barra de ações (48 pt) | Logo 100 × 16 à esquerda (margem 16); ações à direita (margem 16) | Fundo `background` |
| Ações (D-03 ✅) | 2+ alunos: "TROCAR PERFIL" e "SAIR" + ícone logout 10 pt, espaçados 24 pt (variante `3:908`). 1 aluno: só "SAIR" (variante `17:14`) | `caption` |
| Saudação | "Olá, " + `guardian.firstName` em caixa alta e negrito | `greeting` |
| Nome do aluno | `student.firstName` em caixa alta | `bodyMedium` |
| Info do aluno | `` `${className} - RM ${rm} - ${shift}` `` (ex.: "7EF - RM 12567 - Matutino") | `body` |

Medidas: saudação 16 pt abaixo da barra (topo 64); nome do aluno 36 pt abaixo da saudação (topo 129); info 8 pt abaixo do nome. Tudo centralizado.

## 3. Tela "Mudança de aluno" (`2:5`)

| Elemento | Conteúdo | Estilo |
|---|---|---|
| Ação fechar | "FECHAR" + ícone ✕ (24 pt), canto superior direito, margem 16, gap 8 | `bodyBold`, `primary` |
| Título | "Escolha o perfil" / "que você quer visualizar" (2 linhas), centralizado, topo a 209 pt | `headline` |
| Lista | Um `StudentCard` por aluno, 64 pt abaixo do título, gap 16, margens 16 | — |
| `StudentCard` | Nome completo em caixa alta ("RAFAEL DA SILVA") + "7EF - RM 12567 - Matutino"; 90 pt de altura, padding 16 | `surfaceRaised`, raio 8; selecionado: borda 1 pt `primary` |

## 4. Regras

1. "TROCAR PERFIL" abre `StudentSelection` (modal no RootStack, acima das abas).
2. O card do aluno atual aparece com borda `primary`; a ordem dos cards segue o JSON.
3. Tocar num card:
   - se for outro aluno: atualiza `selectedStudentRm` no contexto, persiste e fecha (`goBack`);
   - se for o aluno atual: apenas fecha.
4. "FECHAR" (ou o voltar do Android / gesto de fechar) fecha sem alterar nada.
5. Ao voltar, a aba de origem (Agenda ou Boletim) continua ativa e passa a mostrar os dados do novo aluno.
6. Estado das telas após a troca (proposta):
   - **Agenda**: mantém a mesma data selecionada se ela existir na agenda do novo aluno; senão, aplica a regra de dia inicial (D-02).
   - **Boletim**: volta ao primeiro boletim do novo aluno (ordem do JSON, D-01), com todos os acordeões recolhidos (os anos variam por aluno).
7. Responsável com 1 aluno: "TROCAR PERFIL" oculto, usando a variante `17:14` do Figma (D-03). A rota continua acessível por código, mas não é exposta.
8. Responsável sem alunos (não ocorre no JSON): após o login, mostrar o cabeçalho só com a saudação e "SAIR", e as abas com seus estados vazios. Proposta defensiva, sem novo visual.
9. O aluno selecionado vive **apenas** no contexto de sessão; as telas não guardam cópia própria.

## 5. Animações

- Abertura/fechamento: `slide_from_bottom` (native-stack).
- Press no card: opacidade 0,7.
- Troca da borda de seleção: transição de cor `fast` (150 ms), visível só se a tela permanecer aberta.

## 6. Acessibilidade

- Cards com `accessibilityRole="radio"` e `accessibilityState={{ checked }}`; rótulo "Rafael da Silva, 7EF, RM 12567, Matutino".
- "FECHAR" com `accessibilityRole="button"` e `hitSlop` para 44 pt.
- Foco inicial no título ao abrir a tela.

## 7. Critérios de aceite

- [ ] O cabeçalho mostra o primeiro nome do responsável e o nome/turma/RM/período do aluno selecionado, em ambas as abas.
- [ ] "TROCAR PERFIL" abre a tela de seleção por cima das abas.
- [ ] O aluno atual aparece destacado com borda `#29F4D5`.
- [ ] Selecionar outro aluno fecha a tela e a aba de origem passa a exibir os dados dele (cabeçalho + conteúdo).
- [ ] "FECHAR" e o voltar do Android fecham sem mudar o aluno.
- [ ] O aluno escolhido persiste após fechar e reabrir o app.
- [ ] Para o responsável com 1 aluno, "TROCAR PERFIL" não aparece e a barra fica igual à variante `17:14`.

## 8. Testes previstos

- `SessionProvider.selectStudent`: atualiza o estado e persiste; RM inválido é ignorado.
- `StudentSelectionScreen` (RNTL): lista os alunos, marca o selecionado, troca e chama `goBack`, FECHAR não altera.
- Integração: na aba Boletim, trocar aluno → volta ao Boletim com o cabeçalho do novo aluno.
