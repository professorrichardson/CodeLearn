import { consultar, criarRanking, criarBase, listarXP } from '../server/turso.mjs';

export default async function ranking(request) {
  if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405 });
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return new Response(null, { status: 503 });
  }

  try {
    const instrucoes = [criarRanking, criarBase];
    let identificador;
    if (request.method === 'POST') {
      if (request.headers.get('origin') !== new URL(request.url).origin) {
        return new Response(null, { status: 403 });
      }
      if (!request.headers.get('content-type')?.startsWith('application/json')) {
        return new Response(null, { status: 415 });
      }
      const texto = await request.text();
      if (Buffer.byteLength(texto) > 1024) return new Response(null, { status: 413 });
      let jogador;
      try {
        jogador = JSON.parse(texto);
      } catch {
        return new Response(null, { status: 400 });
      }
      const { id, nome, pontos } = jogador ?? {};
      if (typeof id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id) ||
          typeof nome !== 'string' || !nome.trim() || nome.length > 32 || /[\x00-\x1f\x7f]/.test(nome) ||
          !Number.isInteger(pontos) || pontos < 70 || pontos > 1200 || pontos % 10 !== 0) {
        return new Response(null, { status: 400 });
      }
      identificador = id;
      instrucoes.push({
        sql: `
          INSERT INTO ranking (id, nome, pontos) VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET pontos = excluded.pontos
          WHERE excluded.pontos > ranking.pontos
        `,
        args: [
          { type: 'text', value: id },
          { type: 'text', value: nome.trim() },
          { type: 'integer', value: String(pontos) }
        ]
      });
    }
    const dados = await consultar([...instrucoes, { sql: listarXP + ' LIMIT 20' }]);
    const linhas = dados.map(([id, nome, pontos]) => ({
      nome: nome.value,
      pontos: Number(pontos.value),
      ...(id.value === identificador ? { meu: true } : {})
    }));
    return Response.json(linhas, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(null, { status: 502 });
  }
}
