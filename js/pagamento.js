// ============================================================
// Página de pagamento: preenche a chave Pix e o valor a partir do
// config.js, recupera os dados da última inscrição (salvos no
// sessionStorage pelo script.js) para identificar a pessoa, e envia
// o comprovante de pagamento pro Apps Script (que salva no Google
// Drive e marca "Pago" na planilha).
// ============================================================

const paymentAmountEl = document.getElementById('paymentAmount');
const pixKeyInput = document.getElementById('pixKeyInput');
const pixOwnerNameEl = document.getElementById('pixOwnerName');
const copyPixBtn = document.getElementById('copyPixBtn');
const registrantNote = document.getElementById('registrantNote');
const registrantNameEl = document.getElementById('registrantName');
const formComprovante = document.getElementById('formComprovante');
const comprovanteInput = document.getElementById('comprovanteInput');
const fileNamePreview = document.getElementById('fileNamePreview');
const submitComprovanteBtn = document.getElementById('submitComprovanteBtn');
const paymentError = document.getElementById('paymentError');

// Preenche valor, chave Pix e nome do titular a partir do config.js
paymentAmountEl.textContent = EVENT_CONFIG.payment.amount;
pixKeyInput.value = EVENT_CONFIG.payment.pixKey;
pixOwnerNameEl.textContent = 'Titular: ' + EVENT_CONFIG.payment.pixKeyOwnerName;

// Recupera os dados da inscrição feita no site (salvos pelo js/script.js)
// pra identificar de quem é esse comprovante.
let inscricaoAtual = null;
try {
  const dadosSalvos = sessionStorage.getItem('ultimaInscricao');
  if (dadosSalvos) {
    inscricaoAtual = JSON.parse(dadosSalvos);
  }
} catch (err) {
  inscricaoAtual = null;
}

if (inscricaoAtual && inscricaoAtual.nome) {
  registrantNameEl.textContent = inscricaoAtual.nome;
  registrantNote.style.display = 'block';
}

// Botão "Copiar chave"
copyPixBtn.addEventListener('click', function () {
  pixKeyInput.select();
  pixKeyInput.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(pixKeyInput.value).then(function () {
    copyPixBtn.textContent = 'COPIADO!';
    copyPixBtn.classList.add('copied');
    setTimeout(function () {
      copyPixBtn.textContent = 'COPIAR CHAVE';
      copyPixBtn.classList.remove('copied');
    }, 2000);
  }).catch(function () {
    // Fallback pra navegadores sem suporte à Clipboard API
    document.execCommand('copy');
  });
});

// Mostra o nome do arquivo selecionado
comprovanteInput.addEventListener('change', function () {
  if (this.files && this.files[0]) {
    fileNamePreview.textContent = '📎 ' + this.files[0].name;
    fileNamePreview.style.display = 'block';
  } else {
    fileNamePreview.style.display = 'none';
  }
});

// Converte um arquivo em base64 (sem o prefixo "data:...;base64,")
function lerArquivoComoBase64(arquivo) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const resultado = reader.result;
      const base64 = resultado.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
}

formComprovante.addEventListener('submit', function (e) {
  e.preventDefault();
  paymentError.style.display = 'none';

  const arquivo = comprovanteInput.files[0];

  if (!arquivo) {
    comprovanteInput.classList.add('is-invalid');
    return;
  }

  const LIMITE_TAMANHO = 5 * 1024 * 1024; // 5MB
  if (arquivo.size > LIMITE_TAMANHO) {
    paymentError.textContent = 'O arquivo é maior que 5MB. Tente uma foto mais leve ou um PDF menor.';
    paymentError.style.display = 'block';
    return;
  }

  submitComprovanteBtn.disabled = true;
  submitComprovanteBtn.textContent = 'ENVIANDO...';

  lerArquivoComoBase64(arquivo)
    .then(function (base64) {
      const payload = {
        tipo: 'comprovante',
        nome: (inscricaoAtual && inscricaoAtual.nome) || '',
        email: (inscricaoAtual && inscricaoAtual.email) || '',
        fileName: arquivo.name,
        mimeType: arquivo.type || 'application/octet-stream',
        fileBase64: base64
      };

      return fetch(EVENT_CONFIG.googleSheet.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      if (!result || result.status !== 'success') {
        throw new Error((result && result.message) || 'Erro desconhecido ao salvar o comprovante.');
      }
      // Sucesso confirmado pela planilha — segue pra página de obrigado.
      window.location.href = 'obrigado.html';
    })
    .catch(function (err) {
      console.warn('Erro ao enviar o comprovante:', err);
      paymentError.textContent = 'Não conseguimos confirmar o envio do comprovante. Verifique sua conexão e tente novamente.';
      paymentError.style.display = 'block';
      submitComprovanteBtn.disabled = false;
      submitComprovanteBtn.textContent = 'ENVIAR COMPROVANTE →';
    });
});