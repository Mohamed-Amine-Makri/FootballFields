import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Field } from '../../models/field.model';
import { FieldStatusPipe } from '../../pipes/field-status.pipe';

@Component({
  selector: 'app-field-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FieldStatusPipe],
  templateUrl: './field-card.component.html',
  styleUrl: './field-card.component.css'
})
export class FieldCardComponent {
  @Input() field!: Field; // Input from parent component
  @Output() fieldSelected = new EventEmitter<Field>(); // Output to parent
  @Output() reserveClicked = new EventEmitter<Field>(); // Output to parent

  isHovered = false;

  /**
   * Emit field selection event to parent
   */
  onViewDetails(): void {
    this.fieldSelected.emit(this.field);
  }

  /**
   * Emit reserve button click event to parent
   */
  onReserve(event: Event): void {
    event.stopPropagation();
    this.reserveClicked.emit(this.field);
  }


  getStatusClass(): string {
    switch (this.field.status) {
      case 'available':
        return 'bg-success';
      case 'occupied':
        return 'bg-danger';
      case 'maintenance':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

 
  // getStatusText(): string {
  //   switch (this.field.status) {
  //     case 'available':
  //       return 'Disponible';
  //     case 'occupied':
  //       return 'Occupé';
  //     case 'maintenance':
  //       return 'Maintenance';
  //     default:
  //       return 'Inconnu';
  //   }
  // }


  getTypeText(): string {
    return this.field.type === 'grass' ? 'Gazon naturel' : 'Synthétique';
  }


  onMouseEnter(): void {
    this.isHovered = true;
  }

 
  onMouseLeave(): void {
    this.isHovered = false;
  }
}
