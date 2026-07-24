// Elementos
const toggleAutoClick = document.getElementById('toggleAutoClick');
const speedSlider = document.getElementById('speedSlider');
const speedInput = document.getElementById('speedInput');
const toggleAlertaIV = document.getElementById('toggleAlertaIV');
const ivMinSlider = document.getElementById('ivMinSlider');
const ivMinInput = document.getElementById('ivMinInput');
const toggleIVLendaria = document.getElementById('toggleIVLendaria');
const toggleIVEpica = document.getElementById('toggleIVEpica');
const toggleIVRara = document.getElementById('toggleIVRara');
const toggleAlertaDrop = document.getElementById('toggleAlertaDrop');
const dropItensInput = document.getElementById('dropItensInput');
const toggleRotacao = document.getElementById('toggleRotacao');
const tempoAreaInput = document.getElementById('tempoAreaInput');
const listaAreas = document.getElementById('listaAreas');
const btnCapturarArea = document.getElementById('btnCapturarArea');
const btnIniciarRotacao = document.getElementById('btnIniciarRotacao');
const countLendaria = document.getElementById('countLendaria');
const countEpica = document.getElementById('countEpica');
const countRara = document.getElementById('countRara');
const countTotal = document.getElementById('countTotal');
const resetBtn = document.getElementById('resetStats');
const historicoLista = document.getElementById('historicoLista');
const toggleNotifyLendaria = document.getElementById('toggleNotifyLendaria');
const toggleNotifyEpica = document.getElementById('toggleNotifyEpica');
const toggleNotifyRara = document.getElementById('toggleNotifyRara');
const secAlertaIV = document.getElementById('secAlertaIV');
const secAlertaDrop = document.getElementById('secAlertaDrop');
const secRotacao = document.getElementById('secRotacao');

// Função para salvar no storage
function save(key, value) { chrome.storage.local.set({ [key]: value }); }

// Carregar configurações ao abrir
function loadConfig() {
  chrome.storage.local.get([
    'autoClickEnabled','notifyLendariaEnabled','notifyEpicaEnabled','notifyRaraEnabled',
    'clickSpeed','alertaIVEnabled','ivMinimo','ivLendariaEnabled','ivEpicaEnabled','ivRaraEnabled',
    'alertaDropEnabled','dropItens','rotacaoAtiva','tempoArea','areasRotacao'
  ], (data) => {
    toggleAutoClick.checked = data.autoClickEnabled !== false;
    speedSlider.value = data.clickSpeed || 1000;
    speedInput.value = data.clickSpeed || 1000;
    toggleAlertaIV.checked = data.alertaIVEnabled === true;
    secAlertaIV.style.display = data.alertaIVEnabled ? 'block' : 'none';
    ivMinSlider.value = data.ivMinimo || 150;
    ivMinInput.value = data.ivMinimo || 150;
    toggleIVLendaria.checked = data.ivLendariaEnabled !== false;
    toggleIVEpica.checked = data.ivEpicaEnabled !== false;
    toggleIVRara.checked = data.ivRaraEnabled !== false;
    toggleAlertaDrop.checked = data.alertaDropEnabled === true;
    secAlertaDrop.style.display = data.alertaDropEnabled ? 'block' : 'none';
    dropItensInput.value = data.dropItens || '';
    toggleRotacao.checked = data.rotacaoAtiva === true;
    secRotacao.style.display = data.rotacaoAtiva ? 'block' : 'none';
    tempoAreaInput.value = data.tempoArea || 4;
    toggleNotifyLendaria.checked = data.notifyLendariaEnabled !== false;
    toggleNotifyEpica.checked = data.notifyEpicaEnabled !== false;
    toggleNotifyRara.checked = data.notifyRaraEnabled !== false;
    carregarListaAreas();
    carregarEstatisticas();
    carregarHistorico();
  });
}

// Event Listeners
toggleAutoClick.addEventListener('change', () => save('autoClickEnabled', toggleAutoClick.checked));
speedSlider.addEventListener('input', () => { speedInput.value = speedSlider.value; });
speedSlider.addEventListener('change', () => save('clickSpeed', parseInt(speedSlider.value)));
speedInput.addEventListener('change', () => {
  let v = parseInt(speedInput.value) || 1000;
  if (v < 500) v = 500; if (v > 5000) v = 5000;
  speedSlider.value = v; speedInput.value = v;
  save('clickSpeed', v);
});

