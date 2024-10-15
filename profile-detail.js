// Simule le nom du profil actuellement sélectionné (cela viendra probablement de ton stockage ou d'une API)
const selectedProfileName = "Clément"; // Exemple, cela devrait venir d'une source dynamique

document.addEventListener('DOMContentLoaded', function() {
  // Affiche le nom du profil
  const profileNameElement = document.getElementById('profileName');
  profileNameElement.textContent = selectedProfileName;

  // Gère le retour à la page d'accueil
  document.getElementById('backToHome').addEventListener('click', function() {
    window.location.href = "home.html";
  });

  // Gère la suppression du profil
  document.getElementById('deleteProfile').addEventListener('click', function() {
    if (confirm(`Voulez-vous vraiment supprimer le profil ${selectedProfileName} ?`)) {
      alert(`Profil ${selectedProfileName} supprimé.`);
      // Ici tu ajouteras la logique pour supprimer le profil (API ou localStorage)
      window.location.href = "home.html"; // Redirige vers la page d'accueil
    }
  });

  // Gère la sauvegarde des modifications du profil
  document.getElementById('saveProfile').addEventListener('click', function() {
    const dob = document.getElementById('dob').value;
    const bannedTags = document.getElementById('bannedTags').value;
    const timeLimit = document.getElementById('timeLimit').value;

    alert(`Profil sauvegardé avec succès ! \nDate de naissance: ${dob}\nTags bannis: ${bannedTags}\nTemps de visionnage: ${timeLimit} par jour`);
    // Ici tu ajouteras la logique pour sauvegarder les modifications du profil (API ou localStorage)
  });
});
