// ============================================================
// Envia o formulário de inscrição para uma planilha do Google Sheets
// (via Google Apps Script Web App) e depois redireciona a pessoa para
// a página de obrigado. Configurações ficam em js/config.js
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

  const values = {
    nome: form.nome.value,
    email: form.email.value,
    telefone: form.telefone.value,
    empresa: form.empresa.value,
    trilha: form.trilha.value,
    origem: form.origem.value,
    mensagem: form.mensagem.value
  };

  // Guarda os dados localmente também, como backup (aparece no console
  // e pode ser consultado em sessionStorage se precisar depurar).
  try {
    sessionStorage.setItem('ultimaInscricao', JSON.stringify(values));
  } catch (err) {
    // sessionStorage pode falhar em alguns navegadores/modos privados — sem problema, segue o fluxo.
  }

  // Content-Type "text/plain" evita que o navegador dispare uma requisição
  // de preflight (OPTIONS) antes do POST — o Apps Script não responde bem
  // a preflight, então essa é a forma padrão de contornar isso. O Apps
  // Script lê o corpo normalmente como JSON, independente do Content-Type.
  fetch(EVENT_CONFIG.googleSheet.webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(values)
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      if (result && result.status !== 'success') {
        console.warn('A planilha retornou um erro ao salvar a inscrição:', result.message);
      }
    })
    .catch(function (err) {
      // Se der erro de rede/CORS, não temos confirmação — mas não travamos
      // a pessoa na tela por isso. Fica registrado no console pra depuração.
      console.warn('Não foi possível confirmar o envio para a planilha:', err);
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

