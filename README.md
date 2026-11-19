# Maison Yazid Rideaux — version 2.0

Site vitrine premium et API Node.js / Express / MongoDB.

## Démarrage local

1. Installer Node.js 20+ et MongoDB Community (ou utiliser une URI MongoDB Atlas).
2. Ouvrir un terminal dans `backend/`.
3. Copier `.env.example` vers `.env`, puis renseigner `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL` et `ADMIN_PASSWORD`.
4. Installer les dépendances : `npm install`.
5. Démarrer : `npm run dev` (ou `npm start`).
6. Ouvrir `http://localhost:5000` — ne pas ouvrir les pages HTML directement avec `file://`.

Au premier démarrage, le compte administrateur défini par `ADMIN_EMAIL` et `ADMIN_PASSWORD` est créé automatiquement. Le rôle admin n'est jamais attribué via l'inscription publique.

## Fonctions

- Site responsive : accueil éditorial, collection, recherche, tri, panier local et formulaire de contact.
- Catalogue chargé depuis MongoDB.
- Espace administrateur : authentification JWT, ajout de produits avec image, suppression de produits, lecture des messages clients.
- Images téléversées dans `backend/uploads/`.
- Messages sauvegardés dans MongoDB. Les notifications e-mail sont facultatives (SMTP).
- Sécurité de base : Helmet, validation des entrées, limitation des tentatives de connexion, mots de passe bcrypt, autorisation admin côté API.

## Routes API

- `GET /api/health`
- `GET /api/products`
- `POST /api/products` (admin, multipart/form-data : name, price, description, image)
- `PUT /api/products/:id` (admin, JSON)
- `DELETE /api/products/:id` (admin)
- `POST /api/contact` (public)
- `GET /api/contact` (admin)
- `POST /api/auth/login`
- `POST /api/auth/register` (compte client uniquement)

## Avant mise en production

Configurer HTTPS, une origine CORS stricte, des sauvegardes MongoDB, un stockage d'images persistant (S3/Cloudinary), une adresse SMTP vérifiée et un secret JWT fort. Le panier est une sélection locale et le site ne traite pas encore les paiements en ligne ni les commandes confirmées.
