// ---- Variáveis de controle ----
let autoClickInterval = null;
let observer = null;

// ---- Função de clique automático ----
function startAutoClick() {
  if (autoClickInterval) return; // já está rodando
  autoClickInterval = setInterval(() => {
    const botoes = document.querySelectorAll('button.cap-throw');
    for (const btn of botoes) {
      if (btn.textContent.trim() === 'Lançar') {
        btn.click();
        console.log('[AutoClick] Botão Lançar clicado.');
        break;
      }
    }
  }, 1000);
}

function stopAutoClick() {
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
    console.log('[AutoClick] Parado.');
  }
}

// ---- Som lendário ----
function tocarSomLendario() {
  try {
    const audio = new Audio(chrome.runtime.getURL('lendario.mp3'));
    audio.volume = 0.8;
    audio.play().catch(err => console.warn('Erro ao tocar áudio:', err));
  } catch (e) {
    console.warn('Falha ao reproduzir som:', e);
  }
}

// ---- Detecção de lendário ----
function verificarLendario(span) {
  if (span.dataset.notificado) return;
  const b = span.querySelector('b');
  if (b && b.textContent.trim() === 'Lendária') {
    span.dataset.notificado = 'true';
    tocarSomLendario();
    chrome.runtime.sendMessage({ type: 'legendary-caught' });
    console.log('[Notificação] Pokémon lendário detectado!');
  }
}

// ---- Observer (para notificações) ----
function startObserver() {
  if (observer) return; // já observando
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches && node.matches('span.clog-meta')) {
            verificarLendario(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('span.clog-meta').forEach(span => verificarLendario(span));
          }
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[Observer] Monitorando log.');
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('[Observer] Parado.');
  }
}

// ---- Sincronização com o armazenamento ----
function aplicarConfiguracao({ autoClickEnabled, notifyEnabled }) {
  // AutoClick
  if (autoClickEnabled) {
    startAutoClick();
  } else {
    stopAutoClick();
  }

  // Notificação (observer + som)
  if (notifyEnabled) {
    startObserver();
  } else {
    stopObserver();
  }
}

// Ouvir mudanças no storage (popup)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['autoClickEnabled', 'notifyEnabled'], (data) => {
      aplicarConfiguracao({
        autoClickEnabled: data.autoClickEnabled !== false,
        notifyEnabled: data.notifyEnabled !== false
      });
    });
  }
});

// Inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['autoClickEnabled', 'notifyEnabled'], (data) => {
      aplicarConfiguracao({
        autoClickEnabled: data.autoClickEnabled !== false,
        notifyEnabled: data.notifyEnabled !== false
      });
    });
  });
} else {
  chrome.storage.local.get(['autoClickEnabled', 'notifyEnabled'], (data) => {
    aplicarConfiguracao({
      autoClickEnabled: data.autoClickEnabled !== false,
      notifyEnabled: data.notifyEnabled !== false
    });
  });
}