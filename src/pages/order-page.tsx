import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Upload,
  Copy,
  ShieldCheck,
  Music,
  Play,
  Square,
} from "lucide-react";
import { Route } from "@/routes/order";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Logo,
  LanguageToggle,
  DemoModal,
  WhatsAppButton,
  ResumeLink,
  money,
  copyText,
} from "@/components/invitation/shared";
import { useLanguage } from "@/i18n/provider";
import { siteQuery, catalogQuery } from "@/services/queries";
import {
  createOrder,
  saveOrderDraft,
  getOrderByKey,
  submitOrder,
  checkSlugAvailability,
  getOrderPrice,
  getPaymentDue,
} from "@/services/api";
import type { Order, OrderDetails, Design } from "@/services/types";
import { config } from "@/config";
import { toast } from "sonner";
const contactSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name"),
    email: z.email("Please enter a valid email"),
    phone: z.string().regex(/^\+?[\d\s()-]{10,16}$/, "Please enter a valid WhatsApp number"),
    date: z.string(),
    undecided: z.boolean(),
    edition: z.enum(["template", "personalised"]),
    terms: z.boolean().refine((v) => v, "Please agree to the terms"),
  })
  .refine((v) => v.undecided || Boolean(v.date), {
    message: "Choose a date or select not decided yet",
    path: ["date"],
  });
