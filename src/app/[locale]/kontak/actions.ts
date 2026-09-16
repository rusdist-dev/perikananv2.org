'use server';

import { sendContactMessage, type ContactState } from '@/lib/contact';

/**
 * Server Action form kontak.
 *
 * Server Action, bukan fetch dari browser, karena kunci API CMS tidak boleh
 * pernah meninggalkan server. Sebagai bonus, form-nya tetap bisa dikirim
 * tanpa JavaScript.
 *
 * Berkas ini HANYA mengekspor fungsi async. Itu syarat modul 'use server';
 * satu ekspor nilai saja (dulu `contactInitialState` di sini) membuat React
 * berhenti memperlakukannya sebagai Server Action, dan pengiriman tanpa
 * JavaScript mati tanpa satu pun pesan galat. Tipe dan nilai awalnya ada di
 * lib/contact.ts.
 */

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = field(formData, 'name');
  const email = field(formData, 'email');
  const subject = field(formData, 'subject');
  const message = field(formData, 'message');

  // Pemeriksaan yang sama dengan atribut `required` di form -- bukan duplikat
  // sia-sia: `required` cuma berlaku di browser, dan Server Action ini bisa
  // dipanggil tanpa melewatinya sama sekali.
  if (!name || !email || !subject || !message) {
    return { status: 'error', reason: 'invalid' };
  }

  const result = await sendContactMessage({
    name,
    email,
    subject,
    message,
    website: field(formData, 'website'),
  });

  return result.ok ? { status: 'success' } : { status: 'error', reason: result.reason };
}
