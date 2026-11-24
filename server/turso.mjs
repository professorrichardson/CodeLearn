export async function consultar(instrucoes) {
  const base = new URL(process.env.TURSO_DATABASE_URL.replace(/^libsql:/, 'https:'));
  if (base.protocol !== 'https:') throw new Error('Banco remoto requer HTTPS');
  const resposta = await fetch(new URL('/v2/pipeline', base), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TURSO_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [...instrucoes.map(stmt => ({ type: 'execute', stmt })), { type: 'close' }]
    }),
    redirect: 'error',
    signal: AbortSignal.timeout(5000)
  });
  if (!resposta.ok) throw new Error('Ranking indisponível');
  const { results } = await resposta.json();
  if (results.some(resultado => resultado.type !== 'ok')) {
    throw new Error('Comando do ranking rejeitado');
  }
  return results[instrucoes.length - 1].response.result.rows;
}

export const criarRanking = { sql: 'CREATE TABLE IF NOT EXISTS ranking (id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, pontos INTEGER NOT NULL)' };
export const criarBase = { sql: 'CREATE TABLE IF NOT EXISTS ranking_base (id TEXT PRIMARY KEY NOT NULL, pontos INTEGER NOT NULL)' };
export const listarXP = 'SELECT r.id, r.nome, r.pontos - coalesce(b.pontos, 0) AS xp FROM ranking r LEFT JOIN ranking_base b ON r.id = b.id WHERE r.pontos > coalesce(b.pontos, 0) ORDER BY xp DESC, r.id ASC';
export const zerarXP = { sql: 'INSERT OR REPLACE INTO ranking_base (id, pontos) SELECT id, pontos FROM ranking' };
export const texto = value => ({ type: 'text', value });
