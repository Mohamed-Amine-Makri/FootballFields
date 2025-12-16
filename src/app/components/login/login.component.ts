import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Two-way binding with signals
  credentials = signal<LoginRequest>({
    email: '',
    password: ''
  });

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handle login form submission using async/Promise
   */
  async onSubmit(): Promise<void> {
    if (!this.credentials().email || !this.credentials().password) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response = await this.authService.loginAsync(this.credentials());
      console.log('Login successful:', response.user);
      this.router.navigate(['/fields']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur de connexion');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update email (for two-way binding demonstration)
   */
  updateEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.credentials.update(cred => ({ ...cred, email: input.value }));
  }

  /**
   * Update password (for two-way binding demonstration)
   */
  updatePassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.credentials.update(cred => ({ ...cred, password: input.value }));
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.set('');
  }
}
