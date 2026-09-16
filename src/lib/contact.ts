import { cmsAccess } from '@/lib/cms';

/**
 * Pengiriman pesan kontak ke CMS (`POST /api/v1/contact`, docs/api-public.md).
 *
 * Satu-satunya endpoint TULIS yang dipakai situs ini, dan karena itu ia hidup
 * di berkasnya sendiri alih-alih menumpang lib/content -- yang seluruhnya
 * tentang membaca koleksi.
 *
 * Wajib berjalan di server: kunci API tidak boleh pernah sampai ke browser.
 * Pemanggilnya adalah Server Action di app/[locale]/kontak/actions.ts.
 */

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot. Disembunyikan lewat CSS di form; pengunjung asli tidak pernah
   *  mengisinya. CMS tetap menjawab 201 saat terisi supaya bot tidak tahu
   *  dirinya tertangkap -- jadi jangan perlakukan jawaban sukses sebagai bukti
   *  pesan benar-benar tersimpan. */
  website: string;
};

export type ContactFailure = 'invalid' | 'rate-limit' | 'unavailable';

export type ContactResult = { ok: true } | { ok: false; reason: ContactFailure };

/** Batas waktu sendiri, dengan alasan yang sama seperti jalur baca: fetch di
 *  Node tidak punya batas apa pun, dan pengunjung yang menekan "Kirim" tidak
 *  boleh menunggu tanpa ujung. Lebih pendek dari jalur baca karena ada orang
 *  yang benar-benar menunggu di depan layar. */
const REQUEST_TIMEOUT_MS = 8_000;

export async function sendContactMessage(input: ContactMessage): Promise<ContactResult> {
  const { base, headers } = cmsAccess();

  let res: Response;
  try {
    res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      // Tanpa cache: ini permintaan tulis, dan menyimpannya tidak masuk akal.
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error('[kontak] gagal menghubungi CMS:', error);
    return { ok: false, reason: 'unavailable' };
  }

  if (res.ok) return { ok: true };

  // 429 dibedakan karena satu-satunya jawaban yang berguna bagi pengunjung
  // adalah "coba lagi sebentar lagi" -- bukan "coba kirim lewat email", yang
  // justru salah arah kalau pesannya tertahan karena laju permintaan.
  if (res.status === 429) return { ok: false, reason: 'rate-limit' };
  if (res.status === 422) return { ok: false, reason: 'invalid' };

  console.error(`[kontak] CMS menjawab HTTP ${res.status}`);
  return { ok: false, reason: 'unavailable' };
}

/** Hasil satu percobaan kirim, sebagaimana dibaca form.
 *
 *  Hidup di sini, bukan di berkas aksinya: modul `'use server'` hanya boleh
 *  mengekspor fungsi async, dan menaruh nilai atau tipe di sana membuat React
 *  berhenti memperlakukannya sebagai Server Action -- form lalu kehilangan
 *  kemampuan terkirim tanpa JavaScript, diam-diam, tanpa galat apa pun. */
export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reason: ContactFailure };

export const contactInitialState: ContactState = { status: 'idle' };
