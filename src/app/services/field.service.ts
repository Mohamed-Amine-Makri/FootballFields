import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { API_ENDPOINTS } from '../config/api.config';
import { Field } from '../models/field.model';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private fieldsUrl = API_ENDPOINTS.fields;
  private fieldsSubject = new BehaviorSubject<Field[]>([]);
  public fields$ = this.fieldsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFields();
  }

  private loadFields(): void {
    this.getAllFields().subscribe(fields => {
      this.fieldsSubject.next(fields);
    });
  }


  getAllFields(): Observable<Field[]> {
    return this.http.get<Field[]>(this.fieldsUrl)
      .pipe(
        delay(300),
        catchError(this.handleError)
      );
  }


  getAllFieldsAsync(): Promise<Field[]> {
    return new Promise((resolve, reject) => {
      this.http.get<Field[]>(this.fieldsUrl)
        .pipe(
          delay(300),
          catchError(this.handleError)
        )
        .subscribe({
          next: (fields) => resolve(fields),
          error: (error) => reject(error)
        });
    });
  }

  /**
   * Get field by ID
   */
  getFieldById(id: number): Observable<Field> {
    return this.http.get<Field>(`${this.fieldsUrl}${id}/`)
      .pipe(
        delay(200),
        catchError(this.handleError)
      );
  }

  /**
   * Get field by ID using Promise
   */
  getFieldByIdAsync(id: number): Promise<Field> {
    return new Promise((resolve, reject) => {
      this.http.get<Field>(`${this.fieldsUrl}${id}/`)
        .pipe(
          delay(200),
          catchError(this.handleError)
        )
        .subscribe({
          next: (field) => resolve(field),
          error: (error) => reject(error)
        });
    });
  }

  /**
   * Add new field
   */
  addField(field: Omit<Field, 'id' | 'createdAt'>): Observable<Field> {
    const newField = {
      ...field,
      createdAt: new Date().toISOString()
    };

    return this.http.post<Field>(this.fieldsUrl, newField)
      .pipe(
        tap(field => {
          const currentFields = this.fieldsSubject.value;
          this.fieldsSubject.next([...currentFields, field]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Add new field using Promise
   */
  addFieldAsync(field: Omit<Field, 'id' | 'createdAt'>): Promise<Field> {
    return new Promise((resolve, reject) => {
      this.addField(field).subscribe({
        next: (field) => resolve(field),
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Update field
   */
  updateField(id: number, field: Partial<Field>): Observable<Field> {
    return this.http.patch<Field>(`${this.fieldsUrl}${id}/`, field)
      .pipe(
        tap(updatedField => {
          const currentFields = this.fieldsSubject.value;
          const index = currentFields.findIndex(f => f.id === id);
          if (index !== -1) {
            currentFields[index] = updatedField;
            this.fieldsSubject.next([...currentFields]);
          }
        }),
        catchError(this.handleError)
      );
  }


  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.fieldsUrl}${id}/`)
      .pipe(
        tap(() => {
          const currentFields = this.fieldsSubject.value;
          this.fieldsSubject.next(currentFields.filter(f => f.id !== id));
        }),
        catchError(this.handleError)
      );
  }


  deleteFieldAsync(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.deleteField(id).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  }


  getAvailableFields(): Observable<Field[]> {
    return this.getAllFields().pipe(
      map(fields => fields.filter(field => field.status === 'available'))
    );
  }


  searchFields(criteria: { type?: string; size?: string; location?: string }): Observable<Field[]> {
    return this.getAllFields().pipe(
      map(fields => {
        return fields.filter(field => {
          let matches = true;
          if (criteria.type && field.type !== criteria.type) matches = false;
          if (criteria.size && field.size !== criteria.size) matches = false;
          if (criteria.location && !field.location.toLowerCase().includes(criteria.location.toLowerCase())) matches = false;
          return matches;
        });
      })
    );
  }

  getFieldsArray(): Field[] {
    return this.fieldsSubject.value;
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

    console.error('FieldService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
