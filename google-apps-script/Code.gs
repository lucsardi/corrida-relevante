/**
 * ============================================================
 * TRILHA RELEVANTE 2026 — Recebe inscrições do site e salva
 * numa aba do Google Sheets.
 *
 * COMO USAR: veja o passo a passo completo no README.md,
 * seção "1. Conectar o formulário ao Google Sheets".
 *
 * Resumo rápido:
 * 1. Crie uma planilha no Google Sheets.
 * 2. Extensões → Apps Script.
 * 3. Apague o conteúdo padrão e cole todo este arquivo.
 * 4. Implantar → Nova implantação → tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem tem acesso: Qualquer pessoa
 * 5. Autorize as permissões pedidas (é a sua própria planilha).
 * 6. Copie a URL gerada (termina em /exec) e cole em
 *    js/config.js, no campo googleSheet.webAppUrl.
 * ============================================================
 */

// Nome da aba onde as inscrições serão salvas.
// Se a aba não existir, o script cria ela automaticamente.
var NOME_DA_ABA = 'Inscrições';

function doPost(e) {
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var aba = planilha.getSheetByName(NOME_DA_ABA);

    if (!aba) {
      aba = planilha.insertSheet(NOME_DA_ABA);
    }

    var dados = JSON.parse(e.postData.contents);

    // Cria o cabeçalho se a aba estiver vazia
    if (aba.getLastRow() === 0) {
      aba.appendRow([
        'Data/Hora',
        'Nome',
        'E-mail',
        'Telefone',
        'Empresa/Conexão',
        'Trilha',
        'Como conheceu',
        'Mensagem'
      ]);
      aba.setFrozenRows(1);
    }

    aba.appendRow([
      new Date(),
      dados.nome || '',
      dados.email || '',
      dados.telefone || '',
      dados.empresa || '',
      dados.trilha || '',
      dados.origem || '',
      dados.mensagem || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função só pra testar se o Web App está publicado e acessível
// (abra a URL /exec direto no navegador — deve aparecer este texto).
function doGet(e) {
  return ContentService.createTextOutput('Web App da Trilha Relevante 2026 está no ar. Use POST para enviar inscrições.');
}
