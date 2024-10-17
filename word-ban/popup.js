document.addEventListener('DOMContentLoaded', function() {
    const bannedWordsList = document.getElementById('bannedWordsList');
    const addWordBtn = document.getElementById('addWordBtn');
    const newWordInput = document.getElementById('newWord');
  
    // Charger les mots bannis au chargement de la popup
    chrome.storage.sync.get("bannedWords", function(data) {
      const bannedWords = data.bannedWords || [];
      console.log("Mots bannis récupérés au chargement de la popup :", bannedWords);
      bannedWords.forEach(word => {
        addWordToList(word);
      });
    });
  
    // Ajouter un nouveau mot à la liste et le sauvegarder
    addWordBtn.addEventListener('click', function() {
      const newWord = newWordInput.value.trim();
      if (newWord) {
        chrome.storage.sync.get("bannedWords", function(data) {
          const bannedWords = data.bannedWords || [];
          if (!bannedWords.includes(newWord)) { // Vérifier si le mot n'est pas déjà dans la liste
            bannedWords.push(newWord);
            chrome.storage.sync.set({ bannedWords: bannedWords }, function() {
              console.log("Mot ajouté à la liste de storage :", newWord);
              addWordToList(newWord); // Ajouter visuellement à la liste
              newWordInput.value = ''; // Réinitialiser l'input
            });
          } else {
            console.log("Mot déjà présent dans la liste :", newWord);
          }
        });
      }
    });
  
    // Ajouter un mot à la liste de mots affichée dans la popup
    function addWordToList(word) {
      const li = document.createElement('li');
      li.textContent = word;
      bannedWordsList.appendChild(li);
    }
});
