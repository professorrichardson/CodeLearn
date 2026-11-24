import { createWasi } from './wasi-host.mjs';

const pacote = 'https://cdn.jsdelivr.net/npm/@yowasp/clang@21.1.4-3/gen/bundle.js';
const limiteSaida = 16384;
let ferramenta;
let ultimoPrograma;

function coletarBytes() {
  const decoder = new TextDecoder();
  let texto = '';
  return {
    escrever(bytes) {
      if (bytes && texto.length < limiteSaida) {
        texto += decoder.decode(bytes, { stream: true }).slice(0, limiteSaida - texto.length);
      }
    },
    ler: () => texto + decoder.decode()
  };
}

async function compilar(codigo, apenasVerificar) {
  if (!apenasVerificar && ultimoPrograma?.codigo === codigo) return ultimoPrograma;
  const stderr = coletarBytes();
  const flags = apenasVerificar
    ? ['-fsyntax-only']
    : ['-Wl,--max-memory=67108864', '-o', 'missao.wasm'];
  let arquivos;
  try {
    arquivos = await ferramenta.commands.clang(
      ['-std=c17', '-Wall', '-Wextra', '-fno-color-diagnostics', ...flags, 'missao.c'],
      { 'missao.c': codigo },
      { stderr: stderr.escrever, decodeASCII: false }
    );
  } catch (erro) {
    if (!(erro instanceof ferramenta.Exit)) throw erro;
    return { estado: 'erro_compilacao', diagnostico: stderr.ler() };
  }
  const diagnostico = stderr.ler();
  if (apenasVerificar) return { estado: 'ok', diagnostico };
  const binario = arquivos?.['missao.wasm'];
  if (!binario) return { estado: 'erro_compilacao', diagnostico };

  // Cada entrada do exercício roda em uma instância nova do mesmo módulo.
  ultimoPrograma = { codigo, modulo: await WebAssembly.compile(binario), estado: 'ok', diagnostico };
  return ultimoPrograma;
}

self.onmessage = async ({ data: { codigo, entrada, apenasVerificar } }) => {
  let saida = '';
  let diagnostico = '';
  let fase = 'preparar';
  let estado = 'erro_executor';
  try {
    ferramenta ??= await import(pacote);
    fase = 'compilar';
    self.postMessage({ fase });
    const resultado = await compilar(codigo, apenasVerificar);
    ({ estado, diagnostico } = resultado);
    if (resultado.modulo) {
      const wasi = createWasi({
        args: ['missao'],
        stdin: new TextEncoder().encode(entrada),
        write(fd, texto) {
          if (fd === 1) saida += texto.slice(0, limiteSaida - saida.length);
          else diagnostico += texto.slice(0, limiteSaida - diagnostico.length);
        }
      });
      const instancia = await WebAssembly.instantiate(resultado.modulo, wasi.imports);
      fase = 'executar';
      self.postMessage({ fase });
      estado = wasi.start(instancia) === 0 ? 'ok' : 'erro_execucao';
    }
  } catch (erro) {
    estado = fase === 'executar' ? 'erro_execucao' : 'erro_executor';
    diagnostico += fase === 'preparar'
      ? 'Não foi possível baixar o compilador. Confira a conexão e tente novamente.'
      : String(erro.message ?? erro).slice(0, limiteSaida - diagnostico.length);
  }
  self.postMessage({ resultado: { estado, saida, diagnostico } });
};
