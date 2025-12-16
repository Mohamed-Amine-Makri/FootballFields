import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: 'Accueil - FootballFields'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion'
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent),
    title: 'Inscription'
  },
  {
    path: 'fields',
    loadComponent: () => import('./components/field-list/field-list.component').then(m => m.FieldListComponent),
    title: 'Terrains disponibles'
  },
  {
    path: 'fields/:id',
    loadComponent: () => import('./components/field-details/field-details.component').then(m => m.FieldDetailsComponent),
    title: 'Détails du terrain'
  },
  {
    path: 'fields/add',
    loadComponent: () => import('./components/add-field/add-field.component').then(m => m.AddFieldComponent),
    canActivate: [adminGuard],
    title: 'Ajouter un terrain'
  },
  {
    path: 'reservations',
    loadComponent: () => import('./components/reservation-list/reservation-list.component').then(m => m.ReservationListComponent),
    canActivate: [authGuard],
    title: 'Mes réservations'
  },
  {
    path: 'reservations/new',
    loadComponent: () => import('./components/add-reservation/add-reservation.component').then(m => m.AddReservationComponent),
    canActivate: [authGuard],
    title: 'Nouvelle réservation'
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'Mon profil'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
