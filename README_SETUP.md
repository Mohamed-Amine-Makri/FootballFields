# ⚽ Gestion des Terrains de Football - Guide de Démarrage

## 📋 Description du Projet

Application Angular complète de gestion de terrains de football avec authentification, réservations et administration. Ce projet implémente tous les concepts avancés d'Angular 19 incluant:

- ✅ 12+ composants standalone
- ✅ Communication parent-enfant (@Input/@Output)
- ✅ Services injectés avec Observable et Promise
- ✅ Routage SPA avec lazy loading et guards
- ✅ Signals pour la gestion d'état réactive
- ✅ Pipes personnalisés
- ✅ Forms (template-driven et reactive)
- ✅ API Django REST (backend_foot) avec PostgreSQL
- ✅ Gestion d'erreurs
- ✅ Bootstrap 5 pour le styling
- ✅ Contrôles de flux (@for, @if, @switch)

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)

### Étapes d'installation

1. **Installer les dépendances**
```powershell
npm install
```

## 🏃 Lancement de l'Application

L'application nécessite deux serveurs en parallèle : l'API Django (backend_foot) et le front Angular.

### Terminal 1 : Démarrer l'API Django
```powershell
cd ..\backend_foot
python -m venv .venv            # première fois uniquement
.\.venv\Scripts\activate      # active l'environnement virtuel
pip install -r requirements.txt # première fois uniquement
python manage.py migrate        # s'assurer que la base est à jour
python manage.py runserver 8000
```
L'API REST est accessible sur `http://localhost:8000/api`

### Terminal 2 : Démarrer l'application Angular
```powershell
cd ..\project_foot
npm start
```
L'application démarre sur `http://localhost:4200`

Ouvrez votre navigateur et accédez à : **http://localhost:4200**

## 👤 Comptes de Test

### Utilisateur Admin
- Email: `admin@football.ma`
- Mot de passe: `admin123`

### Utilisateur Regular
- Email: `ahmed@email.ma`
- Mot de passe: `pass123`

### Créer un nouveau compte
Vous pouvez également créer un nouveau compte via la page d'inscription.

## 📁 Structure du Projet

```
src/app/
├── components/          # Tous les composants standalone
│   ├── login/          # Authentification utilisateur
│   ├── signup/         # Inscription
│   ├── header/         # En-tête de navigation
│   ├── footer/         # Pied de page
│   ├── home/           # Page d'accueil
│   ├── field-list/     # Liste des terrains (Parent)
│   ├── field-card/     # Carte terrain (Child - @Input/@Output)
│   ├── field-details/  # Détails d'un terrain
│   ├── add-field/      # Ajout terrain (Admin only)
│   ├── reservation-list/ # Liste des réservations
│   ├── add-reservation/  # Nouvelle réservation
│   └── user-profile/   # Profil utilisateur
│
├── services/           # Services injectés
│   ├── auth.service.ts        # Authentification (Observable + Promise)
│   ├── field.service.ts       # Gestion terrains (CRUD)
│   ├── reservation.service.ts # Gestion réservations
│   └── user.service.ts        # Gestion utilisateurs
│
├── models/             # Interfaces TypeScript
│   ├── user.model.ts
│   ├── field.model.ts
│   └── reservation.model.ts
│
├── guards/             # Guards de routage
│   └── auth.guard.ts  # authGuard + adminGuard
│
├── pipes/              # Pipes personnalisés
│   ├── field-status.pipe.ts
│   ├── reservation-status.pipe.ts
│   └── phone-format.pipe.ts
│
└── app.routes.ts       # Configuration des routes

> ℹ️  L'API Django (dossier `backend_foot/`) expose les mêmes entités (`users`, `fields`, `reservations`). Reportez-vous à `backend_foot/README.md` pour la configuration serveur.
```

## 🎯 Fonctionnalités Principales

### Pour tous les utilisateurs :
- Consulter la liste des terrains
- Voir les détails d'un terrain
- Filtrer par type, taille, statut
- Rechercher un terrain

### Pour les utilisateurs connectés :
- Réserver un terrain
- Voir ses réservations
- Annuler une réservation
- Modifier son profil

### Pour les administrateurs :
- Ajouter un nouveau terrain
- Gérer tous les terrains
- Voir toutes les réservations

## 🛠️ Concepts Angular Implémentés

### 1. Composants Standalone (Angular 19)
Tous les composants utilisent l'architecture standalone sans NgModules.

### 2. Communication Parent-Enfant
```typescript
// Parent: FieldListComponent
<app-field-card 
  [field]="field" 
  (fieldSelected)="onFieldSelected($event)"
  (reserveClicked)="onReserveClicked($event)">
</app-field-card>

// Child: FieldCardComponent
@Input() field!: Field;
@Output() fieldSelected = new EventEmitter<number>();
@Output() reserveClicked = new EventEmitter<number>();
```

### 3. Services avec Observable et Promise
```typescript
// Observable pattern
getAllFields(): Observable<Field[]> {
  return this.http.get<Field[]>(`${this.apiUrl}/fields`);
}

// Promise pattern
async getAllFieldsAsync(): Promise<Field[]> {
  return lastValueFrom(this.http.get<Field[]>(`${this.apiUrl}/fields`));
}
```

