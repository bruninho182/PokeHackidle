// ---- Variáveis de controle ----
let autoClickInterval = null;
let observer = null;
const textosNotificados = new Set();
let ignoreUntil = 0;
let velocidadeClick = 1000; // valor padrão

// ---- AutoClick com velocidade ajustável ----
function startAutoClick() {
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
  }
  
  autoClickInterval = setInterval(() => {
    const botoes = document.querySelectorAll('button.cap-throw');
    for (const btn of botoes) {
      if (btn.textContent.trim() === 'Lançar') {
        btn.click();
        break;
      }
    }
  }, velocidadeClick);
  
  console.log('[AutoClick] Iniciado com intervalo de', velocidadeClick, 'ms');
}

function stopAutoClick() {
  if (autoClickInterval) {
    clearInterval(autoClickInterval);
    autoClickInterval = null;
    console.log('[AutoClick] Parado.');
  }
}

// ---- Som (único para todas) ----
function tocarSom() {
  try {
    const audio = new Audio(chrome.runtime.getURL('lendario.mp3'));
    audio.volume = 0.15;
    audio.play().catch(err => console.warn('Erro ao tocar áudio:', err));
  } catch (e) {
    console.warn('Falha ao reproduzir som:', e);
  }
}

// ---- Configurações atuais ----
let config = {
  autoClick: true,
  notifyLendaria: true,
  notifyEpica: true,
  notifyRara: true,
  velocidade: 1000
};

// ---- Atualiza contadores no storage ----
function incrementarContador(raridade) {
  chrome.storage.local.get(['contadores'], (data) => {
    const contadores = data.contadores || {
      lendaria: 0,
      epica: 0,
      rara: 0,
      total: 0
    };
    
    if (raridade === 'Lendária') contadores.lendaria++;
    else if (raridade === 'Épica') contadores.epica++;
    else if (raridade === 'Rara') contadores.rara++;
    
    contadores.total++;
    
    chrome.storage.local.set({ contadores });
  });
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
    
    // Toca o som
    tocarSom();
    
    // Incrementa contador
    incrementarContador(raridade);
    
    // Envia notificação
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

// ---- Força abertura do log ----
function abrirLogAutomaticamente() {
  const btnDock = document.querySelector('button.dock-btn[data-guide="dock-analyzer"]');
  if (!btnDock) {
    setTimeout(abrirLogAutomaticamente, 2000);
    return;
  }
  
  btnDock.click();
  
  setTimeout(() => {
    const btnLog = document.querySelector('button.ha-clog-btn');
    if (btnLog) {
      btnLog.click();
      console.log('[Setup] Log de capturas aberto automaticamente.');
    }
  }, 2000);
}

// ---- Detecta clique manual no log ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.ha-clog-btn');
  if (btn) {
    ignoreUntil = Date.now() + 2000;
  }
});

// ---- Aplica configuração ----
function aplicarConfiguracao(data) {
  config.autoClick = data.autoClickEnabled !== false;
  config.notifyLendaria = data.notifyLendariaEnabled !== false;
  config.notifyEpica = data.notifyEpicaEnabled !== false;
  config.notifyRara = data.notifyRaraEnabled !== false;
  config.velocidade = data.clickSpeed || 1000;

  if (config.autoClick) {
    velocidadeClick = config.velocidade;
    startAutoClick();
  } else {
    stopAutoClick();
  }

  gerenciarObserver();
}

// ---- Ouvir mudanças no storage ----
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(
      ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled', 'clickSpeed'],
      (data) => aplicarConfiguracao(data)
    );
  }
});

// ---- Inicialização ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(
      ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled', 'clickSpeed'],
      (data) => aplicarConfiguracao(data)
    );
    setTimeout(abrirLogAutomaticamente, 2000);
  });
} else {
  chrome.storage.local.get(
    ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled', 'clickSpeed'],
    (data) => aplicarConfiguracao(data)
  );
  setTimeout(abrirLogAutomaticamente, 2000);
}