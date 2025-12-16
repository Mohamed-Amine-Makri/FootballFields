import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  features = [
    {
      icon: 'bi-calendar-check',
      title: 'Réservation Facile',
      description: 'Réservez votre terrain en quelques clics'
    },
    {
      icon: 'bi-clock-history',
      title: 'Disponibilité 24/7',
      description: 'Consultez les disponibilités en temps réel'
    },
    {
      icon: 'bi-shield-check',
      title: 'Paiement Sécurisé',
      description: 'Transactions 100% sécurisées'
    },
    {
      icon: 'bi-star-fill',
      title: 'Terrains de Qualité',
      description: 'Les meilleurs terrains de football'
    }
  ];

  stats = [
    { value: '50+', label: 'Terrains' },
    { value: '1000+', label: 'Réservations' },
    { value: '500+', label: 'Clients' },
    { value: '4.8/5', label: 'Satisfaction' }
  ];
}
