
function iniciarAutoClick() {
  setInterval(() => {
    const botoes = document.querySelectorAll('button.cap-throw');
    for (const btn of botoes) {
      if (btn.textContent.trim() === 'Lançar') {
        btn.click();
        console.log('[AutoClick] Botão Lançar clicado.');
        break; // clica apenas no primeiro encontrado
      }
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarAutoClick);
} else {
  iniciarAutoClick();
}