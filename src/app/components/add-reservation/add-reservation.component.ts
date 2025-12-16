import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { FieldService } from '../../services/field.service';
import { AuthService } from '../../services/auth.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-add-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-reservation.component.html',
  styleUrl: './add-reservation.component.css'
})
export class AddReservationComponent implements OnInit {
  reservationForm!: FormGroup;
  fields = signal<Field[]>([]);
  selectedField = signal<Field | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private fieldService: FieldService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFields();

    // Check for pre-selected field from query params
    this.route.queryParams.subscribe(params => {
      if (params['fieldId']) {
        this.reservationForm.patchValue({ fieldId: +params['fieldId'] });
        this.onFieldChange(+params['fieldId']);
      }
    });
  }

  
  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.reservationForm = this.fb.group({
      fieldId: ['', Validators.required],
      date: [today, Validators.required],
      startTime: ['', Validators.required],
      duration: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
      playerCount: [10, [Validators.required, Validators.min(2), Validators.max(22)]],
      notes: ['']
    });
  }


  async loadFields(): Promise<void> {
    try {
      const fields = await this.fieldService.getAllFieldsAsync();
      this.fields.set(fields.filter(f => f.status === 'available'));
    } catch (error: any) {
      this.errorMessage.set('Erreur lors du chargement des terrains');
    }
  }


  async onFieldChange(fieldId: number): Promise<void> {
    try {
      const field = await this.fieldService.getFieldByIdAsync(fieldId);
      this.selectedField.set(field);
    } catch (error) {
      console.error('Error loading field:', error);
    }
  }


  getTotalPrice(): number {
    if (!this.selectedField()) return 0;
    const duration = this.reservationForm.get('duration')?.value || 0;
    return this.selectedField()!.pricePerHour * duration;
  }


  getEndTime(): string {
    const startTime = this.reservationForm.get('startTime')?.value;
    const duration = this.reservationForm.get('duration')?.value || 0;
    
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  
  async onSubmit(): Promise<void> {
    if (this.reservationForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const formValue = this.reservationForm.value;
      const reservationData = {
        fieldId: formValue.fieldId,
        userId: user.id,
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: this.getEndTime(),
        duration: formValue.duration,
        totalPrice: this.getTotalPrice(),
        status: 'pending' as const,
        playerCount: formValue.playerCount,
        notes: formValue.notes || ''
      };

      await this.reservationService.addReservationAsync(reservationData);
      this.successMessage.set('Réservation créée avec succès!');
      
      setTimeout(() => {
        this.router.navigate(['/reservations']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur lors de la création de la réservation');
    } finally {
      this.isLoading.set(false);
    }
  }
}
