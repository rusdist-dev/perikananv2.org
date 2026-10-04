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

/** Data yang benar-benar diisi pengunjung di gerbang unduhan publikasi.
 *
 *  Subjek dan isi pesannya TIDAK ikut dari browser -- keduanya disusun di
 *  server oleh `sendDownloadLead`, supaya bentuknya seragam di dashboard CMS
 *  dan tidak bisa dikarang dari sisi klien. */
export type DownloadLead = {
  name: string;
  email: string;
  /** Judul publikasi yang diunduh; dipakai menyusun subjek pesan. */
  title: string;
};

/** Judul dipotong sebelum masuk subjek. `title` sampai ke sini sebagai props
 *  komponen klien, jadi ia tetap masukan yang tidak tepercaya walau sumber
 *  aslinya CMS sendiri. */
const MAX_TITLE_LENGTH = 200;

/**
 * Lead dari gerbang unduhan publikasi.
 *
 * Dikirim lewat endpoint yang sama dengan form kontak (`POST /api/v1/contact`)
 * karena CMS belum punya koleksi tersendiri untuk unduhan -- pesan kontak satu-
 * satunya tempat tulis yang tersedia (lihat docs/api-public.md).
 *
 * Honeypot `website` sengaja dikirim kosong: gerbang unduhan tidak punya field
 * itu di formnya, dan mengisinya dari sini justru membuat CMS membuang setiap
 * lead diam-diam sambil tetap menjawab 201.
 */
export async function sendDownloadLead(input: DownloadLead): Promise<ContactResult> {
  const title = input.title.slice(0, MAX_TITLE_LENGTH);

  return sendContactMessage({
    name: input.name,
    email: input.email,
    subject: `Unduhan publikasi: ${title}`,
    message: [
      'Pengunjung mengunduh publikasi lewat gerbang unduhan situs.',
      '',
      `Nama    : ${input.name}`,
      `Email   : ${input.email}`,
      `Dokumen : ${title}`,
      '',
      'Pesan ini dibuat otomatis -- pengunjung tidak menulis pesan apa pun.',
    ].join('\n'),
    website: '',
  });
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
