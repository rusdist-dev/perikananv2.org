'use client';

import { useActionState } from 'react';
import { submitContact } from '@/app/[locale]/kontak/actions';
import { contactInitialState, type ContactState } from '@/lib/contact';

type ContactFormProps = {
  /** Alamat cadangan, dipakai HANYA saat pengiriman gagal. null = belum
   *  dikonfigurasi (lihat §4j di lib/site.ts); tautan cadangannya lalu tidak
   *  ditampilkan sama sekali, bukan menunjuk alamat karangan. */
  email: string | null;
  labels: {
    heading: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    success: string;
    errorInvalid: string;
    errorRateLimit: string;
    errorUnavailable: string;
    errorFallback: string;
  };
};

const fieldClassName =
  'w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-muted';
const labelClassName = 'block text-xs font-bold uppercase tracking-wider text-muted';

/**
 * Form kontak yang benar-benar mengirim, lewat Server Action ke
 * `POST /api/v1/contact` CMS.
 *
 * Sebelumnya "kirim" di sini cuma membuka mailto: -- satu-satunya pilihan
 * jujur saat belum ada backend yang menerima pesan. Sekarang ada, jadi pesan
 * masuk ke dashboard CMS dan mailto: turun pangkat jadi jalan keluar saat
 * pengiriman gagal: pengunjung tidak kehilangan cara menghubungi, tapi juga
 * tidak pernah dibohongi pesan sukses dari form yang tidak mengirim apa pun.
 *
 * Input tidak dikendalikan state (uncontrolled): Server Action membaca
 * FormData, jadi form ini tetap terkirim meski JavaScript mati.
 */
export function ContactForm({ email, labels }: ContactFormProps) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    contactInitialState,
  );

  const errorMessage =
    state.status === 'error'
      ? state.reason === 'invalid'
        ? labels.errorInvalid
        : state.reason === 'rate-limit'
          ? labels.errorRateLimit
          : labels.errorUnavailable
      : null;

  // Cadangan email hanya masuk akal saat pengirimannya yang bermasalah, bukan
  // saat isian pengunjung yang kurang lengkap -- dan bukan saat tertahan laju
  // permintaan, yang cukup diulang sebentar lagi.
  const showFallback = state.status === 'error' && state.reason === 'unavailable' && Boolean(email);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-xs font-bold uppercase tracking-wider text-secondary">{labels.heading}</p>

      {state.status === 'success' ? (
        <p role="status" className="rounded-md border border-secondary bg-secondary/10 px-4 py-3 text-sm text-fg">
          {labels.success}
        </p>
      ) : null}

      {errorMessage ? (
        // role="alert" supaya pembaca layar mengumumkannya begitu muncul --
        // kegagalan kiriman yang hanya terlihat mata mudah terlewat.
        <p role="alert" className="rounded-md border border-border px-4 py-3 text-sm text-fg">
          {errorMessage}
          {showFallback ? (
            <>
              {' '}
              <a href={`mailto:${email}`} className="font-bold text-primary underline underline-offset-2">
                {labels.errorFallback}
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {/* Honeypot: disembunyikan dari mata dan dari pembaca layar, dan
          dikeluarkan dari urutan tab. Pengunjung asli tidak akan pernah
          mengisinya; bot yang mengisi semua field akan tertangkap di CMS. */}
      <div aria-hidden className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="contact-name" className={labelClassName}>
          {labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={labels.namePlaceholder}
          className={`mt-2 ${fieldClassName}`}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClassName}>
          {labels.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={labels.emailPlaceholder}
          className={`mt-2 ${fieldClassName}`}
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClassName}>
          {labels.subject}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          placeholder={labels.subjectPlaceholder}
          className={`mt-2 ${fieldClassName}`}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClassName}>
          {labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder={labels.messagePlaceholder}
          className={`mt-2 resize-none ${fieldClassName}`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center rounded-md bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
