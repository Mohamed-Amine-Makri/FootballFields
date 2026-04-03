import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, firstValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../config/api.config';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersUrl = API_ENDPOINTS.users;
  private loginUrl = API_ENDPOINTS.auth.login;
  private signupUrl = API_ENDPOINTS.auth.signup;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // reactive state
  public isAuthenticated = signal<boolean>(this.hasToken());
  public currentUserSignal = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) { }

  loginAsync(credentials: LoginRequest): Promise<AuthResponse> {
    return firstValueFrom(this.login(credentials));
  }

  /**
   * Login using Observable (alternative method)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.loginUrl, credentials)
      .pipe(
        tap(authResponse => this.setAuthData(authResponse)),
        catchError(this.handleError)
      );
  }

  /**
   * Signup new user with Promise
   */
  signupAsync(signupData: SignupRequest): Promise<AuthResponse> {
    return firstValueFrom(this.signup(signupData));
  }

  /**
   * Signup using Observable
   */
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.signupUrl, signupData)
      .pipe(
        tap(authResponse => this.setAuthData(authResponse)),
        catchError(this.handleError)
      );
  }


  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUserSignal.set(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }


  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  updateProfile(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.usersUrl}${userId}/`, userData)
      .pipe(
        tap(user => {
          const currentUser = this.getCurrentUser();
          if (currentUser && currentUser.id === user.id) {
            if (this.isBrowser) {
              localStorage.setItem('current_user', JSON.stringify(user));
            }
            this.currentUserSubject.next(user);
            this.currentUserSignal.set(user);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Private helper methods
   */
  private setAuthData(authResponse: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    }
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticated.set(true);
    this.currentUserSignal.set(authResponse.user);
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private hasToken(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('auth_token');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.error instanceof Error) {
      // Application error
      errorMessage = error.error.message;
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('AuthService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
