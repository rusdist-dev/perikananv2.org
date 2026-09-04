'use client';

import { useState } from 'react';
import type { SubmitEvent } from 'react';

type ContactFormProps = {
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
  };
};

const fieldClassName =
  'w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-muted';
const labelClassName = 'block text-xs font-bold uppercase tracking-wider text-muted';

/**
 * Belum ada backend/API untuk menerima pesan, jadi "kirim" di sini berarti
 * membuka mailto: ke site.contact.email dengan subjek+isi terisi otomatis --
 * benar-benar mengirim lewat klien email pengguna, bukan menampilkan pesan
 * sukses palsu dari form yang sebetulnya tidak mengirim ke mana pun.
 */
export function ContactForm({ email, labels }: ContactFormProps) {
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    const body = `${message}\n\n${name} (${senderEmail})`;
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-xs font-bold uppercase tracking-wider text-secondary">{labels.heading}</p>

      <div>
        <label htmlFor="contact-name" className={labelClassName}>
          {labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          value={senderEmail}
          onChange={(event) => setSenderEmail(event.target.value)}
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
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
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
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={labels.messagePlaceholder}
          className={`mt-2 resize-none ${fieldClassName}`}
        />
      </div>

      <button
        type="submit"
        disabled={!email}
        className="inline-flex w-fit items-center rounded-md bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {labels.submit}
      </button>
    </form>
  );
}
