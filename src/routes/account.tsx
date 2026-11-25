import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/pages/account-page";
import { siteQuery, catalogQuery } from "@/services/queries";
import { config } from "@/config";
export const Route = createFileRoute("/account")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]),
  head: () => ({
    meta: [
      { title: `My Invitations | ${config.brand}` },
      {
        name: "description",
        content: "Your celebrations, drafts, downloads and guest responses in one place.",
      },
      { property: "og:title", content: `My Invitations | ${config.brand}` },
      { property: "og:description", content: "Manage your beautiful beginnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});
