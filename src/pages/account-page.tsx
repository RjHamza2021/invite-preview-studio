import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Coins, Heart, ArrowUpRight, Copy, Download, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderHeader } from "./order-page";
import { CreditsDialog, copyText } from "@/components/invitation/shared";
import { useLanguage } from "@/i18n/provider";
import { catalogQuery } from "@/services/queries";
import {
  getOrders,
  getCredits,
  getInvitationLink,
  getRsvpResponses,
  setInvitationLink,
} from "@/services/api";
import { downloadFreePreview } from "@/services/downloads";
import type { Order, Rsvp } from "@/services/types";
import { toast } from "sonner";
export function AccountPage() {
  const { t } = useLanguage();
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buy, setBuy] = useState(false);
  const [tab, setTab] = useState("orders");
  const [selected, setSelected] = useState<Order | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [responses, setResponses] = useState<Rsvp[]>([]);
  useEffect(() => {
    void Promise.all([getOrders(), getCredits()]).then(([o, c]) => {
      setOrders(o);
      setCredits(c);
      setLoading(false);
    });
  }, []);
  async function manage(order: Order) {
    setSelected(order);
    setTab("links");
    setSlug(order.details.slug || order.id.toLowerCase());
    setLink(await getInvitationLink(order.id));
    setResponses(await getRsvpResponses(order.id));
  }
  return (
    <>
      <OrderHeader />
      <main className="account-content">
        <div className="account-heading">
          <div>
            <p className="eyebrow">ALL YOUR BEAUTIFUL BEGINNINGS</p>
            <h1>{t("account")}</h1>
            <p>Your drafts, celebrations and little details, together.</p>
          </div>
          <Button variant="outline" onClick={() => setBuy(true)}>
            <Coins />
            {credits} {t("credits")}
          </Button>
        </div>
        <p className="mock-notice">
          Demo account · your invitations are saved in this browser, with no sign-in required.
        </p>
        <div className="account-tabs">
          {[
            ["orders", "My invitations"],
            ["downloads", "Downloads"],
            ["links", "Links & RSVPs"],
          ].map(([value, label]) => (
            <Button
              variant="ghost"
              key={value}
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value ?? "orders")}
            >
              {label}
            </Button>
          ))}
        </div>
        {loading ? (
          <div className="loading-skeleton" />
        ) : orders.length === 0 ? (
          <div className="empty-account">
            <Heart />
            <h2>{t("noOrders")}</h2>
            <Button asChild>
              <Link to="/order" search={{ design: "chinar" }}>
                {t("start")}
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        ) : tab === "links" ? (
          <>
            {!selected ? (
              <div className="account-orders">
                {orders.map((o) => (
                  <div className="links-panel" key={o.id}>
                    <h3>{o.details.host || o.name}</h3>
                    <Button variant="outline" onClick={() => manage(o)}>
                      Manage link & RSVPs
                      <Globe2 />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="links-panel">
                <h3>
                  {selected.details.host} & {selected.details.partner}
                </h3>
                {!selected.unlocked.includes("link") ? (
                  <>
                    <p className="mock-notice">
                      Unlock an online link in the Preview Studio to manage sharing.
                    </p>
                    <Button asChild>
                      <Link to="/studio" search={{ id: selected.id, key: selected.key }}>
                        Open Preview Studio
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="small-note">
                      {link ? `${window.location.origin}${link}` : "Create your invitation address"}
                    </p>
                    <div className="slug-editor">
                      <input
                        aria-label="Invitation address"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            setLink(await setInvitationLink(selected.id, slug));
                            toast.success("Demo link saved");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Address unavailable");
                          }
                        }}
                      >
                        Save
                      </Button>
                      {link && (
                        <Button
                          variant="outline"
                          onClick={() => copyText(`${window.location.origin}${link}`)}
                        >
                          <Copy />
                          Copy link
                        </Button>
                      )}
                    </div>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Guests</th>
                          <th>Response</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses.length ? (
                          responses.map((r, i) => (
                            <tr key={i}>
                              <td>{r.name}</td>
                              <td>{r.guests}</td>
                              <td>{r.response}</td>
                              <td>{r.message}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4}>No guest responses yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="account-orders">
            {orders.map((o) => {
              const d = catalog.designs.find((design) => design.id === o.designId);
              return (
                <article className="account-order" key={o.id}>
                  {d && <img src={d.image} alt={d.name} />}
                  <div className="account-order-info">
                    <span className="status-chip">
                      {o.status === "draft"
                        ? "Draft"
                        : o.status === "preview-ready"
                          ? "Preview ready · payment pending"
                          : "Payment pending"}
                    </span>
                    <h3>{o.details.host ? `${o.details.host} & ${o.details.partner}` : d?.name}</h3>
                    <p>
                      {o.id} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      {o.unlocked.length
                        ? `Unlocked: ${o.unlocked.join(", ")}`
                        : "Free preview included"}
                    </p>
                  </div>
                  <div className="account-order-actions">
                    {tab === "downloads" ? (
                      <Button
                        variant="outline"
                        disabled={o.status === "draft"}
                        onClick={async () => {
                          if (d)
                            try {
                              await downloadFreePreview(d.image, o);
                            } catch {
                              toast.error("Download unavailable");
                            }
                        }}
                      >
                        <Download />
                        Free preview
                      </Button>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link to="/order" search={{ resume: o.id, key: o.key }}>
                          {o.status === "draft" ? "Continue draft" : "View details"}
                          <ArrowUpRight />
                        </Link>
                      </Button>
                    )}
                    {o.status !== "draft" && (
                      <Button asChild>
                        <Link to="/studio" search={{ id: o.id, key: o.key }}>
                          {t("preview")}
                          <ArrowUpRight />
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <CreditsDialog
        open={buy}
        onClose={() => setBuy(false)}
        onPurchased={() => {
          void getCredits().then(setCredits);
        }}
      />
    </>
  );
}
