import { queryOptions } from "@tanstack/react-query";
import { getSiteContent, getDesigns, getTiers, getCreditPacks } from "./api";
export const siteQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: getSiteContent,
  staleTime: Infinity,
});
export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: async () => ({
    designs: await getDesigns(),
    tiers: await getTiers(),
    packs: await getCreditPacks(),
  }),
  staleTime: Infinity,
});
