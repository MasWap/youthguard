chrome.storage.local.get(['timeSpent'], (result) => {
    const remainingTime = 3600 - (result.timeSpent || 0);
    document.getElementById('timeRemaining').textContent = formatTime(remainingTime);
  });
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes} minutes ${sec} seconds`;
  }
  
  document.getElementById('idCardUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
  
    // Utilise Tesseract.js pour analyser l'image
    Tesseract.recognize(
      file,
      'eng', // Choix de la langue
      {
        logger: (m) => console.log(m) // Log pour suivre le processus
      }
    ).then(({ data: { text } }) => {
      const birthDate = extractBirthDate(text);
      document.getElementById('birthDate').textContent = "Birth Date: " + birthDate;
  
      // Stockage de la date de naissance
      chrome.storage.local.set({ birthDate });
    });
  });
  
  // Fonction pour extraire la date de naissance à partir du texte reconnu
  function extractBirthDate(text) {
    const match = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/); // Format DD/MM/YYYY
    return match ? match[0] : "Date not found";
  }
  