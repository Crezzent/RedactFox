let lastClickedElement;

browser.contextMenus.create({
  id: "un-censor",
  title: "Show Content",
  contexts: ["all"],
  documentUrlPatterns: ["<all_urls>"]
});

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