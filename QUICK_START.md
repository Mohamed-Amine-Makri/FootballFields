# 🚀 Guide de Démarrage Rapide

## Étape 1 : Installation
```powershell
npm install
```

## Étape 2 : Lancer l'Application

### Ouvrir 2 terminaux PowerShell

**Terminal 1 - API Django:**
```powershell
cd c:\Users\makri\Desktop\project_angular\backend_foot
python -m venv .venv            # première fois uniquement
.\.venv\Scripts\activate      # activer l'environnement
pip install -r requirements.txt # première fois uniquement
python manage.py migrate        # s'assurer que le schéma est à jour
python manage.py runserver 8000
```
✅ API disponible sur http://localhost:8000/api

**Terminal 2 - Angular App:**
```powershell
cd c:\Users\makri\Desktop\project_angular\project_foot
npm start
```
✅ Application démarre sur http://localhost:4200

## Étape 3 : Ouvrir le Navigateur
Accédez à: **http://localhost:4200**

## 👤 Comptes de Test

**Admin:**
- Email: `admin@football.ma`
- Password: `admin123`

**Utilisateur:**
- Email: `ahmed@email.ma`
- Password: `pass123`

## ✅ Vérification

1. Page d'accueil s'affiche ✓
2. Connexion fonctionne ✓
3. Liste des terrains s'affiche ✓
4. Réservation possible ✓

## 📝 Structure Complète

- ✅ 12 composants créés
- ✅ 4 services avec Observable/Promise
- ✅ 3 pipes personnalisés
- ✅ Authentification + Guards
- ✅ Routing avec lazy loading
- ✅ Bootstrap 5 intégré
- ✅ Backend Django REST + PostgreSQL
- ✅ Signals + RxJS
- ✅ Forms (template & reactive)

## 🎯 Fonctionnalités

### Tous les utilisateurs:
- Voir les terrains
- Filtrer et rechercher
- Voir détails

### Utilisateurs connectés:
- Réserver un terrain
- Voir ses réservations
- Gérer son profil

### Administrateurs:
- Ajouter des terrains
- Gérer tous les terrains

---

Pour plus de détails, consultez **README_SETUP.md**
