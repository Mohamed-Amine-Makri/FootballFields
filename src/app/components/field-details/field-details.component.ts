import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FieldService } from '../../services/field.service';
import { AuthService } from '../../services/auth.service';
import { Field } from '../../models/field.model';


@Component({
  selector: 'app-field-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './field-details.component.html',
  styleUrl: './field-details.component.css'
})
export class FieldDetailsComponent implements OnInit {
  field = signal<Field | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  isAuthenticated = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: FieldService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.isLoggedIn());
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadField(+id);
    }
  }

  /**
   * Load field details
   */
  async loadField(id: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const field = await this.fieldService.getFieldByIdAsync(id);
      this.field.set(field);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur lors du chargement du terrain');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigate to reservation page
   */
  onReserve(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/fields/${this.field()?.id}` } 
      });
      return;
    }

    this.router.navigate(['/reservations/new'], { 
      queryParams: { fieldId: this.field()?.id } 
    });
  }

 
  getStatusClass(): string {
    const status = this.field()?.status;
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'secondary';
    }
  }

 
  getStatusText(): string {
    const status = this.field()?.status;
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Occupé';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  }

  /**
   * Get type text
   */
  getTypeText(): string {
    return this.field()?.type === 'grass' ? 'Gazon naturel' : 'Synthétique';
  }
}
