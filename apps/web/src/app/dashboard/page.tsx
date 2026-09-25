"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MediaUploadPanel from "@/components/MediaUploadPanel";
import BookingInbox from "@/components/BookingInbox";
import QuotationDesk from "@/components/QuotationDesk";
import GalleryDesk from "@/components/GalleryDesk";
import StudioProfile from "@/components/StudioProfile";
import InvoiceDesk from "@/components/InvoiceDesk";
import ProjectClientDesk from "@/components/ProjectClientDesk";
import DashboardOverview from "@/components/DashboardOverview";
import PortfolioDesk from "@/components/PortfolioDesk";

type View = "Overview" | "Projects" | "Clients" | "Gallery" | "Storage" | "Invoices" | "Settings" | "Requests" | "Quotations" | "Portfolio";
const items: { name:View; icon:string }[] = [
  {name:"Overview",icon:"⌂"},{name:"Projects",icon:"▧"},{name:"Clients",icon:"♙"},{name:"Portfolio",icon:"▧"},{name:"Gallery",icon:"▦"},{name:"Storage",icon:"◫"},{name:"Quotations",icon:"₹"},{name:"Invoices",icon:"▤"},{name:"Requests",icon:"✉"},{name:"Settings",icon:"⚙"}
];
function DashboardContent(){
 const [view,setView]=useState<View>("Overview");const params=useSearchParams();const section=params.get("view") as View|null;const projectId=params.get("projectId")||"";
 useEffect(()=>{if(section&&items.some(i=>i.name===section))setView(section);},[section]);
 return <main className="workspace">
  <aside className="sidebar"><a className="brand" href="/"><span className="brand-mark">f</span><span>frame<span className="brand-light">folk</span><small>STUDIO MANAGER</small></span></a><div className="studio-switch"><span className="studio-avatar">S</span><span><b>Studio workspace</b><small>Choose your workspace below</small></span><span className="chevron">⌄</span></div><div className="nav-label">WORKSPACE</div><nav>{items.map(item=><button key={item.name} className={`nav-item ${view===item.name?"active":""}`} onClick={()=>setView(item.name)}><span className="nav-icon">{item.icon}</span>{item.name}</button>)}</nav><div className="sidebar-bottom"><div className="plan-card"><div className="plan-top"><span>MEDIA STORAGE</span><span>Usage</span></div><p>View your live quota and upload progress.</p><button onClick={()=>setView("Storage")}>Open storage <span>→</span></button></div><a className="profile" href="/login"><span className="profile-pic">↗</span><span><b>Account access</b><small>Sign in or switch account</small></span></a></div></aside>
  <section className="main-area"><header className="topbar"><div className="breadcrumb">Studio workspace <span>/</span> {view}</div><div className="top-actions"><a className="help-link" href="/directory">Photographer directory</a><a className="help-link" href="/admin">Platform admin</a></div></header>
   <div className="content"><div className="welcome-row"><div><p className="eyebrow">YOUR STUDIO AT A GLANCE</p><h1>{view==="Overview"?"Studio overview":view}<span className="wave">✳</span></h1><p className="subhead">{view==="Overview"?"Here’s what’s happening at your studio today.":`Keep your ${view.toLowerCase()} moving smoothly.`}</p></div><a className="primary" href="/projects/new">＋ <span>New project</span></a></div>
   {view==="Overview"&&<DashboardOverview/>}
   {view==="Storage"&&<section className="storage-view"><div className="storage-summary panel"><div className="storage-copy"><span className="stat-icon sand-icon">◫</span><div><h2>Your studio storage</h2><p>Media stays private and is shared through secure gallery links.</p></div></div><div className="storage-number"><b>Live quota below</b><small>Connect your studio account</small></div><div className="storage-foot"><span><i className="legend-photo"/>Photos and files</span><span><i className="legend-video"/>Videos</span></div></div><MediaUploadPanel/><div className="panel storage-info"><span className="info-icon">i</span><div><b>Built for large media libraries</b><p>Photos upload directly to private object storage with resumable multipart transfers. Videos use resumable TUS uploads. Media bytes bypass the app server.</p></div></div></section>}
   {(view==="Projects"||view==="Clients")&&<ProjectClientDesk mode={view}/>} {view==="Requests"&&<BookingInbox/>}{view==="Quotations"&&<QuotationDesk initialProjectId={projectId}/>} {view==="Gallery"&&<GalleryDesk/>}{view==="Settings"&&<StudioProfile/>}{view==="Invoices"&&<InvoiceDesk/>}{view==="Portfolio"&&<PortfolioDesk/>}
   <footer>© {new Date().getFullYear()} The Photo Gallery <span>Private by design <i>·</i> Built for photographers</span></footer></div>
  </section>
 </main>
}

export default function Home(){
  return <Suspense fallback={<main className="workspace"><section className="panel">Loading studio workspace…</section></main>}><DashboardContent/></Suspense>;
}



