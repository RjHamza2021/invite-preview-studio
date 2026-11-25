import { englishContent } from "@/mocks/content";
export type PrintQuote = {
  style: string;
  quantity: number;
  subtotal: number;
  delivery: number;
  total: number;
  days: string;
};
export interface PrintProvider {
  quote(style: string, quantity: number): Promise<PrintQuote>;
  createPrintOrder(quote: PrintQuote): Promise<{ id: string; status: string }>;
  trackOrder(id: string): Promise<{ id: string; status: string; tracking: string | null }>;
}
export const mockPrintProvider: PrintProvider = {
  async quote(style, quantity) {
    if (quantity < 25) throw new Error("Minimum quantity is 25");
    const product = englishContent.print.items.find((p) => p.id === style);
    if (!product) throw new Error("Unknown print style");
    const subtotal = product.price * quantity;
    return {
      style,
      quantity,
      subtotal,
      delivery: 350,
      total: subtotal + 350,
      days: "5–7 working days",
    };
  },
  async createPrintOrder() {
    return {
      id: `PRINT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      status: "Demo — not placed",
    };
  },
  async trackOrder(id) {
    return { id, status: "Demo — awaiting provider", tracking: null };
  },
};
