import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { HeartHandshake, ShieldCheck, Building2, Activity, Sparkles, MessageCircle, PhoneCall } from "lucide-react";
import PatientHeader from "@/components/PatientHeader";
import PatientFooter from "@/components/PatientFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type DonorItem = {
  _id?: string;
  userId?: string;
  fullName?: string;
  name?: string;
  email?: string;
  bloodGroup?: string;
  city?: string;
  state?: string;
  country?: string;
  organ?: string;
  organs?: string[];
};

type VerifiedMap = Record<string, string[]>; // userId -> [verified organs]
type MatchItem = {
  _id?: string;
  donor: string; // userId of donor
  organ: string;
  status: 'pending' | 'approved' | 'rejected';
  matchedAt?: string;
  updatedAt?: string;
  donorSummary?: {
    userId: string;
    name?: string;
    email?: string;
    bloodGroup?: string;
    city?: string; state?: string; country?: string;
    contact?: string;
  };
};

const PatientLanding: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [verifiedByDonor, setVerifiedByDonor] = useState<VerifiedMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // My requests
  const [myRequests, setMyRequests] = useState<MatchItem[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [myError, setMyError] = useState("");

  // Filters
  const [organFilter, setOrganFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"relevance" | "city" | "name" | "group">("relevance");
  const [onlySameGroup, setOnlySameGroup] = useState<boolean>(false);
  const [onlyReqOrgan, setOnlyReqOrgan] = useState<boolean>(false);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorItem | null>(null);

  // Patient preferences (from local storage; optional)
  const [patientBg, setPatientBg] = useState<string>("");
  const [patientReqOrgan, setPatientReqOrgan] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const p = u?.patientProfile || u;
        if (p?.bloodGroup) setPatientBg(String(p.bloodGroup));
        const ro = p?.requiredOrgan || p?.organNeeded || p?.organ;
        if (ro) setPatientReqOrgan(String(ro));
      }
    } catch {}
  }, []);

  // Fetch donors + verified map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [donorRes, verRes] = await Promise.all([
          fetch(`${API_URL.replace(/\/+$/, "")}/donor/all`),
          fetch(`${API_URL.replace(/\/+$/, "")}/donation-request/public/verified-by-donor?status=Verified`),
        ]);
        if (!donorRes.ok) throw new Error(await donorRes.text());
        if (!verRes.ok) throw new Error(await verRes.text());
        const donorData = await donorRes.json();
        const verData = await verRes.json();
        if (!cancelled) {
          setDonors(Array.isArray(donorData) ? donorData : []);
          setVerifiedByDonor((verData && typeof verData.map === "object" && verData.map) || {});
          setError("");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch my match requests (patient)
  const fetchMyRequests = async () => {
    try {
      setLoadingMy(true); setMyError("");
      const base = (API_URL || '').replace(/\/+$/, '');
      const tokenKeys = ['token','accessToken','authToken'];
      let token: string | null = null;
      for (const k of tokenKeys) { const v = localStorage.getItem(k); if (v && v !== 'undefined' && v !== 'null' && v.trim()) { token = v; break; } }
      if (!token) { setLoadingMy(false); return; }
      const res = await fetch(`${base}/match/my`, { headers: { 'Accept':'application/json', ...(token?{ Authorization:`Bearer ${token}`}:{}), }});
      if (!res.ok) { const t = await res.text(); throw new Error(t || `Failed (${res.status})`); }
      const data = await res.json();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (e: any) { setMyError(e?.message || 'Failed to load requests'); }
    finally { setLoadingMy(false); }
  };

  useEffect(() => { fetchMyRequests(); }, []);

  // Derived lists
  const verifiedUserIds = useMemo(() => new Set(Object.keys(verifiedByDonor || {})), [verifiedByDonor]);
  const allCities = useMemo(() => Array.from(new Set(donors.map(d => (d.city || "").trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b)), [donors]);
  const allOrgans = useMemo(() => {
    const s = new Set<string>();
    Object.values(verifiedByDonor || {}).forEach(arr => arr.forEach(o => s.add(o)));
    return Array.from(s).sort((a,b)=>a.localeCompare(b));
  }, [verifiedByDonor]);

  // Base verified donors set
  const baseVerifiedDonors = useMemo(() =>
    donors.filter(d => d.userId && verifiedUserIds.has(String(d.userId))),
  [donors, verifiedUserIds]);

  // Top cities among verified donors
  const topCities = useMemo(() => {
    const counts: Record<string, number> = {};
    baseVerifiedDonors.forEach(d => {
      const c = (d.city || "").trim();
      if (!c) return; counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  }, [baseVerifiedDonors]);

  // Display list with query/filter/sort
  const verifiedDonors = useMemo(() => {
    let list = baseVerifiedDonors;
    if (organFilter) {
      list = list.filter(d => {
        const vid = String(d.userId || "");
        const v = verifiedByDonor[vid] || [];
        return v.map(x=>x.toLowerCase()).includes(organFilter.toLowerCase());
      });
    }
    if (cityFilter) {
      list = list.filter(d => (d.city || "").toLowerCase() === cityFilter.toLowerCase());
    }
    if (onlySameGroup && patientBg) {
      list = list.filter(d => (d.bloodGroup||"").toUpperCase() === patientBg.toUpperCase());
    }
    if (onlyReqOrgan && patientReqOrgan) {
      list = list.filter(d => {
        const vid = String(d.userId||"");
        return (verifiedByDonor[vid]||[]).map(o=>o.toLowerCase()).includes(patientReqOrgan.toLowerCase());
      });
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(d => {
        const vid = String(d.userId || "");
        const v = (verifiedByDonor[vid] || []).join(" ").toLowerCase();
        return (
          (d.fullName || d.name || "").toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.city || "").toLowerCase().includes(q) ||
          (d.bloodGroup || "").toLowerCase().includes(q) ||
          v.includes(q)
        );
      });
    }
    list = [...list];
    list.sort((a,b)=>{
      if (sortKey === "city") return (a.city||"").localeCompare(b.city||"");
      if (sortKey === "name") return (a.fullName||a.name||"").localeCompare(b.fullName||b.name||"");
      if (sortKey === "group") return (a.bloodGroup||"").localeCompare(b.bloodGroup||"");
      // relevance
      const score = (d: DonorItem) => {
        const vid = String(d.userId || "");
        const v = (verifiedByDonor[vid] || []).map(x=>x.toLowerCase());
        const hasOrgan = organFilter ? v.includes(organFilter.toLowerCase()) : false;
        const qOrg = query ? v.some(o => o.includes(query.toLowerCase())) : false;
        const cityMatch = cityFilter && (d.city||"").toLowerCase() === cityFilter.toLowerCase();
        const bgMatch = patientBg && (d.bloodGroup||"").toUpperCase() === patientBg.toUpperCase();
        return (hasOrgan?3:0) + (qOrg?2:0) + (cityMatch?1:0) + (bgMatch?1:0);
      };
      const as = score(a); const bs = score(b);
      if (as !== bs) return bs - as;
      return (a.fullName||a.name||"").localeCompare(b.fullName||b.name||"");
    });
    return list;
  }, [baseVerifiedDonors, organFilter, cityFilter, query, sortKey, verifiedByDonor, patientBg]);

  // Unique blood groups for quick select
  const allGroups = useMemo(() => Array.from(new Set(donors.map(d => (d.bloodGroup||"").toUpperCase()).filter(Boolean))).sort(), [donors]);

  // Helpers
  const initials = (name?: string) => {
    if (!name) return "RS";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "R") + (parts[1]?.[0] || "S");
  };

  const counters = useMemo(() => ({
    verified: verifiedUserIds.size,
    cities: new Set(verifiedDonors.map(d => (d.city||"").trim()).filter(Boolean)).size,
    matches: 120, // optional showcase; replace with real when available
  }), [verifiedUserIds.size, verifiedDonors]);

  const timeAgo = (iso?: string) => {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff/1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec/60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min/60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr/24);
    if (d < 30) return `${d}d ago`;
    const mo = Math.floor(d/30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(mo/12)}y ago`;
  };

  // Organ availability counts (from verified map)
  const organCounts = useMemo(() => {
    const c: Record<string, number> = {};
    Object.values(verifiedByDonor||{}).forEach(arr => arr.forEach(o => {
      const k = o.trim(); if (!k) return; c[k] = (c[k]||0)+1;
    }));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8);
  }, [verifiedByDonor]);

  // Images: stories and gallery (bundled via Vite asset handling)
  const storyImages = useMemo(() => [
    new URL("../../Images/organ-transplant-reuters.jpg", import.meta.url).href,
    new URL("../../Images/23-first-donor-from-surat.jpg", import.meta.url).href,
    new URL("../../Images/heart-with-cardiogram-light-background.jpg", import.meta.url).href,
  ], []);
  const galleryImages = useMemo(() => [
    new URL("../../Images/2-1.jpg", import.meta.url).href,
    new URL("../../Images/images.jpg", import.meta.url).href,
    new URL("../../Images/images (1).jpg", import.meta.url).href,
    new URL("../../Images/102685614.avif", import.meta.url).href,
    new URL("../../Images/Gemini_Generated_Image_a2cnfha2cnfha2cn.png", import.meta.url).href,
    new URL("../../Images/Gemini_Generated_Image_lpymf2lpymf2lpym.png", import.meta.url).href,
  ], []);

  // Send match request
  const requestOrgan = async (donorUserId: string, organ: string) => {
    try {
      const base = (API_URL || '').replace(/\/+$/, '');
      const tokenKeys = ['token', 'accessToken', 'authToken'];
      let token: string | null = null;
      for (const k of tokenKeys) {
        const v = localStorage.getItem(k);
        if (v && v !== 'undefined' && v !== 'null' && v.trim()) { token = v; break; }
      }
      const res = await fetch(`${base}/match/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ donorId: donorUserId, organ }),
      });
      if (!res.ok) {
        const t = await res.text();
        alert(`Failed to send request: ${res.status} ${t}`);
        return;
      }
      alert('Request sent to admin. You will be notified once approved.');
    } catch (e: any) {
      alert(`Error: ${e?.message || 'Unable to send request'}`);
    }
  };

  // Route guard: keep only patients here (optional)
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role && role !== "patient") {
      // Do not hard redirect; show page anyway as a public portal
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-emerald-50">
      <PatientHeader />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        {/* Brand blended backdrop: rose → emerald radials */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#fecdd3_0,transparent_35%),radial-gradient(circle_at_75%_25%,#bbf7d0_0,transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Find a verified organ donor, faster.
            </h1>
            <p className="mt-3 text-slate-600 max-w-prose">
              Search by organ and city, and prioritize matches with your blood group.
            </p>
            {/* Quick search row */}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <div className="w-56">
                <Input placeholder="Search name, city, organ…" value={query} onChange={e=>setQuery(e.target.value)} />
              </div>
              <select value={organFilter} onChange={e=>setOrganFilter(e.target.value)} className="rounded-lg border px-2 py-2 text-sm bg-white">
                <option value="">All organs</option>
                {allOrgans.map(o => <option key={`h-${o}`} value={o}>{o}</option>)}
              </select>
              <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} className="rounded-lg border px-2 py-2 text-sm bg-white">
                <option value="">All cities</option>
                {allCities.slice(0,80).map(c => <option key={`hc-${c}`} value={c}>{c}</option>)}
              </select>
              <Button onClick={()=>{
                const el = document.getElementById('donors');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-emerald-600 hover:bg-emerald-500">Find donors</Button>
            </div>
            {/* Organ chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["Kidney","Liver","Heart","Cornea"].map(o => (
                <Button key={o} size="sm" variant={organFilter===o?"default":"outline"} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  onClick={()=>{ setOrganFilter(o); const el = document.getElementById('donors'); el?.scrollIntoView({behavior:'smooth'}); }}>
                  {o}
                </Button>
              ))}
            </div>
            {/* Live counters */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xl font-bold text-slate-900">{counters.verified}+</div>
                <div className="text-xs text-slate-600">Verified donors</div>
              </div>
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xl font-bold text-slate-900">{counters.cities}</div>
                <div className="text-xs text-slate-600">Cities</div>
              </div>
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xl font-bold text-slate-900">{counters.matches}+</div>
                <div className="text-xs text-slate-600">Successful matches</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-2xl bg-white/60 ring-1 ring-slate-200 shadow-xl flex items-center justify-center">
              <img src="/logo.png" alt="Ram Setu logo" className="h-80 w-80 object-contain" />
            </div>
          </div>
        </div>
      </section>
      {/* Organ availability summary */}
      <section className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border shadow-sm p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-slate-900 font-bold">Verified organ availability</div>
              <ul className="flex flex-wrap gap-2 text-sm">
                {organCounts.length === 0 ? (
                  <li className="text-slate-600">Will populate as verifications grow.</li>
                ) : (
                  organCounts.map(([o, count]) => (
                    <li key={o} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {o} <span className="text-emerald-600">({count})</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
       {/* Verified Donors (Organ‑first) */}
  <section id="donors" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Verified Organ Donors</h2>
              <p className="text-slate-600 text-sm">Only donors with verified organ submissions are shown here.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="w-48">
                <Input placeholder="Search name, city, organ…" value={query} onChange={e=>setQuery(e.target.value)} />
              </div>
              <select value={organFilter} onChange={e=>setOrganFilter(e.target.value)} className="rounded-lg border px-2 py-1 text-sm bg-white">
                <option value="">All organs</option>
                {allOrgans.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} className="rounded-lg border px-2 py-1 text-sm bg-white">
                <option value="">All cities</option>
                {allCities.slice(0,80).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="rounded-lg border px-2 py-1 text-sm bg-white">
                <option value="relevance">Sort: Relevance</option>
                <option value="city">Sort: City</option>
                <option value="name">Sort: Name</option>
                <option value="group">Sort: Blood Group</option>
              </select>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <Checkbox id="chk-bg" checked={onlySameGroup} onCheckedChange={v=>setOnlySameGroup(Boolean(v))} />
              <span>Only same blood group{patientBg ? ` (${patientBg})` : ''}</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox id="chk-org" checked={onlyReqOrgan} onCheckedChange={v=>setOnlyReqOrgan(Boolean(v))} />
              <span>Only my required organ{patientReqOrgan ? ` (${patientReqOrgan})` : ''}</span>
            </label>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_,i)=>(<div key={i} className="h-24 rounded-2xl bg-white border animate-pulse" />))}
              </div>
            ) : error ? (
              <div className="text-rose-600">{error}</div>
            ) : verifiedDonors.length === 0 ? (
              <div className="text-slate-600">No verified donors found for the selected filters.</div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedDonors.slice(0, 9).map(d => {
                  const vid = String(d.userId || "");
                  const organs = (verifiedByDonor[vid] || []).slice(0,3);
                  return (
                    <li key={d._id} className="rounded-2xl bg-white border shadow-sm p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarFallback>{initials(d.fullName||d.name)}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900 truncate">{d.fullName || d.name || "N/A"}</div>
                          <div className="text-xs text-slate-600 truncate">{[d.city, d.state].filter(Boolean).join(", ") || "—"}</div>
                        </div>
                        {d.bloodGroup && <Badge variant="secondary">{d.bloodGroup}</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {organs.map((o, idx) => (
                          <Badge key={`${d._id}-o-${idx}`} className="bg-emerald-600 text-white hover:bg-emerald-600">{o}</Badge>
                        ))}
                      </div>
                      <div className="mt-3 text-right">
                        <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          onClick={()=>{ setSelectedDonor(d); setDetailOpen(true); }}>
                          View details
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {verifiedDonors.length > 9 && (
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={()=>navigate('/patient-dashboard')}>
                View all in Dashboard
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Personalized matches */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border shadow-sm p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personalized matches</h3>
                <p className="text-xs text-slate-600">Quickly view donors with your blood group or for your required organ.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <select value={patientBg} onChange={e=>setPatientBg(e.target.value)} className="rounded-lg border px-2 py-1 bg-white">
                  <option value="">Blood group: Any</option>
                  {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={patientReqOrgan} onChange={e=>setPatientReqOrgan(e.target.value)} className="rounded-lg border px-2 py-1 bg-white">
                  <option value="">Required organ: Any</option>
                  {allOrgans.map(o => <option key={`req-${o}`} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {/* Required organ cards */}
              <div>
                <div className="font-semibold mb-2">{patientReqOrgan ? `Donors for ${patientReqOrgan}` : 'Donors for your required organ'}</div>
                {patientReqOrgan ? (
                  <ul className="grid gap-3">
                    {baseVerifiedDonors.filter(d => {
                      const vid = String(d.userId||'');
                      const v = (verifiedByDonor[vid]||[]).map(x=>x.toLowerCase());
                      return v.includes(patientReqOrgan.toLowerCase());
                    }).slice(0,6).map(d => {
                      const vid = String(d.userId||'');
                      const organs = (verifiedByDonor[vid]||[]).slice(0,2);
                      return (
                        <li key={`org-${d._id}`} className="rounded-xl border bg-white p-3 flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback>{(d.fullName||d.name||'RS').slice(0,2)}</AvatarFallback></Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate">{d.fullName||d.name||'N/A'}</div>
                            <div className="text-xs text-slate-600 truncate">{[d.city,d.state].filter(Boolean).join(', ')||'—'}</div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {organs.map((o,i)=>(<Badge key={`vo-${i}`} className="bg-emerald-600 text-white">{o}</Badge>))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-600">Select your required organ to see matches.</div>
                )}
              </div>
                
              {/* Same blood group */}
              <div>
                <div className="font-semibold mb-2">{patientBg ? `Same blood group (${patientBg})` : 'Same blood group'}</div>
                {patientBg ? (
                  <ul className="grid gap-3">
                    {baseVerifiedDonors.filter(d => (d.bloodGroup||'').toUpperCase() === patientBg.toUpperCase()).slice(0,6).map(d => (
                      <li key={`bg-${d._id}`} className="rounded-xl border bg-white p-3 flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{(d.fullName||d.name||'RS').slice(0,2)}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">{d.fullName||d.name||'N/A'}</div>
                          <div className="text-xs text-slate-600 truncate">{[d.city,d.state].filter(Boolean).join(', ')||'—'}</div>
                        </div>
                        {d.bloodGroup && (<Badge variant="secondary">{d.bloodGroup}</Badge>)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-600">Choose your blood group to get focused results.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Organ Requests */}
      <section id="my-requests" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Organ Requests</h2>
              <p className="text-slate-600 text-sm">Track your pending and approved requests.</p>
            </div>
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={fetchMyRequests}>Refresh</Button>
          </div>

          <div className="mt-6">
            {loadingMy ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_,i)=>(<div key={i} className="h-24 rounded-2xl bg-white border animate-pulse" />))}
              </div>
            ) : myError ? (
              <div className="text-rose-600 text-sm">{myError}</div>
            ) : myRequests.length === 0 ? (
              <div className="text-slate-600 text-sm">No requests yet. Open a donor and click Request next to an organ.</div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRequests.map((r) => {
                  const donor = donors.find(d => String(d.userId||'') === String((r as any).donor||r.donor));
                  const status = String(r.status||'').toLowerCase();
                  const ds = (r as any).donorSummary as MatchItem['donorSummary'];
                  return (
                    <li key={r._id} className="rounded-2xl bg-white border shadow-sm p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">{r.organ}</div>
                        {status === 'approved' ? (
                          <span className="rounded bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Approved</span>
                        ) : status === 'rejected' ? (
                          <span className="rounded bg-rose-100 text-rose-700 text-xs px-2 py-0.5">Rejected</span>
                        ) : (
                          <span className="rounded bg-amber-100 text-amber-700 text-xs px-2 py-0.5">Pending</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 truncate">Donor: {ds?.name || donor?.fullName || donor?.name || '—'}</div>
                      <div className="mt-1 text-xs text-slate-500">Updated: {timeAgo(r.updatedAt)}</div>
                      {status === 'approved' && ds && (
                        <div className="mt-2 rounded-lg border bg-emerald-50 p-3 text-xs text-emerald-900">
                          <div className="font-semibold mb-1">Donor details</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div><span className="text-emerald-700">Email:</span> {ds.email || 'N/A'}</div>
                            <div><span className="text-emerald-700">Blood Group:</span> {ds.bloodGroup || 'N/A'}</div>
                            <div className="col-span-2"><span className="text-emerald-700">Location:</span> {[ds.city, ds.state, ds.country].filter(Boolean).join(', ') || 'N/A'}</div>
                            <div className="col-span-2"><span className="text-emerald-700">Contact:</span> {ds.contact || 'N/A'}</div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
{/* Insight strip: Top donor cities */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-emerald-50 border shadow-sm p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-slate-900 font-bold">Top cities with verified donors</div>
              <ul className="flex flex-wrap gap-3 text-sm">
                {topCities.length === 0 ? (
                  <li className="text-slate-600">Data will appear as donors are verified.</li>
                ) : (
                  topCities.map(([city, count]) => (
                    <li key={city} className="px-3 py-1 rounded-full bg-white border text-slate-700 shadow-sm">
                      {city} <span className="text-slate-500">({count})</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section id="how" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">How It Works</h2>
          <p className="mt-2 text-slate-600 text-center">Simple, safe, and transparent.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-3">1</div>
              <div className="font-semibold">Register</div>
              <div className="text-sm text-slate-600">Create your patient profile and submit medical details.</div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-3">2</div>
              <div className="font-semibold">Get Matched</div>
              <div className="text-sm text-slate-600">Our AI system finds compatible donors from verified submissions.</div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-3">3</div>
              <div className="font-semibold">Connect Securely</div>
              <div className="text-sm text-slate-600">Hospitals facilitate safe transplant coordination.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Ram Setu */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">Why Choose Ram Setu</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div className="mt-2 font-semibold">Secure Data Handling</div>
              <div className="text-sm text-slate-600">We protect your personal and medical data with strict privacy controls.</div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <Building2 className="h-6 w-6 text-emerald-600" />
              <div className="mt-2 font-semibold">Verified Donors & Hospitals</div>
              <div className="text-sm text-slate-600">Every donor submission and hospital partner is verified.</div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <Activity className="h-6 w-6 text-emerald-600" />
              <div className="mt-2 font-semibold">Real‑time Match Tracking</div>
              <div className="text-sm text-slate-600">Track your request and match progress in your dashboard.</div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <Sparkles className="h-6 w-6 text-emerald-600" />
              <div className="mt-2 font-semibold">Compassionate Support Team</div>
              <div className="text-sm text-slate-600">We’re here to help — with empathy and clarity.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood group compatibility (quick tips) */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">Blood Group Compatibility</h2>
          <p className="text-slate-600 text-center mt-2">General guidance only. Your hospital’s medical team makes final compatibility decisions.</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { g: 'O-', r: 'O-', d: 'Donate to all groups' },
              { g: 'O+', r: 'O+, A+, B+, AB+', d: 'Donate to O+, A+, B+, AB+' },
              { g: 'A+', r: 'A+, AB+', d: 'Donate to A+, AB+' },
              { g: 'B+', r: 'B+, AB+', d: 'Donate to B+, AB+' },
              { g: 'AB+', r: 'AB+', d: 'Universal recipient' },
              { g: 'A-', r: 'A-, A+, AB-, AB+', d: 'Donate to A, AB groups' },
              { g: 'B-', r: 'B-, B+, AB-, AB+', d: 'Donate to B, AB groups' },
              { g: 'AB-', r: 'AB-, AB+', d: 'Donate to AB only' },
            ].map(item => (
              <div key={item.g} className="rounded-2xl bg-white border shadow-sm p-5">
                <div className="text-xl font-bold text-slate-900">{item.g}</div>
                <div className="text-sm text-slate-600 mt-1"><span className="font-semibold">Receives:</span> {item.r}</div>
                <div className="text-sm text-slate-600"><span className="font-semibold">Note:</span> {item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">FAQs</h2>
          <div className="mt-4 rounded-2xl bg-white border shadow-sm p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>How do you verify donors?</AccordionTrigger>
                <AccordionContent>
                  We validate identity and medical intent via documentation and partner hospitals before listing donors here.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Is my data safe?</AccordionTrigger>
                <AccordionContent>
                  Yes. We apply strict access controls and only share data with consented medical partners when needed for matching.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>How fast can I expect a match?</AccordionTrigger>
                <AccordionContent>
                  Timelines vary by organ, city, and blood group. Use filters and keep your profile up-to-date to improve visibility.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-emerald-600 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="text-center md:text-left">
              <div className="text-2xl font-extrabold">Need help right now?</div>
              <div className="text-sm text-rose-50/90">Start a request or talk to our support team.</div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link to="/patient-profile-form"><Button className="bg-white text-rose-700 hover:bg-rose-50">Request an Organ</Button></Link>
              <Link to="/contact"><Button variant="outline" className="border-white text-white hover:bg-white/10">Contact Support</Button></Link>
            </div>
          </div>
        </div>
      </section>

 

      {/* Awareness / Stories (now with images) */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">Every organ counts — every life matters.</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {storyImages.map((src, idx) => (
              <div key={src} className="rounded-2xl bg-white border shadow-sm overflow-hidden">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img src={src} alt={`Story ${idx+1}`} className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="font-semibold">A story of hope #{idx+1}</div>
                  <div className="text-sm text-slate-600 mt-1">“Thanks to a timely match, our family found a second chance.”</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery */}

      {/* Donor detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Donor details</DialogTitle>
            <DialogDescription>Verified information for this donor.</DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback>{initials(selectedDonor.fullName||selectedDonor.name)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{selectedDonor.fullName||selectedDonor.name||'N/A'}</div>
                  <div className="text-sm text-slate-600 truncate">{[selectedDonor.city, selectedDonor.state].filter(Boolean).join(', ')||'—'}</div>
                </div>
                {selectedDonor.bloodGroup && <Badge variant="secondary">{selectedDonor.bloodGroup}</Badge>}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Verified organs</div>
                <div className="flex flex-wrap gap-2">
                  {(verifiedByDonor[String(selectedDonor.userId||'')]||[]).map((o,i)=>(
                    <div key={`fd-${i}`} className="inline-flex items-center gap-2">
                      <Badge className="bg-emerald-600 text-white">{o}</Badge>
                      <Button size="sm" variant="outline" className="h-7 px-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        onClick={()=> requestOrgan(String(selectedDonor.userId||''), o)}>
                        Request
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={()=>setDetailOpen(false)}>Close</Button>
            <Button onClick={()=>{
              setDetailOpen(false);
              navigate('/patient-dashboard');
            }} className="bg-emerald-600 hover:bg-emerald-500">Open Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">Inspiration Gallery</h3>
            <p className="text-sm text-slate-600">Real moments and visuals from awareness drives and community stories.</p>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={`g-${i}`} className="group relative rounded-2xl overflow-hidden border bg-white">
                <img src={src} alt={`Gallery image ${i+1}`} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <PatientFooter />

      {/* Floating actions */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3">
        <Link to="/contact" className="rounded-full shadow-lg bg-emerald-600 text-white p-3 hover:bg-emerald-500" aria-label="Chat with support">
          <MessageCircle className="h-5 w-5" />
        </Link>
        <a href="tel:+91-7505675163" className="rounded-full shadow-lg bg-red-600 text-white p-3 hover:bg-red-500" aria-label="Emergency contact">
          <PhoneCall className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};

export default PatientLanding;
