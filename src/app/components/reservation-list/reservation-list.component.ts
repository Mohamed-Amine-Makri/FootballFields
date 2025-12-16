import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { ReservationWithDetails } from '../../models/reservation.model';
import { ReservationStatusPipe } from '../../pipes/reservation-status.pipe';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReservationStatusPipe],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css'
})
export class ReservationListComponent implements OnInit {
  reservations = signal<ReservationWithDetails[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  selectedStatus: string = 'all';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  async loadReservations(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.errorMessage.set('Utilisateur non connecté');
        return;
      }

      this.reservationService.getReservationsByUserId(user.id).subscribe({
        next: (reservations) => {
          this.reservations.set(reservations);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        }
      });
    } catch (error: any) {
      this.errorMessage.set(error.message);
      this.isLoading.set(false);
    }
  }

  get filteredReservations(): ReservationWithDetails[] {
    if (this.selectedStatus === 'all') {
      return this.reservations();
    }
    return this.reservations().filter(r => r.status === this.selectedStatus);
  }

  /**
   * Cancel reservation
   */
  async onCancel(reservationId: number): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
      return;
    }

    try {
      await this.reservationService.cancelReservation(reservationId).toPromise();
      this.loadReservations();
    } catch (error: any) {
      alert('Erreur lors de l\'annulation: ' + error.message);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  // getStatusText(status: string): string {
  //   switch (status) {
  //     case 'confirmed': return 'Confirmée';
  //     case 'pending': return 'En attente';
  //     case 'cancelled': return 'Annulée';
  //     case 'completed': return 'Terminée';
  //     default: return status;
  //   }
  // }
}
