/* =====================================================================
   CONFIGURAÇÃO GERAL — SUMMIT HORIZON 2026
   Este é o ÚNICO arquivo que você precisa editar para conectar o
   formulário do site a um Google Forms e definir o link do grupo do
   WhatsApp. As instruções de como obter cada valor estão no README.md
   (seção "Conectar o formulário ao Google Forms").
   ===================================================================== */

const EVENT_CONFIG = {

  // ---------------------------------------------------------------
  // GOOGLE FORMS
  // ---------------------------------------------------------------
  googleForm: {
    // URL de envio ("formResponse") do seu Google Form.
    // Pegue o link normal do formulário e troque "viewform" por "formResponse".
    // Exemplo: https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxxx/formResponse
    actionUrl: "https://docs.google.com/forms/d/e/COLOQUE_O_ID_DO_SEU_FORM_AQUI/formResponse",

    // IDs dos campos do Google Form (entry.XXXXXXXXX).
    // Veja no README como descobrir cada um desses valores.
    // Se algum campo do seu Google Form não existir, é só apagar a linha
    // correspondente aqui (ou deixar como está — campos vazios são ignorados).
    fields: {
      nome:     "entry.100000001",
      email:    "entry.100000002",
      telefone: "entry.100000003",
      empresa:  "entry.100000004",
      trilha:   "entry.100000005",
      origem:   "entry.100000006",
      mensagem: "entry.100000007"
    }
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
