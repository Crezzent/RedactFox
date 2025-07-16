let censoredWordsCache = [];

function updateCache() {
  browser.storage.local.get('censoredWords').then(result => {
    censoredWordsCache = result.censoredWords || [];
    console.log('RedactFox Cache: Updated with', censoredWordsCache);
  });
}

updateCache();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-word-list') {
    sendResponse(censoredWordsCache);
  }

  if (message.type === 'word-list-updated') {
    updateCache();
  }
});

browser.contextMenus.create({
  id: "un-censor",
  title: "Show Content",
  contexts: ["all"],
  documentUrlPatterns: ["<all_urls>"]
});

let lastClickedElement;

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'censored-right-click') {
    lastClickedElement = message.targetId;
  }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "un-censor" && lastClickedElement) {
    browser.tabs.sendMessage(tab.id, {
      type: 'un-censor-word',
      targetId: lastClickedElement
    });
  }
});