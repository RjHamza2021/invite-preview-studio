export type Language = "en" | "ur";
export type Design = {
  id: string;
  name: string;
  event: string;
  style: string;
  image: string;
  price: number;
  regularPrice: number;
  description: string;
  tag?: string;
};
export type Tier = {
  id: string;
  name: string;
  description: string;
  price: number;
  regularPrice: number;
  features: string[];
  popular?: boolean;
};
export type CreditPack = { id: string; credits: number; price: number; label: string };
export type EventDetails = {
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  map: string;
  dressCode: string;
};
export type OrderDetails = {
  host: string;
  partner: string;
  family: string;
  wording: string;
  city: string;
  slug: string;
  customAddress: boolean;
  bismillah: boolean;
  verse: boolean;
  dua: string;
  events: EventDetails[];
  rsvp: boolean;
  travel: string;
  registry: string;
  faq: string;
  gallery: boolean;
  welcome: string;
  notes: string;
  music: string;
  photoName: string;
  paymentPlan: "full" | "split";
  method: "bank" | "easypaisa" | "jazzcash" | "sadapay" | "card";
  receiptName: string;
};
export type Order = {
  id: string;
  key: string;
  designId: string;
  tierId: string;
  language: Language;
  name: string;
  email: string;
  phone: string;
  date: string;
  edition: "template" | "personalised";
  status: "draft" | "payment-pending" | "preview-ready";
  step: number;
  details: OrderDetails;
  createdAt: string;
  unlocked: string[];
};
export type Rsvp = {
  name: string;
  guests: number;
  response: "Attending" | "Declined" | "Awaiting";
  message: string;
};
export type ExportFormat = "png" | "jpg" | "pdf" | "print" | "video" | "link";
export type InitialData = {
  content?: unknown;
  designs?: Design[];
  tiers?: Tier[];
  creditPacks?: CreditPack[];
};
declare global {
  interface Window {
    __SITE_DATA__?: InitialData;
  }
}
