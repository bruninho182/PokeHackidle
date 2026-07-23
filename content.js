// ---- Variáveis ----
let autoClickInterval = null, observer = null;
const textosNotificados = new Set();
let ignoreUntil = 0, velocidadeClick = 1000;
let alertaIVEnabled = false, ivMinimo = 150;
let ivLendariaEnabled = true, ivEpicaEnabled = true, ivRaraEnabled = true;

// ---- Config ----
let config = { autoClick: true, notifyLendaria: true, notifyEpica: true, notifyRara: true, velocidade: 1000 };

// ---- AutoClick ----
function startAutoClick() {
  if (autoClickInterval) { clearInterval(autoClickInterval); autoClickInterval = null; }
  autoClickInterval = setInterval(() => {
    const b = document.querySelectorAll('button.cap-throw');
    for (const btn of b) { if (btn.textContent.trim() === 'Lançar') { btn.click(); break; } }
  }, velocidadeClick);
}
function stopAutoClick() { if (autoClickInterval) { clearInterval(autoClickInterval); autoClickInterval = null; } }

// ---- Som ----
function tocarSom(vol = 0.15, rate = 1.0) {
  try { const a = new Audio(chrome.runtime.getURL('lendario.mp3')); a.volume = vol; a.playbackRate = rate; a.play().catch(()=>{}); } catch (e) {}
}

// ---- Salvar Captura ----
function salvarCaptura(dados) {
  if (dados.raridade === 'Lendária' || dados.raridade === 'Épica' || dados.raridade === 'Rara') {
    chrome.storage.local.get(['historico','ultimaCaptura'], (data) => {
      const h = data.historico || [];
      const nova = { nome: dados.nome, raridade: dados.raridade, iv: dados.iv, bola: dados.bola, level: dados.level,
        horario: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), data: new Date().toLocaleDateString('pt-BR') };
      h.unshift(nova);
      chrome.storage.local.set({ historico: h.slice(0,50), ultimaCaptura: nova });
      verificarIVAlto(dados);
    });
  }
}

// ---- Extrair Dados ----
function extrairDadosCaptura(row) {
  const n = row.querySelector('span.clog-name'), l = row.querySelector('span.clog-lvl'),
        m = row.querySelector('span.clog-meta'), b = row.querySelector('span.clog-ball');
  if (!n || !m) return null;
  const nome = n.textContent.trim(), level = l ? l.textContent.trim().replace('Lv.','') : '?',
        bola = b ? b.textContent.trim() : 'Desconhecida', bold = m.querySelector('b'),
        raridade = bold ? bold.textContent.trim() : 'Comum',
        ivM = m.textContent.trim().match(/IV\s+(\d+)\/(\d+)/), iv = ivM ? `${ivM[1]}/${ivM[2]}` : '?/?';
  return { nome, raridade, iv, bola, level };
}

// ---- Contadores ----
function incrementarContador(r) {
  chrome.storage.local.get(['contadores'], (d) => {
    const c = d.contadores || { lendaria:0, epica:0, rara:0, total:0 };
    if (r==='Lendária') c.lendaria++; else if (r==='Épica') c.epica++; else if (r==='Rara') c.rara++;
    c.total++; chrome.storage.local.set({ contadores: c });
  });
}

// ---- Alerta IV Alto ----
function verificarIVAlto(dados) {
  if (!alertaIVEnabled) return;
  if (dados.raridade === 'Lendária' && !ivLendariaEnabled) return;
  if (dados.raridade === 'Épica' && !ivEpicaEnabled) return;
  if (dados.raridade === 'Rara' && !ivRaraEnabled) return;
  const m = dados.iv.match(/(\d+)\/(\d+)/); if (!m) return;
  if (parseInt(m[1]) >= ivMinimo) {
    const chaveUnica = `${dados.nome}|${dados.iv}|${dados.raridade}`;
    chrome.storage.local.get(['ivsNotificados'], (storage) => {
      const ivsNotificados = storage.ivsNotificados || [];
      if (ivsNotificados.includes(chaveUnica)) return;
      ivsNotificados.push(chaveUnica);
      chrome.storage.local.set({ ivsNotificados: ivsNotificados.slice(-200) }, () => {
        tocarSom(0.3, 1.5);
        chrome.runtime.sendMessage({ type:'iv-alto-detectado', nome:dados.nome, iv:dados.iv, raridade:dados.raridade });
      });
    });
  }
}

// ---- Processar Span ----
function processarSpan(span) {
  const b = span.querySelector('b'); if (!b) return;
  const r = b.textContent.trim(), t = span.textContent.trim();
  if (textosNotificados.has(t)) return;
  if (Date.now() < ignoreUntil) { textosNotificados.add(t); return; }
  const ok = (r==='Lendária'&&config.notifyLendaria)||(r==='Épica'&&config.notifyEpica)||(r==='Rara'&&config.notifyRara);
  if (ok) { textosNotificados.add(t); tocarSom(); incrementarContador(r);
    let tipo=''; if(r==='Lendária')tipo='legendary-caught'; else if(r==='Épica')tipo='epic-caught'; else tipo='rare-caught';
    chrome.runtime.sendMessage({type:tipo}); }
}

// ---- Processar Row ----
function processarClogRow(row) {
  const meta = row.querySelector('span.clog-meta');
  if (meta) { const b = meta.querySelector('b'); if (b) { const r = b.textContent.trim(); if (['Lendária','Épica','Rara'].includes(r)) { const d = extrairDadosCaptura(row); if (d) salvarCaptura(d); processarSpan(meta); } } }
}

