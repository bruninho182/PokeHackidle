// ---- Variáveis de controle ----
let autoClickInterval = null;
let observer = null;
const textosNotificados = new Set();
let ignoreUntil = 0;
let timerOcultarLog = null; // timer para ocultar o log após abrir manualmente

// ---- AutoClick ----
function startAutoClick() {
  if (autoClickInterval) return;
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

// ---- Som ----
function tocarSom() {
  try {
    const audio = new Audio(chrome.runtime.getURL('lendario.mp3'));
    audio.volume = 0.15;
    audio.play().catch(err => console.warn('Erro ao tocar áudio:', err));
  } catch (e) {
    console.warn('Falha ao reproduzir som:', e);
  }
}

// ---- Configurações ----
let config = {
  autoClick: true,
  notifyLendaria: true,
  notifyEpica: true,
  notifyRara: true
};

// ---- Funções para ocultar/mostrar painéis ----
function ocultarPaineis() {
  const huntPanel = document.querySelector('[class*="ha-panel"], [class*="analyzer-panel"], .dock-panel');
  if (huntPanel) {
    huntPanel.style.setProperty('position', 'fixed', 'important');
    huntPanel.style.setProperty('left', '-9999px', 'important');
    huntPanel.style.setProperty('top', '-9999px', 'important');
    huntPanel.style.setProperty('width', '1px', 'important');
    huntPanel.style.setProperty('height', '1px', 'important');
    huntPanel.style.setProperty('overflow', 'hidden', 'important');
    huntPanel.style.setProperty('opacity', '0', 'important');
    huntPanel.style.setProperty('pointer-events', 'none', 'important');
  }
  
  const clogPanel = document.querySelector('[class*="clog-panel"], [class*="clog-container"]');
  if (clogPanel) {
    clogPanel.style.setProperty('position', 'fixed', 'important');
    clogPanel.style.setProperty('left', '-9999px', 'important');
    clogPanel.style.setProperty('top', '-9999px', 'important');
    clogPanel.style.setProperty('width', '1px', 'important');
    clogPanel.style.setProperty('height', '1px', 'important');
    clogPanel.style.setProperty('overflow', 'hidden', 'important');
    clogPanel.style.setProperty('opacity', '0', 'important');
    clogPanel.style.setProperty('pointer-events', 'none', 'important');
  }
}

function mostrarPaineis() {
  const huntPanel = document.querySelector('[class*="ha-panel"], [class*="analyzer-panel"], .dock-panel');
  if (huntPanel) {
    huntPanel.style.setProperty('position', '', '');
    huntPanel.style.setProperty('left', '', '');
    huntPanel.style.setProperty('top', '', '');
    huntPanel.style.setProperty('width', '', '');
    huntPanel.style.setProperty('height', '', '');
    huntPanel.style.setProperty('overflow', '', '');
    huntPanel.style.setProperty('opacity', '', '');
    huntPanel.style.setProperty('pointer-events', '', '');
  }
  
  const clogPanel = document.querySelector('[class*="clog-panel"], [class*="clog-container"]');
  if (clogPanel) {
    clogPanel.style.setProperty('position', '', '');
    clogPanel.style.setProperty('left', '', '');
    clogPanel.style.setProperty('top', '', '');
    clogPanel.style.setProperty('width', '', '');
    clogPanel.style.setProperty('height', '', '');
    clogPanel.style.setProperty('overflow', '', '');
    clogPanel.style.setProperty('opacity', '', '');
    clogPanel.style.setProperty('pointer-events', '', '');
  }
}

// ---- Processa span.clog-meta ----
function processarSpan(span) {
  const b = span.querySelector('b');
  if (!b) return;
  const raridade = b.textContent.trim();
  const textoCompleto = span.textContent.trim();

  if (textosNotificados.has(textoCompleto)) return;
  if (Date.now() < ignoreUntil) {
    textosNotificados.add(textoCompleto);
    return;
  }

  const deveNotificar =
    (raridade === 'Lendária' && config.notifyLendaria) ||
    (raridade === 'Épica'    && config.notifyEpica)   ||
    (raridade === 'Rara'     && config.notifyRara);

  if (deveNotificar) {
    textosNotificados.add(textoCompleto);
    tocarSom();
    let tipoMsg = '';
    if (raridade === 'Lendária') tipoMsg = 'legendary-caught';
    else if (raridade === 'Épica') tipoMsg = 'epic-caught';
    else if (raridade === 'Rara') tipoMsg = 'rare-caught';
    chrome.runtime.sendMessage({ type: tipoMsg });
    console.log(`[Notificação] Pokémon ${raridade.toLowerCase()} detectado!`);
  }
}

// ---- Observer ----
function gerenciarObserver() {
  const precisaObservar = config.notifyLendaria || config.notifyEpica || config.notifyRara;
  if (precisaObservar && !observer) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches('div.clog-row')) {
              const meta = node.querySelector('span.clog-meta');
              if (meta) processarSpan(meta);
            }
            if (node.matches && node.matches('span.clog-meta')) {
              processarSpan(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('div.clog-row').forEach(row => {
                const meta = row.querySelector('span.clog-meta');
                if (meta) processarSpan(meta);
              });
              node.querySelectorAll('span.clog-meta').forEach(span => processarSpan(span));
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Observer] Ativo.');
  } else if (!precisaObservar && observer) {
    observer.disconnect();
    observer = null;
    console.log('[Observer] Parado.');
  }
}

