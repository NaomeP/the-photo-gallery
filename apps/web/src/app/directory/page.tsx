"use client";

import { useEffect, useMemo, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100/api";
const categories = ["All photographers", "Wedding", "Portraits", "Family", "Events", "Commercial"];

type Studio = {
  organization_id: string;
  public_name: string;
  city: string;
  description: string;
  specialties: string[];
};

type RequestForm = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDate: string;
  message: string;
};

const blankForm: RequestForm = { name: "", email: "", phone: "", eventType: "", preferredDate: "", message: "" };

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

export default function DirectoryPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState<Studio | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<RequestForm>(blankForm);

  async function loadStudios(requestedId?: string) {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(api + "/public/studios");
      if (!response.ok) throw new Error();
      const data = await response.json();
      const loadedStudios: Studio[] = Array.isArray(data.studios) ? data.studios : [];
      setStudios(loadedStudios);
      const requestedStudio = requestedId && loadedStudios.find((studio) => studio.organization_id === requestedId);
      if (requestedStudio) setSelected(requestedStudio);
    } catch {
      setLoadError("The photographer directory is unavailable right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get("studio") || undefined;
    void loadStudios(requestedId);
  }, []);

  const visibleStudios = useMemo(() => {
    const query = search.trim().toLowerCase();
    return studios.filter((studio) => {
      const searchable = [studio.public_name, studio.city, studio.description, ...(studio.specialties || [])].join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = category === categories[0] || (studio.specialties || []).some((item) => item.toLowerCase().includes(category.toLowerCase().replace(/s$/, "")));
      return matchesSearch && matchesCategory;
    });
  }, [studios, search, category]);

  function openRequest(studio: Studio) {
    setSelected(studio);
    setSent(false);
    setFormError("");
    setForm(blankForm);
    window.history.replaceState(null, "", "/photographers?studio=" + encodeURIComponent(studio.organization_id));
  }

  function closeRequest() {
    setSelected(null);
    setSent(false);
    setFormError("");
    window.history.replaceState(null, "", "/photographers");
  }

  async function sendRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setFormError("");
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      eventType: form.eventType.trim(),
      ...(form.preferredDate ? { preferredDate: form.preferredDate } : {}),
      message: form.message.trim(),
    };
    try {
      const response = await fetch(api + "/public/studios/" + selected.organization_id + "/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your request could not be sent. Please try again.");
      setSent(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Your request could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="directory-page">
      <header className="directory-nav">
        <a href="/" className="directory-brand" aria-label="The Photo Gallery home">
          <span className="directory-brand-mark">P</span>
          <span>The Photo Gallery<small>PHOTOGRAPHER DIRECTORY</small></span>
        </a>
        <nav aria-label="Main navigation"><a href="/work">Gallery</a><a className="active" href="/photographers">Photographers</a></nav>
        <a className="directory-signin" href="/login">Studio sign in <span>→</span></a>
      </header>

      <section className="directory-hero">
        <div className="directory-hero-copy">
          <p className="directory-eyebrow"><span /> FIND A PHOTOGRAPHER</p>
          <h1>Find someone who sees it <em>your way.</em></h1>
          <p>Explore photography studios, find the right fit for your plans, and send an appointment request directly.</p>
          <a className="directory-scroll" href="#studios">Browse the directory <span>↓</span></a>
        </div>
        <div className="directory-hero-art" aria-label="An editorial illustration of a framed photograph">
          <div className="hero-art-note">YOUR MOMENT, WELL REMEMBERED</div>
          <div className="hero-art-frame"><div className="hero-art-scene"><span className="scene-sun" /><span className="scene-hill hill-one" /><span className="scene-hill hill-two" /></div></div>
          <span className="hero-art-caption">Make room for the moments that matter.</span>
        </div>
      </section>

      <section className="directory-how" aria-label="How booking works">
        <div className="directory-how-heading"><span>01 — 03</span><h2>A simple way to get started.</h2></div>
        <div className="directory-how-step"><b>01</b><span><strong>Find your photographer</strong><small>Browse approved studios and their specialties.</small></span></div>
        <div className="directory-how-step"><b>02</b><span><strong>Share your plans</strong><small>Tell the studio what you’re looking for and when.</small></span></div>
        <div className="directory-how-step"><b>03</b><span><strong>Hear back from the studio</strong><small>They’ll contact you to discuss availability and next steps.</small></span></div>
      </section>

      <section className="directory-listing" id="studios">
        <div className="directory-listing-heading">
          <div><p className="directory-eyebrow">THE DIRECTORY</p><h2>Photographers to meet</h2><p>Studios are listed after their profiles have been approved and published.</p></div>
          <span className="directory-result-count">{loading ? "…" : visibleStudios.length + (visibleStudios.length === 1 ? " studio" : " studios")}</span>
        </div>
        <div className="directory-tools">
          <label className="directory-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, location or specialty" aria-label="Search photographers" /><kbd>SEARCH</kbd></label>
          <div className="directory-categories" aria-label="Filter photographers by specialty">
            {categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>

        {loadError && <div className="directory-state directory-error"><span>!</span><div><strong>We couldn’t reach the directory.</strong><p>{loadError}</p></div><button onClick={() => void loadStudios()}>Try again</button></div>}
        {!loadError && loading && <div className="directory-loading" aria-live="polite"><span /><span /><span />Loading approved studios…</div>}
        {!loadError && !loading && visibleStudios.length > 0 && <div className="directory-cards">
          {visibleStudios.map((studio, index) => <article className="directory-card" key={studio.organization_id}>
            <div className={"directory-card-art art-" + (index % 3)}>
              <span className="card-art-index">{String(index + 1).padStart(2, "0")}</span><span className="directory-monogram">{initials(studio.public_name)}</span><span className="card-art-label">{studio.city || "PHOTOGRAPHY STUDIO"}</span>
            </div>
            <div className="directory-card-info">
              <div className="directory-card-meta"><span>{studio.city || "Studio"}</span><span className="directory-verified"><i /> APPROVED STUDIO</span></div>
              <h3>{studio.public_name}</h3><p>{studio.description || "A photography studio ready to hear about your plans."}</p>
              <div className="directory-specialties">{(studio.specialties || []).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
              <button className="directory-card-action" onClick={() => openRequest(studio)}>View studio & request an appointment <span>↗</span></button>
            </div>
          </article>)}
        </div>}
        {!loadError && !loading && visibleStudios.length === 0 && studios.length > 0 && <div className="directory-state"><span>⌕</span><div><strong>No studios match those filters.</strong><p>Try another search or choose a different specialty.</p></div><button onClick={() => { setSearch(""); setCategory(categories[0]); }}>Clear filters</button></div>}
        {!loadError && !loading && studios.length === 0 && <div className="directory-empty">
          <div className="empty-frame"><span>F</span></div><p className="directory-eyebrow">A DIRECTORY THAT GROWS WITH ITS STUDIOS</p><h3>Approved studios will appear here.</h3>
          <p>Once a photography studio has been approved and published, you’ll be able to explore its profile and request an appointment here.</p>
          <a href="#how-booking-works">How booking works <span>↓</span></a>
        </div>}
      </section>

      <section className="directory-bottom" id="how-booking-works">
        <div><p className="directory-eyebrow">AFTER YOU SEND A REQUEST</p><h2>The studio takes it from there.</h2></div>
        <p>The photographer will review your details and contact you about the date and session. If you decide to go ahead, they’ll share a quotation and payment details. Your private gallery comes later, when the photographs are ready.</p>
      </section>

      <footer className="directory-footer"><a href="/" className="directory-brand"><span className="directory-brand-mark">P</span><span>The Photo Gallery<small>PHOTOGRAPHER DIRECTORY</small></span></a><span>Browse studios. Find your fit.</span><a href="/login">Studio sign in →</a></footer>

      {selected && <div className="directory-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRequest(); }}>
        <section className="directory-modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
          <button className="directory-modal-close" onClick={closeRequest} aria-label="Close appointment request">×</button>
          {!sent ? <>
            <div className="directory-modal-aside"><p className="directory-eyebrow">APPOINTMENT REQUEST</p><span className="modal-monogram">{initials(selected.public_name)}</span><h2>{selected.public_name}</h2><p>{selected.city || "Photography studio"}</p><div className="modal-specialties">{(selected.specialties || []).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="modal-note"><b>What happens next?</b><p>The studio receives your request and will follow up using the contact details you provide. No account is needed to enquire.</p></div></div>
            <div className="directory-modal-form"><p className="directory-eyebrow">TELL US ABOUT YOUR PLANS</p><h2 id="request-title">Let’s make an introduction.</h2><p className="directory-form-intro">A few details will help the studio get back to you with the right information.</p>
              <form onSubmit={sendRequest}>
                <label>Your name<input required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" /></label>
                <div className="directory-form-row"><label>Email address<input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label><label>Phone <span>(optional)</span><input type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" /></label></div>
                <div className="directory-form-row"><label>What are you planning?<select value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })}><option value="">Choose an occasion</option><option>Wedding</option><option>Portrait session</option><option>Family photographs</option><option>Birthday or event</option><option>Commercial project</option><option>Something else</option></select></label><label>Preferred date <span>(optional)</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} /></label></div>
                <label>A note for the studio <span>(optional)</span><textarea rows={3} maxLength={2000} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Share a little about what you have in mind." /></label>
                {formError && <p className="directory-form-error" role="alert">{formError}</p>}
                <button className="directory-submit" disabled={busy}>{busy ? "Sending your request…" : "Send appointment request"} <span>→</span></button><small className="directory-privacy">Your details are sent to this studio so they can respond to your enquiry.</small>
              </form>
            </div>
          </> : <div className="directory-success"><span className="success-check">✓</span><p className="directory-eyebrow">REQUEST SENT</p><h2>Thanks, {form.name.split(" ")[0]}.</h2><p>Your appointment request has been sent to <strong>{selected.public_name}</strong>. The studio can follow up with you by email or phone.</p><button className="directory-submit" onClick={closeRequest}>Back to photographers <span>→</span></button></div>}
        </section>
      </div>}
    </main>
  );
}




