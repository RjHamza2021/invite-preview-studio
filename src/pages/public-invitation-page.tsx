import { useState, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MapPin, Check, Heart } from "lucide-react";
import { Route } from "@/routes/invitation.$slug";
import { Button } from "@/components/ui/button";
import { Logo, LanguageToggle } from "@/components/invitation/shared";
import { getSharedInvitation, submitRsvp } from "@/services/api";
import { catalogQuery } from "@/services/queries";
import type { Order } from "@/services/types";
import { toast } from "sonner";
export function PublicInvitationPage() {
  const { slug } = Route.useParams();
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [response, setResponse] = useState<"Attending" | "Declined">("Attending");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void getSharedInvitation(slug).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [slug]);
  const design = catalog.designs.find((d) => d.id === order?.designId);
  return (
    <>
      <header className="order-header">
        <Logo />
        <LanguageToggle />
      </header>
      {loading ? (
        <div className="order-content">
          <div className="loading-skeleton" />
        </div>
      ) : !order ? (
        <div className="empty-account">
          <Heart />
          <h2>This invitation is not available in this browser.</h2>
          <p className="small-note">
            Demo links work in the browser where the order was created. Shared access becomes
            available after WordPress is connected.
          </p>
          <Button variant="outline" asChild>
            <Link to="/">Explore invitations</Link>
          </Button>
        </div>
      ) : (
        <main className="public-invitation">
          {design && <img src={design.image} alt={`${design.name} invitation artwork`} />}
          <p className="eyebrow">{order.details.wording}</p>
          <h1>
            {order.details.host}
            <br />
            <em>&</em>
            <br />
            {order.details.partner}
          </h1>
          <p>
            {order.details.welcome || "Joyfully invite you to celebrate our beautiful beginning."}
          </p>
          {order.details.events.map((event, i) => (
            <section className="public-event" key={i}>
              <h3>{event.name}</h3>
              <h4>
                {event.date} · {event.time}
              </h4>
              <p>{event.venue}</p>
              <p>{event.address}</p>
              {event.dressCode && <p>Dress code: {event.dressCode}</p>}
              {event.map.startsWith("https://") && (
                <Button variant="outline" asChild>
                  <a href={event.map} target="_blank" rel="noreferrer">
                    <MapPin />
                    View directions
                  </a>
                </Button>
              )}
            </section>
          ))}
          {order.details.travel && (
            <section>
              <h3>Travel & stay</h3>
              <p>{order.details.travel}</p>
            </section>
          )}
          {order.details.rsvp && (
            <section>
              <h3>Will you celebrate with us?</h3>
              {sent ? (
                <p>
                  <Check className="inline" />
                  Thank you — your demo RSVP has been received.
                </p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!name.trim()) return;
                    setBusy(true);
                    try {
                      await submitRsvp(order.id, {
                        name,
                        guests: response === "Attending" ? guests : 0,
                        response,
                        message,
                      });
                      setSent(true);
                    } catch {
                      toast.error("Could not save response");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label className="field">
                    <span>Your name</span>
                    <input required value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="field">
                    <span>Your response</span>
                    <select
                      value={response}
                      onChange={(e) =>
                        setResponse(e.target.value === "Declined" ? "Declined" : "Attending")
                      }
                    >
                      <option>Attending</option>
                      <option>Declined</option>
                    </select>
                  </label>
                  {response === "Attending" && (
                    <label className="field">
                      <span>Number of guests</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      />
                    </label>
                  )}
                  <label className="field">
                    <span>A little message</span>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                  </label>
                  <Button type="submit" disabled={busy}>
                    Send RSVP
                    <Check />
                  </Button>
                </form>
              )}
            </section>
          )}
          <p className="mock-notice small-note">
            Demo invitation · responses are saved in this browser only.
          </p>
        </main>
      )}
    </>
  );
}
