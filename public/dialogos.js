function abrirAviso({ titulo, texto, confirmar }) {
  const anterior = document.querySelector('#aviso-codlearn');
  if (anterior) return Promise.resolve(false);

  const modal = document.createElement('dialog');
  modal.id = 'aviso-codlearn';
  modal.setAttribute('aria-labelledby', 'aviso-titulo');
  modal.setAttribute('aria-describedby', 'aviso-texto');

  const cabecalho = document.createElement('h2');
  cabecalho.id = 'aviso-titulo';
  cabecalho.textContent = titulo;
  const descricao = document.createElement('p');
  descricao.id = 'aviso-texto';
  descricao.textContent = texto;

  const form = document.createElement('form');
  form.method = 'dialog';
  const voltar = document.createElement('button');
  voltar.textContent = confirmar ? 'Cancelar' : 'Entendi';
  voltar.value = 'voltar';
  voltar.autofocus = true;
  form.append(voltar);

  if (confirmar) {
    const acao = document.createElement('button');
    acao.className = 'acao-destrutiva';
    acao.textContent = confirmar;
    acao.value = 'confirmar';
    form.append(acao);
  }

  modal.append(cabecalho, descricao, form);
  document.body.append(modal);

  return new Promise(resolve => {
    modal.addEventListener('close', () => {
      const confirmado = modal.returnValue === 'confirmar';
      modal.remove();
      resolve(confirmado);
    }, { once: true });
    modal.showModal();
  });
}
