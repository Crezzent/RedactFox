
document.documentElement.style.visibility = 'hidden';

let censoredWords = [];
let nextElementId = 0;
let debounceTimer;

function censorNode(node) {
  if (censoredWords.length === 0) return;

  const regex = new RegExp(censoredWords.join('|'), 'gi');
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const nodesToReplace = [];

  while (walker.nextNode()) {
    const textNode = walker.currentNode;

    if (textNode.parentElement.closest('.censored-word, SCRIPT, STYLE')) {
      continue;
    }
    
    if (regex.test(textNode.nodeValue)) {
      nodesToReplace.push(textNode);
    }
  }

  nodesToReplace.forEach(textNode => {
    if (!textNode.parentNode) return;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    textNode.nodeValue.replace(regex, (match, offset) => {
      fragment.appendChild(document.createTextNode(textNode.nodeValue.slice(lastIndex, offset)));
      const censoredSpan = document.createElement('span');
      censoredSpan.className = 'censored-word';
      censoredSpan.textContent = match;
      censoredSpan.id = `censored-id-${nextElementId++}`;
      fragment.appendChild(censoredSpan);
      lastIndex = offset + match.length;
    });
    fragment.appendChild(document.createTextNode(textNode.nodeValue.slice(lastIndex)));
    textNode.parentNode.replaceChild(fragment, textNode);
  });
}

function handleMutation() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    censorNode(document.body);
  }, 300);
}

const observer = new MutationObserver(handleMutation);


browser.runtime.sendMessage({ type: 'get-word-list' }).then(wordList => {
  censoredWords = wordList || [];

  window.addEventListener('DOMContentLoaded', () => {
    censorNode(document.body);
    
    document.documentElement.style.visibility = 'visible';

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
});

// --- CONTEXT MENU LISTENERS ---
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