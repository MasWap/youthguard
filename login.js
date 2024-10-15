document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Simule la connexion (les données d'exemple)
  if (email === "test@test.com" && password === "password") {
    localStorage.setItem('user', email);  // Simule la session utilisateur
    window.location.href = "home.html";   // Redirection vers la page d'accueil
  } else {
    alert("Identifiants incorrects");
  }
});
