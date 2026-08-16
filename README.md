# Trilha Relevante 2026 — Landing Page de Inscrição

Landing page estática (HTML + CSS + Bootstrap 5) para inscrição na Corrida
Relevante, com modal de inscrição que alimenta uma planilha do Google Sheets
e, depois, redireciona a pessoa para uma página de obrigado e em seguida
para o grupo do WhatsApp.

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
│   ├── config.js             → ⚙️ ÚNICO arquivo que você precisa editar (Google Sheets + WhatsApp)
│   └── script.js              → Lógica de envio do formulário e redirecionamento
│
├── google-apps-script/
│   └── Code.gs                → Código para colar no Apps Script (recebe e salva as inscrições)
│
└── assets/
    ├── icons/
    │   └── favicon32.png    → ícone da aba do navegador
    ├── images/
    │   ├── bg_header2.gif  → imagem de fundo do header/hero (telas grandes, >=992px)
    │   ├── bg_mobile2.gif  → imagem de fundo do header/hero (telas pequenas, <992px)
    │   ├── logo_r2_white.png → logo (branca) exibida na navbar e na página de obrigado
    │   ├── title_bg.png    → título estilizado do evento (visível só em telas grandes)
    │   ├── subtitle_bg.png → subtítulo estilizado do evento (visível só em telas grandes)
    │   ├── img_1.png, img_2.jpg, img_3.jpg → fotos dos depoimentos
    │   ├── teaser_thumb.jpg (opcional) → miniatura do vídeo teaser
    │   └── README.txt      → nota lembrete sobre os arquivos acima
    └── videos/
        ├── teaser.mp4      → vídeo exibido no modal "Assistir Teaser"
        └── README.txt      → nota lembrete sobre o vídeo
```

## Dependências (via CDN, já referenciadas nos HTMLs)

- Bootstrap 5.3.3 (CSS + JS bundle)
- Google Fonts: Bebas Neue, Poppins, Caveat
- Logo, backgrounds e título/subtítulo do header: locais, em `assets/images/`
- Demais imagens (cards, depoimentos, seção final): hotlinkadas do Unsplash

---

## 1. Conectar o formulário ao Google Sheets

O modal de inscrição (`#inscricaoModal` no `index.html`) envia os dados
diretamente para uma planilha do Google Sheets, sem precisar de backend —
usando um **Google Apps Script Web App** como ponte. Você só precisa criar
a planilha, publicar o script (código já pronto em
`google-apps-script/Code.gs`) e colar a URL gerada em **`js/config.js`**.

### Por que assim, em vez de um Google Forms?

O Google Forms funcionaria, mas ele geraria um formulário público que
ninguém nunca vê (o site usa o modal próprio), e o envio é "às cegas" — sem
confirmação de que deu certo. Indo direto para a planilha via Apps Script,
você tem controle total do formato dos dados **e** confirmação real de
sucesso no envio.

### Passo a passo

1. **Crie uma planilha nova** em [sheets.google.com](https://sheets.google.com)
   e dê um nome a ela (ex: "Inscrições — Trilha Relevante 2026").

2. **Abra o editor de scripts:**
   - Menu **Extensões → Apps Script**
   - Apague todo o conteúdo padrão (`function myFunction() {...}`)
   - Abra o arquivo `google-apps-script/Code.gs` (está na pasta do projeto),
     copie todo o conteúdo e cole no editor
   - Clique no ícone de disquete (salvar) — pode dar qualquer nome ao projeto

3. **Publique como Web App:**
   - Clique em **Implantar → Nova implantação**
   - No ícone de engrenagem, escolha o tipo **"App da Web"**
   - **Executar como:** Eu (seu e-mail)
   - **Quem tem acesso:** Qualquer pessoa
   - Clique em **Implantar**
   - O Google vai pedir para autorizar as permissões (é a sua própria
     planilha, pode aceitar) — clique em **Avançar → Acessar (nome do
     projeto) (não seguro) → Permitir**
     *(esse aviso aparece só porque o script ainda não foi verificado pelo
     Google — é normal para scripts de uso pessoal)*

4. **Copie a URL gerada**, algo como:
   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxx/exec
   ```
   e cole em `js/config.js`:
   ```js
   googleSheet: {
     webAppUrl: "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxx/exec"
   }
   ```

5. Pronto. A cada inscrição, uma nova linha é criada automaticamente na aba
   **"Inscrições"** da sua planilha (o script cria a aba e o cabeçalho
   sozinho, na primeira vez que alguém se inscrever).

> **Testando o Web App:** cole a URL do passo 4 direto no navegador. Se
> aparecer a mensagem *"Web App da Trilha Relevante 2026 está no ar..."*,
> está tudo certo e publicado.

> **Atualizou o código do script depois?** Toda vez que você editar o
> `Code.gs` no Apps Script, precisa ir em **Implantar → Gerenciar
> implantações → ✏️ (editar) → Nova versão → Implantar** para as mudanças
> valerem — só salvar não é suficiente.

> **Prefere Microsoft (Excel/Forms)?** O caminho equivalente é o **Power
> Automate**: um fluxo com gatilho "Quando uma solicitação HTTP for
> recebida", que insere a linha numa planilha do Excel Online, e você troca
> a `webAppUrl` em `config.js` pela URL desse fluxo. Posso te ajudar a
> montar isso se preferir esse caminho.

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

## 3. Vídeo do "Assistir Teaser"

O botão **"Assistir Teaser"** do header abre um modal com um player de
vídeo. Para funcionar, basta colocar o arquivo do vídeo em:

```
assets/videos/teaser.mp4
```

Esse nome (`teaser.mp4`) precisa ser exato — é o caminho já referenciado no
`index.html`. Recomendações:

- **Formato:** MP4 (H.264 + AAC), que funciona em todos os navegadores.
- **Peso:** tente manter abaixo de ~20–30MB para carregar rápido. Se o vídeo
  for maior que isso, o ideal é hospedar no YouTube/Vimeo (sem listar
  publicamente) e trocar o `<video>` por um `<iframe>` incorporado — nesse
  caso é só pedir que eu ajusto o código.
- **Miniatura (opcional):** salve uma imagem estática 16:9 em
  `assets/images/teaser_thumb.jpg` para aparecer como capa do vídeo antes do
  play. Sem isso, o player mostra fundo preto até carregar.

O vídeo toca automaticamente ao abrir o modal e pausa/reinicia sozinho ao
fechar (lógica já pronta em `js/script.js`).

---

## 4. Colocar em um versionador (Git) e publicar com URL própria

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
| Google Sheets / WhatsApp        | `js/config.js`                          |
| Cores da marca                 | `:root { --forest, --orange, --gold... }` no topo de `css/style.css` |
| Nome do evento, datas            | `index.html` (hero, navbar, footer)     |
| Trilhas/cards                     | Seção `<section id="trilhas">` no `index.html` |
| Campos do formulário                | `<form id="formInscricao">` no `index.html`, dentro do modal (lembre de atualizar `js/config.js` se adicionar/remover campos) |
| Texto/estilo da página de obrigado    | `obrigado.html`                          |
| Lógica de envio e redirecionamento     | `js/script.js`                          |
