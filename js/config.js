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
    webAppUrl: "https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbwFRMHJTgxamHhHFKWeZeGFnzAdPDSPm-Weo3ujduPh8fMCdMzntdhh0cvGmNWpHM-s/exec"
  },

  // ---------------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------------
  // Link de convite do grupo do WhatsApp para onde a pessoa será
  // redirecionada depois da página de obrigado.
  whatsappGroupLink: "https://chat.whatsapp.com/JQEbpGsm00XGzzH02ZUx0q",

  // Quantos segundos a página de obrigado espera antes de redirecionar
  // automaticamente para o WhatsApp.
  redirectDelaySeconds: 5

};