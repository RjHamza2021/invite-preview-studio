import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Coins,
  Download,
  LockKeyhole,
  Image as ImageIcon,
  FileText,
  Printer,
  Video,
  Globe2,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Route } from "@/routes/studio";
import { OrderHeader } from "./order-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditsDialog, DemoModal, money } from "@/components/invitation/shared";
import { siteQuery, catalogQuery } from "@/services/queries";
import {
  getOrderByKey,
  generatePreview,
  getCredits,
  unlockExport,
  exportCosts,
  payNow,
  getOrderPrice,
} from "@/services/api";
import { downloadFreePreview } from "@/services/downloads";
import type { Order, ExportFormat } from "@/services/types";
import { useLanguage } from "@/i18n/provider";
import { toast } from "sonner";
const exportsList: { format: ExportFormat; title: string; note: string; icon: typeof ImageIcon }[] =
  [
    {
      format: "png",
      title: "High-quality PNG",
      note: "Crisp, high-resolution invitation",
      icon: ImageIcon,
    },
    {
      format: "jpg",
      title: "High-quality JPG",
      note: "Perfect for WhatsApp and sharing",
      icon: ImageIcon,
    },
    {
      format: "pdf",
      title: "Digital PDF",
      note: "A beautiful downloadable keepsake",
      icon: FileText,
    },
    {
      format: "print",
      title: "Print-ready PDF",
      note: "Production-ready artwork for printing",
      icon: Printer,
    },
    {
      format: "video",
      title: "Video invitation",
      note: "A cinematic beginning for your guests",
      icon: Video,
    },
    {
      format: "link",
      title: "Your online invitation",
      note: "One link, every beautiful detail",
      icon: Globe2,
    },
  ];
export function StudioPage() {
  const search = Route.useSearch();
  const { t, language } = useLanguage();
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const { data: c } = useSuspenseQuery(siteQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(true);
  const [credits, setCredits] = useState(0);
  const [buy, setBuy] = useState(false);
  const [pay, setPay] = useState(false);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const design = catalog.designs.find((d) => d.id === order?.designId);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!search.id || !search.key) {
        setGenerating(false);
        return;
      }
      const initial = await getOrderByKey(search.id, search.key);
      if (!initial) {
        setGenerating(false);
        return;
      }
      if (initial.status === "draft") {
        if (active) {
          setOrder(initial);
          setGenerating(false);
        }
        return;
      }
      const result = await generatePreview(search.id, search.key);
      if (active) {
        setOrder(result.order);
        setCredits(await getCredits());
        setGenerating(false);
      }
    }
    void load().catch(() => {
      setGenerating(false);
      toast.error("Preview unavailable");
    });
    return () => {
      active = false;
    };
  }, [search.id, search.key]);
  async function unlock(format: ExportFormat) {
    if (!order) return;
    setBusy(true);
    try {
      const updated = await unlockExport(order.id, order.key, format);
      setOrder(updated);
      setCredits(await getCredits());
      toast.success("Unlocked in demo mode");
    } catch {
      setBuy(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <OrderHeader />
      {generating ? (
        <div className="generating-screen">
          <Sparkles />
          <p className="eyebrow">A LITTLE MAGIC IN THE MAKING</p>
          <h2>Generating your preview.</h2>
          <p>Your story is finding its beautiful beginning.</p>
          <div className="generating-track">
            <span />
          </div>
        </div>
      ) : !order || !design ? (
        <div className="empty-account">
          <Sparkles />
          <h2>Your preview is waiting to be created.</h2>
          <Button asChild>
            <Link to="/order" search={{ design: "chinar" }}>
              {t("start")}
            </Link>
          </Button>
        </div>
      ) : order.status === "draft" ? (
        <div className="empty-account">
          <h2>Complete your invitation details first.</h2>
          <Button asChild>
            <Link to="/order" search={{ resume: order.id, key: order.key }}>
              {t("continue")}
            </Link>
          </Button>
        </div>
      ) : (
        <main className="studio-content">
          <div className="studio-heading">
            <div>
              <p className="eyebrow">YOUR STORY, BROUGHT TO LIFE</p>
              <h1>{t("preview")}</h1>
              <p>
                {order.details.host} & {order.details.partner} · {order.id}
              </p>
            </div>
            <div className="credits-chip">
              <Coins size={16} />
              {credits} {t("credits")}
            </div>
          </div>
          <div className="studio-layout">
            <div>
              <div className="studio-canvas">
                <img src={design.image} alt="Sample artwork for your selected design" />
                <span className="preview-watermark">FREE PREVIEW</span>
              </div>
              <div className="studio-preview-footer">
                <span>
                  <Check size={12} className="inline" />
                  Low-resolution · Watermarked
                </span>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await downloadFreePreview(design.image, order);
                    } catch {
                      toast.error("Could not download preview");
                    }
                  }}
                >
                  <Download />
                  {t("download")}
                </Button>
              </div>
              <p className="small-note">
                Mock personalised preview — your names are applied to the free download. Full design
                generation connects later.
              </p>
            </div>
            <div className="studio-exports">
              <h3>Make it celebration-ready.</h3>
              <p>{c[language].free.note}</p>
              {exportsList.map((item) => {
                const Icon = item.icon;
                const unlocked = order.unlocked.includes(item.format);
                return (
                  <div key={item.format} className="export-option">
                    <Icon />
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.note}</small>
                    </div>
                    {unlocked ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (item.format === "video") setDemo(true);
                          else if (item.format === "link")
                            toast.info("Manage your demo link in My invitations.");
                          else
                            toast.info(
                              "High-quality exports will be produced by the WordPress generation service. Only the free preview is downloadable in this demo.",
                            );
                        }}
                      >
                        <Check />
                        Unlocked
                      </Button>
                    ) : (
                      <Button variant="outline" disabled={busy} onClick={() => unlock(item.format)}>
                        <LockKeyhole />
                        {exportCosts[item.format]} credits
                      </Button>
                    )}
                  </div>
                );
              })}
              <div className="studio-pay-actions">
                <Button onClick={() => setBuy(true)}>
                  <Coins />
                  {t("buy")}
                </Button>
                <Button variant="outline" onClick={() => setPay(true)}>
                  Pay now
                  <ArrowUpRight />
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/account">{t("account")}</Link>
                </Button>
              </div>
              <p className="small-note">All upgrades are mocked. No payment is collected.</p>
            </div>
          </div>
        </main>
      )}
      <CreditsDialog
        open={buy}
        onClose={() => setBuy(false)}
        onPurchased={() => {
          void getCredits().then(setCredits);
        }}
      />
      <DemoModal design={demo ? (design ?? null) : null} onClose={() => setDemo(false)} />
      <Dialog open={pay} onOpenChange={setPay}>
        <DialogContent>
          <DialogTitle>Complete your invitation</DialogTitle>
          <DialogDescription>
            Demo checkout only. No payment is collected. High-resolution assets require the future
            WordPress service.
          </DialogDescription>
          {order && (
            <>
              <p className="quote-total">
                Your package <strong>{money(getOrderPrice(order))}</strong>
              </p>
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const result = await payNow(order.id, order.key);
                    setOrder(result.order);
                    setPay(false);
                    toast.success("Package unlocked in demo mode");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Confirm demo checkout
                <Check />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
