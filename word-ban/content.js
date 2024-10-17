// Liste de mots par défaut à bannir (en français)
let defaultBannedWords = [
    "insulte1", "insulte2", "insulte3", // Remplace par les vrais mots à bannir
    "injure1", "grossièreté1"
];

// Liste de mots personnalisés à bannir (ajoutés par l'utilisateur)
let customBannedWords = [];

// Fonction pour récupérer les mots bannis depuis le stockage Chrome
function updateBannedWords() {
    chrome.storage.sync.get("bannedWords", function(data) {
        customBannedWords = data.bannedWords || [];
        console.log("Mots personnalisés récupérés : ", customBannedWords);

        // Combiner les mots par défaut avec les mots personnalisés
        const allBannedWords = defaultBannedWords.concat(customBannedWords);
        console.log("Liste complète des mots bannis : ", allBannedWords);

        // Filtrer les posts après avoir récupéré les mots bannis
        filterInstagramPosts(allBannedWords);
    });
}

// Fonction pour filtrer les posts en fonction des mots interdits
function filterInstagramPosts(bannedWords) {

    const posts = document.querySelectorAll('article'); // Sélection des posts Instagram

    posts.forEach(post => {
        const description = post.innerText.toLowerCase(); // Récupérer le texte (description) du post

        // Vérifier si la description contient un mot banni
        const containsBannedWord = bannedWords.some(word => description.includes(word.toLowerCase()));

        if (containsBannedWord) {
            console.log(`Post contenant un mot banni trouvé : ${description}`);
            post.style.display = 'none'; // Masquer le post si un mot banni est trouvé
        } else {
        }
    });

    console.log("Filtrage terminé.");
}

// Écouter les événements de scroll pour vérifier les nouveaux posts qui apparaissent
window.addEventListener('scroll', function() {
    updateBannedWords(); // Récupérer les mots bannis et filtrer les nouveaux posts
});

// Initialiser l'extension en récupérant les mots bannis à l'ouverture
updateBannedWords();

// Ajouter un mot personnalisé via l'extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "addBannedWord") {
        const newWord = request.word.toLowerCase(); // Ajouter en minuscule pour éviter les erreurs de casse
        chrome.storage.sync.get("bannedWords", function(data) {
            let bannedWords = data.bannedWords || [];
            if (!bannedWords.includes(newWord)) {
                bannedWords.push(newWord); // Ajouter le nouveau mot s'il n'est pas déjà dans la liste
                chrome.storage.sync.set({ bannedWords: bannedWords }, function() {
                    console.log(`Nouveau mot ajouté : ${newWord}`);
                    updateBannedWords(); // Mettre à jour la liste des mots bannis après ajout
                });
            }
        });
    }
});
