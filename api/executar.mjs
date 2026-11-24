export default async function executar(request) {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return new Response(null, { status: 415 });
  }

  const url = process.env.CODLEARN_RUNNER_URL;
  const token = process.env.CODLEARN_RUNNER_TOKEN;
  if (!url || !token) return new Response(null, { status: 503 });

  const corpo = await request.text();
  if (Buffer.byteLength(corpo) > 65536) return new Response(null, { status: 413 });

  let pedido;
  try {
    pedido = JSON.parse(corpo);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof pedido?.codigo !== 'string' || typeof pedido.entrada !== 'string' ||
      typeof pedido.apenas_verificar !== 'boolean') return new Response(null, { status: 400 });

  try {
    if (new URL(url).protocol !== 'https:') return new Response(null, { status: 503 });
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: pedido.codigo,
        entrada: pedido.entrada,
        apenas_verificar: pedido.apenas_verificar
      }),
      redirect: 'error',
      signal: AbortSignal.timeout(10000)
    });
    if (!resposta.ok) return new Response(null, { status: 502 });
    const { estado, saida, diagnostico } = await resposta.json();
    if (!['ok', 'erro_compilacao', 'erro_execucao', 'tempo_compilacao', 'tempo_execucao', 'erro_executor'].includes(estado) ||
        typeof saida !== 'string' || typeof diagnostico !== 'string') {
      return new Response(null, { status: 502 });
    }
    return Response.json({ estado, saida: saida.slice(0, 16384), diagnostico: diagnostico.slice(0, 16384) });
  } catch {
    return new Response(null, { status: 502 });
  }
}
