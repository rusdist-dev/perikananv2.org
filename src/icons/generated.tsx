/* GENERATED — do not edit by hand.
 * Sumber: src/icons/*.svg · Regenerate: npm run icons
 */

export type IconId =
  | 'arrow-right'
  | 'close'
  | 'menu'
  | 'search';

export const iconIds = [
  'arrow-right',
  'close',
  'menu',
  'search',
] as const;

/**
 * Sprite ditulis sebagai string, bukan JSX.
 *
 * Markup SVG memakai atribut ber-tanda-hubung (stroke-width, stroke-linecap)
 * yang bukan properti React; ditempel sebagai JSX ia akan memicu peringatan
 * "Invalid DOM property" dan diam-diam menghilangkan atributnya. Menerjemahkan
 * tiap atribut ke camelCase di generator berarti memelihara daftar padanan
 * selamanya. String + dangerouslySetInnerHTML melewati keduanya, dan isinya
 * berasal dari file di repo ini pada waktu build -- bukan dari input pengguna.
 */
const SPRITE = "<symbol id=\"i-arrow-right\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 12h14m-6-6 6 6-6 6\"/></symbol><symbol id=\"i-close\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"2\"><path d=\"m6 6 12 12m0-12L6 18\"/></symbol><symbol id=\"i-menu\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"2\"><path d=\"M4 7h16M4 12h16M4 17h16\"/></symbol><symbol id=\"i-search\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M16.5 16.5 21 21\"/></symbol>";

/**
 * Dirender SEKALI per dokumen (SiteShell menaruhnya tepat di dalam <body>),
 * lalu <Icon> merujuknya lewat <use href="#i-...">. aria-hidden dan ukuran nol
 * menjaganya keluar dari accessibility tree dan dari layout.
 */
export function IconSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: SPRITE }}
    />
  );
}
