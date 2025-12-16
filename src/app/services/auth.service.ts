import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // reactive state
  public isAuthenticated = signal<boolean>(this.hasToken());
  public currentUserSignal = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  loginAsync(credentials: LoginRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>(`${this.apiUrl}?email=${credentials.email}`)
        .pipe(
          delay(500), // Simulate network delay
          map(users => {
            const user = users.find(u => 
              u.email === credentials.email && u.password === credentials.password
            );
            if (!user) {
              throw new Error('Email ou mot de passe incorrect');
            }
            return user;
          }),
          catchError(this.handleError)
        )
        .subscribe({
          next: (user) => {
            const token = this.generateToken(user);
            const authResponse: AuthResponse = { user, token };
            this.setAuthData(authResponse);
            resolve(authResponse);
          },
          error: (error) => reject(error)
        });
    });
  }

  /**
   * Login using Observable (alternative method)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${credentials.email}`)
      .pipe(
        delay(500),
        map(users => {
          const user = users.find(u => 
            u.email === credentials.email && u.password === credentials.password
          );
          if (!user) {
            throw new Error('Email ou mot de passe incorrect');
          }
          const token = this.generateToken(user);
          return { user, token };
        }),
        tap(authResponse => this.setAuthData(authResponse)),
        catchError(this.handleError)
      );
  }

  /**
   * Signup new user with Promise
   */
  signupAsync(signupData: SignupRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      // Check if email already exists
      this.http.get<User[]>(`${this.apiUrl}?email=${signupData.email}`)
        .pipe(
          delay(500),
          map(users => {
            if (users.length > 0) {
              throw new Error('Cet email est déjà utilisé');
            }
            return true;
          }),
          catchError(this.handleError)
        )
        .subscribe({
          next: () => {
            const newUser: Omit<User, 'id'> = {
              ...signupData,
              role: 'user',
              createdAt: new Date().toISOString()
            };

            this.http.post<User>(this.apiUrl, newUser)
              .pipe(catchError(this.handleError))
              .subscribe({
                next: (user) => {
                  const token = this.generateToken(user);
                  const authResponse: AuthResponse = { user, token };
                  this.setAuthData(authResponse);
                  resolve(authResponse);
                },
                error: (error) => reject(error)
              });
          },
          error: (error) => reject(error)
        });
    });
  }

  /**
   * Signup using Observable
   */
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${signupData.email}`)
      .pipe(
        delay(500),
        map(users => {
          if (users.length > 0) {
            throw new Error('Cet email est déjà utilisé');
          }
          return true;
        }),
        map(() => {
          const newUser: Omit<User, 'id'> = {
            ...signupData,
            role: 'user',
            createdAt: new Date().toISOString()
          };
          return newUser;
        }),
        catchError(this.handleError)
      ).pipe(
        map(newUser => this.http.post<User>(this.apiUrl, newUser)),
        map(obs => obs.pipe(
          map(user => {
            const token = this.generateToken(user);
            return { user, token };
          }),
          tap(authResponse => this.setAuthData(authResponse)),
          catchError(this.handleError)
        ))
      ) as any;
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
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, userData)
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

  private generateToken(user: User): string {
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(tokenData));
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
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('AuthService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
