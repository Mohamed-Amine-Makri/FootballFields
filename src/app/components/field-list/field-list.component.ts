import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';
import { FieldCardComponent } from '../field-card/field-card.component';

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FieldCardComponent],
  templateUrl: './field-list.component.html',
  styleUrl: './field-list.component.css'
})
export class FieldListComponent implements OnInit {
  fields = signal<Field[]>([]);
  filteredFields = signal<Field[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  
  selectedType = signal<string>('all');
  selectedSize = signal<string>('all');
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');

  typeOptions = ['all', 'grass', 'synthetic'];
  sizeOptions = ['all', '5x5', '7x7', '11x11'];
  statusOptions = ['all', 'available', 'occupied', 'maintenance'];

  constructor(
    private fieldService: FieldService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFields();
  }

  async loadFields(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const fields = await this.fieldService.getAllFieldsAsync();
      this.fields.set(fields);
      this.filteredFields.set(fields);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur lors du chargement des terrains');
      console.error('Error loading fields:', error);
    } finally {
      this.isLoading.set(false);
    }
  }


  onFieldSelected(field: Field): void {
    console.log('Field selected:', field);
    this.router.navigate(['/fields', field.id]);
  }

 
  onReserveClicked(field: Field): void {
    console.log('Reserve clicked for:', field);
    this.router.navigate(['/reservations/new'], { 
      queryParams: { fieldId: field.id } 
    });
  }

  applyFilters(): void {
    let filtered = this.fields();

    // Filter by type
    if (this.selectedType() !== 'all') {
      filtered = filtered.filter(f => f.type === this.selectedType());
    }

    // Filter by size
    if (this.selectedSize() !== 'all') {
      filtered = filtered.filter(f => f.size === this.selectedSize());
    }

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(f => f.status === this.selectedStatus());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.location.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      );
    }

    this.filteredFields.set(filtered);
  }

 
  updateTypeFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedType.set(select.value);
    this.applyFilters();
  }


  updateSizeFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSize.set(select.value);
    this.applyFilters();
  }


  updateStatusFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.applyFilters();
  }

 
  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

 
  resetFilters(): void {
    this.selectedType.set('all');
    this.selectedSize.set('all');
    this.selectedStatus.set('all');
    this.searchQuery.set('');
    this.filteredFields.set(this.fields());
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'all': return 'Tous les types';
      case 'grass': return 'Gazon naturel';
      case 'synthetic': return 'Synthétique';
      default: return type;
    }
  }

  /**
   * Get status label in French
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'all': return 'Tous les statuts';
      case 'available': return 'Disponible';
      case 'occupied': return 'Occupé';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  }
}
