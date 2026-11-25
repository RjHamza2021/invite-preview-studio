import { Link } from "@tanstack/react-router";
import {
  Flower2,
  Globe2,
  X,
  Play,
  ArrowUpRight,
  Check,
  Coins,
  Copy,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/provider";
import { config } from "@/config";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteQuery, catalogQuery } from "@/services/queries";
import { buyCredits } from "@/services/api";
import type { Design } from "@/services/types";
import video from "@/assets/invitation-intro.mp4.asset.json";
import { toast } from "sonner";
export const money = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;
export function Logo() {
  return (
    <Link to="/" className="wordmark" aria-label={`${config.brand} home`}>
      <Flower2 strokeWidth={1.4} />
      <span>
        {config.brand}
        <span className="wordmark-dot">.</span>
      </span>
    </Link>
  );
}
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="language-toggle"
      aria-label={language === "en" ? "Switch to Urdu" : "Switch to English"}
      onClick={() => setLanguage(language === "en" ? "ur" : "en")}
    >
      <Globe2 />
      <span>{language === "en" ? "اردو" : "EN"}</span>
    </Button>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>
        {title}
        {emphasis && (
          <>
            {" "}
            <em>{emphasis}</em>
          </>
        )}
      </h2>
      {text && <p className="section-description">{text}</p>}
    </div>
  );
}
export function WhatsAppButton() {
  const { language } = useLanguage();
  const { data } = useSuspenseQuery(siteQuery);
  const c = data[language];
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (config.contact.whatsapp)
          window.open(`https://wa.me/${config.contact.whatsapp}`, "_blank", "noopener");
        else
          toast.info(
            language === "en"
              ? "The contact number will be added when the brand launches."
              : "رابطہ نمبر جلد شامل کیا جائے گا۔",
          );
      }}
    >
      <span>◉</span>
      {c.footer.whatsapp}
      <ArrowUpRight />
    </Button>
  );
}
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Clipboard unavailable. Select and copy the link.");
  }
}
export function DemoModal({ design, onClose }: { design: Design | null; onClose: () => void }) {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  return (
    <Dialog
      open={!!design}
      onOpenChange={(open) => {
        if (!open) {
          setPlaying(false);
          onClose();
        }
      }}
    >
      <DialogContent className="demo-dialog" showCloseButton={false}>
        <DialogTitle className="sr-only">
          {design?.name} — {t("live")}
        </DialogTitle>
        <DialogDescription className="sr-only">Invitation experience</DialogDescription>
        <div className="demo-top">
          <Logo />
          <span>{design?.name}</span>
          <Button variant="ghost" size="icon" aria-label={t("close")} onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="demo-phone phone">
          <div className="phone-island" />
          <div className="phone-scroll">
            {design && (
              <>
                <div className="demo-cover">
                  {playing ? (
                    <video
                      src={video.url}
                      autoPlay
                      muted
                      controls
                      playsInline
                      poster={design.image}
                      onEnded={() => setPlaying(false)}
                    />
                  ) : (
                    <>
                      <img src={design.image} alt={`${design.name} full invitation cover`} />
                      <Button
                        className="phone-play"
                        size="icon"
                        aria-label="Play invitation intro"
                        onClick={() => setPlaying(true)}
                      >
                        <Play fill="currentColor" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="phone-page">
                  <Flower2 />
                  <p>TOGETHER WITH OUR FAMILIES</p>
                  <h3>
                    Ayesha <em>&</em> Hamza
                  </h3>
                  <p>Joyfully invite you to celebrate</p>
                  <h4>Our beautiful beginning</h4>
                  <div className="phone-event">
                    <p>NIKAH & BARAAT</p>
                    <h4>December 20, 2026</h4>
                    <p>7:00 PM · The Shalimar Garden, Lahore</p>
                  </div>
                  <p>With love, laughter and happily ever after.</p>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Demo RSVP received. Thank you!")}
                  >
                    I’ll be there <Check />
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="phone-browser">
            <LockKeyhole size={12} />
            <span>your celebration</span>
            <Button size="sm" asChild>
              <Link to="/order" search={{ design: design?.id ?? "chinar" }}>
                {t("use")}
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
        <p className="demo-caption">
          {t("live")} · {design?.style}
        </p>
      </DialogContent>
    </Dialog>
  );
}
export function CreditsDialog({
  open,
  onClose,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const { t, language } = useLanguage();
  const { data } = useSuspenseQuery(siteQuery);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>{t("buy")}</DialogTitle>
        <DialogDescription>{data[language].pricing.creditText}</DialogDescription>
        <p className="mock-notice">Demo purchase only — no payment will be collected.</p>
        <div className="credit-dialog-packs">
          {catalog.packs.map((pack) => (
            <div key={pack.id}>
              <Coins />
              <strong>
                {pack.credits} {t("credits")}
              </strong>
              <p>{money(pack.price)}</p>
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await buyCredits(pack.id);
                    toast.success(`${pack.credits} demo credits added`);
                    onPurchased?.();
                    onClose();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("buy")}
                <ArrowUpRight />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function ResumeLink({ id, secret }: { id: string; secret: string }) {
  const { t } = useLanguage();
  return (
    <div className="resume-link">
      <div>
        <Copy size={16} />
        <span>{t("resume")}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          copyText(
            `${window.location.origin}/order?resume=${encodeURIComponent(id)}&key=${encodeURIComponent(secret)}`,
          )
        }
      >
        {t("copy")}
        <Copy />
      </Button>
    </div>
  );
}
