/**
 * Alamat dan kredensial CMS, divalidasi di satu tempat.
 *
 * Dipakai dua jalur yang sangat berbeda -- pembacaan konten
 * (lib/content/source.ts) dan pengiriman pesan kontak (lib/contact.ts) --
 * dan justru karena itu tidak boleh ada dua salinan: kunci API yang dibaca
 * di dua tempat adalah dua kesempatan salah nama env, dan yang satu bisa
 * diam-diam lolos sementara yang lain gagal.
 *
 * Berisik saat kosong, bukan diam-diam melewatkan: deploy yang mengira
 * dirinya terhubung ke CMS tapi sebenarnya tidak adalah kegagalan yang tidak
 * terlihat sampai ada yang mencari kontennya.
 */
export function cmsAccess(): { base: string; headers: Record<string, string> } {
  const base = process.env.CONTENT_API_URL;
  if (!base) throw new Error('CONTENT_API_URL tidak diisi.');

  const apiKey = process.env.X_API_KEY;
  if (!apiKey) throw new Error('X_API_KEY tidak diisi.');

  return {
    base: base.replace(/\/$/, ''),
    headers: { Accept: 'application/json', 'X-Api-Key': apiKey },
  };
}