type Contact = z.infer<typeof contactSchema>;
export function OrderHeader() {
  const { t } = useLanguage();
  return (
    <header className="order-header">
      <Logo />
      <span className="secure-label">
        <LockKeyhole size={13} />
        {t("secure")}
      </span>
      <div className="order-header-actions">
        <LanguageToggle />
        <Link to="/">{t("cancel")}</Link>
      </div>
    </header>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  wide?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
export function OrderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { data: content } = useSuspenseQuery(siteQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const c = content[language];
  const [order, setOrder] = useState<Order | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(Boolean(search.resume));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(true);
  const [success, setSuccess] = useState(false);
  const [demo, setDemo] = useState<Design | null>(null);
  const [slugStatus, setSlugStatus] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      undecided: false,
      edition: "template",
      terms: false,
    },
  });
  const edition = form.watch("edition");
  const undecided = form.watch("undecided");
  const design =
    catalog.designs.find((d) => d.id === (order?.designId ?? search.design)) ?? catalog.designs[0];
  const tier =
    catalog.tiers.find((d) => d.id === (order?.tierId ?? search.tier)) ?? catalog.tiers[0];
  useEffect(() => {
    if (!search.resume || !search.key) return;
    let mounted = true;
    void getOrderByKey(search.resume, search.key).then((o) => {
      if (!mounted) return;
      if (o) {
        setOrder(o);
        setStep(o.step);
        setSuccess(o.status !== "draft");
      } else
        toast.error(
          "Draft not found in this browser. Use the browser where you started your order.",
        );
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [search.resume, search.key]);
  useEffect(() => {
    if (!order || success) return;
    setSaved(false);
    const timer = setTimeout(() => {
      void saveOrderDraft({ ...order, step })
        .then(() => setSaved(true))
        .catch(() => toast.error("Could not save your draft"));
    }, 500);
    return () => clearTimeout(timer);
  }, [order, step, success]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const update = <K extends keyof OrderDetails>(k: K, v: OrderDetails[K]) =>
    setOrder((o) => (o ? { ...o, details: { ...o.details, [k]: v } } : o));
  async function start(values: Contact) {
    if (!design || !tier) return;
    setBusy(true);
    try {
      const newOrder = await createOrder({
        designId: design.id,
        tierId: tier.id,
        language,
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.undecided ? "" : values.date,
        edition: values.edition,
      });
      setOrder(newOrder);
      void navigate({
        to: "/order",
        search: { resume: newOrder.id, key: newOrder.key },
        replace: true,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create order");
    } finally {
      setBusy(false);
    }
  }
  async function next() {
    if (!order) return;
    const d = order.details;
    if (step === 0 && (!d.host.trim() || !d.partner.trim())) {
      toast.error("Please enter both names");
      return;
    }
    if (step === 1 && d.slug) {
      const result = await checkSlugAvailability(d.slug);
      if (!result.available) {
        toast.error("Please choose an available invitation address");
        return;
      }
    }
    if (
      step === 2 &&
      d.events.some((e) => !e.name.trim() || !e.venue.trim() || !e.date || !e.time)
    ) {
      toast.error("Please complete each event name, date, time and venue");
      return;
    }
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      await saveOrderDraft(order);
      const submitted = await submitOrder(order.id, order.key);
      setOrder(submitted);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }
  const price = order
    ? getOrderPrice(order)
    : (tier?.price ?? 1900) + (edition === "personalised" ? 4000 : 0);
  const sectionNames = [
    t("hosts"),
    t("touches"),
    t("events"),
    t("sections"),
    t("finishing"),
    t("review"),
  ];
  if (loading)
    return (
      <>
        <OrderHeader />
        <div className="order-content">
          <div className="loading-skeleton" />
        </div>
      </>
    );
  if (success && order)
    return (
      <>
        <OrderHeader />
        <div className="success-screen">
          <div className="success-icon">
            <Check size={30} />
          </div>
          <p className="eyebrow">A BEAUTIFUL BEGINNING</p>
          <h1>{t("success")}</h1>
          <span className="order-chip">
            {order.id}
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy order number"
              onClick={() => copyText(order.id)}
            >
              <Copy size={14} />
            </Button>
          </span>
          <p className="mock-notice">{t("pending")}</p>
          <div className="success-actions">
            <Button asChild>
              <Link to="/studio" search={{ id: order.id, key: order.key }}>
                View your free preview
                <ArrowRight />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setStep(5);
              }}
            >
              View wedding details
            </Button>
          </div>
          <h3>{t("next")}</h3>
          <ol className="next-list">
            {c.order.next.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <WhatsAppButton />
        </div>
      </>
    );
  return (
    <>
      <OrderHeader />
      <main className="order-content">
        <div className="part-stepper">
          <div className={!order ? "active" : ""}>
            <span>{order ? <Check size={13} /> : 1}</span>
            {t("details")}
          </div>
          <div className={order ? "active" : ""}>
            <span>2</span>
            {t("payment")}
          </div>
        </div>
        <div className="order-layout">
          <div>
            {!order ? (
              <>
                <div className="order-title">
                  <p className="eyebrow">PART 1 OF 2</p>
                  <h1>Your beautiful beginning.</h1>
                  <p>{c.order.intro}</p>
                </div>
                {design && (
                  <section className="form-panel design-summary">
                    <img src={design.image} alt={design.name} />
                    <div>
                      <p className="eyebrow">{design.style}</p>
                      <h3>{design.name}</h3>
                      <p>{design.description}</p>
                      <strong>{money(design.price)}</strong>
                      <div className="design-summary-buttons">
                        <Button variant="outline" onClick={() => setDemo(design)}>
                          <Play />
                          {t("live")}
                        </Button>
                        <Button variant="ghost" asChild>
                          <Link to="/" hash="designs">
                            Change design
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </section>
                )}
                <form id="contact-form" onSubmit={form.handleSubmit(start)}>
                  <section className="form-panel">
                    <h3>Your details</h3>
                    <div className="form-grid">
                      {(["name", "email", "phone", "date"] as const).map((name) => (
                        <label
                          key={name}
                          className={`field ${name === "name" || name === "date" ? "wide" : ""}`}
                        >
                          <span>{t(name)}</span>
                          <input
                            {...form.register(name)}
                            type={
                              name === "email"
                                ? "email"
                                : name === "date"
                                  ? "date"
                                  : name === "phone"
                                    ? "tel"
                                    : "text"
                            }
                            disabled={name === "date" && undecided}
                            placeholder={
                              name === "name"
                                ? "Your full name"
                                : name === "email"
                                  ? "you@example.com"
                                  : name === "phone"
                                    ? "+92 300 0000000"
                                    : ""
                            }
                          />
                          {form.formState.errors[name] && (
                            <span className="field-error">
                              {form.formState.errors[name]?.message}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                    <label className="check-row">
                      <input type="checkbox" {...form.register("undecided")} />
                      {t("notDecided")}
                    </label>
                  </section>
                  <section className="form-panel">
                    <h3>Choose your design route</h3>
                    <div className="edition-grid">
                      {(["template", "personalised"] as const).map((e) => (
                        <label
                          className={`edition-option ${edition === e ? "selected" : ""}`}
                          key={e}
                        >
                          <span>
                            <input type="radio" value={e} {...form.register("edition")} />
                            {c.order[e]}
                          </span>
                          <p>
                            {e === "template" ? c.order.templateText : c.order.personalisedText}
                          </p>
                          <strong>
                            {money((tier?.price ?? 1900) + (e === "personalised" ? 4000 : 0))}
                          </strong>
                        </label>
                      ))}
                    </div>
                  </section>
                  <details className="included-features">
                    <summary>{c.order.features}</summary>
                    <ul>
                      {tier?.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </details>
                  <div className="help-banner">
                    <div>
                      <strong>{c.order.help}</strong>
                      <p>{c.order.helpText}</p>
                    </div>
                    <WhatsAppButton />
                  </div>
                  <section className="form-panel">
                    <label className="check-row">
                      <input type="checkbox" {...form.register("terms")} />
                      {t("terms")}
                    </label>
                    {form.formState.errors.terms && (
                      <p className="field-error">{form.formState.errors.terms.message}</p>
                    )}
                  </section>
                  <div className="captcha-placeholder">
                    <ShieldCheck />
                    reCAPTCHA placeholder · demo
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="order-title">
                  <p className="eyebrow">PART 2 OF 2</p>
                  <h1>{sectionNames[step]}</h1>
                  <p>{c.order.intro}</p>
                </div>
                <div className="wizard-progress">
                  <div className="wizard-progress-head">
                    <span>Section {step + 1} of 6</span>
                    <span>{Math.round(((step + 1) / 6) * 100)}%</span>
                  </div>
                  <div className="wizard-progress-track">
                    {sectionNames.map((s, i) => (
                      <span key={s} className={i <= step ? "done" : ""} />
                    ))}
                  </div>
                </div>
                <ResumeLink id={order.id} secret={order.key} />
                <p className="draft-notice">{c.order.draftNotice}</p>
                {step === 0 && (
                  <section className="form-panel">
                    <h3>{t("hosts")}</h3>
                    <div className="form-grid">
                      <Field
                        label={
                          design?.event === "Birthday" || design?.event === "Aqiqah"
                            ? "Celebrant’s name"
                            : "First name / bride"
                        }
                        value={order.details.host}
                        onChange={(v) => update("host", v)}
                      />
                      <Field
                        label={
                          design?.event === "Birthday" || design?.event === "Aqiqah"
                            ? "Host / parent name"
                            : "Second name / groom"
                        }
                        value={order.details.partner}
                        onChange={(v) => update("partner", v)}
                      />
                      <Field
                        label="Family names (optional)"
                        value={order.details.family}
                        onChange={(v) => update("family", v)}
                        wide
                      />
                      <Field
                        label="Invitation wording"
                        value={order.details.wording}
                        onChange={(v) => update("wording", v)}
                        type="textarea"
                        wide
                      />
                      <Field
                        label="City"
                        value={order.details.city}
                        onChange={(v) => update("city", v)}
                        wide
                      />
                    </div>
                  </section>
                )}
                {step === 1 && (
                  <section className="form-panel">
                    <h3>{t("touches")}</h3>
                    <Field
                      label="Your invitation address"
                      value={order.details.slug}
                      placeholder="ayesha-and-hamza"
                      onChange={(v) => {
                        update("slug", v.toLowerCase().replace(/\s/g, "-"));
                        setSlugStatus("");
                      }}
                    />
                    <div className="slug-editor">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!order.details.slug) {
                            setSlugStatus("Enter an address first");
                            return;
                          }
                          setSlugStatus("Checking…");
                          const result = await checkSlugAvailability(order.details.slug);
                          setSlugStatus(
                            result.available
                              ? "This address is available ✓"
                              : "Please choose another address",
                          );
                        }}
                      >
                        Check availability
                      </Button>
                      <span className="small-note">{slugStatus}</span>
                    </div>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={order.details.customAddress}
                        onChange={(e) => update("customAddress", e.target.checked)}
                      />
                      Custom-address add-on · {money(1500)}
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={order.details.bismillah}
                        onChange={(e) => update("bismillah", e.target.checked)}
                      />
                      Include Bismillah banner
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={order.details.verse}
                        onChange={(e) => update("verse", e.target.checked)}
                      />
                      Include Quranic verse or dua
                    </label>
                    {order.details.verse && (
                      <Field
                        label="Your verse or dua"
                        value={order.details.dua}
                        onChange={(v) => update("dua", v)}
                        type="textarea"
                      />
                    )}
                  </section>
                )}
                {step === 2 && (
                  <section className="form-panel">
                    <h3>{t("events")}</h3>
                    {order.details.events.map((event, i) => (
                      <div className="event-panel" key={i}>
                        <div className="event-panel-header">
                          <h4>Event {i + 1}</h4>
                          {order.details.events.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove event ${i + 1}`}
                              onClick={() =>
                                update(
                                  "events",
                                  order.details.events.filter((_, index) => index !== i),
                                )
                              }
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                        <div className="form-grid">
                          {(
                            [
                              "name",
                              "date",
                              "time",
                              "venue",
                              "address",
                              "map",
                              "dressCode",
                            ] as const
                          ).map((key) => (
                            <Field
                              key={key}
                              label={
                                {
                                  name: "Event name",
                                  date: "Date",
                                  time: "Time",
                                  venue: "Venue name",
                                  address: "Full address",
                                  map: "Google Maps link",
                                  dressCode: "Dress code (optional)",
                                }[key]
                              }
                              value={event[key]}
                              type={
                                key === "date"
                                  ? "date"
                                  : key === "time"
                                    ? "time"
                                    : key === "map"
                                      ? "url"
                                      : "text"
                              }
                              wide={key === "address" || key === "map" || key === "dressCode"}
                              onChange={(v) =>
                                update(
                                  "events",
                                  order.details.events.map((ev, index) =>
                                    index === i ? { ...ev, [key]: v } : ev,
                                  ),
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="add-event"
                      onClick={() =>
                        update("events", [
                          ...order.details.events,
                          {
                            name: "Walima",
                            date: "",
                            time: "",
                            venue: "",
                            address: "",
                            map: "",
                            dressCode: "",
                          },
                        ])
                      }
                    >
                      <Plus />
                      Add another event
                    </Button>
                  </section>
                )}
                {step === 3 && (
                  <section className="form-panel">
                    <h3>{t("sections")}</h3>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={order.details.rsvp}
                        onChange={(e) => update("rsvp", e.target.checked)}
                      />
                      Guest RSVP
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={order.details.gallery}
                        onChange={(e) => update("gallery", e.target.checked)}
                      />
                      Include a photo gallery
                    </label>
                    <Accordion type="multiple">
                      {(["travel", "registry", "faq"] as const).map((key) => (
                        <AccordionItem key={key} value={key}>
                          <AccordionTrigger>
                            {
                              {
                                travel: "Travel & stay",
                                registry: "Gift registry",
                                faq: "Guest FAQs",
                              }[key]
                            }
                          </AccordionTrigger>
                          <AccordionContent>
                            <Field
                              label="Details (optional)"
                              value={order.details[key]}
                              type="textarea"
                              onChange={(v) => update(key, v)}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                )}
                {step === 4 && (
                  <section className="form-panel">
                    <h3>{t("finishing")}</h3>
                    <div className="form-grid">
                      <Field
                        wide
                        type="textarea"
                        label="Welcome message"
                        value={order.details.welcome}
                        onChange={(v) => update("welcome", v)}
                      />
                      <Field
                        wide
                        type="textarea"
                        label="Notes for the design team"
                        value={order.details.notes}
                        onChange={(v) => update("notes", v)}
                      />
                      <label className="field wide">
                        <span>Background music</span>
                        <select
                          value={order.details.music}
                          onChange={(e) => update("music", e.target.value)}
                        >
                          {["None", "Soft piano", "A little celebration", "Peaceful strings"].map(
                            (m) => (
                              <option key={m}>{m}</option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                    {order.details.music !== "None" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="add-event"
                        onClick={async () => {
                          if (musicPlaying) {
                            await audio.current?.close();
                            audio.current = null;
                            setMusicPlaying(false);
                            return;
                          }
                          const ctx = new AudioContext();
                          audio.current = ctx;
                          setMusicPlaying(true);
                          [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.type = "sine";
                            osc.frequency.value = freq;
                            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.35);
                            gain.gain.linearRampToValueAtTime(
                              0.08,
                              ctx.currentTime + i * 0.35 + 0.05,
                            );
                            gain.gain.exponentialRampToValueAtTime(
                              0.001,
                              ctx.currentTime + i * 0.35 + 1.8,
                            );
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.start(ctx.currentTime + i * 0.35);
                            osc.stop(ctx.currentTime + i * 0.35 + 1.9);
                          });
                          setTimeout(() => setMusicPlaying(false), 3300);
                        }}
                      >
                        {musicPlaying ? <Square /> : <Play />}
                        {musicPlaying ? "Stop sample" : "Preview sample melody"}
                      </Button>
                    )}
                    <UploadZone
                      label="Your photos"
                      name={order.details.photoName}
                      accept="image/*"
                      onFile={(name) => update("photoName", name)}
                    />
                    <p className="small-note">
                      Demo uploads save the filename only. Files will upload to WordPress after
                      connection.
                    </p>
                    <div className="help-banner">
                      <p>Prefer sending your photos on WhatsApp?</p>
                      <WhatsAppButton />
                    </div>
                  </section>
                )}
                {step === 5 && (
                  <>
                    <section className="form-panel">
                      <h3>Your celebration, at a glance</h3>
                      {sectionNames.slice(0, 5).map((name, i) => (
                        <div key={name} className="review-section-row">
                          <div>
                            <strong>{name}</strong>
                            <p>
                              {i === 0
                                ? `${order.details.host} & ${order.details.partner}`
                                : i === 1
                                  ? order.details.slug || "Address not chosen"
                                  : i === 2
                                    ? order.details.events
                                        .map((e) => `${e.name} · ${e.venue}`)
                                        .join(", ")
                                    : i === 3
                                      ? `${order.details.rsvp ? "RSVP enabled" : "RSVP off"} · ${order.details.gallery ? "Gallery enabled" : "No gallery"}`
                                      : order.details.music}
                            </p>
                          </div>
                          <Button variant="ghost" onClick={() => setStep(i)}>
                            {t("edit")}
                          </Button>
                        </div>
                      ))}
                    </section>
                    <section className="form-panel">
                      <h3>Choose your payment plan</h3>
                      <div className="edition-grid">
                        {(["full", "split"] as const).map((plan) => (
                          <label
                            key={plan}
                            className={`edition-option ${order.details.paymentPlan === plan ? "selected" : ""}`}
                          >
                            <span>
                              <input
                                type="radio"
                                name="plan"
                                checked={order.details.paymentPlan === plan}
                                onChange={() => update("paymentPlan", plan)}
                              />
                              {plan === "full" ? "Pay in full" : "50% now, 50% later"}
                            </span>
                            <strong>{money(plan === "full" ? price : Math.ceil(price / 2))}</strong>
                          </label>
                        ))}
                      </div>
                      <div className="payment-tabs">
                        {(["bank", "easypaisa", "jazzcash", "sadapay", "card"] as const).map(
                          (method) => (
                            <Button
                              key={method}
                              variant={order.details.method === method ? "default" : "outline"}
                              onClick={() => update("method", method)}
                            >
                              {
                                {
                                  bank: "Bank transfer",
                                  easypaisa: "Easypaisa",
                                  jazzcash: "JazzCash",
                                  sadapay: "SadaPay",
                                  card: "Card",
                                }[method]
                              }
                            </Button>
                          ),
                        )}
                      </div>
                      <p className="mock-notice">
                        Demo payment details. Do not transfer any funds.
                      </p>
                      {order.details.method === "card" ? (
                        <div className="payment-account">
                          <p>Card checkout will be connected through WooCommerce.</p>
                          <Button
                            variant="outline"
                            onClick={() =>
                              toast.info(
                                "WooCommerce checkout is not connected. No payment was collected.",
                              )
                            }
                          >
                            Preview checkout
                            <LockKeyhole />
                          </Button>
                        </div>
                      ) : (
                        <div className="payment-account">
                          <p>{config.paymentAccounts[order.details.method].bank}</p>
                          <p>{config.paymentAccounts[order.details.method].name}</p>
                          <div>
                            <code>{config.paymentAccounts[order.details.method].account}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Copy demo account number"
                              onClick={() =>
                                copyText(
                                  config.paymentAccounts[
                                    order.details.method as keyof typeof config.paymentAccounts
                                  ]?.account ?? "",
                                )
                              }
                            >
                              <Copy />
                            </Button>
                          </div>
                        </div>
                      )}
                      <UploadZone
                        label="Payment screenshot (optional in demo)"
                        name={order.details.receiptName}
                        accept="image/*,.pdf"
                        onFile={(name) => update("receiptName", name)}
                      />
                      <div className="payment-due">
                        <span>Due now</span>
                        <strong>{money(getPaymentDue(order))}</strong>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </div>
          <aside className="summary-panel">
            {design && (
              <div className="summary-design">
                <img src={design.image} alt={design.name} />
                <div>
                  <h3>{design.name}</h3>
                  <p>{design.style}</p>
                </div>
              </div>
            )}
            <dl>
              <div>
                <dt>Package</dt>
                <dd>{tier?.name}</dd>
              </div>
              <div>
                <dt>Edition</dt>
                <dd>{c.order[order?.edition ?? edition]}</dd>
              </div>
              <div>
                <dt>First preview</dt>
                <dd>Instant</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{language === "en" ? "English" : "اردو"}</dd>
              </div>
            </dl>
            <div className="summary-total">
              <p>YOUR BEAUTIFUL BEGINNING</p>
              <s>
                {money(
                  (tier?.regularPrice ?? 3000) +
                    ((order?.edition ?? edition) === "personalised" ? 4000 : 0),
                )}
              </s>
              <strong>{money(price)}</strong>
              <p>Launch price · one-time payment</p>
            </div>
            <div className="summary-trust">
              {c.order.trust.map((x) => (
                <p key={x}>
                  <Check size={12} />
                  {x}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <div className="order-bottom">
        <div className="order-bottom-inner">
          <p>
            {order ? (
              <>
                <Check size={13} />
                {saved ? t("saved") : t("saving")}
              </>
            ) : (
              <>
                <LockKeyhole size={13} />
                Your details stay private
              </>
            )}
          </p>
          <div>
            {order && step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft />
                {t("previous")}
              </Button>
            )}
            {order ? (
              <Button disabled={busy} onClick={next}>
                {busy ? "Submitting…" : step === 5 ? t("submit") : t("continue")}
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" form="contact-form" disabled={busy}>
                {busy ? "Saving…" : t("continue")}
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
      <DemoModal design={demo} onClose={() => setDemo(null)} />
    </>
  );
}
function UploadZone({
  label,
  name,
  accept,
  onFile,
}: {
  label: string;
  name: string;
  accept: string;
  onFile: (name: string) => void;
}) {
  return (
    <label
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.size <= 10 * 1024 * 1024) onFile(file.name);
        else toast.error("Choose a file smaller than 10 MB");
      }}
    >
      <Upload />
      <span>{name || `Drop ${label.toLowerCase()} here or choose a file`}</span>
      <small>Up to 10 MB</small>
      <input
        type="file"
        accept={accept}
        aria-label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size <= 10 * 1024 * 1024) onFile(file.name);
          else toast.error("Choose a file smaller than 10 MB");
        }}
      />
    </label>
  );
}
