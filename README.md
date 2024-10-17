![Logo](images/logo.png)

# YouthGuard - Extension de Navigateur Anti-Addiction

**YouthGuard** est une extension de navigateur conçue pour aider les utilisateurs à réguler leur utilisation des réseaux sociaux et à prévenir l’addiction. Elle inclut des fonctionnalités de vérification d’identité sécurisée, de gestion du temps d’écran, ainsi qu’une modération automatisée des contenus pour favoriser un usage sain, notamment chez les jeunes.

## Table des matières
1. [Introduction](#introduction)
2. [Fonctionnalités principales](#fonctionnalités-principales)
   - [Vérification d'identité](#vérification-didentité)
   - [Régulation du temps d'écran](#régulation-du-temps-décran)
   - [Restrictions adaptées à l'âge](#restrictions-adaptées-à-lâge)
   - [Blocage automatique](#blocage-automatique)
3. [Étapes de développement](#étapes-de-développement)
4. [Installation](#installation)
5. [Utilisation](#utilisation)
6. [Contribuer](#contribuer)
7. [Licence](#licence)

## Introduction

L’addiction aux réseaux sociaux est un problème croissant, en particulier chez les jeunes. **YouthGuard** vise à aider les utilisateurs à contrôler leur temps d’écran, à garantir une expérience en ligne sécurisée et à prévenir l'exposition à des contenus dangereux. Ce projet comprend plusieurs modules, la limitation du temps d'utilisation et la modération automatisée, afin de favoriser le bien-être numérique des utilisateurs.

## Fonctionnalités principales

### Régulation du temps d'écran
- **Limite quotidienne d’utilisation** : L’accès aux réseaux sociaux est limité en fonction du temps définit par le parent.
- **Suivi des sites visités** : L’extension surveille le temps passé sur les réseaux sociaux populaires tels que Facebook, Instagram et TikTok.
- **Alertes avant blocage** : Une notification prévient l’utilisateur lorsque la limite de temps approche, et l’accès est bloqué une fois la limite atteinte.

### Blocage automatique
- **Blocage après dépassement de la limite** : Une fois le temps d’écran quotidien atteint, l’accès aux réseaux sociaux est bloqué.

## Étapes de développement

1. **Développement de l’extension Chrome**
   - Implémenter une logique en JavaScript pour intercepter et suivre les sites de réseaux sociaux (Facebook, Instagram, TikTok).
   - Surveiller le temps passé sur chaque plateforme via les API du navigateur.

2. **Gestion du temps d’écran**
   - Utiliser le stockage local (`localStorage`) pour suivre et enregistrer le temps d’utilisation quotidien.
   - Développer une interface utilisateur minimaliste qui affiche le temps restant et envoie des notifications avant que la limite ne soit atteinte.

3. **Blocage d'accès**
   - Rediriger l’utilisateur vers une page de notification expliquant que son temps d’écran est écoulé lorsqu'il atteint la limite quotidienne.

## Installation

Pour installer YouthGuard, suivez ces étapes :
1. Clonez le dépôt sur votre machine locale :
   ```bash
   git clone https://github.com/MasWap/youthguard.git
   ```
2. Accédez au répertoire du projet :
   ```bash
   cd youthguard
   ```
3. Chargez l’extension dans votre navigateur :
   - Ouvrez Chrome et allez sur `chrome://extensions/`.
   - Activez le "Mode développeur".
   - Cliquez sur "Charger l’extension non empaquetée" et sélectionnez le dossier YouthGuard.

## Utilisation

1. **Configurer la vérification d’identité** : Après l’installation, suivez les instructions à l’écran pour scanner ou télécharger votre carte d’identité pour la vérification d’âge.
2. **Surveillez votre temps d’écran** : L’extension suivra automatiquement votre utilisation des réseaux sociaux supportés.
3. **Gérez les alertes et les limites** : Vous recevrez des notifications lorsque vous approcherez de votre limite quotidienne. Une fois la limite atteinte, l’accès aux plateformes sera bloqué jusqu’au lendemain.

## Développeur

### Prérequis

Npm, docker, docker-compose

### Commandes à taper pour démarrer la bdd et l'app

Pour démarrer l'application, veuillez lancer les commandes suivantes :

#### Démarrer docker

```bash
docker-compose up -d
```

#### Vérifier que les conteneurs tournent

```bash
docker-compose ps
```

#### Accéder au repertoir du serveur de base de donnée, installer les packets, et le lancer

```bash
cd server
npm install
node server.js
```

#### Accès à l'interface de base de données

```bash
http://localhost:8081
```

#### Générer la table users

```sql
-- Création de la table des administrateurs
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL UNIQUE
);

-- Création de la table des tags (mots à filtrer)
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(255) NOT NULL UNIQUE
);

-- Création de la table des enfants avec la colonne is_active pour indiquer si un compte est actif
CREATE TABLE kids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  birth_date DATE,
  is_active BOOLEAN DEFAULT FALSE,  -- Par défaut, le compte est actif
  max_time INT DEFAULT 3600,       -- Temps maximum de visionnage par défaut (1 heure)
  uuid VARCHAR(36) UNIQUE,          -- Colonne pour stocker l'UUID
  admin_id INT,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Création de la table de relation entre les enfants et les tags (many-to-many)
CREATE TABLE kids_tags (
  kid_id INT,
  tag_id INT,
  PRIMARY KEY (kid_id, tag_id),
  FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Insertion de l'administrateur avec les données fournies
INSERT INTO admins (username, password, ip_address) 
VALUES 
('test', '$2a$10$jPZTP7Ol8DcvtqOD/1fIG.kpZXcAIvYwIvNCQ0KxPw8TcJXOYRw/a', '195.15.137.164');

-- Insertion des tags (mots à filtrer)
INSERT INTO tags (libelle) 
VALUES 
('Violence'), 
('Drogue'), 
('Horreur'), 
('Bagage');

-- Insertion des enfants avec is_active indiquant s'ils sont actifs ou non
INSERT INTO kids (username, birth_date, is_active, max_time, admin_id) 
VALUES 
('Alice', '2011-04-12', FALSE, 3600, 1),
('Bob', '2012-09-20', FALSE, 340, 1),
('Charlie', '2010-02-18', TRUE, 60, 1);

-- Association des enfants avec des tags (mots à filtrer)
INSERT INTO kids_tags (kid_id, tag_id) 
VALUES 
(1, 1),
(1, 4),
(2, 2),
(2, 3),
(3, 1),
(3, 3);

```

## Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.

---