import Image from "next/image";
import type { BlogAuthor as Author } from "@/lib/hygraph";

type BlogAuthorProps = {
  author: Author;
  /** Smaller variant for listing cards. */
  compact?: boolean;
};

export default function BlogAuthor({ author, compact }: BlogAuthorProps) {
  return (
    <div className={compact ? "blog-author blog-author-compact" : "blog-author"}>
      {author.pictureUrl ? (
        <Image
          className="blog-author-avatar"
          src={author.pictureUrl}
          alt=""
          width={80}
          height={80}
        />
      ) : null}
      <span className="blog-author-text">
        <span className="blog-author-name">{author.name}</span>
        {author.role && !compact ? (
          <span className="blog-author-role">{author.role}</span>
        ) : null}
      </span>
    </div>
  );
}
