// Elementos dos toggles
const toggleAutoClick = document.getElementById('toggleAutoClick');
const toggleNotifyLendaria = document.getElementById('toggleNotifyLendaria');
const toggleNotifyEpica = document.getElementById('toggleNotifyEpica');
const toggleNotifyRara = document.getElementById('toggleNotifyRara');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const statusDiv = document.getElementById('status');

// Elementos das estatísticas
const countLendaria = document.getElementById('countLendaria');
const countEpica = document.getElementById('countEpica');
const countRara = document.getElementById('countRara');
const countTotal = document.getElementById('countTotal');
const resetBtn = document.getElementById('resetStats');

// Carrega configurações ao abrir
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(
    ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled', 'clickSpeed'],
    (data) => {
      toggleAutoClick.checked = data.autoClickEnabled !== false;
      toggleNotifyLendaria.checked = data.notifyLendariaEnabled !== false;
      toggleNotifyEpica.checked = data.notifyEpicaEnabled !== false;
      toggleNotifyRara.checked = data.notifyRaraEnabled !== false;
      
      const speed = data.clickSpeed || 1000;
      speedSlider.value = speed;
      speedDisplay.textContent = speed + ' ms';
      
      statusDiv.textContent = 'Configurações carregadas.';
    }
  );
  
  // Carrega estatísticas
  carregarEstatisticas();
});

// Atualiza estatísticas sempre que o popup abrir
function carregarEstatisticas() {
  chrome.runtime.sendMessage({ type: 'getStats' }, (contadores) => {
    if (contadores) {
      countLendaria.textContent = contadores.lendaria || 0;
      countEpica.textContent = contadores.epica || 0;
      countRara.textContent = contadores.rara || 0;
      countTotal.textContent = contadores.total || 0;
    }
  });
}

// AutoClick toggle
toggleAutoClick.addEventListener('change', () => {
  chrome.storage.local.set({ autoClickEnabled: toggleAutoClick.checked }, () => {
    statusDiv.textContent = `AutoClick ${toggleAutoClick.checked ? 'ativado' : 'desativado'}.`;
  });
});

// Velocidade do slider
speedSlider.addEventListener('input', () => {
  const speed = parseInt(speedSlider.value);
  speedDisplay.textContent = speed + ' ms';
});

speedSlider.addEventListener('change', () => {
  const speed = parseInt(speedSlider.value);
  chrome.storage.local.set({ clickSpeed: speed }, () => {
    statusDiv.textContent = `Velocidade alterada para ${speed} ms.`;
  });
});

// Toggles de notificação
toggleNotifyLendaria.addEventListener('change', () => {
  chrome.storage.local.set({ notifyLendariaEnabled: toggleNotifyLendaria.checked }, () => {
    statusDiv.textContent = `Lendária ${toggleNotifyLendaria.checked ? 'ativada' : 'desativada'}.`;
  });
});

toggleNotifyEpica.addEventListener('change', () => {
  chrome.storage.local.set({ notifyEpicaEnabled: toggleNotifyEpica.checked }, () => {
    statusDiv.textContent = `Épica ${toggleNotifyEpica.checked ? 'ativada' : 'desativada'}.`;
  });
});

toggleNotifyRara.addEventListener('change', () => {
  chrome.storage.local.set({ notifyRaraEnabled: toggleNotifyRara.checked }, () => {
    statusDiv.textContent = `Rara ${toggleNotifyRara.checked ? 'ativada' : 'desativada'}.`;
  });
});

// Resetar estatísticas
resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'resetStats' }, (response) => {
    if (response && response.success) {
      countLendaria.textContent = '0';
      countEpica.textContent = '0';
      countRara.textContent = '0';
      countTotal.textContent = '0';
      statusDiv.textContent = 'Contadores resetados!';
    }
  });
});