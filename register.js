document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
  
    // Simule l'enregistrement de l'utilisateur
    localStorage.setItem('user', email);  // Simule la session utilisateur
    alert("Inscription réussie !");
    window.location.href = "home.html";   // Redirection vers la page d'accueil
  });
  