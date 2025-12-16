export interface Field {
  id: number;
  name: string;
  type: 'grass' | 'synthetic';
  size: string;
  pricePerHour: number;
  status: 'available' | 'occupied' | 'maintenance';
  location: string;
  description: string;
  amenities: string[];
  imageUrl: string;
  createdAt: string;
}
