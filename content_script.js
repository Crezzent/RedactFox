let censoredWords = [];
let nextElementId = 0;

function censorPage() {
  if (censoredWords.length === 0) return;
  const regex = new RegExp(censoredWords.join('|'), 'gi');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;
    const matches = node.nodeValue.match(regex);
    if (matches) {
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      node.nodeValue.replace(regex, (match, offset) => {
        fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, offset)));
        const censoredSpan = document.createElement('span');
        censoredSpan.className = 'censored-word';
        censoredSpan.textContent = match;
        censoredSpan.dataset.original = match;
        censoredSpan.id = `censored-id-${nextElementId++}`;
        fragment.appendChild(censoredSpan);
        lastIndex = offset + match.length;
      });
      fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    }
  }
}

browser.storage.local.get('censoredWords').then(result => {
  censoredWords = result.censoredWords || [];
  censorPage();
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.classList.contains('censored-word')) {
    browser.runtime.sendMessage({
      type: 'censored-right-click',
      targetId: e.target.id
    });
  }
}, true);

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'un-censor-word') {
    const elementToReveal = document.getElementById(message.targetId);
    if (elementToReveal) {
      elementToReveal.classList.add('revealed-word');
    }
  }
});