// ---- Variáveis de controle ----
let autoClickInterval = null;
let observer = null;
const textosNotificados = new Set();
let ignoreUntil = 0;

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

// ---- Processa span.clog-meta ----
function processarSpan(span) {
  console.log('[DEBUG] 🔍 processarSpan chamado');
  console.log('[DEBUG] Conteúdo do span:', span.textContent.trim());
  
  const b = span.querySelector('b');
  if (!b) {
    console.log('[DEBUG] ❌ Tag <b> não encontrada dentro do span');
    return;
  }
  
  const raridade = b.textContent.trim();
  const textoCompleto = span.textContent.trim();
  
  console.log('[DEBUG] Raridade encontrada:', raridade);
  console.log('[DEBUG] Texto completo:', textoCompleto);

  if (textosNotificados.has(textoCompleto)) {
    console.log('[DEBUG] ⚠️ Este texto já foi notificado antes');
    return;
  }
  
  if (Date.now() < ignoreUntil) {
    console.log('[DEBUG] 🔇 Modo silêncio ativo, apenas registrando');
    textosNotificados.add(textoCompleto);
    return;
  }

  const deveNotificar =
    (raridade === 'Lendária' && config.notifyLendaria) ||
    (raridade === 'Épica'    && config.notifyEpica)   ||
    (raridade === 'Rara'     && config.notifyRara);

  console.log('[DEBUG] Deve notificar?', deveNotificar);
  console.log('[DEBUG] Configs atuais:', config);

  if (deveNotificar) {
    textosNotificados.add(textoCompleto);
    console.log('[DEBUG] ✅ Tocando som e enviando notificação...');
    tocarSom();
    
    let tipoMsg = '';
    if (raridade === 'Lendária') tipoMsg = 'legendary-caught';
    else if (raridade === 'Épica') tipoMsg = 'epic-caught';
    else if (raridade === 'Rara') tipoMsg = 'rare-caught';
    
    chrome.runtime.sendMessage({ type: tipoMsg });
    console.log('[NOTIFICAÇÃO] 🎉 Pokémon', raridade, 'detectado!');
  } else {
    console.log('[DEBUG] ❌ Notificação não enviada (desabilitada ou raridade não corresponde)');
  }
}

// ---- Observer ----
function gerenciarObserver() {
  const precisaObservar = config.notifyLendaria || config.notifyEpica || config.notifyRara;
  console.log('[DEBUG] gerenciarObserver - precisa:', precisaObservar, 'ativo:', !!observer);
  
  if (precisaObservar && !observer) {
    observer = new MutationObserver((mutations) => {
      console.log('[DEBUG] 👁️ Observer detectou', mutations.length, 'mutação(ões)');
      
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            
            // Verifica se é uma div.clog-row
            if (node.matches && node.matches('div.clog-row')) {
              console.log('[DEBUG] 🟢 div.clog-row encontrada!');
              console.log('[DEBUG] Conteúdo da row:', node.textContent.trim().substring(0, 100));
              const meta = node.querySelector('span.clog-meta');
              if (meta) {
                console.log('[DEBUG] 🟢 span.clog-meta encontrado dentro da row');
                processarSpan(meta);
              } else {
                console.log('[DEBUG] 🔴 span.clog-meta NÃO encontrado na row');
              }
            }
            
            // Verifica se é um span.clog-meta
            if (node.matches && node.matches('span.clog-meta')) {
              console.log('[DEBUG] 🟢 span.clog-meta encontrado!');
              processarSpan(node);
            }
            
            // Vasculha dentro do nó
            if (node.querySelectorAll) {
              const rows = node.querySelectorAll('div.clog-row');
              const spans = node.querySelectorAll('span.clog-meta');
              
              if (rows.length > 0 || spans.length > 0) {
                console.log('[DEBUG] 🔍 Dentro do nó:', rows.length, 'rows,', spans.length, 'spans');
                
                rows.forEach(row => {
                  const meta = row.querySelector('span.clog-meta');
                  if (meta) processarSpan(meta);
                });
                
                spans.forEach(span => processarSpan(span));
              }
            }
          }
        }
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Observer] ✅ Ativo e monitorando');
  } else if (!precisaObservar && observer) {
    observer.disconnect();
    observer = null;
    console.log('[Observer] ❌ Parado');
  }
}

// ---- Força abertura do log ----
function abrirLogAutomaticamente() {
  console.log('[Setup] 🚀 Iniciando configuração automática...');
  
  // Passo 1: Abrir Hunt Analyzer
  const btnDock = document.querySelector('button.dock-btn[data-guide="dock-analyzer"]');
  if (!btnDock) {
    console.log('[Setup] ⏳ Hunt Analyzer não encontrado, tentando em 2s...');
    setTimeout(abrirLogAutomaticamente, 2000);
    return;
  }
  
  console.log('[Setup] 🖱️ Clicando no Hunt Analyzer...');
  btnDock.click();
  
  // Passo 2: Esperar e abrir o log
  setTimeout(() => {
    const btnLog = document.querySelector('button.ha-clog-btn');
    if (!btnLog) {
      console.log('[Setup] ⏳ Botão "Ver Log" não encontrado, tentando em 2s...');
      setTimeout(abrirLogAutomaticamente, 2000);
      return;
    }
    
    console.log('[Setup] 🖱️ Clicando em "Ver Log de Capturas"...');
    btnLog.click();
    console.log('[Setup] ✅ Log aberto! Notificações prontas para funcionar.');
  }, 2000);
}

// ---- Detecta clique manual no botão do log ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.ha-clog-btn');
  if (btn) {
    console.log('[Log] 🖱️ Clique manual no botão do log - silenciando 2s');
    ignoreUntil = Date.now() + 2000;
  }
});

// ---- Aplica config ----
function aplicarConfiguracao(data) {
  config.autoClick = data.autoClickEnabled !== false;
  config.notifyLendaria = data.notifyLendariaEnabled !== false;
  config.notifyEpica = data.notifyEpicaEnabled !== false;
  config.notifyRara = data.notifyRaraEnabled !== false;
  console.log('[Config]', config);

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
    setTimeout(abrirLogAutomaticamente, 2000);
  });
} else {
  chrome.storage.local.get(
    ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled'],
    (data) => aplicarConfiguracao(data)
  );
  setTimeout(abrirLogAutomaticamente, 2000);
}