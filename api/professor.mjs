import { createHash, pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { consultar, criarRanking, criarBase, listarXP, texto, zerarXP } from '../server/turso.mjs';

const derivar = promisify(pbkdf2);
const duracao = 8 * 60 * 60;
const tabelaProfessor = { sql: 'CREATE TABLE IF NOT EXISTS professor (id INTEGER PRIMARY KEY CHECK (id = 1), sal TEXT NOT NULL, hash TEXT NOT NULL)' };
const tabelaSessoes = { sql: 'CREATE TABLE IF NOT EXISTS sessoes_professor (token TEXT PRIMARY KEY, expira INTEGER NOT NULL)' };
const numero = value => ({ type: 'integer', value: String(value) });
const resumo = token => createHash('sha256').update(token).digest('hex');
const hashSenha = (senha, sal) => derivar(senha, Buffer.from(sal, 'hex'), 600000, 32, 'sha256');

function responder(status, dados = null, cookie) {
  const headers = { 'Cache-Control': 'no-store' };
  if (cookie !== undefined) {
    headers['Set-Cookie'] = `codlearn_professor=${cookie}; Path=/api/professor; HttpOnly; Secure; SameSite=Strict; Max-Age=${cookie ? duracao : 0}`;
  }
  return Response.json(dados, { status, headers });
}

export default async function professor(request) {
  if (!['GET', 'POST'].includes(request.method)) return responder(405);
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) return responder(503);
  let acao = 'listar';
  let senha;
  if (request.method === 'POST') {
    if (request.headers.get('origin') !== new URL(request.url).origin) return responder(403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return responder(415);
    const corpo = await request.text();
    if (Buffer.byteLength(corpo) > 1024) return responder(413);
    try {
      ({ acao, senha } = JSON.parse(corpo));
    } catch {
      return responder(400);
    }
    if (!['cadastrar', 'entrar', 'sair', 'resetar'].includes(acao)) return responder(400);
  }

  try {
    const [credencial] = await consultar([tabelaProfessor, tabelaSessoes, { sql: 'SELECT sal, hash FROM professor WHERE id = 1' }]);
    const agora = Math.floor(Date.now() / 1000);
    if (acao === 'cadastrar') {
      if (credencial) return responder(409);
      if (typeof senha !== 'string' || [...senha].length < 8 || [...senha].length > 128) return responder(400);
      const sal = randomBytes(16).toString('hex');
      const hash = (await hashSenha(senha, sal)).toString('hex');
      const gravado = await consultar([{
        sql: 'INSERT OR IGNORE INTO professor VALUES (1, ?, ?) RETURNING id',
        args: [texto(sal), texto(hash)]
      }]);
      if (gravado.length !== 1) return responder(409);
    } else if (!credencial) {
      return responder(428);
    } else if (acao === 'entrar') {
      if (typeof senha !== 'string' || [...senha].length > 128) return responder(401);
      const [sal, hash] = credencial;
      if (!timingSafeEqual(await hashSenha(senha, sal.value), Buffer.from(hash.value, 'hex'))) return responder(401);
    }

    if (acao === 'cadastrar' || acao === 'entrar') {
      const token = randomBytes(32).toString('hex');
      await consultar([
        { sql: 'DELETE FROM sessoes_professor WHERE expira <= ?', args: [numero(agora)] },
        { sql: 'INSERT INTO sessoes_professor VALUES (?, ?)', args: [texto(resumo(token)), numero(agora + duracao)] }
      ]);
      return responder(200, null, token);
    }

    const token = request.headers.get('cookie')?.match(/(?:^|;\s*)codlearn_professor=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (!token) return responder(401);
    const chave = texto(resumo(token));
    const sessao = await consultar([{
      sql: 'SELECT 1 FROM sessoes_professor WHERE token = ? AND expira > ?', args: [chave, numero(agora)]
    }]);
    if (!sessao.length) return responder(401);
    if (acao === 'sair') {
      await consultar([{ sql: 'DELETE FROM sessoes_professor WHERE token = ?', args: [chave] }]);
      return responder(200, null, '');
    }
    if (acao === 'resetar') {
      await consultar([criarRanking, criarBase, zerarXP]);
      return responder(200);
    }
    const linhas = await consultar([criarRanking, criarBase, { sql: listarXP }]);
    return responder(200, linhas.map(([, nome, xp]) => ({ nome: nome.value, pontos: Number(xp.value) })));
  } catch {
    return responder(503);
  }
}
