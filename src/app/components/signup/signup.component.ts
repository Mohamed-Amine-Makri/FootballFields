import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  // Regular properties for form fields
  signupData: SignupRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  confirmPassword: string = '';
  
  // Signals for UI state
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handle signup form submission using async/Promise
   */
  async onSubmit(): Promise<void> {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const response = await this.authService.signupAsync(this.signupData);
      console.log('Signup successful:', response.user);
      this.successMessage.set('Inscription réussie! Redirection...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/fields']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erreur lors de l\'inscription');
      console.error('Signup error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Validate form data
   */
  validateForm(): boolean {
    if (!this.signupData.email || !this.signupData.password || !this.signupData.firstName || 
        !this.signupData.lastName || !this.signupData.phone) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return false;
    }

    if (this.signupData.password.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (this.signupData.password !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(show => !show);
  }

  /**
   * Clear messages
   */
  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
