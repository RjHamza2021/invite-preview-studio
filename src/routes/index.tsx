import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/home-page";
import { siteQuery, catalogQuery } from "@/services/queries";
import { englishContent } from "@/mocks/content";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]),
  head: () => ({
    meta: [
      { title: englishContent.seo.title },
      { name: "description", content: englishContent.seo.description },
      { property: "og:title", content: englishContent.seo.title },
      { property: "og:description", content: englishContent.seo.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
