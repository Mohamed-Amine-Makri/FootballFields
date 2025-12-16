import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user = signal<User | null>(null);
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  editedUser = signal<Partial<User>>({});

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.editedUser.set({ ...currentUser });
    }
  }

 
  toggleEdit(): void {
    this.isEditing.update(editing => !editing);
    if (!this.isEditing()) {
      this.editedUser.set({ ...this.user()! });
    }
  }

 
  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const updated = await this.authService.updateProfile(
        this.user()!.id,
        this.editedUser()
      ).toPromise();
      
      this.user.set(updated!);
      this.successMessage.set('Profil mis à jour avec succès');
      this.isEditing.set(false);
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

 
  updateField(field: keyof User, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.editedUser.update(user => ({ ...user, [field]: value }));
  }
}
