import { createFileRoute } from "@tanstack/react-router";
import { PublicInvitationPage } from "@/pages/public-invitation-page";
import { catalogQuery } from "@/services/queries";
import { config } from "@/config";
export const Route = createFileRoute("/invitation/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: `You're Invited | ${config.brand}` },
      {
        name: "description",
        content: "Join us for a beautiful celebration. View the details and send your RSVP.",
      },
      { property: "og:title", content: `You're Invited | ${config.brand}` },
      { property: "og:description", content: "A beautiful beginning, shared with you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicInvitationPage,
});
