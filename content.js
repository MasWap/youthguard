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
  
// Fonction principale pour récupérer les mots bannis et filtrer les posts en fonction de la plateforme
// Fonction principale pour récupérer les mots bannis et filtrer les posts en fonction de la plateforme
async function filterPosts() {
    const bannedTags = await getBannedTags(); // Récupérer les mots bannis
    console.log(`Mots bannis récupérés : ${bannedTags.join(', ')}`);

    const platform = detectPlatform(); // Détecter la plateforme actuelle

    if (platform === 'instagram') {
        filterInstagramPosts(bannedTags);
    } else if (platform === 'facebook') {
        filterFacebookPosts(bannedTags);
    } else if (platform === 'tiktok') {
        filterTiktokPosts(bannedTags);
    }
}

// Détecter la plateforme actuelle (basé sur l'URL du site)
function detectPlatform() {
    const url = window.location.href;
    if (url.includes('instagram.com')) {
        return 'instagram';
    } else if (url.includes('facebook.com')) {
        return 'facebook';
    } else if (url.includes('tiktok.com')) {
        return 'tiktok';
    }
    return null;
}

// Fonction pour masquer la publication avec un fond gris et un texte
function blockPost(post) {
    post.style.position = 'relative'; // S'assurer que le post est positionné relativement pour l'overlay

    // Créer un div qui recouvre le post avec le fond gris et le message
    const blockOverlay = document.createElement('div');
    blockOverlay.style.position = 'absolute';
    blockOverlay.style.top = '0';
    blockOverlay.style.left = '0';
    blockOverlay.style.width = '100%';
    blockOverlay.style.height = '100%';
    blockOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Fond gris avec opacité
    blockOverlay.style.display = 'flex';
    blockOverlay.style.alignItems = 'center';
    blockOverlay.style.justifyContent = 'center';
    blockOverlay.style.color = 'red';
    blockOverlay.style.fontSize = '20px';
    blockOverlay.style.fontWeight = 'bold';
    blockOverlay.innerText = 'Publication bloquée';

    post.appendChild(blockOverlay); // Ajouter le bloc par-dessus la publication
}

// Filtrer les posts Instagram
function filterInstagramPosts(bannedTags) {
    const posts = document.querySelectorAll('article'); // Sélection des posts Instagram

    posts.forEach(post => {
        const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post

        // Vérifier si la description contient un mot banni
        bannedTags.forEach(tag => {
            if (description.includes(tag.toLowerCase())) {
                console.log(`Post contenant un mot banni trouvé (Instagram) : ${description}`);
                console.log(`Mot banni : ${tag}`);
                blockPost(post); // Appeler la fonction pour bloquer le post
            }
        });
    });
}

// Filtrer les posts Facebook
function filterFacebookPosts(bannedTags) {
    const posts = document.querySelectorAll('div[role="article"]'); // Sélection des posts Facebook (balise <div> avec role="article")

    posts.forEach(post => {
        const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post

        // Vérifier si la description contient un mot banni
        bannedTags.forEach(tag => {
            if (description.includes(tag.toLowerCase())) {
                console.log(`Post contenant un mot banni trouvé (Facebook) : ${description}`);
                console.log(`Mot banni : ${tag}`);
                blockPost(post); // Appeler la fonction pour bloquer le post
            }
        });
    });
}

// Filtrer les posts TikTok
function filterTiktokPosts(bannedTags) {
    const posts = document.querySelectorAll('div[data-e2e="video"]'); // Sélection des posts TikTok (balise <div> avec data-e2e="video")

    posts.forEach(post => {
        const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post

        // Vérifier si la description contient un mot banni
        bannedTags.forEach(tag => {
            if (description.includes(tag.toLowerCase())) {
                console.log(`Post contenant un mot banni trouvé (TikTok) : ${description}`);
                console.log(`Mot banni : ${tag}`);
                blockPost(post); // Appeler la fonction pour bloquer le post
            }
        });
    });
}

// Écouter les événements de scroll pour vérifier les nouveaux posts qui apparaissent
window.addEventListener('scroll', function() {
    filterPosts(); // Filtrer les nouveaux posts qui apparaissent lors du scroll
});

// Filtrer immédiatement les posts à l'ouverture de la page
filterPosts();

createTimerElement();
createBlockElement();
createResetButton();