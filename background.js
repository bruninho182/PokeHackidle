chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'legendary-caught') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: '🌟 Pokémon Lendário!',
      message: 'Você capturou um Pokémon lendário!',
      priority: 2
    });
  } else if (message.type === 'epic-caught') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: '💎 Pokémon Épico!',
      message: 'Você capturou um Pokémon épico!',
      priority: 2
    });
  } else if (message.type === 'rare-caught') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: '✨ Pokémon Raro!',
      message: 'Você capturou um Pokémon raro!',
      priority: 2
    });
  }
});