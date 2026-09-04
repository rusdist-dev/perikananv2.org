import type { ReactNode } from 'react';

type ContactInfoProps = {
  heading: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  configMissingLabel: string;
};

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5 shrink-0">
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5 shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5 shrink-0">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.4 21 3 12.6 3 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-secondary">{icon}</span>
      <span className="text-sm text-fg">{children}</span>
    </div>
  );
}

export function ContactInfo({ heading, address, email, phone, configMissingLabel }: ContactInfoProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-bold uppercase tracking-wider text-secondary">{heading}</p>

      <InfoRow icon={<MapPinIcon />}>
        {address ?? <span data-config="missing">{configMissingLabel}</span>}
      </InfoRow>

      <InfoRow icon={<MailIcon />}>
        {email ? (
          <a href={`mailto:${email}`} className="hover:underline">
            {email}
          </a>
        ) : (
          <span data-config="missing">{configMissingLabel}</span>
        )}
      </InfoRow>

      <InfoRow icon={<PhoneIcon />}>
        {phone ? (
          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:underline">
            {phone}
          </a>
        ) : (
          <span data-config="missing">{configMissingLabel}</span>
        )}
      </InfoRow>
    </div>
  );
}
