// Elementos dos toggles
const toggleAutoClick = document.getElementById('toggleAutoClick');
const toggleNotify = document.getElementById('toggleNotify');
const statusDiv = document.getElementById('status');

// Carrega o estado salvo ao abrir o popup
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['autoClickEnabled', 'notifyEnabled'], (data) => {
    // Define os switches (padrão: true)
    toggleAutoClick.checked = data.autoClickEnabled !== false;
    toggleNotify.checked = data.notifyEnabled !== false;
    statusDiv.textContent = 'Estado carregado.';
  });
});

// Ao mudar o toggle do AutoClick
toggleAutoClick.addEventListener('change', () => {
  const enabled = toggleAutoClick.checked;
  chrome.storage.local.set({ autoClickEnabled: enabled }, () => {
    statusDiv.textContent = `AutoClick ${enabled ? 'ativado' : 'desativado'}.`;
  });
});

// Ao mudar o toggle da Notificação
toggleNotify.addEventListener('change', () => {
  const enabled = toggleNotify.checked;
  chrome.storage.local.set({ notifyEnabled: enabled }, () => {
    statusDiv.textContent = `Notificação ${enabled ? 'ativada' : 'desativada'}.`;
  });
});