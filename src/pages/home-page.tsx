import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/invitation/site-header";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Star,
  Check,
  Sparkles,
  Heart,
  Globe2,
  Video,
  Users,
  MapPin,
  Clock,
  Music,
  CalendarDays,
  Languages,
  Printer,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Logo,
  LanguageToggle,
  SectionHeading,
  DemoModal,
  CreditsDialog,
  WhatsAppButton,
  money,
} from "@/components/invitation/shared";
import { useLanguage } from "@/i18n/provider";
import { siteQuery, catalogQuery } from "@/services/queries";
import { mockPrintProvider, type PrintQuote } from "@/services/print";
import type { Design } from "@/services/types";
import hero from "@/assets/hero.webp.asset.json";
import intro from "@/assets/invitation-intro.mp4.asset.json";
import { config } from "@/config";
import { toast } from "sonner";
const occasions = [
  "Wedding",
  "Mehndi",
  "Nikah",
  "Walima",
  "Birthday",
  "Baby Shower",
  "Aqiqah",
  "Corporate",
  "Engagement",
];
const urOccasions = [
  "شادی",
  "مہندی",
  "نکاح",
  "ولیمہ",
  "سالگرہ",
  "بے بی شاور",
  "عقیقہ",
  "کارپوریٹ",
  "منگنی",
];
const icons = [
  Sparkles,
  Globe2,
  Video,
  Users,
  MapPin,
  Clock,
  Music,
  CalendarDays,
  Languages,
  Printer,
];
export function FaqSchema({ items }: { items: { q: string; a: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
export function HomePage() {
  const { language, t } = useLanguage();
  const { data: content } = useSuspenseQuery(siteQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const c = content[language];
  const [event, setEvent] = useState("All");
  const [style, setStyle] = useState("All");
  const [all, setAll] = useState(false);
  const [demo, setDemo] = useState<Design | null>(null);
  const [credits, setCredits] = useState(false);
  const [active, setActive] = useState("");
  const [review, setReview] = useState(0);
  const [printStyle, setPrintStyle] = useState("flat");
  const [quantity, setQuantity] = useState(50);
  const [quote, setQuote] = useState<PrintQuote | null>(null);
  const [legal, setLegal] = useState("");
  const reduced = useReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-20% 0px -60% 0px" },
    );
    c.nav.forEach((n) => {
      const element = document.getElementById(n.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [c.nav]);
  const filtered = catalog.designs.filter(
    (d) => (event === "All" || d.event === event) && (style === "All" || d.style === style),
  );
  const shown = all ? filtered : filtered.slice(0, 4);
  const featured = catalog.designs[0];
  return (
    <>
      <FaqSchema items={c.faq.items} />
      <SiteHeader
        active={active}
        onDemo={setDemo}
        onPrint={setPrintStyle}
        onOccasion={(occasion) => {
          setEvent(occasion);
          setStyle("All");
          setAll(true);
          document
            .getElementById("designs")
            ?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
        }}
      />
      <main>
        <section className="hero-section">
          <img
            className="hero-image"
            src={hero.url}
            alt="Peacock teal wedding invitation with ivory jasmine, a matching envelope and personalised stationery"
            fetchPriority="high"
          />
          <div className="hero-overlay" />
          <div className="hero-inner">
            <motion.div
              className="hero-copy"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <p className="eyebrow">
                <span className="tiny-line" />
                {c.hero.eyebrow}
              </p>
              <h1>
                {c.hero.title}
                <br />
                {c.hero.line}
                <br />
                <em>{c.hero.emphasis}</em>
              </h1>
              <p className="hero-description">{c.hero.description}</p>
              <div className="hero-actions">
                <Button size="lg" asChild>
                  <a href="#designs">
                    {c.hero.browse}
                    <ArrowUpRight />
                  </a>
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setDemo(featured ?? null)}>
                  <span className="play-circle">
                    <Play size={14} fill="currentColor" />
                  </span>
                  {c.hero.demo}
                </Button>
              </div>
              <p className="hero-note">
                <Check size={13} />
                {c.hero.note}
              </p>
              <div className="hero-social">
                <div className="avatar-stack">
                  <span>AK</span>
                  <span>MH</span>
                  <span>SA</span>
                  <span>HN</span>
                </div>
                <div>
                  <span className="stars">
                    {"★★★★★"} <b>{c.hero.rating}</b>
                  </span>
                  <p>{c.hero.trust}</p>
                </div>
              </div>
            </motion.div>
            <div className="hero-visual">
              <div className="hero-phone phone">
                <div className="phone-island" />
                <video
                  src={intro.url}
                  poster={featured?.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Animated peacock wedding invitation"
                />
                <Button
                  variant="secondary"
                  className="hero-phone-button"
                  onClick={() => setDemo(featured ?? null)}
                >
                  <Play size={12} />
                  {t("live")}
                  <ArrowUpRight size={12} />
                </Button>
              </div>
              <div className="phone-annotation">
                <span>✧</span>
                {c.hero.phone}
              </div>
            </div>
          </div>
        </section>
        <div className="benefits-strip">
          <div className="content-width">
            {c.benefits.map((b, i) => {
              const Icon = [Sparkles, Heart, Languages, Printer][i] ?? Check;
              return (
                <span key={b}>
                  <Icon size={18} strokeWidth={1.5} />
                  {b}
                </span>
              );
            })}
          </div>
        </div>
        <section id="designs" className="section collection-section">
          <div className="content-width">
            <div className="collection-heading">
              <SectionHeading
                eyebrow={c.designs.eyebrow}
                title={c.designs.title}
                emphasis={c.designs.emphasis}
                text={c.designs.text}
              />
              <span className="collection-count">
                08 <span>CURATED DESIGNS</span>
              </span>
            </div>
            <div className="gallery-toolbar">
              <div
                className="occasion-filters"
                role="group"
                aria-label="Filter designs by occasion"
              >
                <Button
                  variant={event === "All" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setEvent("All");
                    setAll(false);
                  }}
                >
                  {c.designs.all}
                </Button>
                {occasions.map((e, i) => (
                  <Button
                    variant={event === e ? "default" : "ghost"}
                    size="sm"
                    key={e}
                    onClick={() => {
                      setEvent(e);
                      setAll(true);
                    }}
                  >
                    {language === "ur" ? urOccasions[i] : e}
                  </Button>
                ))}
              </div>
              <select
                aria-label="Filter by style"
                value={style}
                onChange={(e) => {
                  setStyle(e.target.value);
                  setAll(true);
                }}
              >
                <option value="All">{c.designs.styles}</option>
                {["Royal & Traditional", "Floral", "Minimal", "Contemporary"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="design-grid">
              {shown.map((d, i) => (
                <motion.article
                  key={d.id}
                  className="design-card"
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className={`design-art art-${d.id}`}>
                    {d.tag && <span className="design-badge">{d.tag}</span>}
                    <img
                      loading="lazy"
                      src={d.image}
                      srcSet={`${d.image} 384w`}
                      sizes="(max-width: 600px) 45vw, 260px"
                      alt={`${d.name} ${d.event.toLowerCase()} invitation in ${d.style.toLowerCase()} style`}
                      width="384"
                      height="512"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gallery-demo"
                      onClick={() => setDemo(d)}
                    >
                      <Play size={12} />
                      {t("live")}
                    </Button>
                  </div>
                  <div className="design-info">
                    <p className="design-style">
                      {d.style} <span>· {d.event}</span>
                    </p>
                    <h3>{d.name}</h3>
                    <div className="design-bottom">
                      <span>
                        {c.designs.from} <strong>{money(d.price)}</strong>
                      </span>
                      <Button variant="ghost" size="icon" title={t("use")} asChild>
                        <Link
                          to="/order"
                          search={{ design: d.id }}
                          aria-label={`${t("use")} — ${d.name}`}
                        >
                          <ArrowUpRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            {shown.length === 0 && (
              <div className="empty-gallery">
                <FlowerDecoration />
                <h3>{c.designs.empty}</h3>
                <p>{c.designs.emptyText}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEvent("All");
                    setStyle("All");
                  }}
                >
                  {c.designs.all}
                </Button>
              </div>
            )}
            <div className="collection-footer">
              <p>
                <Heart size={14} />
                {c.designs.footer}
              </p>
              {!all && filtered.length > 4 && (
                <Button variant="outline" onClick={() => setAll(true)}>
                  {c.designs.more}
                  <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </section>
        <section id="how-it-works" className="section how-section">
          <div className="content-width">
            <SectionHeading {...c.how} center />
            <div className="steps-grid">
              {c.how.steps.map((s, i) => (
                <div className="how-step" key={s.title}>
                  <span className="step-number">0{i + 1}</span>
                  <div className="step-illustration">
                    {i === 0 ? (
                      <>
                        <ImageIcon />
                        <Heart />
                      </>
                    ) : i === 1 ? (
                      <>
                        <span>Ayesha & Hamza</span>
                        <span className="illustration-line" />
                        <span className="illustration-line short" />
                      </>
                    ) : (
                      <>
                        <Check />
                        <span>You’re invited.</span>
                      </>
                    )}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section comparison-section">
          <div className="content-width narrow">
            <SectionHeading {...c.comparison} center />
            <div className="comparison-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th aria-label="Features" />
                    {c.comparison.columns.map((col, i) => (
                      <th key={col} className={i === 2 ? "featured-column" : ""}>
                        {i === 2 && <Sparkles size={18} />} {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.comparison.labels.map((label, index) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {c.comparison.values.map((column, i) => (
                        <td key={i} className={i === 2 ? "featured-column" : ""}>
                          {column[index] === "✓" ? (
                            <Check size={17} />
                          ) : (
                            <span className="muted-dash">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section id="features" className="section feature-section">
          <div className="content-width">
            <SectionHeading {...c.features} center />
            <div className="feature-grid">
              {c.features.items.map((f, i) => {
                const Icon = icons[i] ?? Sparkles;
                return (
                  <article
                    key={f.title}
                    className={`feature-item ${i === 0 ? "feature-spotlight" : ""}`}
                  >
                    <div className="feature-icon">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                    {i === 0 && featured && (
                      <div className="feature-preview">
                        <img
                          src={featured.image}
                          loading="lazy"
                          alt="Personalised peacock invitation preview"
                        />
                        <span>
                          <Sparkles size={12} /> Ayesha & Hamza
                        </span>
                      </div>
                    )}
                    {i === 5 && (
                      <div className="countdown">
                        <span>
                          18<small>DAYS</small>
                        </span>
                        <b>:</b>
                        <span>
                          06<small>HOURS</small>
                        </span>
                        <b>:</b>
                        <span>
                          24<small>MINUTES</small>
                        </span>
                      </div>
                    )}
                    {i === 6 && (
                      <div className="music-bars">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                    {i === 3 && (
                      <div className="rsvp-mini">
                        <span>
                          <Check size={12} /> Attending
                        </span>
                        <b>+2 guests</b>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="section free-section">
          <div className="content-width free-inner">
            <SectionHeading {...c.free} />
            <div className="free-columns">
              <div>
                <span className="free-icon">
                  <Download />
                </span>
                <h3>{c.free.previewTitle}</h3>
                {c.free.previewItems.map((x) => (
                  <p key={x}>
                    <Check size={15} />
                    {x}
                  </p>
                ))}
              </div>
              <div>
                <span className="free-icon paid">
                  <Sparkles />
                </span>
                <h3>{c.free.paidTitle}</h3>
                {c.free.paidItems.map((x) => (
                  <p key={x}>
                    <Check size={15} />
                    {x}
                  </p>
                ))}
              </div>
            </div>
            <p className="free-note">{c.free.note}</p>
          </div>
        </section>
        <section id="pricing" className="section pricing-section">
          <div className="content-width">
            <SectionHeading {...c.pricing} center />
            <div className="pricing-grid">
              {catalog.tiers.map((tier) => (
                <article key={tier.id} className={`pricing-card ${tier.popular ? "popular" : ""}`}>
                  {tier.popular && (
                    <div className="popular-label">
                      <Sparkles size={13} />
                      {c.pricing.popular}
                    </div>
                  )}
                  <p className="eyebrow">
                    {tier.id === "cinematic"
                      ? "THE FULL EXPERIENCE"
                      : tier.id === "complete"
                        ? "A LITTLE MORE MAGIC"
                        : "BEAUTIFULLY SIMPLE"}
                  </p>
                  <h3>{tier.name}</h3>
                  <p>{tier.description}</p>
                  <div className="tier-price">
                    <s>{money(tier.regularPrice)}</s>
                    <span className="launch-badge">{c.pricing.launch}</span>
                    <strong>{money(tier.price)}</strong>
                    <small>{c.pricing.once}</small>
                  </div>
                  <ul>
                    {tier.features.map((f) => (
                      <li key={f}>
                        <Check size={15} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={tier.popular ? "default" : "outline"} asChild>
                    <Link to="/order" search={{ design: "chinar", tier: tier.id }}>
                      {c.pricing.choose} {tier.name}
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
            <div className="credit-row">
              <div>
                <h3>{c.pricing.creditTitle}</h3>
                <p>{c.pricing.creditText}</p>
              </div>
              <div className="credit-packs">
                {catalog.packs.map((p) => (
                  <Button key={p.id} variant="outline" onClick={() => setCredits(true)}>
                    <span>
                      <strong>{p.credits}</strong> {c.pricing.creditUnit}
                      <small>{money(p.price)}</small>
                    </span>
                    <ArrowUpRight />
                  </Button>
                ))}
              </div>
            </div>
            <p className="print-addons">
              <Printer size={15} />
              {c.pricing.printNote}
            </p>
          </div>
        </section>
        <section id="print" className="section print-section">
          <div className="content-width print-layout">
            <div className="print-image">
              <img
                src={hero.url}
                loading="lazy"
                alt="Premium teal wedding invitation card and matching ivory envelope set"
              />
              <span className="print-image-label">A LITTLE KEEPSAKE. A LIFETIME OF MEMORIES.</span>
            </div>
            <div>
              <SectionHeading {...c.print} />
              <div className="print-style-grid">
                {c.print.items.map((p) => (
                  <label key={p.id} className={printStyle === p.id ? "selected" : ""}>
                    <input
                      type="radio"
                      name="printstyle"
                      value={p.id}
                      checked={printStyle === p.id}
                      onChange={() => setPrintStyle(p.id)}
                    />
                    <span>
                      <strong>{p.name}</strong>
                      <small>{money(p.price)} / piece</small>
                    </span>
                  </label>
                ))}
              </div>
              <div className="print-controls">
                <label>
                  {c.print.quantity}
                  <select
                    aria-label={c.print.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[25, 50, 100, 200, 500].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <Button
                  onClick={async () => {
                    try {
                      setQuote(await mockPrintProvider.quote(printStyle, quantity));
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Quote unavailable");
                    }
                  }}
                >
                  {c.print.quote}
                  <ArrowUpRight />
                </Button>
              </div>
              <p className="small-note">{c.print.note}</p>
            </div>
          </div>
        </section>
        <section id="reviews" className="section review-section">
          <div className="content-width">
            <SectionHeading {...c.reviews} center />
            <div className="reviews-grid">
              {[0, 1, 2].map((offset) => {
                const item = c.reviews.items[(review + offset) % c.reviews.items.length];
                return item ? (
                  <article className="review-card" key={`${review}-${offset}`}>
                    <span className="stars">★★★★★</span>
                    <blockquote>“{item.quote}”</blockquote>
                    <div className="review-person">
                      <span>{item.initials}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.event}</small>
                      </div>
                      <ShieldCheck size={17} />
                    </div>
                  </article>
                ) : null;
              })}
            </div>
            <div className="carousel-controls">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous reviews"
                onClick={() => setReview((review + 2) % 3)}
              >
                <ChevronLeft />
              </Button>
              <div>
                {c.reviews.items.map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className={`carousel-dot ${review === i ? "active" : ""}`}
                    aria-label={`Review ${i + 1}`}
                    onClick={() => setReview(i)}
                  >
                    <span />
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next reviews"
                onClick={() => setReview((review + 1) % 3)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </section>
        <section id="faq" className="section faq-section">
          <div className="content-width faq-layout">
            <SectionHeading {...c.faq} />
            <Accordion type="single" collapsible>
              {c.faq.items.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        <section className="final-section">
          <div className="content-width">
            <p className="eyebrow">{c.final.eyebrow}</p>
            <h2>
              {c.final.title}
              <br />
              <em>{c.final.emphasis}</em>
            </h2>
            <p>{c.final.text}</p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/order" search={{ design: "chinar" }}>
                {c.final.cta}
                <ArrowUpRight />
              </Link>
            </Button>
            <span className="final-flower">✧</span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="content-width footer-top">
          <div>
            <Logo />
            <p>{c.footer.description}</p>
          </div>
          <div>
            <p className="eyebrow">EXPLORE</p>
            {c.nav.slice(0, 4).map((n) => (
              <a href={`#${n.id}`} key={n.id}>
                {n.label}
              </a>
            ))}
          </div>
          <div>
            <p className="eyebrow">{c.footer.contact}</p>
            <a href={`mailto:${config.contact.email}`}>
              {c.footer.email}
              <ArrowUpRight size={13} />
            </a>
            <WhatsAppButton />
            <Link to="/account">{t("account")}</Link>
          </div>
          <div>
            <p className="eyebrow">THE LITTLE DETAILS</p>
            {[c.footer.terms, c.footer.privacy, c.footer.refund].map((x) => (
              <Button key={x} variant="link" onClick={() => setLegal(x)}>
                {x}
              </Button>
            ))}
          </div>
        </div>
        <div className="content-width footer-bottom">
          <p>
            © {new Date().getFullYear()} {config.brand}. {c.footer.copyright}
          </p>
          <span>
            <Heart size={12} /> For all your beautiful beginnings.
          </span>
        </div>
      </footer>
      <DemoModal design={demo} onClose={() => setDemo(null)} />
      <CreditsDialog open={credits} onClose={() => setCredits(false)} />
      <Dialog open={!!quote} onOpenChange={(v) => !v && setQuote(null)}>
        <DialogContent>
          <DialogTitle>{c.print.quoteTitle}</DialogTitle>
          <DialogDescription>{c.print.mockNote}</DialogDescription>
          {quote && (
            <div className="quote-details">
              <p>
                {c.print.items.find((i) => i.id === quote.style)?.name} × {quote.quantity}
              </p>
              <p>
                Printing <strong>{money(quote.subtotal)}</strong>
              </p>
              <p>
                Delivery <strong>{money(quote.delivery)}</strong>
              </p>
              <p className="quote-total">
                Total <strong>{money(quote.total)}</strong>
              </p>
              <small>{quote.days}</small>
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await mockPrintProvider.createPrintOrder(quote);
                  toast.info(result.status);
                }}
              >
                Save demo print estimate
                <Printer />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!legal} onOpenChange={(v) => !v && setLegal("")}>
        <DialogContent>
          <DialogTitle>{legal}</DialogTitle>
          <DialogDescription>{c.footer.legal}</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
function FlowerDecoration() {
  return <Heart size={36} />;
}
