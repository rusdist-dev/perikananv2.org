/* GENERATED — do not edit by hand.
 * Sumber: src/icons/*.svg · Regenerate: npm run icons
 */

export type IconId =
  | 'arrow-right'
  | 'close'
  | 'left-arrow'
  | 'menu'
  | 'right-arrow'
  | 'search';

export const iconIds = [
  'arrow-right',
  'close',
  'left-arrow',
  'menu',
  'right-arrow',
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
const SPRITE = "<symbol id=\"i-arrow-right\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 12h14m-6-6 6 6-6 6\"/></symbol><symbol id=\"i-close\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"2\"><path d=\"m6 6 12 12m0-12L6 18\"/></symbol><symbol id=\"i-left-arrow\" viewBox=\"0 0 29.25 54.75\"><defs><clipPath id=\"a\"><path d=\"M0 .563h27.79v53.382H0Zm0 0\"/></clipPath></defs><g clip-path=\"url(#a)\"><path fill=\"currentColor\" d=\"M26.254 53.516q-.573.001-.977-.403L.407 28.188a1.3 1.3 0 0 1-.302-.45 1.4 1.4 0 0 1 0-1.059 1.3 1.3 0 0 1 .301-.445L25.277 1.31c.125-.141.278-.246.45-.325a1.4 1.4 0 0 1 .539-.125 1.387 1.387 0 0 1 .968 2.407L3.34 27.207l23.894 23.945q.299.296.38.707.08.415-.079.801a1.38 1.38 0 0 1-1.281.855m0 0\"/></g></symbol><symbol id=\"i-menu\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"2\"><path d=\"M4 7h16M4 12h16M4 17h16\"/></symbol><symbol id=\"i-right-arrow\" viewBox=\"0 0 29.25 54.75\"><defs><clipPath id=\"a\"><path d=\"M.184.563h27.785v53.289H.184Zm0 0\"/></clipPath></defs><g clip-path=\"url(#a)\"><path fill=\"currentColor\" d=\"M1.719.898q.57.001.976.407l24.871 24.922q.196.194.297.449.106.252.106.527a1.4 1.4 0 0 1-.403.98L2.696 53.106q-.193.21-.45.325a1.36 1.36 0 0 1-1.086.023 1.4 1.4 0 0 1-.465-.305 1.4 1.4 0 0 1-.304-.46 1.36 1.36 0 0 1 .023-1.086 1.3 1.3 0 0 1 .324-.45l23.89-23.945L.739 3.266q-.3-.3-.383-.711a1.37 1.37 0 0 1 .079-.801q.164-.393.511-.621.353-.235.774-.235m0 0\"/></g></symbol><symbol id=\"i-search\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M16.5 16.5 21 21\"/></symbol>";

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
