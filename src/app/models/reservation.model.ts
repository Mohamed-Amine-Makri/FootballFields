export interface Reservation {
  id: number;
  fieldId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  playerCount: number;
  notes: string;
  createdAt: string;
}

export interface ReservationWithDetails extends Reservation {
  fieldName?: string;
  userName?: string;
}
