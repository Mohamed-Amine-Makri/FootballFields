import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fieldStatus',
  standalone: true
})
export class FieldStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupé';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  }
}
