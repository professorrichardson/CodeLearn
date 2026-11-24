# CodLearn

Trilha introdutória de C para o primeiro ano técnico. A trilha tem oito missões jogáveis, divididas em onze etapas. Cada etapa vale 100 XP. Cada dica nova reduz em 10 XP a recompensa da etapa. Uma previsão correta no desafio rende 10 XP extras na conclusão. O nome exibido, os rascunhos e o progresso ficam no navegador. O ranking compartilhado usa um identificador aleatório, sem conta ou senha. O botão **Sair** encerra a partida no navegador. A próxima partida começa com outro nome, na primeira etapa, e as pontuações já registradas permanecem no ranking.

## Rodar no Mac

Com Python 3 e Clang instalados, execute a partir da raiz do projeto:

```sh
python3 -B piloto/servidor.py
```

Abra [CodLearn local](http://127.0.0.1:8765/). O piloto local executa C com as permissões do usuário. Use apenas código próprio e confiável. O ranking local fica em `piloto/ranking.sqlite3`, criado automaticamente. O banco guarda a maior pontuação por identificador e lista os 20 melhores resultados.

## Publicar na Vercel

Suba a pasta para o GitHub e importe o repositório pela Vercel com o preset **Other**. A raiz do repositório é a raiz do projeto. O `vercel.json` publica `public/` e as funções da pasta `api/`. Não há comando de build. Configure as variáveis de `.env.example` no ambiente da Vercel antes do deploy.

| Variável | Função |
| --- | --- |
| `CODLEARN_RUNNER_URL` | URL HTTPS de um executor C isolado, acessível pela Vercel |
| `CODLEARN_RUNNER_TOKEN` | Token Bearer do executor |
| `TURSO_DATABASE_URL` | URL `libsql://` ou `https://` do banco Turso (compatível com SQLite) |
| `TURSO_AUTH_TOKEN` | Token do banco Turso com permissão de escrita |

A função de ranking cria a tabela no Turso na primeira chamada. O banco remoto e o arquivo SQLite local são independentes. As pontuações existentes no navegador são enviadas ao abrir o ranking.

### Contrato do executor online

A função `/api/executar` recebe o código do navegador e chama o executor via POST JSON autenticado. Envia `codigo` (texto C), `entrada` (stdin) e `apenas_verificar` (booleano). O modo de verificação deve fazer a análise de sintaxe sem rodar o programa e aceitar um arquivo sem `main`. Retorne JSON com `estado`, `saida` e `diagnostico`, todos strings. Os estados aceitos são `ok`, `erro_compilacao`, `erro_execucao`, `tempo_compilacao`, `tempo_execucao` e `erro_executor`. Para destacar a linha, envie diagnósticos do Clang no formato `missao.c:linha:coluna: error: mensagem`.

O executor isolado é um serviço externo e precisa ser provisionado. Exija o token e limite chamadas, CPU, memória, tempo e saída. Execute sem rede e sem acesso aos dados do host. O script Python de desenvolvimento fica fora da pasta publicada.

O ranking recebe a pontuação calculada no navegador e serve para incentivar a prática em sala. Ele não é um registro de avaliação. Evite nomes completos em uma publicação aberta.

## Verificar o executor local

```sh
python3 -B piloto/testar.py
```

## Painel do professor

Abra `/professor` e cadastre a senha no primeiro acesso, antes de compartilhar o endereço com a turma. O banco guarda somente um hash com salt. O cadastro inicial não usa variável de ambiente para senha. Na Vercel, as variáveis de conexão do Turso continuam necessárias.

O painel lista todos os jogadores com XP no placar e atualiza a cada três segundos. **Zerar ranking** retira do placar os XP já registrados e passa a contar os XP ganhos depois do reset. A partida dos alunos e os rascunhos continuam no navegador. Pontos que ainda não chegaram ao servidor quando o professor zera podem aparecer ao serem sincronizados.
