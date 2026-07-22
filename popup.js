const toggleAutoClick = document.getElementById('toggleAutoClick');
const toggleNotifyLendaria = document.getElementById('toggleNotifyLendaria');
const toggleNotifyEpica = document.getElementById('toggleNotifyEpica');
const toggleNotifyRara = document.getElementById('toggleNotifyRara');
const statusDiv = document.getElementById('status');

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(
    ['autoClickEnabled', 'notifyLendariaEnabled', 'notifyEpicaEnabled', 'notifyRaraEnabled'],
    (data) => {
      toggleAutoClick.checked = data.autoClickEnabled !== false;
      toggleNotifyLendaria.checked = data.notifyLendariaEnabled !== false;
      toggleNotifyEpica.checked = data.notifyEpicaEnabled !== false;
      toggleNotifyRara.checked = data.notifyRaraEnabled !== false;
      statusDiv.textContent = 'Estado carregado.';
    }
  );
});

toggleAutoClick.addEventListener('change', () => {
  chrome.storage.local.set({ autoClickEnabled: toggleAutoClick.checked }, () => {
    statusDiv.textContent = `AutoClick ${toggleAutoClick.checked ? 'ativado' : 'desativado'}.`;
  });
});

toggleNotifyLendaria.addEventListener('change', () => {
  chrome.storage.local.set({ notifyLendariaEnabled: toggleNotifyLendaria.checked }, () => {
    statusDiv.textContent = `Notif. Lendária ${toggleNotifyLendaria.checked ? 'ativada' : 'desativada'}.`;
  });
});

toggleNotifyEpica.addEventListener('change', () => {
  chrome.storage.local.set({ notifyEpicaEnabled: toggleNotifyEpica.checked }, () => {
    statusDiv.textContent = `Notif. Épica ${toggleNotifyEpica.checked ? 'ativada' : 'desativada'}.`;
  });
});

toggleNotifyRara.addEventListener('change', () => {
  chrome.storage.local.set({ notifyRaraEnabled: toggleNotifyRara.checked }, () => {
    statusDiv.textContent = `Notif. Rara ${toggleNotifyRara.checked ? 'ativada' : 'desativada'}.`;
  });
});