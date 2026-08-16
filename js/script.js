// ============================================================
// Envia o formulário de inscrição para o Google Forms e depois
// redireciona a pessoa para a página de obrigado.
// Configurações (URL do form, IDs dos campos) ficam em js/config.js
// ============================================================

const form = document.getElementById('formInscricao');
const successAlert = document.getElementById('successAlert');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    successAlert.style.display = 'none';
    return;
  }

  // Trava o botão pra evitar duplo envio enquanto processa
  submitBtn.disabled = true;
  submitBtn.textContent = 'ENVIANDO...';

  // Monta o corpo da requisição usando os entry.IDs configurados em config.js
  const payload = new FormData();
  const values = {
    nome: form.nome.value,
    email: form.email.value,
    telefone: form.telefone.value,
    empresa: form.empresa.value,
    trilha: form.trilha.value,
    origem: form.origem.value,
    mensagem: form.mensagem.value
  };

  Object.keys(values).forEach((key) => {
    const entryId = EVENT_CONFIG.googleForm.fields[key];
    if (entryId) {
      payload.append(entryId, values[key] || '');
    }
  });

  // Guarda os dados localmente também, como backup (aparece no console
  // e pode ser consultado em sessionStorage se precisar depurar).
  try {
    sessionStorage.setItem('ultimaInscricao', JSON.stringify(values));
  } catch (err) {
    // sessionStorage pode falhar em alguns navegadores/modos privados — sem problema, segue o fluxo.
  }

  // Google Forms não responde com cabeçalhos CORS, então usamos "no-cors":
  // a requisição é enviada normalmente, mas não conseguimos ler a resposta.
  // Por isso redirecionamos sempre no ".finally", sem depender do retorno.
  fetch(EVENT_CONFIG.googleForm.actionUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: payload
  })
    .catch(function () {
      // Erro de rede não deve travar o usuário na tela — seguimos para o redirecionamento.
    })
    .finally(function () {
      window.location.href = 'obrigado.html';
    });
});

// Reseta o alerta e o botão ao reabrir o modal
document.getElementById('inscricaoModal').addEventListener('hidden.bs.modal', function () {
  successAlert.style.display = 'none';
  form.classList.remove('was-validated');
  submitBtn.disabled = false;
  submitBtn.textContent = 'CONFIRMAR INSCRIÇÃO →';
});

// ============================================================
// Modal do teaser (vídeo): toca ao abrir, pausa e reinicia ao fechar
// ============================================================
const teaserModalEl = document.getElementById('teaserModal');
const teaserVideo = document.getElementById('teaserVideo');

if (teaserModalEl && teaserVideo) {
  teaserModalEl.addEventListener('shown.bs.modal', function () {
    teaserVideo.play().catch(function () {
      // Alguns navegadores bloqueiam autoplay com som — a pessoa dá play manual pelos controles.
    });
  });

  teaserModalEl.addEventListener('hidden.bs.modal', function () {
    teaserVideo.pause();
    teaserVideo.currentTime = 0;
  });
}

