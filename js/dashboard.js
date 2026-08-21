// ============================================================
// Dashboard de inscrições. Busca os dados agregados no Apps Script
// (?action=dashboard&token=...) e renderiza os cards/tabelas. Atualiza
// sozinho a cada 30 segundos, e também tem botão de atualizar manual.
// ============================================================

const TOKEN_STORAGE_KEY = 'dashboardToken';
const AUTO_REFRESH_MS = 30000;

const tokenGate = document.getElementById('tokenGate');
const tokenInput = document.getElementById('tokenInput');
const tokenSubmitBtn = document.getElementById('tokenSubmitBtn');
const tokenErrorMsg = document.getElementById('tokenErrorMsg');
const dashboardContent = document.getElementById('dashboardContent');
const refreshBtn = document.getElementById('refreshBtn');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dashboardBody = document.getElementById('dashboardBody');

let autoRefreshTimer = null;

// ---------------------------------------------------------------
// Autenticação simples por token (armazenado no navegador)
// ---------------------------------------------------------------
function tentarEntrar() {
  const token = tokenInput.value.trim();
  if (!token) return;

  tokenSubmitBtn.disabled = true;
  tokenSubmitBtn.textContent = 'ENTRANDO...';

  buscarDashboard(token)
    .then(function (dados) {
      if (dados.status === 'error') {
        tokenErrorMsg.style.display = 'block';
        tokenSubmitBtn.disabled = false;
        tokenSubmitBtn.textContent = 'ENTRAR';
        return;
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      mostrarDashboard();
      renderizarDashboard(dados);
      iniciarAutoRefresh();
    })
    .catch(function () {
      tokenErrorMsg.textContent = 'Não conseguimos conectar. Tente de novo.';
      tokenErrorMsg.style.display = 'block';
      tokenSubmitBtn.disabled = false;
      tokenSubmitBtn.textContent = 'ENTRAR';
    });
}

tokenSubmitBtn.addEventListener('click', tentarEntrar);
tokenInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') tentarEntrar();
});

function mostrarDashboard() {
  tokenGate.style.display = 'none';
  dashboardContent.style.display = 'block';
}

// ---------------------------------------------------------------
// Busca os dados no Apps Script
// ---------------------------------------------------------------
function buscarDashboard(token) {
  const url = EVENT_CONFIG.googleSheet.webAppUrl + '?action=dashboard&token=' + encodeURIComponent(token);
  return fetch(url).then(function (response) { return response.json(); });
}

function carregarDashboard(primeiraVez) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return;

  errorState.style.display = 'none';

  if (primeiraVez) {
    loadingState.style.display = 'block';
    dashboardBody.style.display = 'none';
  }

  buscarDashboard(token)
    .then(function (dados) {
      if (dados.status === 'error') {
        // Token guardado não é mais válido — volta pra tela de senha.
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        tokenGate.style.display = 'flex';
        dashboardContent.style.display = 'none';
        pararAutoRefresh();
        return;
      }
      renderizarDashboard(dados);
    })
    .catch(function () {
      dashboardBody.style.display = 'none';
      loadingState.style.display = 'none';
      errorState.style.display = 'block';
    });
}

refreshBtn.addEventListener('click', function () {
  refreshBtn.disabled = true;
  refreshBtn.textContent = '↻ ATUALIZANDO...';
  Promise.resolve(carregarDashboard()).finally(function () {
    setTimeout(function () {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '↻ ATUALIZAR';
    }, 500);
  });
});

function iniciarAutoRefresh() {
  pararAutoRefresh();
  autoRefreshTimer = setInterval(carregarDashboard, AUTO_REFRESH_MS);
}

function pararAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
}

// ---------------------------------------------------------------
// Renderização
// ---------------------------------------------------------------
function renderizarDashboard(dados) {
  loadingState.style.display = 'none';
  errorState.style.display = 'none';
  dashboardBody.style.display = 'block';

  document.getElementById('updatedAt').textContent =
    'Atualizado em ' + new Date(dados.atualizadoEm).toLocaleString('pt-BR');

  document.getElementById('kpiTotal').textContent = dados.total;
  document.getElementById('kpiRestantes').textContent = dados.vagasRestantes;
  document.getElementById('kpiComprovante').textContent = dados.porStatusPagamento['Comprovante enviado'] || 0;
  document.getElementById('kpiAguardando').textContent = dados.porStatusPagamento['Aguardando pagamento'] || 0;

  const pct = dados.limite > 0 ? Math.min(Math.round((dados.total / dados.limite) * 100), 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabelLeft').textContent = dados.total + ' de ' + dados.limite + ' vagas preenchidas';
  document.getElementById('progressLabelRight').textContent = pct + '%';

  renderizarBarras('panelConexao', dados.porConexao, 'orange');
  renderizarBarras('panelNivelMapas', dados.porNivelMapas, 'gold');
  renderizarBarras('panelNivelFisico', dados.porNivelFisico);

  renderizarTabelaUltimas(dados.ultimas);
}

function renderizarBarras(containerId, contagens, corClasse) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const entradas = Object.keys(contagens).map(function (chave) {
    return { chave: chave, valor: contagens[chave] };
  }).sort(function (a, b) { return b.valor - a.valor; });

  if (entradas.length === 0) {
    container.innerHTML = '<p class="text-muted small mb-0">Sem dados ainda.</p>';
    return;
  }

  const maiorValor = entradas[0].valor;

  entradas.forEach(function (item) {
    const larguraPct = maiorValor > 0 ? Math.max((item.valor / maiorValor) * 100, 6) : 0;

    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML =
      '<div class="bar-label"><span>' + escapeHtml(item.chave) + '</span><span class="bar-count">' + item.valor + '</span></div>' +
      '<div class="bar-track"><div class="bar-fill' + (corClasse ? ' ' + corClasse : '') + '" style="width:' + larguraPct + '%"></div></div>';
    container.appendChild(row);
  });
}

function renderizarTabelaUltimas(ultimas) {
  const tbody = document.getElementById('ultimasTbody');
  tbody.innerHTML = '';

  if (!ultimas || ultimas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center py-3">Nenhuma inscrição ainda.</td></tr>';
    return;
  }

  ultimas.forEach(function (item) {
    const dataFormatada = item.data ? new Date(item.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
    const badgeClasse = item.pagamento === 'Comprovante enviado' ? 'badge-enviado'
      : item.pagamento === 'Aguardando pagamento' ? 'badge-aguardando'
      : 'badge-outro';

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + dataFormatada + '</td>' +
      '<td>' + escapeHtml(item.nome) + '</td>' +
      '<td>' + escapeHtml(item.conexao) + '</td>' +
      '<td><span class="badge-pagamento ' + badgeClasse + '">' + escapeHtml(item.pagamento || '—') + '</span></td>';
    tbody.appendChild(tr);
  });
}

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

// ---------------------------------------------------------------
// Ao carregar a página: se já tem token salvo, entra direto
// ---------------------------------------------------------------
(function inicializar() {
  const tokenSalvo = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!tokenSalvo) return;

  mostrarDashboard();
  carregarDashboard(true);
  iniciarAutoRefresh();
})();