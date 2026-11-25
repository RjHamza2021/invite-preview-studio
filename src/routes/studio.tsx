import { createFileRoute } from "@tanstack/react-router";
import { StudioPage } from "@/pages/studio-page";
import { siteQuery, catalogQuery } from "@/services/queries";
import { config } from "@/config";
export type StudioSearch = { id?: string; key?: string };
export const Route = createFileRoute("/studio")({
  validateSearch: (s: Record<string, unknown>): StudioSearch => ({
    ...(typeof s["id"] === "string" ? { id: s["id"] } : {}),
    ...(typeof s["key"] === "string" ? { key: s["key"] } : {}),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]),
  head: () => ({
    meta: [
      { title: `Preview Studio | ${config.brand}` },
      {
        name: "description",
        content: "Preview your invitation and choose your digital and printed extras.",
      },
      { property: "og:title", content: `Invitation Preview | ${config.brand}` },
      { property: "og:description", content: "Your story, brought to life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});
