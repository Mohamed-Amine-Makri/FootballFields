import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { API_ENDPOINTS } from '../config/api.config';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = API_ENDPOINTS.users;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }


  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}${id}/`)
      .pipe(
        delay(200),
        catchError(this.handleError)
      );
  }


  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.usersUrl}${id}/`, user)
      .pipe(
        catchError(this.handleError)
      );
  }


  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}${id}/`)
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de l\'opération';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('UserService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