### 4. Signals (Angular 19)
```typescript
isAuthenticated = signal<boolean>(false);
currentUserSignal = signal<User | null>(null);

// Update
this.isAuthenticated.set(true);

// Read
if (this.isAuthenticated()) {
  // user is logged in
}
```

### 5. Guards Fonctionnels
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
```

### 6. Lazy Loading des Routes
```typescript
{
  path: 'fields/:id',
  loadComponent: () => import('./components/field-details/field-details.component')
    .then(m => m.FieldDetailsComponent)
}
```

### 7. Pipes Personnalisés
```typescript
@Pipe({ name: 'fieldStatus', standalone: true })
export class FieldStatusPipe implements PipeTransform {
  transform(status: string): string {
    const statusMap: any = {
      'available': 'Disponible',
      'occupied': 'Occupé',
      'maintenance': 'En maintenance'
    };
    return statusMap[status] || status;
  }
}
```

### 8. Contrôle de Flux (@for, @if, @switch)
```html
<!-- @for loop -->
@for (field of fields(); track field.id) {
  <app-field-card [field]="field"></app-field-card>
}

<!-- @if condition -->
@if (isLoading()) {
  <div class="spinner"></div>
} @else if (errorMessage()) {
  <div class="alert alert-danger">{{ errorMessage() }}</div>
} @else {
  <div class="content">...</div>
}

<!-- @switch -->
@switch (field.status) {
  @case ('available') {
    <span class="badge bg-success">Disponible</span>
  }
  @case ('occupied') {
    <span class="badge bg-warning">Occupé</span>
  }
  @default {
    <span class="badge bg-secondary">Inconnu</span>
  }
}
```

### 9. Forms
- **Template-driven**: LoginComponent
- **Reactive**: AddReservationComponent

### 10. Gestion d'Erreurs
```typescript
private handleError(operation: string) {
  return (error: HttpErrorResponse): Observable<never> => {
    console.error(`${operation} failed:`, error);
    return throwError(() => new Error(`${operation} échoué. Veuillez réessayer.`));
  };
}
```

## 🌐 API Backend (Django + PostgreSQL)

Le dossier `backend_foot/` contient l'API officielle :
- Django 6 + Django REST Framework
- PostgreSQL (`foot_db`) pour stocker les utilisateurs, terrains et réservations
- Endpoints disponibles sur `http://localhost:8000/api`
- Points d'entrée dédiés pour l'authentification : `/api/auth/login/` et `/api/auth/signup/`

Les comptes de test listés plus haut sont déjà fournis dans la base de données. Utilisez `python manage.py createsuperuser` pour ajouter un administrateur supplémentaire si nécessaire.

## 🎨 Styling

Le projet utilise :
- Bootstrap 5.3.3
- Bootstrap Icons (via CDN)
- CSS personnalisé pour chaque composant

## 🔧 Scripts Disponibles

```powershell
cd ..\backend_foot
python manage.py runserver 8000   # Démarrer l'API Django (port 8000)

cd ..\project_foot
npm start                         # Démarrer l'application Angular (port 4200)
npm run build                     # Build de production
npm test                          # Lancer les tests
```

## 📝 Notes Importantes

1. **Deux serveurs requis** : L'API Django (`http://localhost:8000/api`) et l'application Angular (`http://localhost:4200`) doivent tourner simultanément
2. **Base de données** : PostgreSQL `foot_db` (cf. `backendFoot/settings.py`) doit être accessible
3. **Migrations** : exécutez `python manage.py migrate` dès qu'un nouveau modèle est ajouté
4. **Données persistantes** : Les modifications sont stockées dans PostgreSQL (plus de `db.json`)

## ❓ Problèmes Courants

### Le serveur API ne démarre pas
- Vérifiez que PostgreSQL est en cours d'exécution et que les identifiants correspondent à `backendFoot/settings.py`
- Activez le virtualenv (`.\.venv\Scripts\activate`) avant de lancer `python manage.py runserver`
- Si le port 8000 est occupé :
  ```powershell
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```
- Lancez `python manage.py check` pour détecter les erreurs de configuration

### L'application Angular ne se connecte pas à l'API
- Vérifiez que `python manage.py runserver 8000` tourne dans `backend_foot`
- Confirmez que l'URL `http://localhost:8000/api/users/` est accessible dans le navigateur
- Surveillez la console navigateur pour les erreurs CORS ou HTTP et consultez les logs Django

### Erreurs de compilation
```powershell
# Nettoyer et réinstaller
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📧 Contact

Pour toute question sur le projet, référez-vous aux commentaires dans le code source.

## ✅ Checklist des Exigences Pédagogiques

- [x] Minimum 8 composants (12 créés)
- [x] Communication parent-enfant (FieldList ↔ FieldCard)
- [x] Services injectés (4 services)
- [x] SPA avec routing
- [x] Bootstrap intégré
- [x] Services en mode async (Observable + Promise)
- [x] Pipes personnalisés (3 pipes)
- [x] API Django REST + PostgreSQL
- [x] Contrôles de flux (@for, @if, @switch)
- [x] Observables et RxJS
- [x] Gestion d'erreurs
- [x] Signals
- [x] Forms (template-driven et reactive)
- [x] Guards de routage
- [x] Lazy loading

---

**Bon développement ! ⚽🚀**
