# Trilha Relevante 2026 — Landing Page de Inscrição

Landing page estática (HTML + CSS + Bootstrap 5) para inscrição na Corrida
Relevante, com modal de inscrição que alimenta um Google Forms e, depois,
redireciona a pessoa para uma página de obrigado e em seguida para o grupo
do WhatsApp.

## Estrutura de pastas

```
summit-horizon/
│
├── index.html            → Página principal (landing page)
├── obrigado.html          → Página de obrigado (pós-inscrição → WhatsApp)
├── README.md               → Este arquivo
│
├── css/
│   └── style.css            → Todo o CSS customizado (cores, tipografia, seções, modal, obrigado)
│
├── js/
│   ├── config.js             → ⚙️ ÚNICO arquivo que você precisa editar (Google Form + WhatsApp)
│   └── script.js              → Lógica de envio do formulário e redirecionamento
│
└── assets/
    ├── icons/
    │   └── favicon32.png    → ícone da aba do navegador
    └── images/
        ├── bg_header2.gif  → imagem de fundo do header/hero (telas grandes, >=992px)
        ├── bg_mobile2.gif  → imagem de fundo do header/hero (telas pequenas, <992px)
        ├── logo_r2_white.png → logo (branca) exibida na navbar e na página de obrigado
        ├── title_bg.png    → título estilizado do evento (visível só em telas grandes)
        ├── subtitle_bg.png → subtítulo estilizado do evento (visível só em telas grandes)
        ├── img_1.png, img_2.jpg, img_3.jpg → fotos dos depoimentos
        └── README.txt      → nota lembrete sobre os arquivos acima
```

## Dependências (via CDN, já referenciadas nos HTMLs)

- Bootstrap 5.3.3 (CSS + JS bundle)
- Google Fonts: Bebas Neue, Poppins, Caveat
- Logo, backgrounds e título/subtítulo do header: locais, em `assets/images/`
- Demais imagens (cards, depoimentos, seção final): hotlinkadas do Unsplash

---

## 1. Conectar o formulário ao Google Forms

O modal de inscrição (`#inscricaoModal` no `index.html`) envia os dados
diretamente para um Google Forms, sem precisar de backend. Você só precisa
editar o arquivo **`js/config.js`**.

### Passo a passo

1. **Crie um Google Form** com uma pergunta para cada campo do site, na mesma
   ordem (não precisa ser idêntico, mas facilita a organização):
   - Nome completo (resposta curta)
   - E-mail (resposta curta)
   - Telefone / WhatsApp (resposta curta)
   - Empresa / Instituição (resposta curta)
   - Trilha de interesse (múltipla escolha ou lista suspensa)
   - Como conheceu o evento? (múltipla escolha ou lista suspensa)
   - Mensagem (parágrafo)

2. **Pegue a URL de envio do formulário:**
   - Clique nos três pontinhos (⋮) no canto superior direito do formulário
   - Clique em **"Obter link para pré-preenchimento"**
   - Preencha qualquer resposta de teste em cada campo e clique em **"Obter link"**
   - Copie o link gerado — ele será parecido com:
     ```
     https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxxxxxx/viewform?usp=pp_url&entry.111111111=Teste&entry.222222222=teste%40email.com...
     ```

3. **Extraia os dados desse link** e cole em `js/config.js`:
   - A parte `.../d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxxxxxx/` é o **ID do formulário**.
     Monte a `actionUrl` assim:
     ```
     https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxxxxxx/formResponse
     ```
     (repare: troca `viewform` por `formResponse`)
   - Cada `entry.NNNNNNNNN=valor` no link corresponde a um campo. Identifique
     qual `entry.` é qual pergunta (pelo valor de teste que você digitou) e
     preencha em `fields` no `config.js`:
     ```js
     fields: {
       nome:     "entry.111111111",
       email:    "entry.222222222",
       telefone: "entry.333333333",
       empresa:  "entry.444444444",
       trilha:   "entry.555555555",
       origem:   "entry.666666666",
       mensagem: "entry.777777777"
     }
     ```

4. Salve `js/config.js`. Pronto — o formulário do site já vai alimentar seu
   Google Form automaticamente a cada inscrição.

> **Prefere Microsoft Forms?** O Microsoft Forms não tem um endpoint público
> de envio direto (como o Google Forms tem), então a forma confiável de
> integrar é via **Power Automate**: crie um fluxo com gatilho
> "Quando uma solicitação HTTP for recebida", que insere a resposta no seu
> Forms/Excel, e troque a `actionUrl` em `config.js` pela URL desse fluxo
> (ajustando o `script.js` para enviar JSON em vez de `FormData`, se for o caso).
> Posso te ajudar a montar esse fluxo se preferir esse caminho.

### Por que o envio "não confirma" no navegador?

