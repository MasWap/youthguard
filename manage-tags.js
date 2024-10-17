document.addEventListener('DOMContentLoaded', function () {
    fetchTags(); // Récupérer et afficher les tags au chargement de la page

    // Événement pour ajouter un nouveau tag
    document.getElementById('addTagButton').addEventListener('click', function () {
        const newTag = prompt("Entrez le nom du nouveau tag :");
        if (newTag) {
            addTag(newTag); // Appeler la fonction pour ajouter le tag
        }
    });
});

// Fonction pour récupérer les tags depuis l'API
async function fetchTags() {
    try {
        const response = await fetch('http://localhost:3000/tags'); // Remplacez par l'URL de votre API
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const tags = await response.json();
        console.log('Tags récupérés:', tags); // Debug: afficher les tags dans la console
        populateTagList(tags); // Remplir la liste avec les tags récupérés
    } catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);
    }
}

// Fonction pour remplir la liste avec des tags
function populateTagList(tags) {
    const tagList = document.getElementById('tagList');
    tagList.innerHTML = ''; // Vider la liste avant d'ajouter les tags

    if (tags.length === 0) {
        tagList.innerHTML = '<p>Aucun tag trouvé.</p>'; // Message si aucun tag n'est trouvé
    } else {
        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.textContent = tag.libelle; // Afficher le libellé du tag

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.addEventListener('click', function () {
                deleteTag(tag.id); // Appeler la fonction pour supprimer le tag
            });

            tagItem.appendChild(deleteButton); // Ajouter le bouton de suppression
            tagList.appendChild(tagItem); // Ajouter le tag à la liste
        });
    }
}

// Fonction pour ajouter un nouveau tag
async function addTag(tagName) {
    try {
        const response = await fetch('http://localhost:3000/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ libelle: tagName }),
        });
        const data = await response.json();
        if (data.success) {
            fetchTags(); // Rafraîchir la liste des tags
        } else {
            alert(data.message); // Afficher un message d'erreur
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du tag:', error);
    }
}

// Fonction pour supprimer un tag
async function deleteTag(tagId) {
    try {
        const response = await fetch(`http://localhost:3000/tags/${tagId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            fetchTags(); // Rafraîchir la liste des tags
        } else {
            alert(data.message); // Afficher un message d'erreur
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du tag:', error);
    }
}