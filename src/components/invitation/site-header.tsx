import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Play,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LanguageToggle, money } from "./shared";
import { useLanguage } from "@/i18n/provider";
import { siteQuery, catalogQuery } from "@/services/queries";
import type { Design } from "@/services/types";
import hero from "@/assets/hero.webp.asset.json";

const expandable = new Set(["designs", "features", "pricing", "print"]);

export function SiteHeader({
  active,
  onOccasion,
  onDemo,
  onPrint,
}: {
  active: string;
  onOccasion: (event: string) => void;
  onDemo: (design: Design) => void;
  onPrint: (style: string) => void;
}) {
  const { language, t } = useLanguage();
  const { data: content } = useSuspenseQuery(siteQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const c = content[language];
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const header = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const close = () => {
    setOpen(null);
    setMobile(false);
  };

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        lastTrigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    close();
  }, [language]);

  const chooseOccasion = (event: string) => {
    onOccasion(event);
    close();
  };
  const browse = (id: string) => {
    close();
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  const featured = catalog.designs[0];
  const panel = (id: string) => (
    <div className={`mega-panel mega-${id}`} id={`mega-${id}`}>
      <div className="mega-inner">
        <div className="mega-intro">
          <p className="eyebrow">
            {id === "designs"
              ? c.designs.eyebrow
              : id === "print"
                ? c.print.eyebrow
                : id === "pricing"
                  ? c.pricing.eyebrow
                  : c.features.eyebrow}
          </p>
          <h3>
            {id === "designs" ? (
              <>
                {c.designs.title} <em>{c.designs.emphasis}</em>
              </>
            ) : id === "print" ? (
              <>
                {c.print.title} <em>{c.print.emphasis}</em>
              </>
            ) : id === "pricing" ? (
              c.pricing.title
            ) : (
              c.features.title
            )}
          </h3>
          <p>
            {id === "designs"
              ? c.designs.text
              : id === "print"
                ? c.print.text
                : id === "pricing"
                  ? c.pricing.text
                  : c.features.text}
          </p>
          <Button
            variant="link"
            className="mega-explore"
            onClick={() => (id === "designs" ? chooseOccasion("All") : browse(id))}
          >
            {id === "designs" ? c.designs.more : c.nav.find((n) => n.id === id)?.label}
            <ArrowRight />
          </Button>
        </div>
        {id === "designs" && (
          <>
            <div className="mega-occasion-list">
              <p className="eyebrow">{c.designs.all}</p>
              {Array.from(new Set(catalog.designs.map((d) => d.event))).map((event) => (
                <Button variant="ghost" key={event} onClick={() => chooseOccasion(event)}>
                  {language === "ur"
                    ? ((
                        {
                          Wedding: "شادی",
                          Mehndi: "مہندی",
                          Nikah: "نکاح",
                          Walima: "ولیمہ",
                          Birthday: "سالگرہ",
                          Engagement: "منگنی",
                          Aqiqah: "عقیقہ",
                        } as Record<string, string>
                      )[event] ?? event)
                    : event}
                  <ArrowUpRight />
                </Button>
              ))}
            </div>
            <div className="mega-design-grid">
              {catalog.designs.slice(0, 3).map((d) => (
                <div className="mega-design" key={d.id}>
                  <Button
                    variant="ghost"
                    className={`mega-art art-${d.id}`}
                    aria-label={`${t("use")} — ${d.name}`}
                    onClick={() => chooseOccasion(d.event)}
                  >
                    <img
                      src={d.image}
                      alt={`${d.name} invitation artwork`}
                      loading="lazy"
                      width="384"
                      height="512"
                    />
                  </Button>
                  <span>{d.style}</span>
                  <h4>{d.name}</h4>
                  <div>
                    <small>
                      {c.designs.from} {money(d.price)}
                    </small>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${t("live")} — ${d.name}`}
                      title={t("live")}
                      onClick={() => {
                        close();
                        onDemo(d);
                      }}
                    >
                      <Play />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {id === "features" && (
          <>
            <div className="mega-feature-links">
              {c.features.items.slice(0, 6).map((item, i) => (
                <Button variant="ghost" key={item.title} onClick={() => browse("features")}>
                  <span className="mega-feature-number">0{i + 1}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                  <ArrowUpRight />
                </Button>
              ))}
            </div>
            {featured && (
              <Button
                variant="ghost"
                className="mega-experience"
                onClick={() => {
                  close();
                  onDemo(featured);
                }}
              >
                <div>
                  <img
                    src={featured.image}
                    alt={featured.name}
                    loading="lazy"
                    width="384"
                    height="512"
                  />
                  <span className="mega-play">
                    <Play />
                  </span>
                </div>
                <strong>
                  {c.hero.demo}
                  <ArrowUpRight />
                </strong>
              </Button>
            )}
          </>
        )}
        {id === "pricing" && (
          <div className="mega-tiers">
            {catalog.tiers.map((tier, i) => (
              <Link
                className={`mega-tier ${tier.popular ? "is-popular" : ""}`}
                key={tier.id}
                to="/order"
                search={{ design: "chinar", tier: tier.id }}
                onClick={close}
              >
                <div className="mega-tier-image">
                  <img
                    src={catalog.designs[i]?.image ?? hero.url}
                    alt={`${tier.name} invitation package`}
                    loading="lazy"
                  />
                  <span>{tier.popular ? <Sparkles /> : <ArrowUpRight />}</span>
                </div>
                <h4>{tier.name}</h4>
                <p>{tier.description}</p>
                <div>
                  <strong>{money(tier.price)}</strong>
                  <ArrowUpRight />
                </div>
              </Link>
            ))}
          </div>
        )}
        {id === "print" && (
          <>
            <div className="mega-print-links">
              {c.print.items.map((item) => (
                <Button
                  variant="ghost"
                  key={item.id}
                  onClick={() => {
                    onPrint(item.id);
                    browse("print");
                  }}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="mega-print-price">
                    {money(item.price)}
                    <ArrowUpRight />
                  </span>
                </Button>
              ))}
            </div>
            <div className="mega-print-image">
              <img
                src={hero.url}
                alt="Peacock invitation stationery and matching envelopes"
                loading="lazy"
              />
              <span>{c.print.note}</span>
            </div>
          </>
        )}
      </div>
      <div className="mega-bottom">
        <span>
          <Sparkles size={14} />
          {c.hero.note}
        </span>
        <Button variant="link" asChild>
          <Link to="/order" search={{ design: "chinar" }} onClick={close}>
            {t("start")}
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <header
      className={`site-header enhanced-header ${open ? "has-mega" : ""}`}
      ref={header}
      onPointerLeave={(e) => {
        if (
          e.pointerType === "mouse" &&
          !mobile &&
          !header.current?.contains(document.activeElement)
        )
          setOpen(null);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(null);
          setMobile(false);
        }
      }}
    >
      <div className="header-inner">
        <Logo />
        <nav
          className={`enhanced-nav ${mobile ? "mobile-expanded" : ""}`}
          aria-label="Main navigation"
        >
          {c.nav.map((n) => (
            <div className="nav-disclosure" key={n.id}>
              {expandable.has(n.id) ? (
                <Button
                  variant="ghost"
                  className={`nav-trigger ${open === n.id || active === n.id ? "active" : ""}`}
                  aria-expanded={open === n.id}
                  aria-controls={`mega-${n.id}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse" && !mobile) setOpen(n.id);
                  }}
                  onClick={(e) => {
                    lastTrigger.current = e.currentTarget;
                    setOpen(open === n.id ? null : n.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      lastTrigger.current = e.currentTarget;
                      setOpen(n.id);
                      requestAnimationFrame(() =>
                        document
                          .getElementById(`mega-${n.id}`)
                          ?.querySelector<HTMLElement>("button, a")
                          ?.focus(),
                      );
                    }
                  }}
                >
                  {n.label}
                  <ChevronDown />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  asChild
                  className={`nav-trigger ${active === n.id ? "active" : ""}`}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={close}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse" && !mobile) setOpen(null);
                    }}
                  >
                    {n.label}
                  </a>
                </Button>
              )}
              {open === n.id && panel(n.id)}
            </div>
          ))}
          <Button variant="outline" className="mobile-account" asChild>
            <Link to="/account" onClick={close}>
              <Users />
              {t("account")}
            </Link>
          </Button>
        </nav>
        <div className="header-actions">
          <LanguageToggle />
          <Button variant="ghost" size="icon" className="account-icon" asChild title={t("account")}>
            <Link to="/account" aria-label={t("account")}>
              <Users />
            </Link>
          </Button>
          <Button asChild className="header-cta">
            <Link to="/order" search={{ design: "chinar" }}>
              {t("start")}
              <ArrowUpRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu"
            aria-label={mobile ? t("close") : language === "ur" ? "مینو کھولیں" : "Open navigation"}
            aria-expanded={mobile}
            onClick={(e) => {
              lastTrigger.current = e.currentTarget;
              setMobile(!mobile);
              setOpen(null);
            }}
          >
            {mobile ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
    </header>
  );
}
