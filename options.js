const form = document.getElementById('add-word-form');
const wordInput = document.getElementById('word-input');
const wordList = document.getElementById('word-list');

function loadWords() {
  browser.storage.local.get('censoredWords').then(result => {
    const words = result.censoredWords || [];
    wordList.innerHTML = '';
    words.forEach((word, index) => {
      const li = document.createElement('li');
      li.textContent = word;
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Remove';
      deleteBtn.onclick = () => removeWord(index);
      li.appendChild(deleteBtn);
      wordList.appendChild(li);
    });
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newWord = wordInput.value.trim();
  if (newWord) {
    browser.storage.local.get('censoredWords').then(result => {
      const words = result.censoredWords || [];
      if (!words.includes(newWord)) {
        words.push(newWord);
        browser.storage.local.set({ censoredWords: words }).then(() => {
          loadWords();
          wordInput.value = '';
        });
      }
    });
  }
});

function removeWord(index) {
  browser.storage.local.get('censoredWords').then(result => {
    let words = result.censoredWords || [];
    words.splice(index, 1);
    browser.storage.local.set({ censoredWords: words }).then(loadWords);
  });
}

document.addEventListener('DOMContentLoaded', loadWords);