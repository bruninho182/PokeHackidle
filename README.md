<div align="center">

<img src="./img/banner.png" alt="PokeHackidle" width="50%">

# 🎮 Poke AutoClick – Lançar

### 🖱️ Extensão para Chrome que automatiza o botão **Lançar** no Poke Idle World

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white">
  <img src="https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge">
</p>

Automatize o clique no botão **Lançar** do jogo **Poke Idle World** de forma simples, leve e eficiente.

</div>

---

# 📸 Demonstração

<p align="center">
<img src="./img/demo.gif" width="900">
</p>

---

# 📖 Índice

- [✨ Sobre](#-sobre)
- [🚀 Funcionalidades](#-funcionalidades)
- [🛠 Tecnologias](#-tecnologias)
- [📦 Instalação](#-instalação)
- [🎮 Como usar](#-como-usar)
- [⚙️ Personalização](#️-personalização)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚠️ Aviso Legal](#️-aviso-legal)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

---

# ✨ Sobre

O **Poke AutoClick – Lançar** é uma extensão para navegadores baseados em Chromium que realiza automaticamente o clique no botão **Lançar** do jogo:

> 🎮 https://poke.idleworld.online/play

Foi desenvolvido como estudo sobre:

- Desenvolvimento de extensões Chrome
- Manipulação do DOM
- JavaScript Vanilla
- Manifest V3

A extensão é extremamente leve e não utiliza nenhuma biblioteca externa.

---

# 🚀 Funcionalidades

✅ Clique automático no botão **Lançar**

✅ Inicia automaticamente ao abrir o jogo

✅ Intervalo totalmente configurável

✅ Código simples e fácil de modificar

✅ Compatível com:

- Google Chrome
- Microsoft Edge
- Brave
- Opera
- Outros navegadores Chromium

---

# 🛠 Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| JavaScript ES6 | Lógica da extensão |
| Manifest V3 | Novo padrão para extensões Chrome |
| DOM API | Automação dos cliques |

---

# 📦 Instalação

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/poke-autoclick-lancar.git
```

Ou faça o download do ZIP.

---

### 2️⃣ Abra o Chrome

Acesse:

```
chrome://extensions
```

---

### 3️⃣ Ative o modo desenvolvedor

No canto superior direito habilite:

> **Modo do Desenvolvedor**

---

### 4️⃣ Carregue a extensão

Clique em:

```
Carregar sem compactação
```

Selecione a pasta do projeto.

Pronto! 🎉

---

# 🎮 Como usar

1. Abra o jogo

https://poke.idleworld.online/play

2. Aguarde a página carregar

3. O AutoClick começará automaticamente.

---

## Console (Opcional)

Caso queira visualizar a execução:

Pressione

```
F12
```

Depois abra a aba

```
Console
```

Será exibida a mensagem:

```text
[AutoClick] Botão Lançar clicado.
```

---

# ⚙️ Personalização

O intervalo entre os cliques pode ser alterado facilmente no arquivo:

```
content.js
```

Exemplo:

```javascript
setInterval(() => {

   // Código

}, 1000);
```

### Valores comuns

| Tempo | Resultado |
|--------|-----------|
| 500 ms | 2 cliques/segundo |
| 1000 ms | 1 clique/segundo |
| 2000 ms | 1 clique a cada 2 segundos |
| 5000 ms | 1 clique a cada 5 segundos |

Após alterar o valor:

- Recarregue a extensão
- Atualize a página do jogo

---

# 📁 Estrutura do Projeto

```
poke-autoclick-lancar/
│
├── manifest.json
├── content.js
├── demo.gif
├── LICENSE
└── README.md
```

---

# 💡 Como funciona

A extensão monitora continuamente a página do jogo.

Sempre que encontra o botão:

```html
<button class="cap-throw">
    Lançar
</button>
```

Ela executa automaticamente:

```javascript
button.click();
```

Tudo acontece em segundo plano.

---

# ⚠️ Aviso Legal

> **Este projeto possui finalidade exclusivamente educacional.**

Automatizar ações em jogos online pode violar os Termos de Serviço da plataforma.

O autor não se responsabiliza por:

- Suspensão de contas
- Banimentos
- Uso indevido da ferramenta

Utilize por sua conta e risco.

---

# 🤝 Contribuindo

Contribuições são muito bem-vindas!

Caso tenha sugestões de melhorias:

- ⭐ Faça um Fork
- 🌱 Crie uma Branch
- 💻 Faça suas alterações
- 🚀 Abra um Pull Request

Também é possível abrir uma **Issue** para reportar bugs ou sugerir novas funcionalidades.

---

# 📄 Licença

Este projeto está licenciado sob a licença **MIT**.

Consulte o arquivo **LICENSE** para mais informações.

---

<div align="center">

## ⭐ Gostou do projeto?

Deixe uma ⭐ no repositório para apoiar o desenvolvimento!

Desenvolvido com ❤️ utilizando **JavaScript**.

</div>
