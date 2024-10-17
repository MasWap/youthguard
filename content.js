let timerElement;
let blockElement;
let resetButton;

function createTimerElement() {
  timerElement = document.createElement('div');
  timerElement.id = 'timeguard-timer';
  timerElement.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(timerElement);
}

function createBlockElement() {
  blockElement = document.createElement('div');
  blockElement.id = 'timeguard-block';
  blockElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    z-index: 9998;
    display: none;
  `;
  blockElement.textContent = "Temps écoulé ! Vous ne pouvez plus naviguer.";
  document.body.appendChild(blockElement);
}

function createResetButton() {
  resetButton = document.createElement('button');
  resetButton.textContent = 'Réinitialiser le temps';
  resetButton.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
  `;
  
  resetButton.addEventListener('click', () => {
    // Logique pour réinitialiser le temps
    chrome.runtime.sendMessage({ action: "resetTimer" });
  });

  document.body.appendChild(resetButton);
}

function updateTimer(remainingTime) {
  if (!timerElement) {
    createTimerElement();
  }
  timerElement.textContent = formatTime(remainingTime);

  if (remainingTime <= 0) {
    showBlockElement();
  }
}

function showBlockElement() {
  if (blockElement) {
    blockElement.style.display = 'flex';
  }
}

function hideBlockElement() {
  if (blockElement) {
    blockElement.style.display = 'none';
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimer") {
    updateTimer(request.remainingTime);
  }
});

// Fonction pour récupérer les mots bannis (tags) de l'enfant actif
async function getBannedTags() {
    try {
      const response = await fetch('http://localhost:3000/active-kid-tags');
      const data = await response.json();
  
      if (data.success) {
        // console.log("Tags récupérés de l'enfant actif:", data.bannedTags);
        return data.bannedTags;
      } else {
        console.error("Erreur lors de la récupération des tags:", data.message);
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la requête pour récupérer les tags:", error);
      return [];
    }
  }
  
  // Fonction pour filtrer les posts en fonction des mots interdits
  async function filterInstagramPosts() {
    const bannedTags = await getBannedTags(); // Récupérer les mots bannis
    // console.log(`Mots bannis récupérés : ${bannedTags.join(', ')}`);

    const posts = document.querySelectorAll('article'); // Sélection des posts Instagram
  
    posts.forEach(post => {
      const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post
  
      // Vérifier si la description contient un mot banni
      const containsBannedWord = bannedTags.some(tag => description.includes(tag.toLowerCase()));
  
      if (containsBannedWord) {
        console.log(`Post contenant un mot banni trouvé : ${description}`);
        post.style.visibility = 'hidden'; // Masquer le post si un mot banni est trouvé
      }
    });
  }
  
  // Écouter les événements de scroll pour vérifier les nouveaux posts qui apparaissent
  window.addEventListener('scroll', function() {
    filterInstagramPosts(); // Filtrer les nouveaux posts qui apparaissent lors du scroll
  });
  
// Filtrer immédiatement les posts à l'ouverture de la page
filterInstagramPosts();  
createTimerElement();
createBlockElement();
createResetButton();