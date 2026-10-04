'use server';

import { sendDownloadLead, type ContactResult, type DownloadLead } from '@/lib/contact';

/**
 * Server Action gerbang unduhan publikasi.
 *
 * Server Action, bukan fetch dari browser, dengan alasan yang persis sama
 * seperti form kontak: kunci API CMS tidak boleh pernah meninggalkan server
 * (lihat app/[locale]/kontak/actions.ts).
 *
 * Ia duduk di segmen [locale], bukan di salah satu folder rute, karena
 * DownloadGateModal dipakai dari dua tempat sekaligus -- halaman depan
 * (HomePublicationsGrid) dan /discover/publications (PublicationsSlider serta
 * FeaturedPublicationActions). Menaruhnya di salah satu rute akan membuat rute
 * yang lain mengimpor aksi milik tetangganya.
 *
 * Seperti berkas aksi lain di proyek ini, modul ini HANYA mengekspor fungsi
 * async. Itu syarat modul 'use server'; satu ekspor nilai saja membuat React
 * berhenti memperlakukannya sebagai Server Action. Tipenya ada di
 * lib/contact.ts.
 */
export async function submitDownloadLead(input: DownloadLead): Promise<ContactResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const title = input.title.trim();

  // Pemeriksaan yang sama dengan atribut `required` di form -- bukan duplikat
  // sia-sia: `required` hanya berlaku di browser, sedangkan Server Action ini
  // bisa dipanggil langsung tanpa melewatinya sama sekali.
  if (!name || !email) return { ok: false, reason: 'invalid' };

  return sendDownloadLead({ name, email, title });
}
