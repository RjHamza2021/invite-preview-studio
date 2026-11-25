import { config } from "@/config";
import { siteContent } from "@/mocks/content";
import { designs, tiers, creditPacks, emptyDetails } from "@/mocks/products";
import type { Order, ExportFormat, Rsvp } from "./types";
const delay = (ms = 180) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const key = "invitation-demo-v1";
type Store = {
  orders: Order[];
  credits: number;
  links: Record<string, string>;
  rsvp: Record<string, Rsvp[]>;
};
function read(): Store {
  if (typeof window === "undefined") return { orders: [], credits: 0, links: {}, rsvp: {} };
  try {
    return JSON.parse(
      localStorage.getItem(key) || '{"orders":[],"credits":0,"links":{},"rsvp":{}}',
    ) as Store;
  } catch {
    return { orders: [], credits: 0, links: {}, rsvp: {} };
  }
}
function write(store: Store) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(store));
}
export async function getSiteContent() {
  await delay();
  if (typeof window !== "undefined" && window.__SITE_DATA__?.content)
    return window.__SITE_DATA__.content as typeof siteContent;
  return siteContent;
}
export async function getDesigns() {
  await delay();
  return (typeof window !== "undefined" ? window.__SITE_DATA__?.designs : undefined) ?? designs;
}
export async function getTiers() {
  return (typeof window !== "undefined" ? window.__SITE_DATA__?.tiers : undefined) ?? tiers;
}
export async function getCreditPacks() {
  return (
    (typeof window !== "undefined" ? window.__SITE_DATA__?.creditPacks : undefined) ?? creditPacks
  );
}
export async function createOrder(
  input: Pick<
    Order,
    "designId" | "tierId" | "language" | "name" | "email" | "phone" | "date" | "edition"
  >,
): Promise<Order> {
  await delay();
  const id = `${config.orderPrefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;
  const order: Order = {
    ...input,
    id,
    key: crypto.randomUUID(),
    status: "draft",
    step: 0,
    details: structuredClone(emptyDetails),
    createdAt: new Date().toISOString(),
    unlocked: [],
  };
  const s = read();
  s.orders.push(order);
  write(s);
  return order;
}
export async function saveOrderDraft(order: Order) {
  await delay(100);
  const s = read();
  const index = s.orders.findIndex((o) => o.id === order.id && o.key === order.key);
  if (index < 0) throw new Error("Draft not found");
  const current = s.orders[index];
  const next =
    current && current.status !== "draft" && order.status === "draft"
      ? { ...order, status: current.status, unlocked: current.unlocked }
      : order;
  s.orders[index] = next;
  write(s);
  return next;
}
export async function getOrderByKey(id: string, secret: string) {
  await delay();
  return read().orders.find((o) => o.id === id && o.key === secret) ?? null;
}
export async function getOrders() {
  await delay();
  return read().orders;
}
export async function submitOrder(id: string, secret: string) {
  const order = await getOrderByKey(id, secret);
  if (!order) throw new Error("Order not found");
  if (!order.details.host.trim() || !order.details.events[0]?.venue.trim())
    throw new Error("Please add your names and venue before submitting.");
  order.status = "payment-pending";
  return saveOrderDraft(order);
}
export async function generatePreview(id: string, secret: string) {
  await delay(2000);
  const order = await getOrderByKey(id, secret);
  if (!order) throw new Error("Order not found");
  order.status = "preview-ready";
  await saveOrderDraft(order);
  return {
    order,
    image: designs.find((d) => d.id === order.designId)?.image ?? designs[0]?.image ?? "",
  };
}
export async function checkSlugAvailability(slug: string) {
  await delay(350);
  return {
    available:
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && !["admin", "brand", "test"].includes(slug),
    slug,
  };
}
export async function getCredits() {
  await delay();
  return read().credits;
}
export async function buyCredits(packId: string) {
  const pack = creditPacks.find((p) => p.id === packId);
  if (!pack) throw new Error("Pack not found");
  const s = read();
  s.credits += pack.credits;
  write(s);
  return { credits: s.credits, mock: true };
}
export const exportCosts: Record<ExportFormat, number> = {
  png: 2,
  jpg: 2,
  pdf: 3,
  print: 4,
  video: 8,
  link: 5,
};
export function getOrderPrice(order: Pick<Order, "tierId" | "edition" | "details">) {
  return (
    (tiers.find((t) => t.id === order.tierId)?.price ?? 1900) +
    (order.edition === "personalised" ? 4000 : 0) +
    (order.details.customAddress ? 1500 : 0)
  );
}
export function getPaymentDue(order: Pick<Order, "tierId" | "edition" | "details">) {
  const total = getOrderPrice(order);
  return order.details.paymentPlan === "split" ? Math.ceil(total / 2) : total;
}
export async function unlockExport(id: string, secret: string, format: ExportFormat) {
  const order = await getOrderByKey(id, secret);
  if (!order) throw new Error("Order not found");
  const s = read();
  if (order.unlocked.includes(format)) return order;
  if (s.credits < exportCosts[format]) throw new Error("Not enough credits");
  s.credits -= exportCosts[format];
  order.unlocked.push(format);
  s.orders = s.orders.map((o) => (o.id === id ? order : o));
  if (format === "link") s.links[id] = `/invitation/${order.details.slug || id.toLowerCase()}`;
  write(s);
  return order;
}
export async function getDownloads(id: string) {
  return read().orders.find((o) => o.id === id)?.unlocked ?? [];
}
export async function getInvitationLink(id: string) {
  return read().links[id] ?? null;
}
export async function setInvitationLink(id: string, slug: string) {
  const availability = await checkSlugAvailability(slug);
  if (!availability.available) throw new Error("Choose another address");
  const s = read();
  s.links[id] = `/invitation/${slug}`;
  write(s);
  return s.links[id];
}
export async function getRsvpResponses(id: string) {
  return read().rsvp[id] ?? [];
}
export async function payNow(id: string, secret: string) {
  await delay();
  const order = await getOrderByKey(id, secret);
  if (!order) throw new Error("Order not found");
  order.unlocked = ["png", "jpg", "pdf", "print", "video", "link"];
  await saveOrderDraft(order);
  await setInvitationLink(id, order.details.slug || id.toLowerCase());
  return { order, mock: true };
}

export async function getSharedInvitation(slug: string) {
  await delay();
  const s = read();
  const id = Object.entries(s.links).find(([, link]) => link === `/invitation/${slug}`)?.[0];
  return s.orders.find((o) => o.id === id) ?? null;
}
export async function submitRsvp(id: string, response: Rsvp) {
  await delay();
  const s = read();
  const o = s.orders.find((o) => o.id === id);
  if (!o?.unlocked.includes("link")) throw new Error("Invitation unavailable");
  s.rsvp[id] = [...(s.rsvp[id] ?? []), response];
  write(s);
  return response;
}
