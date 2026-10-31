import { site } from "@/lib/site";

const videoId = new URL(site.links.featuredVideo).searchParams.get("v");

export default function FeaturedVideo() {
  return (
    <section id="watch" className="wrap featured-video-section" aria-labelledby="video-title">
      <p className="eyebrow"><b /> WATCH CHUCHU</p>
      <h2 id="video-title" className="h2">A little Chuchu. Press play.</h2>
      <p className="lede">Watch here, or find more on the Chuchu YouTube channel.</p>
      <figure className="glass featured-video">
        <div className="featured-video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title="Chuchu video on YouTube"
            width="1280"
            height="720"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <figcaption className="featured-video-caption">
          <span>CHUCHU ON YOUTUBE</span>
          <div className="featured-video-links">
            <a href={site.links.featuredVideo}>Open on YouTube <span aria-hidden="true">↗</span></a>
            <a href={site.links.youtube}>Visit the channel <span aria-hidden="true">↗</span></a>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
