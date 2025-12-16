import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservationStatus',
  standalone: true
})
export class ReservationStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  }
}