O Google Forms não libera CORS para sites externos, então o envio é feito em
modo `no-cors` — o navegador manda os dados, mas não temos como ler a
resposta de volta. Por isso o site sempre redireciona para a página de
obrigado após o envio, mesmo sem confirmação visual. **Teste uma inscrição
de verdade e confira se ela aparece nas respostas do seu Google Form.**

---

## 2. Página de obrigado + redirecionamento para o WhatsApp

Depois que a pessoa envia o formulário, ela é levada automaticamente para
`obrigado.html`, no mesmo estilo visual do site. Essa página:

- Mostra a confirmação da inscrição
- Exibe uma contagem regressiva (5 segundos, configurável)
- Redireciona automaticamente para o grupo do WhatsApp ao final da contagem
- Também mostra um botão **"Entrar no grupo agora"**, caso a pessoa não
  queira esperar ou o navegador bloqueie o redirecionamento automático

### Como configurar

Edite só o `js/config.js`:

```js
whatsappGroupLink: "https://chat.whatsapp.com/SEU_LINK_AQUI",
redirectDelaySeconds: 5
```

Troque `whatsappGroupLink` pelo link de convite do seu grupo (Grupo do
WhatsApp → Convidar via link → Copiar link), e ajuste `redirectDelaySeconds`
se quiser mais ou menos tempo de espera.

---

## 3. Colocar em um versionador (Git) e publicar com URL própria

Como o site ainda vai sofrer atualizações, o ideal é usar **Git + GitHub**
para versionar, conectado a um serviço de deploy automático — assim toda vez
que você fizer `git push`, o site atualiza sozinho, sem precisar subir
arquivo manualmente.

### 3.1. Criar o repositório no GitHub

1. Crie uma conta gratuita em [github.com](https://github.com) (se ainda não tiver)
2. Clique em **New repository**, dê um nome (ex: `summit-horizon`), deixe
   **público** ou **privado** (tanto faz para o deploy) e **não** marque
   "Add a README" (já temos um)

### 3.2. Subir o projeto (rode estes comandos dentro da pasta `summit-horizon`)

```bash
git init
git add .
git commit -m "Primeira versão do site"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/summit-horizon.git
git push -u origin main
```

A partir daqui, toda atualização é só:
```bash
git add .
git commit -m "Descreva o que mudou"
git push
```

### 3.3. Publicar com deploy automático e URL própria

Recomendo o **Netlify** (gratuito, simples e com deploy automático a cada
`git push`):

1. Crie uma conta gratuita em [app.netlify.com](https://app.netlify.com)
   (pode entrar direto com sua conta do GitHub)
2. Clique em **"Add new site" → "Import an existing project"**
3. Escolha **GitHub** e selecione o repositório `summit-horizon`
4. Deixe as configurações de build em branco (é um site estático, não
   precisa de comando de build nem pasta de publicação específica —
   ou coloque `.` se for pedido)
5. Clique em **Deploy site**

Em poucos segundos o site estará no ar em uma URL tipo
`https://random-name-123.netlify.app`. Para deixar com uma URL que faça
sentido:

1. No painel do site, vá em **Site configuration → Change site name**
2. Escolha algo como `trilha-relevante-2026`
3. Sua URL final vira: **`https://trilha-relevante-2026.netlify.app`**

Pronto — a partir de agora, toda vez que você der `git push`, o Netlify
detecta a mudança e republica o site automaticamente, com a mesma URL.

> **Alternativas igualmente gratuitas**, caso prefira: **Vercel** (mesmo
> fluxo do Netlify) ou **GitHub Pages** (ativa em Settings → Pages do
> próprio repositório, ficando em `seu-usuario.github.io/summit-horizon`).

> **Domínio próprio (opcional, pago):** se no futuro quiser algo como
> `www.summithorizon.com.br`, é só comprar o domínio em um registrador
> (Registro.br, Namecheap etc.) e apontá-lo para o Netlify/Vercel em
> **Domain settings** — o certificado HTTPS é gerado automaticamente e
> de graça.

---

## Personalização rápida

| O que mudar                | Onde                                    |
|-----------------------------|------------------------------------------|
| Google Form / WhatsApp        | `js/config.js`                          |
| Cores da marca                 | `:root { --forest, --orange, --gold... }` no topo de `css/style.css` |
| Nome do evento, datas            | `index.html` (hero, navbar, footer)     |
| Trilhas/cards                     | Seção `<section id="trilhas">` no `index.html` |
| Campos do formulário                | `<form id="formInscricao">` no `index.html`, dentro do modal (lembre de atualizar `js/config.js` se adicionar/remover campos) |
| Texto/estilo da página de obrigado    | `obrigado.html`                          |
| Lógica de envio e redirecionamento     | `js/script.js`                          |
