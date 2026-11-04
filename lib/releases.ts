import { cacheLife } from "next/cache";
import { fetchRelease } from "./release-manifest";

/** Server-only callers. Both success and failure expire, including build-time results. */
export async function getRelease() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  return fetchRelease();
}
