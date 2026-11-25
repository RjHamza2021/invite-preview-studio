import { describe, it, expect, beforeEach } from "vitest";
import {
  createOrder,
  getOrderByKey,
  saveOrderDraft,
  buyCredits,
  getCredits,
  unlockExport,
  getPaymentDue,
  exportCosts,
  checkSlugAvailability,
} from "@/services/api";
import { mockPrintProvider } from "@/services/print";
import { emptyDetails } from "@/mocks/products";
beforeEach(() => localStorage.clear());
const input = {
  designId: "chinar",
  tierId: "complete",
  language: "en" as const,
  name: "Ayesha Khan",
  email: "ayesha@example.com",
  phone: "+923001234567",
  date: "2026-12-20",
  edition: "template" as const,
};
describe("Invitation product rules", () => {
  it("restores saved drafts only with the matching secret", async () => {
    const o = await createOrder(input);
    o.details.host = "Ayesha";
    await saveOrderDraft(o);
    expect((await getOrderByKey(o.id, o.key))?.details.host).toBe("Ayesha");
    expect(await getOrderByKey(o.id, "wrong-key")).toBeNull();
  });
  it("never lets an in-flight autosave undo a submitted order", async () => {
    const order = await createOrder(input);
    await saveOrderDraft({ ...order, status: "payment-pending" });
    await saveOrderDraft(order);
    expect((await getOrderByKey(order.id, order.key))?.status).toBe("payment-pending");
  });
  it("offers a 50/50 payment plan", () => {
    expect(
      getPaymentDue({
        tierId: "complete",
        edition: "template",
        details: { ...emptyDetails, paymentPlan: "split" },
      }),
    ).toBe(2450);
  });
  it("provides 5, 15 and 40 credit packs", async () => {
    await buyCredits("small");
    expect(await getCredits()).toBe(5);
    await buyCredits("medium");
    expect(await getCredits()).toBe(20);
    await buyCredits("large");
    expect(await getCredits()).toBe(60);
  });
  it("requires credits for high-quality downloads", async () => {
    const o = await createOrder(input);
    await expect(unlockExport(o.id, o.key, "png")).rejects.toThrow("Not enough credits");
    await buyCredits("small");
    await unlockExport(o.id, o.key, "png");
    expect(await getCredits()).toBe(5 - exportCosts.png);
    await unlockExport(o.id, o.key, "png");
    expect(await getCredits()).toBe(3);
  });
  it("checks custom invitation slug availability", async () => {
    expect((await checkSlugAvailability("ayesha-and-hamza")).available).toBe(true);
    expect((await checkSlugAvailability("admin")).available).toBe(false);
  });
  it("quotes provider-agnostic print orders with selected quantity", async () => {
    expect((await mockPrintProvider.quote("flat", 50)).subtotal).toBe(6000);
  });
});
