import Image, { type StaticImageData } from 'next/image';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';

export type RelatedStory = {
  /** Opsional dengan sengaja: kartu tanpa foto tetap dirender lengkap dengan
   *  teksnya, sama seperti kartu artikel di beranda saat `article.image`
   *  tidak dikenal -- bukan kotak next/image kosong yang menunggu aset. */
  image?: StaticImageData;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
};

/** Grid tiga berita terkait, mengikuti persis pola kartu artikel di beranda
 *  (border + eyebrow tanggal/kategori + judul + ringkasan + tombol outline)
 *  supaya kedua tempat terasa satu sistem visual, bukan dua desain kartu
 *  yang kebetulan mirip. */
export function ProgramRelatedStories({
  eyebrow,
  heading,
  stories,
  readStoryLabel,
}: {
  eyebrow: string;
  heading: string;
  stories: RelatedStory[];
  readStoryLabel: string;
}) {
  return (
    <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">{eyebrow}</p>
      <h2 className="mb-8 text-2xl font-semibold md:text-3xl">
        <span className="text-primary">{heading}</span>{' '}
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <article key={story.title} className="flex flex-col border border-border">
            {story.image ? (
              <div className="relative aspect-[16/10]">
                <Image
                  src={story.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col gap-3 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                {story.date} · {story.category}
              </p>
              <h3 className="text-lg font-bold text-primary">{story.title}</h3>
              <p className="text-sm text-muted">{story.excerpt}</p>
              <AppLink
                href={story.href}
                className="mt-auto inline-flex w-fit items-center rounded-md border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
              >
                {readStoryLabel}
              </AppLink>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
