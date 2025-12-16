import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-add-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-field.component.html',
  styleUrl: './add-field.component.css'
})
export class AddFieldComponent {
  fieldData: Omit<Field, 'id' | 'createdAt'> = {
    name: '',
    type: 'grass',
    size: '11x11',
    pricePerHour: 200,
    status: 'available',
    location: '',
    description: '',
    amenities: [],
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400'
  };

  newAmenity: string = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fieldService: FieldService,
    private router: Router
  ) {}

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const field = await this.fieldService.addFieldAsync(this.fieldData);
      this.successMessage.set('Terrain ajouté avec succès!');
      
      setTimeout(() => {
        this.router.navigate(['/fields', field.id]);
      }, 1500);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur lors de l\'ajout du terrain');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Add amenity
   */
  addAmenity(): void {
    const amenity = this.newAmenity.trim();
    if (amenity) {
      this.fieldData.amenities = [...this.fieldData.amenities, amenity];
      this.newAmenity = '';
    }
  }

  /**
   * Remove amenity
   */
  removeAmenity(index: number): void {
    this.fieldData.amenities = this.fieldData.amenities.filter((_, i) => i !== index);
  }
}
