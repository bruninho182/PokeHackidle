chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'legendary-caught') {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: '🌟 Pokémon Lendário!', message: 'Você capturou um Pokémon lendário!', priority: 2 });
  } else if (message.type === 'epic-caught') {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: '💎 Pokémon Épico!', message: 'Você capturou um Pokémon épico!', priority: 2 });
  } else if (message.type === 'rare-caught') {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: '✨ Pokémon Raro!', message: 'Você capturou um Pokémon raro!', priority: 2 });
  } else if (message.type === 'iv-alto-detectado') {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: '🔥 IV ALTO DETECTADO!', message: `${message.nome} (${message.raridade}) - IV ${message.iv}`, priority: 2 });
  }
  
  if (message.type === 'getStats') {
    chrome.storage.local.get(['contadores'], (data) => { sendResponse(data.contadores || { lendaria: 0, epica: 0, rara: 0, total: 0 }); });
    return true;
  }
  if (message.type === 'resetStats') {
    chrome.storage.local.set({ contadores: { lendaria: 0, epica: 0, rara: 0, total: 0 } }, () => { sendResponse({ success: true }); });
    return true;
  }
});