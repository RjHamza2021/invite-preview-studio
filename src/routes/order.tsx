import { createFileRoute } from "@tanstack/react-router";
import { OrderPage } from "@/pages/order-page";
import { siteQuery, catalogQuery } from "@/services/queries";
import { config } from "@/config";
export type OrderSearch = { design?: string; tier?: string; resume?: string; key?: string };
export const Route = createFileRoute("/order")({
  validateSearch: (search: Record<string, unknown>): OrderSearch => ({
    ...(typeof search["design"] === "string" ? { design: search["design"] } : {}),
    ...(typeof search["tier"] === "string" ? { tier: search["tier"] } : {}),
    ...(typeof search["resume"] === "string" ? { resume: search["resume"] } : {}),
    ...(typeof search["key"] === "string" ? { key: search["key"] } : {}),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]),
  head: () => ({
    meta: [
      { title: `Create Your Invitation | ${config.brand}` },
      {
        name: "description",
        content: "Personalise your invitation, save your details and preview your celebration.",
      },
      { property: "og:title", content: `Your Invitation | ${config.brand}` },
      {
        property: "og:description",
        content: "Your beautiful beginning starts with a few details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});
