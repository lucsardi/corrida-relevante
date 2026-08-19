// ============================================================
// Envia o formulário de inscrição para uma planilha do Google Sheets
// (via Google Apps Script Web App) e depois redireciona a pessoa para
// a página de obrigado. Configurações ficam em js/config.js
// ============================================================

const form = document.getElementById('formInscricao');
const successAlert = document.getElementById('successAlert');
const submitBtn = form.querySelector('button[type="submit"]');

// ============================================================
// Vagas esgotadas: consulta o total de inscritos assim que a página
// carrega e, se já tiver atingido o limite configurado no Apps Script
// (var LIMITE_INSCRICOES em Code.gs), impede o modal de inscrição de
// abrir e mostra o modal "Inscrições encerradas" no lugar.
// ============================================================
let vagasEsgotadas = false;

fetch(EVENT_CONFIG.googleSheet.webAppUrl + '?action=contagem')
  .then(function (response) { return response.json(); })
  .then(function (result) {
    vagasEsgotadas = !!(result && result.esgotado);
  })
  .catch(function (err) {
    // Se a checagem falhar (ex: sem internet), deixamos o formulário
    // aberto normalmente — a planilha ainda bloqueia no envio, como
    // segunda camada de segurança (ver mais abaixo).
    console.warn('Não foi possível checar o número de vagas:', err);
  });

const encerradasModalEl = document.getElementById('encerradasModal');
document.getElementById('inscricaoModal').addEventListener('show.bs.modal', function (e) {
  if (vagasEsgotadas) {
    e.preventDefault();
    new bootstrap.Modal(encerradasModalEl).show();
  }
});

// ============================================================
// Campo "Participa de uma conexão?" — o dropdown "Qual?" fica sempre
// visível, mas só é habilitado quando a pessoa marca "Sim". O valor
// final é sincronizado com o campo oculto "empresa" (que é o que vai
// pra planilha).
// ============================================================
const conexaoRadios = document.querySelectorAll('input[name="participaConexao"]');
const conexaoQualSelect = document.getElementById('conexaoQualSelect');
const empresaHidden = document.getElementById('empresaHidden');

conexaoRadios.forEach(function (radio) {
  radio.addEventListener('change', function () {
    if (this.value === 'sim') {
      conexaoQualSelect.disabled = false;
      conexaoQualSelect.setAttribute('required', 'required');
      empresaHidden.value = conexaoQualSelect.value || '';
    } else {
      conexaoQualSelect.disabled = true;
      conexaoQualSelect.removeAttribute('required');
      conexaoQualSelect.value = '';
      conexaoQualSelect.classList.remove('is-invalid');
      empresaHidden.value = 'Não participa de uma conexão';
    }
  });
});

conexaoQualSelect.addEventListener('change', function () {
  empresaHidden.value = this.value;
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Validação extra: se marcou "Sim" mas não escolheu a conexão no dropdown
  if (conexaoQualSelect.hasAttribute('required') && !conexaoQualSelect.value) {
    conexaoQualSelect.classList.add('is-invalid');
    form.classList.add('was-validated');
    successAlert.style.display = 'none';
    return;
  }

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
    nivelMapas: form.nivelMapas.value,
    nivelFisico: form.nivelFisico.value
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
      if (result && result.status === 'encerrado') {
        // Segunda camada de segurança: mesmo que o modal tenha aberto
        // (ex: duas pessoas se inscrevendo ao mesmo tempo), a própria
        // planilha recusa depois que o limite é atingido.
        vagasEsgotadas = true;
        bootstrap.Modal.getInstance(document.getElementById('inscricaoModal')).hide();
        new bootstrap.Modal(encerradasModalEl).show();
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONFIRMAR INSCRIÇÃO →';
        return;
      }

      if (result && result.status !== 'success') {
        console.warn('A planilha retornou um erro ao salvar a inscrição:', result.message);
      }

      window.location.href = 'pagamento.html';
    })
    .catch(function (err) {
      // Se der erro de rede/CORS, não temos confirmação — mas não travamos
      // a pessoa na tela por isso (a planilha segue como segunda camada
      // de segurança quando a conexão for reestabelecida). Fica
      // registrado no console pra depuração.
      console.warn('Não foi possível confirmar o envio para a planilha:', err);
      window.location.href = 'pagamento.html';
    });
});

// Reseta o alerta e o botão ao reabrir o modal
document.getElementById('inscricaoModal').addEventListener('hidden.bs.modal', function () {
  successAlert.style.display = 'none';
  form.classList.remove('was-validated');
  submitBtn.disabled = false;
  submitBtn.textContent = 'CONFIRMAR INSCRIÇÃO →';

  // Reseta o campo "Participa de uma conexão?" pro estado inicial
  conexaoRadios.forEach(function (radio) { radio.checked = false; });
  conexaoQualSelect.disabled = true;
  conexaoQualSelect.removeAttribute('required');
  conexaoQualSelect.value = '';
  conexaoQualSelect.classList.remove('is-invalid');
  empresaHidden.value = '';
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