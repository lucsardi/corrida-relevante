/* =====================================================================
   CONFIGURAÇÃO GERAL — TRILHA RELEVANTE 2026
   Este é o ÚNICO arquivo que você precisa editar para conectar o
   formulário do site a uma planilha do Google Sheets e definir o link
   do grupo do WhatsApp. As instruções de como obter cada valor estão
   no README.md (seção "Conectar o formulário ao Google Sheets").
   ===================================================================== */

const EVENT_CONFIG = {

  // ---------------------------------------------------------------
  // GOOGLE SHEETS (via Google Apps Script Web App)
  // ---------------------------------------------------------------
  googleSheet: {
    // URL do seu Web App do Apps Script (termina em "/exec").
    // Veja no README como criar e publicar esse Web App.
    // Exemplo: https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxx/exec
    webAppUrl: "https://script.google.com/macros/s/COLOQUE_O_ID_DO_SEU_WEB_APP_AQUI/exec"
  },

  // ---------------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------------
  // Link de convite do grupo do WhatsApp para onde a pessoa será
  // redirecionada depois da página de obrigado.
  whatsappGroupLink: "https://chat.whatsapp.com/COLOQUE_O_LINK_DO_SEU_GRUPO_AQUI",

  // Quantos segundos a página de obrigado espera antes de redirecionar
  // automaticamente para o WhatsApp.
  redirectDelaySeconds: 5

};
