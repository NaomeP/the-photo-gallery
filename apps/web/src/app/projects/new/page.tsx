import ProjectClientDesk from "@/components/ProjectClientDesk";

export default function NewProjectPage() {
  return (
    <main className="public-page">
      <header className="public-header">
        <a href="/dashboard" className="brand"><span className="brand-mark">f</span><span>frame<span className="brand-light">folk</span><small>STUDIO MANAGER</small></span></a>
        <a className="text-button" href="/dashboard">Back to workspace →</a>
      </header>
      <section className="public-hero"><p className="eyebrow">STUDIO WORKSPACE</p><h1>Start a project</h1><p>Choose a client, add the event details, and keep the work together from quotation through delivery.</p></section>
      <ProjectClientDesk mode="Projects" />
    </main>
  );
}