toggleAlertaIV.addEventListener('change', () => {
  save('alertaIVEnabled', toggleAlertaIV.checked);
  secAlertaIV.style.display = toggleAlertaIV.checked ? 'block' : 'none';
});
ivMinSlider.addEventListener('input', () => { ivMinInput.value = ivMinSlider.value; });
ivMinSlider.addEventListener('change', () => save('ivMinimo', parseInt(ivMinSlider.value)));
ivMinInput.addEventListener('change', () => {
  let v = parseInt(ivMinInput.value) || 150;
  if (v < 100) v = 100; if (v > 192) v = 192;
  ivMinSlider.value = v; ivMinInput.value = v;
  save('ivMinimo', v);
});
toggleIVLendaria.addEventListener('change', () => save('ivLendariaEnabled', toggleIVLendaria.checked));
toggleIVEpica.addEventListener('change', () => save('ivEpicaEnabled', toggleIVEpica.checked));
toggleIVRara.addEventListener('change', () => save('ivRaraEnabled', toggleIVRara.checked));

toggleAlertaDrop.addEventListener('change', () => {
  save('alertaDropEnabled', toggleAlertaDrop.checked);
  secAlertaDrop.style.display = toggleAlertaDrop.checked ? 'block' : 'none';
});
dropItensInput.addEventListener('input', () => save('dropItens', dropItensInput.value));

toggleRotacao.addEventListener('change', () => {
  save('rotacaoAtiva', toggleRotacao.checked);
  secRotacao.style.display = toggleRotacao.checked ? 'block' : 'none';
});
tempoAreaInput.addEventListener('change', () => save('tempoArea', parseInt(tempoAreaInput.value) || 4));

btnCapturarArea.addEventListener('click', () => {
  chrome.storage.local.set({ capturarProximaArea: true });
  alert('Modo captura ativado! Abra o mapa no jogo e clique nas áreas.');
});
btnIniciarRotacao.addEventListener('click', () => {
  chrome.storage.local.set({ capturarProximaArea: false, rotacaoAtiva: true });
  toggleRotacao.checked = true;
  secRotacao.style.display = 'block';
  alert('Rotação iniciada!');
});

toggleNotifyLendaria.addEventListener('change', () => save('notifyLendariaEnabled', toggleNotifyLendaria.checked));
toggleNotifyEpica.addEventListener('change', () => save('notifyEpicaEnabled', toggleNotifyEpica.checked));
toggleNotifyRara.addEventListener('change', () => save('notifyRaraEnabled', toggleNotifyRara.checked));

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'resetStats' }, (r) => {
    if (r && r.success) {
      countLendaria.textContent = '0'; countEpica.textContent = '0'; countRara.textContent = '0'; countTotal.textContent = '0';
    }
  });
});

function carregarListaAreas() {
  chrome.storage.local.get(['areasRotacao'], (d) => {
    const areas = d.areasRotacao || [];
    listaAreas.innerHTML = areas.map((a, i) => 
      `<div class="area-item"><span>${a.nome || 'Área '+(i+1)}</span><button data-index="${i}" class="remover-area">✕</button></div>`
    ).join('');
    document.querySelectorAll('.remover-area').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        areas.splice(idx, 1);
        chrome.storage.local.set({ areasRotacao: areas }, carregarListaAreas);
      });
    });
  });
}

function carregarEstatisticas() {
  chrome.runtime.sendMessage({ type: 'getStats' }, (c) => {
    if (c) {
      countLendaria.textContent = c.lendaria || 0;
      countEpica.textContent = c.epica || 0;
      countRara.textContent = c.rara || 0;
      countTotal.textContent = c.total || 0;
    }
  });
}

function carregarHistorico() {
  chrome.storage.local.get(['historico'], (data) => {
    const h = data.historico || [];
    if (h.length === 0) {
      historicoLista.innerHTML = '<div class="historico-vazio">Nenhuma captura ainda</div>';
      return;
    }
    historicoLista.innerHTML = h.slice(0, 10).map(item => {
      let rc = '';
      if (item.raridade === 'Lendária') rc = 'cor-lendario';
      else if (item.raridade === 'Épica') rc = 'cor-epico';
      else if (item.raridade === 'Rara') rc = 'cor-raro';
      return `<div class="historico-item">
        <span class="hist-nome">${item.nome}</span>
        <span class="hist-raridade ${rc}">${item.raridade}</span>
        <span class="hist-iv">IV ${item.iv}</span>
        <span class="hist-hora">${item.horario}</span>
      </div>`;
    }).join('');
  });
}

// Atualiza automaticamente ao detectar mudanças no storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.areasRotacao) carregarListaAreas();
    if (changes.contadores) carregarEstatisticas();
    if (changes.historico || changes.ultimaCaptura) carregarHistorico();
  }
});

loadConfig();
setInterval(carregarEstatisticas, 2000);
setInterval(carregarHistorico, 2000);
setInterval(carregarListaAreas, 5000);