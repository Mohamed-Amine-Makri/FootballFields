import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { API_ENDPOINTS } from '../config/api.config';
import { Reservation, ReservationWithDetails } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservationsUrl = API_ENDPOINTS.reservations;
  private reservationsWithDetailsUrl = API_ENDPOINTS.reservationsWithDetails;

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadReservations();
  }

  private loadReservations(): void {
    this.getAllReservations().subscribe(reservations => {
      this.reservationsSubject.next(reservations);
    });
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.reservationsUrl)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }


  getAllReservationsWithDetails(): Observable<ReservationWithDetails[]> {
    return this.http.get<ReservationWithDetails[]>(this.reservationsWithDetailsUrl)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }


  getReservationsByUserId(userId: number): Observable<ReservationWithDetails[]> {
    return this.http.get<ReservationWithDetails[]>(`${this.reservationsWithDetailsUrl}?userId=${userId}`)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }

  /**
   * Get reservations by field ID
   */
  getReservationsByFieldId(fieldId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.reservationsUrl}?fieldId=${fieldId}`)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }

  /**
   * Get reservation by ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.reservationsUrl}${id}/`)
      .pipe(
        delay(200),
        catchError(this.handleError)
      );
  }

  /**
   * Add new reservation
   */
  addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Observable<Reservation> {
    return this.http.post<Reservation>(this.reservationsUrl, reservation)
      .pipe(
        tap(reservation => {
          const currentReservations = this.reservationsSubject.value;
          this.reservationsSubject.next([...currentReservations, reservation]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Add reservation using Promise
   */
  addReservationAsync(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    return new Promise((resolve, reject) => {
      this.addReservation(reservation).subscribe({
        next: (reservation) => resolve(reservation),
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Update reservation
   */
  updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.reservationsUrl}${id}/`, reservation)
      .pipe(
        tap(updatedReservation => {
          const currentReservations = this.reservationsSubject.value;
          const index = currentReservations.findIndex(r => r.id === id);
          if (index !== -1) {
            currentReservations[index] = updatedReservation;
            this.reservationsSubject.next([...currentReservations]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cancel reservation
   */
  cancelReservation(id: number): Observable<Reservation> {
    return this.updateReservation(id, { status: 'cancelled' });
  }

  /**
   * Delete reservation
   */
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reservationsUrl}${id}/`)
      .pipe(
        tap(() => {
          const currentReservations = this.reservationsSubject.value;
          this.reservationsSubject.next(currentReservations.filter(r => r.id !== id));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete reservation using Promise
   */
  deleteReservationAsync(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.deleteReservation(id).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Get reservations array from BehaviorSubject
   */
  getReservationsArray(): Reservation[] {
    return this.reservationsSubject.value;
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de l\'opération';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.status === 400 && error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = JSON.stringify(error.error);
      }
    } else {
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('ReservationService Error:', errorMessage, error.error);
    return throwError(() => new Error(errorMessage));
  }
}
