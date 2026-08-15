import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * twMerge(clsx(...)) -- urutannya penting. clsx meratakan kondisi jadi string,
 * twMerge lalu membuang utility Tailwind yang berkonflik dan menyisakan yang
 * TERAKHIR. Efeknya: `className` dari pemanggil menang atas default komponen
 * tanpa perlu `!important` atau prop `variant` untuk tiap penyimpangan kecil.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
