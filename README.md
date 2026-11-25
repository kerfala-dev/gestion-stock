# StockManager

**Application web de gestion de stock multi-utilisateur**

StockManager est une application web conçue pour faciliter la gestion des stocks, des produits, des catégories, des fournisseurs et des mouvements de stock.

Le projet repose sur une architecture frontend/backend avec une gestion des utilisateurs et des permissions selon leurs rôles.

## Fonctionnalités principales

- Authentification sécurisée avec JWT et cookies HTTP-only.
- Gestion des produits.
- Gestion des catégories.
- Gestion des fournisseurs.
- Gestion des mouvements de stock.
- Tableau de bord.
- Gestion des utilisateurs.
- Activation et désactivation des comptes.
- Gestion des rôles et permissions.
- Isolation des données par organisation.
- Validation des données côté serveur.

## Technologies utilisées

### Frontend
- React
- TypeScript
- Bootstrap
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Argon2
- Helmet

### Outils
- Git
- GitHub
- Visual Studio Code

## Architecture du projet

Le projet est organisé en deux parties principales :

```text
gestion-stock/
│
├── frontend/
│   ├── src/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── prisma/
│   └── ...
│
├── .gitignore
└── README.md
```

## Gestion des rôles

| Rôle | Permissions |
|---|---|
| ADMIN | Gestion complète de l'organisation |
| MANAGER | Gestion opérationnelle et création d'employés |
| EMPLOYEE | Accès aux fonctionnalités autorisées |

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/kerfala-dev/gestion-stock.git
cd gestion-stock
```

### 2. Installer les dépendances

Installer les dépendances du backend et du frontend :

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 3. Configuration

Créer les fichiers `.env` nécessaires dans les dossiers concernés en suivant les fichiers `.env.example`.

Configurer notamment :
- La connexion PostgreSQL.
- Le secret JWT.
- L'URL du frontend.
- Les paramètres du serveur backend.

Ne jamais publier les véritables variables d'environnement.

### 4. Base de données

Configurer PostgreSQL et appliquer les migrations Prisma selon la configuration du projet.

### 5. Démarrage

Démarrer le backend et le frontend dans deux terminaux distincts avec leurs scripts npm respectifs.

## Sécurité

- Authentification par JWT.
- Cookies HTTP-only.
- Contrôle des origines des requêtes.
- Validation des entrées avec Zod.
- Hachage des mots de passe avec Argon2.
- Gestion des permissions selon les rôles.

## Auteur

**Kerfala Sylla**

GitHub : https://github.com/kerfala-dev

## Licence

Ce projet est développé à des fins d'apprentissage et de démonstration professionnelle.
