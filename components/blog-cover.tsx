import Image from "next/image";

type BlogCoverProps = {
  src: string | null;
  alt: string;
  sizes: string;
  /** Marks an above-the-fold image so it is fetched early. */
  eager?: boolean;
};

/**
 * 16:9 cover. The box reserves its space up front so images never shift the
 * layout, and posts without an image get a quiet logo placeholder.
 */
export default function BlogCover({ src, alt, sizes, eager }: BlogCoverProps) {
  return (
    <div className="blog-cover">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      ) : (
        <Image
          className="blog-cover-fallback"
          src="/chuchu-logo-3.svg"
          alt=""
          width={96}
          height={58}
        />
      )}
    </div>
  );
}
