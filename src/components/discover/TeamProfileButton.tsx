'use client';

import { type StaticImageData } from 'next/image';
import { useState } from 'react';
import { TeamProfileModal } from '@/components/discover/TeamProfileModal';

/**
 * Tombol "Profil"/"Profile" pada kartu tim (About Us & Our Team): membuka
 * TeamProfileModal alih-alih menautkan ke href="#" seperti sebelumnya --
 * belum ada halaman profil individu, jadi popup ini yang menampilkannya.
 * `className` diserahkan oleh pemanggil supaya tampilannya tetap identik
 * dengan AppLink yang digantikannya di tiap varian kartu (navy vs putih).
 */
export function TeamProfileButton({
  member,
  label,
  closeLabel,
  className,
}: {
  member: { image: StaticImageData; name: string; role: string; description: string };
  label: string;
  closeLabel: string;
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {label}
      </button>
      <TeamProfileModal isOpen={isOpen} member={member} closeLabel={closeLabel} onClose={() => setIsOpen(false)} />
    </>
  );
}
