const executorNavegador = (() => {
  let worker;
  let pronto = false;
  let pendentes = 0;
  let fila = Promise.resolve();

  function executar(pedido, informar) {
    return new Promise(resolve => {
      let tempo;
      const eraPronto = pronto;

      function concluir(resultado, interromper = false) {
        clearTimeout(tempo);
        if (worker) {
          worker.onmessage = null;
          worker.onerror = null;
          if (interromper) {
            worker.terminate();
            worker = undefined;
            pronto = false;
          }
        }
        resolve(resultado);
      }

      function falhar(estado, diagnostico) {
        concluir({ estado, saida: '', diagnostico }, true);
      }

      try {
        worker ??= new Worker('/compilador/worker.mjs', { type: 'module' });
        worker.onerror = () => falhar('erro_executor', 'O navegador não conseguiu iniciar o compilador.');
        worker.onmessage = ({ data }) => {
          if (data.fase === 'executar') {
            pronto = true;
            clearTimeout(tempo);
            informar?.('Executando código C…');
            tempo = setTimeout(() => falhar('tempo_execucao', 'O programa excedeu 1 segundo.'), 1000);
          } else if (data.fase === 'compilar') {
            informar?.(eraPronto ? 'Compilando código C…' : 'Preparando o compilador C na primeira execução…');
          } else if (data.resultado) {
            pronto = data.resultado.estado !== 'erro_executor';
            concluir(data.resultado, !pronto);
          }
        };
        informar?.(eraPronto ? 'Compilando código C…' : 'Preparando o compilador C na primeira execução…');
        tempo = setTimeout(() => {
          if (eraPronto) falhar('tempo_compilacao', 'A compilação excedeu 15 segundos.');
          else falhar('erro_executor', 'O compilador demorou para carregar. Confira a conexão e tente novamente.');
        }, eraPronto ? 15000 : 90000);
        worker.postMessage(pedido);
      } catch {
        falhar('erro_executor', 'Este navegador não conseguiu iniciar o compilador C.');
      }
    });
  }

  return {
    get podeVerificar() {
      return pronto && pendentes === 0;
    },
    enviar(pedido, informar) {
      pendentes += 1;
      const tentativa = fila.then(() => executar(pedido, informar)).finally(() => { pendentes -= 1; });
      fila = tentativa.catch(() => {});
      return tentativa;
    }
  };
})();