// ---- Abre Hunt Analyzer + Log e oculta tudo ----
function abrirLogEOcultar() {
  // Passo 1: Clica no botão Hunt Analyzer
  const btnDock = document.querySelector('button.dock-btn[data-guide="dock-analyzer"]');
  if (!btnDock) {
    setTimeout(abrirLogEOcultar, 2000);
    return;
  }
  
  btnDock.click();
  
  // Passo 2: Espera e clica no "Ver Log de Capturas"
  setTimeout(() => {
    const btnLog = document.querySelector('button.ha-clog-btn');
    if (!btnLog) {
      setTimeout(abrirLogEOcultar, 2000);
      return;
    }
    
    btnLog.click();
    
    // Passo 3: Espera carregar e oculta
    setTimeout(() => {
      ocultarPaineis();
      console.log('[Log] ✅ Log configurado e oculto. Notificações ativas!');
    }, 1500);
    
  }, 1500);
}

// ---- Detecta cliques no botão do log ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.ha-clog-btn');
  if (btn) {
    console.log('[Log] 🖱️ Clique detectado no botão "Ver Log"!');
    
    // Cancela o timer anterior se existir
    if (timerOcultarLog) {
      clearTimeout(timerOcultarLog);
      timerOcultarLog = null;
    }
    
    // Mostra os painéis imediatamente
    mostrarPaineis();
    
    // Silencia notificações por 2s (para não disparar ao abrir)
    ignoreUntil = Date.now() + 2000;
    
    // Agenda para ocultar novamente após 10 segundos
    timerOcultarLog = setTimeout(() => {
      ocultarPaineis();
      console.log('[Log] 🔒 Log ocultado automaticamente após 10s.');
      timerOcultarLog = null;
    }, 10000); // 10 segundos
    
    console.log('[Log] 👁️ Log visível por 10 segundos.');
  }
});

// ---- Aplica config ----
function aplicarConfiguracao(data) {
  config.autoClick = data.autoClickEnabled !== false;
  config.notifyLendaria = data.notifyLendariaEnabled !== false;
  config.notifyEpica = data.notifyEpicaEnabled !== false;
  config.notifyRara = data.notifyRaraEnabled !== false;
  console.log('[Config]', JSON.stringify(config));

  if (config.autoClick) startAutoClick();
  else stopAutoClick();

  gerenciarObserver();
}

// ---- Storage ----
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(
      ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled'],
      (data) => aplicarConfiguracao(data)
    );
  }
});

// ---- Inicialização ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(
      ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled'],
      (data) => aplicarConfiguracao(data)
    );
    setTimeout(abrirLogEOcultar, 2000);
  });
} else {
  chrome.storage.local.get(
    ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled'],
    (data) => aplicarConfiguracao(data)
  );
  setTimeout(abrirLogEOcultar, 2000);
}