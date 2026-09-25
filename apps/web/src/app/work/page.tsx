"use client";

import { useEffect, useMemo, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100/api";
type PortfolioItem = { id: string; caption: string; imageUrl: string; alt: string; studio: { name: string; city: string; specialties: string[] } };

export default function PublicPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(api + "/public/portfolio");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The public gallery is unavailable right now.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The public gallery is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => [item.caption, item.studio.name, item.studio.city, ...item.studio.specialties].join(" ").toLowerCase().includes(query));
  }, [items, search]);

  return <main className="public-portfolio-page">
    <header className="directory-nav">
      <a href="/" className="directory-brand"><span className="directory-brand-mark">P</span><span>The Photo Gallery<small>PHOTOGRAPHER DIRECTORY</small></span></a>
      <nav aria-label="Main navigation"><a className="active" href="/work">Gallery</a><a href="/photographers">Photographers</a></nav>
      <a className="directory-signin" href="/login">Studio sign in <span>→</span></a>
    </header>

    <section className="public-portfolio-hero">
      <p className="directory-eyebrow"><span /> WORK SHARED BY PHOTOGRAPHY STUDIOS</p>
      <h1>Good work speaks in its own way.</h1>
      <p>Browse photographs that studios have chosen and cleared to share publicly. Find a photographer whose work feels right for your plans.</p>
      <a href="/photographers">Meet the photographers <span>→</span></a>
    </section>

    <section className="public-portfolio-content">
      <div className="public-portfolio-toolbar"><div><p className="directory-eyebrow">THE PUBLIC GALLERY</p><h2>Recent work</h2></div><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work, studio or city" aria-label="Search public portfolio" /></label></div>
      {error && <div className="directory-state directory-error"><span>!</span><div><strong>We couldn’t load the gallery.</strong><p>{error}</p></div><button onClick={() => void load()}>Try again</button></div>}
      {loading && !error && <div className="directory-loading"><span /><span /><span />Loading public work…</div>}
      {!loading && !error && visibleItems.length > 0 && <div className="public-portfolio-grid">
        {visibleItems.map((item) => <article className="public-portfolio-card" key={item.id}>
          <div className="public-portfolio-photo"><img src={item.imageUrl} alt={item.alt} loading="lazy" /></div>
          <div className="public-portfolio-caption"><div><h3>{item.caption || item.studio.name}</h3><p>{item.studio.name}{item.studio.city ? " · " + item.studio.city : ""}</p></div><a href="/photographers" aria-label={"Browse photographers including " + item.studio.name}>↗</a></div>
          {item.studio.specialties.length > 0 && <div className="public-portfolio-tags">{item.studio.specialties.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>}
        </article>)}
      </div>}
      {!loading && !error && visibleItems.length === 0 && <div className="directory-empty">
        <div className="empty-frame"><span>F</span></div>
        <p className="directory-eyebrow">SHARED BY THE STUDIOS</p>
        <h3>{items.length ? "No work matches that search." : "Public photographs will appear here."}</h3>
        <p>{items.length ? "Try another studio name, city or search term." : "Studios choose which images they have permission to share. Private customer galleries are not shown in this public collection."}</p>
        <a href={items.length ? "/work" : "/photographers"}>{items.length ? "Browse the gallery" : "Browse photographers"} <span>→</span></a>
      </div>}
    </section>

    <section className="directory-bottom"><div><p className="directory-eyebrow">FOUND A PHOTOGRAPHER?</p><h2>Tell them what you’re looking for.</h2></div><p>Send an appointment request from a studio’s profile. You don’t need to create an account to make an enquiry.</p><a className="portfolio-cta" href="/photographers">Browse photographers →</a></section>
    <footer className="directory-footer"><a href="/" className="directory-brand"><span className="directory-brand-mark">P</span><span>The Photo Gallery<small>PHOTOGRAPHER DIRECTORY</small></span></a><span>Public work shared by participating studios.</span><a href="/photographers">Photographers →</a></footer>
  </main>;
}