// ---- Observer ----
function gerenciarObserver() {
  const p = config.notifyLendaria || config.notifyEpica || config.notifyRara;
  if (p && !observer) {
    observer = new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType===Node.ELEMENT_NODE) {
      if (n.matches&&n.matches('div.clog-row')) processarClogRow(n);
      if (n.matches&&n.matches('span.clog-meta')) processarSpan(n);
      if (n.querySelectorAll) { n.querySelectorAll('div.clog-row').forEach(r=>processarClogRow(r)); n.querySelectorAll('span.clog-meta').forEach(s=>processarSpan(s)); }
    }});
    observer.observe(document.body, { childList:true, subtree:true });
  } else if (!p && observer) { observer.disconnect(); observer = null; }
}

// ---- Log Automático (360x220, fecha Hunt Analyzer, acima do chat) ----
function abrirLogAutomaticamente() {
  const btnDock = document.querySelector('button.dock-btn[data-guide="dock-analyzer"]');
  if (!btnDock) { setTimeout(abrirLogAutomaticamente, 2000); return; }
  btnDock.click();
  setTimeout(() => {
    const btnLog = document.querySelector('button.ha-clog-btn');
    if (btnLog) {
      btnLog.click();
      setTimeout(() => {
        const clogWindow = document.querySelector('.clog-window');
        if (clogWindow) {
          clogWindow.style.setProperty('width', '360px', 'important');
          clogWindow.style.setProperty('height', '220px', 'important');
          clogWindow.style.setProperty('z-index', '9999', 'important');
          clogWindow.style.setProperty('position', 'fixed', 'important');
          clogWindow.style.setProperty('left', '14px', 'important');
          clogWindow.style.setProperty('bottom', '248px', 'important');
          clogWindow.style.removeProperty('top');
          clogWindow.style.removeProperty('right');
          clogWindow.style.removeProperty('inset');
          const clogList = clogWindow.querySelector('.clog-list');
          if (clogList) { clogList.style.setProperty('max-height', '120px', 'important'); clogList.style.setProperty('overflow-y', 'auto', 'important'); }
          const clogTitle = clogWindow.querySelector('.clog-title');
          if (clogTitle) { clogTitle.style.setProperty('font-size', '12px', 'important'); clogTitle.style.setProperty('padding', '4px 8px', 'important'); }
          const clogHead = clogWindow.querySelector('.clog-head');
          if (clogHead) { clogHead.style.setProperty('font-size', '10px', 'important'); clogHead.style.setProperty('padding', '4px 8px', 'important'); }
          const clogFoot = clogWindow.querySelector('.clog-foot');
          if (clogFoot) { clogFoot.style.setProperty('font-size', '10px', 'important'); clogFoot.style.setProperty('padding', '4px 8px', 'important'); }
        }
        const btnFecharHA = document.querySelector('.ha-x');
        if (btnFecharHA) btnFecharHA.click();
      }, 1000);
    }
  }, 2000);
}
document.addEventListener('click',(e)=>{ if(e.target.closest('button.ha-clog-btn')) ignoreUntil=Date.now()+2000; });

// ---- Aplicar Config ----
function aplicarConfiguracao(data) {
  config.autoClick = data.autoClickEnabled !== false;
  config.notifyLendaria = data.notifyLendariaEnabled !== false;
  config.notifyEpica = data.notifyEpicaEnabled !== false;
  config.notifyRara = data.notifyRaraEnabled !== false;
  config.velocidade = data.clickSpeed || 1000;
  alertaIVEnabled = data.alertaIVEnabled === true;
  ivMinimo = data.ivMinimo || 150;
  ivLendariaEnabled = data.ivLendariaEnabled !== false;
  ivEpicaEnabled = data.ivEpicaEnabled !== false;
  ivRaraEnabled = data.ivRaraEnabled !== false;
  if (config.autoClick) { velocidadeClick=config.velocidade; startAutoClick(); } else stopAutoClick();
  gerenciarObserver();
}

// ---- Storage ----
chrome.storage.onChanged.addListener((changes,area)=>{ if(area==='local') chrome.storage.local.get(['autoClickEnabled','notifyLendariaEnabled','notifyEpicaEnabled','notifyRaraEnabled','clickSpeed','alertaIVEnabled','ivMinimo','ivLendariaEnabled','ivEpicaEnabled','ivRaraEnabled'], (d)=>aplicarConfiguracao(d)); });

// ---- Init ----
if (document.readyState==='loading') { document.addEventListener('DOMContentLoaded',()=>{ chrome.storage.local.get(['autoClickEnabled','notifyLendariaEnabled','notifyEpicaEnabled','notifyRaraEnabled','clickSpeed','alertaIVEnabled','ivMinimo','ivLendariaEnabled','ivEpicaEnabled','ivRaraEnabled'],(d)=>aplicarConfiguracao(d)); setTimeout(abrirLogAutomaticamente,2000); }); }
else { chrome.storage.local.get(['autoClickEnabled','notifyLendariaEnabled','notifyEpicaEnabled','notifyRaraEnabled','clickSpeed','alertaIVEnabled','ivMinimo','ivLendariaEnabled','ivEpicaEnabled','ivRaraEnabled'],(d)=>aplicarConfiguracao(d)); setTimeout(abrirLogAutomaticamente,2000); }