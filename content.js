// Liste de mots à bannir (cela peut être récupéré via chrome.storage plus tard)
let bannedWords = [];

// Récupérer les mots bannis depuis le stockage Chrome
chrome.storage.sync.get("bannedWords", function(data) {
  bannedWords = data.bannedWords || [];
  console.log("Mots bannis récupérés : ", bannedWords);
  filterInstagramPosts(); // Filtrer les posts après avoir récupéré les mots bannis
});

// Fonction pour filtrer les posts en fonction des mots interdits
function filterInstagramPosts() {
    const posts = document.querySelectorAll('article'); // Sélection des posts Instagram (les posts sont des éléments <article>)
  
    posts.forEach(post => {
      const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post
      
      // Vérifier si la description contient un mot banni
      const containsBannedWord = bannedWords.some(word => description.includes(word.toLowerCase()));
  
      if (containsBannedWord) {
        console.log(`Post contenant un mot banni trouvé : ${description}`);
        post.style.display = 'none'; // Masquer le post au lieu de le supprimer
      }
    });
  }
  

// Écouter les événements de scroll pour vérifier les nouveaux posts qui apparaissent
window.addEventListener('scroll', function() {
  filterInstagramPosts(); // Filtrer les nouveaux posts qui apparaissent lors du scroll
});
