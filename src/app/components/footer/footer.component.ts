import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  companyInfo = {
    name: 'FootballFields Tunisie',
    address: '123 Avenue Habib Bourguiba, Tunis 1000, Tunisie',
    phone: '+216 22 12 34 56',
    email: 'contact@footballfields.tn',
    description: 'La plateforme leader pour la réservation de terrains de football en Tunisie. Réservez facilement et rapidement votre terrain en quelques clics.'
  };

  socialLinks = [
    { name: 'Facebook', url: '#', icon: 'bi-facebook' },
    { name: 'Instagram', url: '#', icon: 'bi-instagram' },
    { name: 'Twitter', url: '#', icon: 'bi-twitter' },
    { name: 'LinkedIn', url: '#', icon: 'bi-linkedin' }
  ];

  quickLinks = [
    { name: 'Accueil', route: '/' },
    { name: 'Terrains', route: '/fields' },
    { name: 'À propos', route: '/about' },
    { name: 'Contact', route: '/contact' }
  ];

  legalLinks = [
    { name: 'Conditions d\'utilisation', route: '/terms' },
    { name: 'Politique de confidentialité', route: '/privacy' },
    { name: 'FAQ', route: '/faq' }
  ];
}
