# CodLearn

Trilha introdutória de C para o primeiro ano técnico. A trilha tem oito missões jogáveis, divididas em onze etapas. Cada etapa vale 100 XP. Cada dica nova reduz em 10 XP a recompensa da etapa. Uma previsão correta no desafio rende 10 XP extras na conclusão. O nome exibido, os rascunhos e o progresso ficam no navegador. O ranking compartilhado usa um identificador aleatório, sem conta ou senha. O botão **Sair** encerra a partida no navegador. A próxima partida começa com outro nome, na primeira etapa, e as pontuações já registradas permanecem no ranking.

## Jogar no site

Na Vercel, o botão **Executar** usa Clang 21 em WebAssembly dentro de um Web Worker. O aluno abre o endereço publicado e joga no navegador, sem instalar GCC ou Python. O código e a entrada permanecem no navegador. Cada tentativa tem limite de execução de um segundo. O compilador é baixado do jsDelivr na primeira execução e reaproveitado pelo cache do navegador.

O worker usa [YoWASP Clang 21.1.4-3](https://www.npmjs.com/package/@yowasp/clang/v/21.1.4-3) e o [tiny-wasi-host](https://github.com/devtoolry/tiny-wasi-host/tree/b31a831b1271940d58f25a7b5ea8cb639c5bfca7), licenciado sob MIT. O host fornece entrada e saída em memória, sem abrir arquivos ou conexões de rede para o programa C.

## Rodar no Mac ou no laboratório

Baixe ou clone o repositório em cada computador. Com Python 3 e um compilador C disponíveis, abra o terminal na raiz do projeto.

No Mac:

```sh
python3 -B piloto/servidor.py --compilador clang
```

No Linux, para executar o C em cada computador e compartilhar o ranking:

```sh
python3 -B piloto/servidor.py --compilador gcc --ranking-url https://SEU-PROJETO.vercel.app
```

Troque a URL pelo endereço público da Vercel. Deixe o terminal aberto e acesse [CodLearn local](http://127.0.0.1:8765/) para usar o compilador instalado. Para testar o mesmo compilador do site na prévia, abra [CodLearn com Clang no navegador](http://127.0.0.1:8765/?executor=navegador). Abra `/professor` no endereço da Vercel para projetar o ranking compartilhado. Somente nome, identificador e XP vão para o ranking. Código, entrada, diagnósticos e rascunhos ficam no computador do aluno.

Sem `--compilador`, o Mac prefere Clang e o Linux prefere GCC, com o outro compilador como alternativa. No macOS, `/usr/bin/gcc` costuma chamar Clang. Para testar GNU GCC de verdade no Mac, indique o executável GNU instalado, por exemplo `--compilador gcc-15`.

Sem `--ranking-url`, o ranking usa `piloto/ranking.sqlite3`, criado automaticamente. O banco local e o Turso são independentes. O servidor local escuta apenas em `127.0.0.1`. A execução de C usa as permissões da conta que iniciou o jogo, como no terminal do laboratório. Use uma conta de aluno, sem privilégios administrativos. O limite de tempo não isola arquivos e processos da conta.

## Publicar na Vercel

Importe o repositório GitHub pela Vercel com o preset **Other**. A raiz do repositório é a raiz do projeto. O `vercel.json` publica `public/` e as funções da pasta `api/`. Não há comando de build. O compilador do navegador não requer credenciais. Configure as duas variáveis do Turso em **Production** para ativar o ranking e o painel do professor.

| Variável | Função |
| --- | --- |
| `TURSO_DATABASE_URL` | URL `libsql://` ou `https://` do banco Turso (compatível com SQLite) |
| `TURSO_AUTH_TOKEN` | Token do banco Turso com permissão de escrita |

A função de ranking cria a tabela no Turso na primeira chamada. As pontuações existentes no navegador são enviadas ao abrir o ranking, se estiver aberto pelo mesmo endereço onde foram obtidas.

### API legada do executor remoto

A função `/api/executar` permanece disponível para integrações que usem um executor separado. Configure `CODLEARN_RUNNER_URL` e `CODLEARN_RUNNER_TOKEN` somente nesse caso. Ela chama o executor via POST JSON autenticado. Envia `codigo` (texto C), `entrada` (stdin) e `apenas_verificar` (booleano). O modo de verificação deve fazer a análise de sintaxe sem rodar o programa e aceitar um arquivo sem `main`. Retorne JSON com `estado`, `saida` e `diagnostico`, todos strings. Os estados aceitos são `ok`, `erro_compilacao`, `erro_execucao`, `tempo_compilacao`, `tempo_execucao` e `erro_executor`. Para destacar a linha, envie diagnósticos do Clang no formato `missao.c:linha:coluna: error: mensagem`.

O executor isolado é um serviço externo e precisa ser provisionado. Exija o token e limite chamadas, CPU, memória, tempo e saída. Execute sem rede e sem acesso aos dados do host. O script Python de desenvolvimento fica fora da pasta publicada.

O ranking recebe a pontuação calculada no navegador e serve para incentivar a prática em sala. Ele não é um registro de avaliação. Evite nomes completos em uma publicação aberta.

## Verificar o executor local

```sh
python3 -B piloto/testar.py --compilador clang
python3 -B piloto/testar.py --compilador gcc
```

## Painel do professor

Abra `/professor` e cadastre a senha no primeiro acesso, antes de compartilhar o endereço com a turma. O banco guarda somente um hash com salt. O cadastro inicial não usa variável de ambiente para senha. Na Vercel, as variáveis de conexão do Turso continuam necessárias.

O painel lista todos os jogadores com XP no placar e atualiza a cada três segundos. **Zerar ranking** retira do placar os XP já registrados e passa a contar os XP ganhos depois do reset. A partida dos alunos e os rascunhos continuam no navegador. Pontos que ainda não chegaram ao servidor quando o professor zera podem aparecer ao serem sincronizados.
