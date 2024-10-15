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

L’addiction aux réseaux sociaux est un problème croissant, en particulier chez les jeunes. **YouthGuard** vise à aider les utilisateurs à contrôler leur temps d’écran, à garantir une expérience en ligne sécurisée et à prévenir l'exposition à des contenus dangereux. Ce projet comprend plusieurs modules, notamment la vérification d'identité, la limitation du temps d'utilisation et la modération automatisée, afin de favoriser le bien-être numérique des utilisateurs.

## Fonctionnalités principales

### Vérification d'identité
- **Vérification d’identité sécurisée** : À l’installation, l’utilisateur doit scanner ou télécharger une photo de sa carte d’identité.
- **Vérification d'âge par IA** : L’extension utilise la reconnaissance optique de caractères (OCR) pour lire la date de naissance et vérifier l’âge de l’utilisateur.
- **Restrictions en fonction de l’âge** : Si l’utilisateur est en dessous de l’âge légal pour accéder à certains réseaux sociaux, l’accès à ces plateformes est bloqué.

### Régulation du temps d'écran
- **Limite quotidienne d’utilisation** : L’accès aux réseaux sociaux est limité à une heure par jour.
- **Suivi des sites visités** : L’extension surveille le temps passé sur les réseaux sociaux populaires tels que Facebook, Instagram et TikTok.
- **Alertes avant blocage** : Une notification prévient l’utilisateur lorsque la limite de temps approche, et l’accès est bloqué une fois la limite atteinte.

### Restrictions adaptées à l'âge
- **Règles adaptées à l'âge** : En fonction de l’âge de l’utilisateur (vérifié via sa carte d’identité), l’extension adapte les restrictions :
  - **Pour les jeunes enfants** : Certains réseaux sociaux sont totalement interdits.
  - **Pour les adolescents** : Le temps d’écran peut être réduit (par exemple, moins de 30 minutes par jour).

### Blocage automatique
- **Blocage après dépassement de la limite** : Une fois le temps d’écran quotidien atteint, l’accès aux réseaux sociaux est bloqué pour le reste de la journée.
- **Déconnexion forcée** : Une option de déconnexion automatique peut être mise en place pour forcer les utilisateurs à respecter la limite de temps.

## Étapes de développement

1. **Développement de l’extension Chrome**
   - Implémenter une logique en JavaScript pour intercepter et suivre les sites de réseaux sociaux (Facebook, Instagram, TikTok).
   - Surveiller le temps passé sur chaque plateforme via les API du navigateur.

2. **Module de vérification d'identité**
   - Intégrer une bibliothèque OCR (comme Tesseract.js) pour scanner et extraire la date de naissance depuis la carte d'identité de l’utilisateur.
   - Utiliser des services IA ou des solutions cloud pour analyser et vérifier l’âge de l’utilisateur.

3. **Gestion du temps d’écran**
   - Utiliser le stockage local (`localStorage`) pour suivre et enregistrer le temps d’utilisation quotidien.
   - Développer une interface utilisateur minimaliste qui affiche le temps restant et envoie des notifications avant que la limite ne soit atteinte.

4. **Blocage d'accès**
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

## Contribuer

Les contributions de la communauté sont les bienvenues ! Si vous souhaitez participer, suivez ces étapes :
1. Forkez le dépôt.
2. Créez une nouvelle branche pour votre fonctionnalité ou correction de bug.
3. Soumettez une pull request avec une description détaillée de vos modifications.

## Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.

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
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE kids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  birth_date DATE,
  admin_id INT,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);
```

#### Insérer les utilisateurs

```sql
USE timeguard;

INSERT INTO users (username, password) VALUES
('lilian', 'toto'),
('louis', 'toto');
```

---