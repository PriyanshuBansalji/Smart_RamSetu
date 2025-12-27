import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { HeartHandshake, ShieldCheck, Building2, Activity, Sparkles, MessageCircle, PhoneCall } from "lucide-react";
import PatientHeader from "@/components/PatientHeader";
import PatientFooter from "@/components/PatientFooter";
import { useLocation } from "react-router-dom";

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
  createdAt: string | number | Date;
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
    city?: string;
    state?: string;
    country?: string;
    contact?: string;
  };
  matchScore?: number;
  matchScore2?: number;
  tests?: any[];
};
;

const organOptions = [
  { label: "Kidney", path: "/donate/kidney" },
  { label: "Liver", path: "/donate/liver" },
  { label: "Heart", path: "/donate/heart" },
  { label: "Cornea", path: "/donate/cornea" },
];

const PatientLanding: React.FC = () => {
  const [showOrganModal, setShowOrganModal] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState(organOptions[0].label);
  const navigate = useNavigate();
  const location = useLocation();
  const [appliedInfo, setAppliedInfo] = useState<{ organ?: string; matchScore?: number; bestDonor?: any } | null>(null);
  const [matchResults, setMatchResults] = useState<Record<string, any[]>>({});

  // Data
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [verifiedByDonor, setVerifiedByDonor] = useState<VerifiedMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // My requests
  const [myRequests, setMyRequests] = useState<MatchItem[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [myError, setMyError] = useState("");
  
  // Approved matches from Match collection
  const [approvedMatches, setApprovedMatches] = useState<MatchItem[]>([]);
  const [loadingApproved, setLoadingApproved] = useState(false);

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
  // Patient ID for smart matching (from local storage)
  const [patientId, setPatientId] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const p = u?.patientProfile || u;
        if (p?._id) setPatientId(String(p._id));
        if (p?.bloodGroup) setPatientBg(String(p.bloodGroup));
        const ro = p?.requiredOrgan || p?.organNeeded || p?.organ;
        if (ro) setPatientReqOrgan(String(ro));
      }
    } catch {}
  }, []);

  // Fetch patient requests (defined before useEffect calls it)
  const fetchMyRequests = async () => {
    try {
      setLoadingMy(true);
      setMyError("");
      const token = getAuthToken();
      if (!token) throw new Error("Not authenticated");
      const base = (API_URL || '').replace(/\/+$/, '');
      const res = await fetch(`${base}/patient/request/my`, { headers: { 'Accept':'application/json', Authorization:`Bearer ${token}` }});
      if (!res.ok) { const t = await res.text(); throw new Error(t || `Failed (${res.status})`); }
      const data = await res.json();
      console.log('📋 Fetched requests:', data); // Debug: show all requests
      const approvedRequests = Array.isArray(data) ? data.filter((r: any) => r.status === 'approved') : [];
      console.log('✅ Approved requests found:', approvedRequests.length, approvedRequests); // Debug: show approved
      setMyRequests(Array.isArray(data) ? data : []);
      const arr = Array.isArray(data) ? data : [];
      if (arr.length > 0) {
        for (const r of arr) {
          fetchMatchesForRequest(String(r._id), String(r.organ));
        }
      }
    } catch (e: any) { setMyError(e?.message || 'Failed to load requests'); }
    finally { setLoadingMy(false); }
  };

  const getAuthToken = () => {
    const tokenKeys = ['token','accessToken','authToken'];
    for (const k of tokenKeys) {
      const v = localStorage.getItem(k);
      if (v && v !== 'undefined' && v !== 'null' && v.trim()) return v;
    }
    return null;
  };

  // Fetch approved matches from Match collection (separate from patient requests)
  const fetchApprovedMatches = async () => {
    try {
      setLoadingApproved(true);
      const token = getAuthToken();
      if (!token) return;
      const base = (API_URL || '').replace(/\/+$/, '');
      
      // Try to fetch from /match/my endpoint and filter approved matches
      const res = await fetch(`${base}/match/my`, { 
        headers: { 'Accept':'application/json', Authorization:`Bearer ${token}` }
      });
      if (!res.ok) {
        console.log('⚠️ Could not fetch matches from /match/my');
        return;
      }
      
      const data = await res.json();
      console.log('📊 All matches from /match/my:', data);
      
      // Filter only approved matches
      const approved = Array.isArray(data) ? data.filter((m: any) => m.status === 'approved') : [];
      console.log('✅ Approved matches filtered:', approved.length, approved);
      
      setApprovedMatches(approved);
    } catch (e: any) { 
      console.error('❌ Error fetching approved matches:', e.message);
    }
    finally { setLoadingApproved(false); }
  };

  const fetchMatchesForRequest = async (requestId: string, organ: string) => {
    try {
      if (!patientId) return;
      if (matchResults[requestId]) return;
      const token = getAuthToken();
      if (!token) return;
      const base = (API_URL || '').replace(/\/+$/, '');
      const url = `${base}/match/smart/${encodeURIComponent(patientId)}/${encodeURIComponent(organ)}`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({}) });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const ranked = Array.isArray(data?.ranked) ? data.ranked : [];
      setMatchResults(prev => ({ ...prev, [requestId]: ranked }));
    } catch (e) { /** ignore non-fatal */ }
  };

  // Fetch donors + verified map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = (API_URL || '').replace(/\/+$/, '');
        const donRes = await fetch(`${base}/donor/donations`, { headers: { 'Accept':'application/json' } });
        if (!donRes.ok) throw new Error(`Donor fetch failed (${donRes.status})`);
        const donData: any = await donRes.json();
        const donors = Array.isArray(donData) ? donData : donData?.donations || [];
        if (cancelled) return;
        setDonors(donors);
        // Organize by userId -> [organs]
        const vb: VerifiedMap = {};
        donors.forEach(d => {
          const uid = String(d.userId || "");
          if (!uid) return;
          if (!vb[uid]) vb[uid] = [];
          if (d.organs && Array.isArray(d.organs)) {
            d.organs.forEach((org:string) => {
              if (!vb[uid].includes(org)) vb[uid].push(org);
            });
          } else if (d.organ) {
            if (!vb[uid].includes(d.organ)) vb[uid].push(d.organ);
          }
        });
        if (!cancelled) setVerifiedByDonor(vb);
        if (!cancelled) setLoading(false);
      } catch (e: any) { 
        if (!cancelled) setError(e?.message || 'Failed to load donors'); 
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { 
    fetchMyRequests();
    fetchApprovedMatches(); // Fetch approved matches separately
  }, []);

  // Handle navigation state when redirected after applying
  useEffect(() => {
    try {
      const st: any = (location && (location as any).state) || {};
      if (st && st.applied) {
        // store applied info to show banner and ML score with best donor
        setAppliedInfo({ 
          organ: st.organ, 
          matchScore: st.matchScore,
          bestDonor: st.bestDonor
        });
        // refresh requests to include the newly-created request
        fetchMyRequests();
        // Clear navigation state by replacing current entry so banner isn't re-triggered on refresh
        setTimeout(() => {
          try {
            navigate(location.pathname, { replace: true, state: {} });
          } catch {}
        }, 500);
      }
    } catch {}
  }, [location]);

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
    matches: 120,
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
      
      if (!token) {
        alert('Please log in to send a request.');
        return;
      }

      // Capitalize organ name for enum validation
      const organCapitalized = organ.charAt(0).toUpperCase() + organ.slice(1).toLowerCase();

      console.log('📤 Sending match request:', { donorUserId, organ: organCapitalized, patientId });

      // Send match request to admin for verification
      const res = await fetch(`${base}/match/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          donorId: donorUserId,  // Backend expects donorId (not donor)
          organ: organCapitalized,
        }),
      });

      const responseText = await res.text();
      console.log(`📨 Response status: ${res.status}`, responseText);

      if (!res.ok) {
        console.error('❌ Match request failed:', responseText);
        alert(`Failed to send request: ${res.status}\n${responseText}`);
        return;
      }

      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('✅ Match request response:', responseData);

      // Refresh both requests and approved matches
      await fetchMyRequests();
      await fetchApprovedMatches();

      // Show success message with tracking info
      alert(`✅ Request Sent Successfully!\n\nOrgan: ${organCapitalized}\nStatus: Pending Admin Verification\n\nYou will be notified within 24 hours once the admin reviews and approves this match.`);
    } catch (e: any) {
      console.error('❌ Request error:', e);
      alert(`❌ Error: ${e?.message || 'Unable to send request'}`);
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

      {/* Hero - Apply Now CTA and Guide */}
      <section id="home" className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-rose-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/60 border border-emerald-200">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-emerald-700">AI-Powered Matching</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                Find Your Perfect <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Organ Match</span>
              </h1>
              <p className="text-xl text-slate-700 leading-relaxed max-w-prose">
                Our intelligent AI system matches you with the best available donors instantly. See your match score and connect with compatible donors today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setShowOrganModal(true)}>
                🎯 Apply Now
              </Button>
              <Link to="/patient-profile-form"><Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-6 text-lg font-semibold transition-all duration-300">📋 Complete Profile</Button></Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50">
                <div className="text-2xl font-bold text-emerald-600">⚡</div>
                <div className="text-sm text-slate-600 mt-2">Instant Matching</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50">
                <div className="text-2xl font-bold text-blue-600">🔒</div>
                <div className="text-sm text-slate-600 mt-2">100% Secure</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50">
                <div className="text-2xl font-bold text-rose-600">❤️</div>
                <div className="text-sm text-slate-600 mt-2">Life Saving</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-3xl blur-2xl" />
            <div className="relative aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200/50 shadow-2xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Ram Setu logo" className="h-80 w-80 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      {/* Organ availability summary */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200/50 shadow-sm p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">🩺 Verified Organ Availability</h3>
                <p className="text-sm text-slate-600 mt-1">Current donor profiles by organ type</p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-3">
              {organCounts.length === 0 ? (
                <li className="text-slate-600 text-sm">Organs will appear as donors are verified.</li>
              ) : (
                organCounts.map(([o, count]) => (
                  <li key={o} className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-800 border border-emerald-200/50 shadow-sm">
                    <span className="font-semibold">{o}</span>
                    <span className="ml-2 text-emerald-600 font-bold">({count})</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
      
       {/* Verified Donors (Organ‑first) */}
  <section id="donors" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">👥 Verified Organ Donors</h2>
            <p className="text-slate-600 text-sm mt-2">Only donors with verified organ submissions are shown here.</p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                <Input placeholder="Name, city, organ..." value={query} onChange={e=>setQuery(e.target.value)} className="border-slate-200/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Organ</label>
                <select value={organFilter} onChange={e=>setOrganFilter(e.target.value)} className="w-full rounded-lg border border-slate-200/50 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                  <option value="">All organs</option>
                  {allOrgans.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} className="w-full rounded-lg border border-slate-200/50 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                  <option value="">All cities</option>
                  {allCities.slice(0,80).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort by</label>
                <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="w-full rounded-lg border border-slate-200/50 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                  <option value="relevance">Relevance</option>
                  <option value="city">City</option>
                  <option value="name">Name</option>
                  <option value="group">Blood Group</option>
                </select>
              </div>
            </div>

            {/* Advanced filters */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <Checkbox id="chk-bg" checked={onlySameGroup} onCheckedChange={v=>setOnlySameGroup(Boolean(v))} />
                <span className="text-sm font-medium text-slate-700">Same blood group {patientBg && `(${patientBg})`}</span>
              </label>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <Checkbox id="chk-org" checked={onlyReqOrgan} onCheckedChange={v=>setOnlyReqOrgan(Boolean(v))} />
                <span className="text-sm font-medium text-slate-700">My organ {patientReqOrgan && `(${patientReqOrgan})`}</span>
              </label>
            </div>
          </div>

          {/* Donors Grid */}
          <div>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_,i)=>(<div key={i} className="h-56 rounded-2xl bg-white border border-slate-200/50 animate-pulse" />))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">{error}</div>
            ) : verifiedDonors.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-600">No donors match your criteria</div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {verifiedDonors.slice(0, 9).map(d => {
                  const vid = String(d.userId || "");
                  const organs = (verifiedByDonor[vid] || []).slice(0,3);
                  return (
                    <li key={d._id} className="group rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 p-5 cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12 border-2 border-emerald-100"><AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{initials(d.fullName||d.name)}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900 truncate">{d.fullName || d.name || "N/A"}</div>
                          <div className="text-xs text-slate-500 truncate">{[d.city, d.state].filter(Boolean).join(", ") || "—"}</div>
                        </div>
                        {d.bloodGroup && <Badge className="bg-emerald-100 text-emerald-700 font-semibold">{d.bloodGroup}</Badge>}
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {organs.map((o, idx) => (
                          <Badge key={`${d._id}-o-${idx}`} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs">{o}</Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-300"
                        onClick={()=>{ setSelectedDonor(d); setDetailOpen(true); }}>
                        View Details
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {verifiedDonors.length > 9 && (
            <div className="mt-10 text-center">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-3 font-semibold" onClick={()=>navigate('/patient-dashboard')}>
                View All Donors
              </Button>
            </div>
          )}
        </div>
      </section>


      {/* Best Match Donor (after ML scores) */}
      {appliedInfo?.bestDonor && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">Best Match Found! 🎉</h3>
                  <p className="text-emerald-700">Your organ request has been processed by our AI matching system</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Organ & Match Score */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                  <p className="text-sm text-slate-600 mb-1">Requested Organ</p>
                  <p className="text-3xl font-bold text-emerald-600">{appliedInfo.organ}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <p className="text-sm text-slate-600 mb-1">Match Score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-blue-600">{appliedInfo.matchScore ? (appliedInfo.matchScore * 100).toFixed(1) : 'N/A'}%</p>
                  </div>
                </div>

                {/* Match Strength Indicator */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                  <p className="text-sm text-slate-600 mb-2">Match Strength</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(appliedInfo.matchScore || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-indigo-700">
                      {appliedInfo.matchScore && appliedInfo.matchScore >= 0.8 ? '🌟 Excellent' : 
                       appliedInfo.matchScore && appliedInfo.matchScore >= 0.6 ? '⭐ Good' : 
                       'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Best Donor Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-200 mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Best Matching Donor</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {((appliedInfo.bestDonor?.name || "").split(' ').map((n: string) => n[0]).join('')) || 'D'}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-xl font-bold text-slate-900">{appliedInfo.bestDonor?.name || 'Unknown Donor'}</h5>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {appliedInfo.bestDonor?.bloodGroup && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                            🩸 {appliedInfo.bestDonor.bloodGroup}
                          </span>
                        )}
                        {appliedInfo.bestDonor?.city && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            📍 {appliedInfo.bestDonor.city}, {appliedInfo.bestDonor.state || 'India'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100">
                    <h6 className="font-bold text-slate-900 mb-3">Match Details</h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Compatibility:</span>
                        <span className="font-semibold text-emerald-700">{appliedInfo.matchScore ? (appliedInfo.matchScore * 100).toFixed(1) : 'N/A'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Organ Available:</span>
                        <span className="font-semibold text-emerald-700">{appliedInfo.organ}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <span className="font-semibold text-emerald-700">✓ Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
                  onClick={() => {
                    alert(`Your request for ${appliedInfo.organ} has been submitted to the admin. You will be notified once approved.`);
                  }}
                >
                  ✓ Request Sent to Admin
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-lg py-6 rounded-xl"
                  onClick={() => setAppliedInfo(null)}
                >
                  Dismiss
                </Button>
              </div>

              <p className="text-xs text-slate-500 mt-4 text-center">
                The admin team will verify this match and contact you within 24 hours. Your request has been logged in the system.
              </p>
            </div>
          </div>
        </section>
      )}

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
              <>
                {/* Show Best Match Donors from all requests at the top */}
                {myRequests.filter((r: any) => r.bestMatchDonor && r.bestMatchDonor.name).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">🎯 Your Best Matched Donors</h3>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myRequests.filter((r: any) => r.bestMatchDonor && r.bestMatchDonor.name).map((r: any) => {
                        // Check if match request already exists
                        const matchExists = myRequests.some((m: any) => 
                          m.donor === String(r.bestMatchDonor?.donorId) && 
                          m.organ === r.organ
                        );
                        
                        // Check if this organ has an approved match
                        const isApproved = approvedMatches.some((m: any) => m.organ === r.organ);
                        
                        return (
                        <li key={`best-${r._id}`} className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 shadow-2xl p-1 relative overflow-hidden hover:shadow-3xl transition-all duration-300">
                          {/* Animated background elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
                          
                          {/* Inner card */}
                          <div className="relative bg-white rounded-3xl p-6 backdrop-blur-sm z-10">
                            {/* Header with Organ and Status */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">💚</span>
                                <div>
                                  <div className="text-xs text-slate-500 font-medium">Organ Required</div>
                                  <div className="text-lg font-bold text-slate-900 capitalize">{r.organ}</div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-4 py-1.5 font-bold shadow-md">✓ Matched</span>
                                {typeof r.matchScore !== 'undefined' && (
                                  <span className="text-xs font-semibold text-emerald-700">Score: {(r.matchScore * 100).toFixed(0)}%</span>
                                )}
                              </div>
                            </div>

                            {/* Donor Info Card */}
                            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-4 mb-4">
                              <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                                  {((r.bestMatchDonor.name || "").split(' ').map((n: string) => n[0]).join('')) || 'D'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xl text-slate-900 truncate">{r.bestMatchDonor.name}</div>
                                  <div className="text-sm text-slate-600 truncate flex items-center gap-1 mt-1">
                                    <span>📧</span> {r.bestMatchDonor.email}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {r.bestMatchDonor.bloodGroup && (
                                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                                        🩸 {r.bestMatchDonor.bloodGroup}
                                      </span>
                                    )}
                                    {r.bestMatchDonor.city && (
                                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                                        📍 {r.bestMatchDonor.city}
                                      </span>
                                    )}
                                    {r.bestMatchDonor.state && (
                                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                                        {r.bestMatchDonor.state}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Match Score Section */}
                            {typeof r.bestMatchDonor.matchPercentage !== 'undefined' && (
                              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-4 mb-4 border border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-xs text-slate-600 font-medium">Compatibility Score</div>
                                    <div className="text-2xl font-bold text-emerald-600">{r.bestMatchDonor.matchPercentage}%</div>
                                  </div>
                                  <div className="text-right">
                                    {r.bestMatchDonor.matchPercentage >= 85 ? (
                                      <span className="text-2xl">🌟</span>
                                    ) : r.bestMatchDonor.matchPercentage >= 70 ? (
                                      <span className="text-2xl">⭐</span>
                                    ) : (
                                      <span className="text-2xl">✨</span>
                                    )}
                                    <div className="text-xs text-slate-600 font-medium mt-1">
                                      {r.bestMatchDonor.matchPercentage >= 85 ? 'Excellent Match' : 
                                       r.bestMatchDonor.matchPercentage >= 70 ? 'Good Match' : 
                                       'Compatible'}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-300 rounded-full h-3 overflow-hidden shadow-inner">
                                  <div 
                                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500 ease-out"
                                    style={{ width: `${r.bestMatchDonor.matchPercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {isApproved ? (
                                <Button 
                                  disabled
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg text-base cursor-not-allowed opacity-80"
                                  title="This organ match has been approved by admin"
                                >
                                  ✓ Approved by Admin
                                </Button>
                              ) : matchExists ? (
                                <Button 
                                  disabled
                                  className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-xl shadow-lg text-base cursor-not-allowed"
                                  title="Request already sent for this donor and organ"
                                >
                                  ✓ Request Sent
                                </Button>
                              ) : (
                                <Button 
                                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-bold py-3 rounded-xl shadow-lg transition-all duration-200 text-base active:scale-95"
                                  onClick={() => requestOrgan(String(r.bestMatchDonor.donorId), r.organ)}
                                  title={`Send organ request to admin for ${r.organ} verification`}
                                >
                                  ✉️ Send Request to Admin
                                </Button>
                              )}
                              <Button 
                                variant="outline"
                                className="px-4 border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl transition-all duration-200"
                                onClick={() => {
                                  const message = `🎯 Best Match Donor\n\nDonor: ${r.bestMatchDonor.name}\nOrgan: ${r.organ}\nBlood Group: ${r.bestMatchDonor.bloodGroup}\nLocation: ${r.bestMatchDonor.city}, ${r.bestMatchDonor.state}\nMatch Score: ${r.bestMatchDonor.matchPercentage}%\n\nStatus: Pending verification`;
                                  navigator.clipboard.writeText(message);
                                  alert('✅ Donor info copied to clipboard!');
                                }}
                                title="Copy donor details to clipboard"
                              >
                                📋
                              </Button>
                            </div>

                            {/* Info Footer */}
                            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 text-center">
                              <span className="block font-semibold text-emerald-700 mb-1">✓ Admin Verification Required</span>
                              After sending, admin will review compatibility and contact you within 24 hours
                            </div>
                          </div>
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Approved & Donated Section */}
                {/* Approved & Donated Section - fetches from Match collection */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">🎁 Approved & Donated Organs</h3>
                  {approvedMatches.length > 0 ? (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedMatches.map((r: any) => (
                        <li key={`approved-${r._id}`} className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg p-5 relative overflow-hidden">
                          {/* Success checkmark background */}
                          <div className="absolute top-3 right-3 text-4xl opacity-10">✓</div>
                          
                          <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-green-200">
                              <div className="font-bold text-green-900 capitalize">
                                💚 {r.organ}
                              </div>
                              <span className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1 font-bold">✓ Approved</span>
                            </div>

                            {/* Donor Info - improved to show Match donor data */}
                            {(r.bestMatchDonor || r.donorSummary) && (
                              <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-green-100">
                                <div className="font-semibold text-slate-900">{r.bestMatchDonor?.name || r.donorSummary?.name || 'Unknown Donor'}</div>
                                <div className="text-xs text-slate-600 mt-1">{r.bestMatchDonor?.email || r.donorSummary?.email || 'N/A'}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(r.bestMatchDonor?.bloodGroup || r.donorSummary?.bloodGroup) && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                      {r.bestMatchDonor?.bloodGroup || r.donorSummary?.bloodGroup}
                                    </span>
                                  )}
                                  {(r.bestMatchDonor?.city || r.donorSummary?.city) && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                      📍 {r.bestMatchDonor?.city || r.donorSummary?.city}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Match Score - improved from Match data */}
                            {(r.matchScore || r.bestMatchDonor?.matchPercentage) && (
                              <div className="bg-white rounded-xl p-3 shadow-sm border border-green-100 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs text-slate-600 font-medium">Match Score</div>
                                  <span className="font-bold text-green-700">
                                    {(r.bestMatchDonor?.matchPercentage || (r.matchScore ? (r.matchScore * 100).toFixed(0) : 0))}%
                                  </span>
                                </div>
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                    style={{ width: `${r.bestMatchDonor?.matchPercentage || (r.matchScore ? (r.matchScore * 100) : 0)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Timeline Info */}
                            <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
                              <div className="text-xs font-semibold text-green-700 mb-2">📋 Timeline</div>
                              <div className="space-y-1 text-xs text-slate-700">
                                <div>Requested: {timeAgo(r.createdAt)}</div>
                                <div>Approved: {timeAgo(r.updatedAt)}</div>
                              </div>
                            </div>

                            {/* Success Message */}
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border border-green-200">
                              <div className="text-sm font-bold text-green-900">🎉 Donation Approved!</div>
                              <div className="text-xs text-green-800 mt-1">Your organ match has been verified and approved by the admin. Contact the hospital for next steps.</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 text-center shadow-sm">
                      <div className="text-5xl mb-3">⏳</div>
                      <p className="text-slate-700 font-semibold mb-2">No Approved Matches Yet</p>
                      <p className="text-sm text-slate-600 mb-3">Approved matches will appear here once the admin verifies your matched donor from the Match collection.</p>
                      <div className="bg-white rounded-lg p-3 border border-green-200 text-left">
                        <p className="text-xs font-mono text-slate-600">
                          📊 Total Requests: <span className="font-bold text-emerald-700">{myRequests.length}</span><br/>
                          ⏳ Pending: <span className="font-bold text-yellow-700">{myRequests.filter((r: any) => r.status === 'pending').length}</span><br/>
                          ✅ Approved: <span className="font-bold text-green-700">{approvedMatches.length}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* All Requests List */}
                <h3 className="text-xl font-bold text-slate-900 mb-4">All Requests</h3>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRequests.map((r: any) => {
                  // r is PatientRequest document: { _id, organ, tests[], consent, status, matchScore, bestMatchDonor, createdAt, updatedAt }
                  const status = String(r.status || 'Pending').toLowerCase();
                  const hasBestMatch = r.bestMatchDonor && r.bestMatchDonor.name;
                  return (
                    <li key={r._id} className="rounded-2xl bg-white border shadow-sm p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">{r.organ}</div>
                        {status === 'verified' ? (
                          <span className="rounded bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Verified</span>
                        ) : status === 'donated' ? (
                          <span className="rounded bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Donated</span>
                        ) : status === 'rejected' ? (
                          <span className="rounded bg-rose-100 text-rose-700 text-xs px-2 py-0.5">Rejected</span>
                        ) : status === 'nomatch' ? (
                          <span className="rounded bg-amber-100 text-amber-700 text-xs px-2 py-0.5">No Match</span>
                        ) : status === 'matched' ? (
                          <span className="rounded bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Matched</span>
                        ) : (
                          <span className="rounded bg-amber-100 text-amber-700 text-xs px-2 py-0.5">{String(r.status || 'Pending')}</span>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        <div><strong>Submitted:</strong> {timeAgo(r.createdAt)}</div>
                        {typeof r.matchScore !== 'undefined' && r.matchScore !== null && (
                          <div className="mt-1"><strong>Match score:</strong> {r.matchScore.toFixed(3)}</div>
                        )}
                      </div>

                      {/* Best Matched Donor Details */}
                      {hasBestMatch && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                          <div className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                            <span className="text-sm">✅ Best Match Found</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700"><strong>Name:</strong></span>
                              <span className="font-medium text-slate-900">{r.bestMatchDonor.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700"><strong>Email:</strong></span>
                              <span className="font-medium text-slate-900 truncate">{r.bestMatchDonor.email}</span>
                            </div>
                            {r.bestMatchDonor.bloodGroup && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700"><strong>Blood Group:</strong></span>
                                <span className="font-medium text-slate-900 bg-red-100 text-red-700 px-2 py-0.5 rounded">{r.bestMatchDonor.bloodGroup}</span>
                              </div>
                            )}
                            {r.bestMatchDonor.city && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700"><strong>Location:</strong></span>
                                <span className="font-medium text-slate-900">{r.bestMatchDonor.city}{r.bestMatchDonor.state ? `, ${r.bestMatchDonor.state}` : ''}</span>
                              </div>
                            )}
                            {typeof r.bestMatchDonor.matchPercentage !== 'undefined' && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700"><strong>Match:</strong></span>
                                <span className="font-bold text-emerald-700">{r.bestMatchDonor.matchPercentage}%</span>
                              </div>
                            )}
                          </div>
                          <Button className="w-full mt-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs" onClick={() => requestOrgan(String(r.bestMatchDonor.donorId), r.organ)}>
                            Send Request to Donor
                          </Button>
                        </div>
                      )}

                      <div className="mt-3 text-sm text-slate-700">
                        <div className="font-semibold mb-1">Submitted tests</div>
                        <ul className="text-xs space-y-1">
                          {(Array.isArray(r.tests) ? r.tests : []).map((t: any, idx: number) => (
                            <li key={idx} className="border rounded-md p-2 bg-white"> 
                              <div className="text-xs font-medium">{t.label || `Test ${idx+1}`}</div>
                              <div className="text-xs text-slate-600">{t.value || '—'}</div>
                              {t.fileUrl && (
                                <div className="mt-1 text-xs">
                                  <a className="text-emerald-700 underline" href={t.fileUrl.startsWith('http') ? t.fileUrl : `${API_URL.replace(/\/+$/, '')}${t.fileUrl}`} target="_blank" rel="noreferrer">View file</a>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
              </>
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
      <section id="how" className="py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">🚀 How It Works</h2>
            <p className="text-slate-600 text-lg">Simple, safe, and transparent process</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500" />
              <div className="relative rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 p-8">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border-2 border-emerald-200 text-lg font-bold">1️⃣</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Register Profile</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Create your patient profile and submit your medical details, test results, and organ requirements securely.</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative mt-6 md:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500" />
              <div className="relative rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-8">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center mb-4 border-2 border-blue-200 text-lg font-bold">2️⃣</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">AI Matching</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Our advanced ML system analyzes thousands of verified donors to find the most compatible matches for your organ.</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative mt-6 md:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500" />
              <div className="relative rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-lg hover:border-cyan-200 transition-all duration-300 p-8">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 flex items-center justify-center mb-4 border-2 border-cyan-200 text-lg font-bold">3️⃣</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Connection</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Connect with matched donors through verified hospitals for safe, coordinated transplant arrangements.</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-cyan-600 to-rose-600 rounded" />
              </div>
            </div>
          </div>

          {/* Timeline connecting line - visible on desktop */}
          <div className="hidden md:block mt-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded" />
              <div className="text-slate-400">→</div>
              <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded" />
              <div className="text-slate-400">→</div>
              <div className="flex-1 h-1 bg-gradient-to-r from-cyan-600 to-rose-600 rounded" />
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
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">❓ Frequently Asked Questions</h2>
            <p className="text-slate-600">Get answers to common questions about Ram Setu</p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/50 shadow-sm overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1" className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 transition duration-200 text-left">
                  <span className="font-semibold text-slate-900">How do you verify donors?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  We validate donor identity and medical intent through comprehensive documentation review and partnership verification with accredited hospitals. Each donor submission is manually reviewed before listing.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q2" className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 transition duration-200 text-left">
                  <span className="font-semibold text-slate-900">Is my personal data safe with Ram Setu?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  Yes. We apply industry-standard encryption, strict access controls, and only share data with consented medical partners when necessary for matching and coordination. Your privacy is our top priority.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q3" className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 transition duration-200 text-left">
                  <span className="font-semibold text-slate-900">How long does it take to find a match?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  Timeline varies by organ, geography, blood group, and medical compatibility. Keep your profile updated and use filters to improve visibility. Our AI system continuously matches new donors to your profile.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q4" className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 transition duration-200 text-left">
                  <span className="font-semibold text-slate-900">What organs can I apply for?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  Ram Setu currently matches Kidney, Heart, Liver, and Cornea. Each organ has different matching criteria and medical requirements. Select the organ you need when creating your request.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q5" className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 transition duration-200 text-left">
                  <span className="font-semibold text-slate-900">How does the AI matching work?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">
                  Our ML models analyze medical tests, blood compatibility, organ condition, and geographic proximity to rank donors by compatibility. Scores help hospitals prioritize matches for transplant coordination.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-600" />
            
            {/* Animated blur overlay */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            
            {/* Content */}
            <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Find Your Match?</h2>
                <p className="text-white/90 text-lg mb-2">Start your journey to life-saving care with Ram Setu's AI-powered matching system.</p>
                <ul className="space-y-2 text-sm text-white/80 mt-4">
                  <li className="flex items-center gap-2">✓ <span>Quick application process</span></li>
                  <li className="flex items-center gap-2">✓ <span>AI-powered donor matching</span></li>
                  <li className="flex items-center gap-2">✓ <span>Secure hospital coordination</span></li>
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button 
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-slate-50 font-bold shadow-lg px-8"
                  onClick={() => setShowOrganModal(true)}
                >
                  🎯 Apply for Organ
                </Button>
                <Link to="/patient-profile-form" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="border-white text-white hover:bg-white/20 w-full font-bold"
                  >
                    📋 Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Organ Selection Modal */}
          {showOrganModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center relative border border-emerald-100">
                <img src="/logo.png" alt="Ram Setu logo" className="h-16 w-16 object-contain mb-2" />
                <h3 className="text-2xl font-extrabold mb-2 text-emerald-700 text-center">Select Organ to Apply</h3>
                <p className="text-slate-500 text-sm mb-4 text-center">Choose the organ you need and continue to the application form.</p>
                <select
                  className="w-full mb-6 p-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50 text-emerald-900 font-semibold"
                  value={selectedOrgan}
                  onChange={e => setSelectedOrgan(e.target.value)}
                >
                  {organOptions.map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <div className="flex gap-3 w-full mt-2">
                  <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => {
                    if(!selectedOrgan) return alert('Please select an organ');
                    setShowOrganModal(false);
                    navigate(`/common-donation-form?organ=${encodeURIComponent(selectedOrgan)}&role=patient`);
                  }}>Continue</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowOrganModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
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
