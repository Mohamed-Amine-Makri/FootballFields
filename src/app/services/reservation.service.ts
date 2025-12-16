import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, tap, delay, switchMap } from 'rxjs/operators';
import { Reservation, ReservationWithDetails } from '../models/reservation.model';
import { Field } from '../models/field.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/reservations';
  private fieldsUrl = 'http://localhost:3000/fields';
  private usersUrl = 'http://localhost:3000/users';
  
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
    return this.http.get<Reservation[]>(this.apiUrl)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }

 
  getAllReservationsWithDetails(): Observable<ReservationWithDetails[]> {
    return this.http.get<Reservation[]>(this.apiUrl)
      .pipe(
        delay(300),
        switchMap(reservations => {
          if (reservations.length === 0) {
            return new Observable<ReservationWithDetails[]>(observer => {
              observer.next([]);
              observer.complete();
            });
          }

          const detailsObservables = reservations.map(reservation =>
            forkJoin({
              field: this.http.get<Field>(`${this.fieldsUrl}/${reservation.fieldId}`),
              user: this.http.get<User>(`${this.usersUrl}/${reservation.userId}`)
            }).pipe(
              map(({ field, user }) => ({
                ...reservation,
                fieldName: field.name,
                userName: `${user.firstName} ${user.lastName}`
              }))
            )
          );

          return forkJoin(detailsObservables);
        }),
        catchError(this.handleError)
      );
  }

 
  getReservationsByUserId(userId: number): Observable<ReservationWithDetails[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?userId=${userId}`)
      .pipe(
        delay(300),
        switchMap(reservations => {
          if (reservations.length === 0) {
            return new Observable<ReservationWithDetails[]>(observer => {
              observer.next([]);
              observer.complete();
            });
          }

          const detailsObservables = reservations.map(reservation =>
            this.http.get<Field>(`${this.fieldsUrl}/${reservation.fieldId}`).pipe(
              map(field => ({
                ...reservation,
                fieldName: field.name
              }))
            )
          );

          return forkJoin(detailsObservables);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get reservations by field ID
   */
  getReservationsByFieldId(fieldId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?fieldId=${fieldId}`)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }

  /**
   * Get reservation by ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`)
      .pipe(
        delay(200),
        catchError(this.handleError)
      );
  }

  /**
   * Add new reservation
   */
  addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Observable<Reservation> {
    const newReservation = {
      ...reservation,
      createdAt: new Date().toISOString()
    };

    return this.http.post<Reservation>(this.apiUrl, newReservation)
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
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, reservation)
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
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
    } else {
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('ReservationService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
