import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(phone: string): string {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('216')) {
      const country = cleaned.substring(0, 3);
      const part1 = cleaned.substring(3, 5);
      const part2 = cleaned.substring(5, 8);
      const part3 = cleaned.substring(8, 11);
      
      return `+${country} ${part1} ${part2} ${part3}`;
    } else if (cleaned.length === 8) {

      const part1 = cleaned.substring(0, 2);
      const part2 = cleaned.substring(2, 5);
      const part3 = cleaned.substring(5, 8);
      
      return `${part1} ${part2} ${part3}`;
    }
    
    return phone;
  }
}
