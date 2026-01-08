import React, { useEffect, useMemo, useState } from 'react';
import { 
  SearchIcon, 
  TrendingIcon, 
  UserGroupIcon, 
  HeartIcon,
  RefreshIcon,
  DownloadIcon,
  CheckIcon,
  CloseIcon
} from './components/icons.jsx';
import {
  normalizeId,
  formatDateTime,
  formatDate,
  calcAge,
  getBloodGroupColor,
  getStatusColor,
  truncate,
  toCSV,
  downloadCSV
} from './utils/dashboardHelpers.js';
import StatCard from './components/StatCard.jsx';
import Modal from './components/Modal.jsx';
import Alert from './components/Alert.jsx';
import SearchBar from './components/SearchBar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function Dashboard({ 
  donors, 
  patients, 
  loadingDonors, 
  loadingPatients, 
  donorError, 
  patientError, 
  onRefreshDonors, 
  onRefreshPatients,
  onLogout
}) {
  // Tab state for better navigation
  const [activeTab, setActiveTab] = useState('overview');
  // Settings
  const [apiBase, setApiBase] = useState(() => sessionStorage.getItem('apiBase') || 'http://localhost:5000');
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken') || '');
  const [showSettings, setShowSettings] = useState(false);
  // Optional admin-backend login helper
  const [adminAuthUrl, setAdminAuthUrl] = useState(() => sessionStorage.getItem('adminAuthUrl') || 'http://localhost:5001');
  const [adminEmail, setAdminEmail] = useState('teamtechzy@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Matasree');

  // UI state
  const [query, setQuery] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorDetails, setDonorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [donorRequests, setDonorRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [flash, setFlash] = useState({ type: '', message: '' });
  const [statusModal, setStatusModal] = useState({ open: false, requestId: null, targetStatus: null, remarks: '', donationDetails: '' });
  const [expandedReq, setExpandedReq] = useState({});

  // Patient detail modal state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  const [patientDetailsError, setPatientDetailsError] = useState('');
  const [editingPatient, setEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({});

  // Matches
  const [matchRequests, setMatchRequests] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState('');
  const [savingMatchId, setSavingMatchId] = useState(null);
  const [matchQuery, setMatchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organFilter, setOrganFilter] = useState('all');

  // New request modal
  const [newRequestModal, setNewRequestModal] = useState({ open: false });
  const [newRequestForm, setNewRequestForm] = useState({
    donor: '',
    organ: 'Kidney',
    status: 'Pending',
    consent: true,
    tests: []
  });
  const [creatingRequest, setCreatingRequest] = useState(false);

  // Persist settings
  useEffect(() => { sessionStorage.setItem('apiBase', apiBase); }, [apiBase]);
  useEffect(() => { if (adminToken) sessionStorage.setItem('adminToken', adminToken); }, [adminToken]);
  useEffect(() => { if (adminAuthUrl) sessionStorage.setItem('adminAuthUrl', adminAuthUrl); }, [adminAuthUrl]);

  // Decode token role to help diagnose 401s
  const tokenRole = useMemo(() => {
    try {
      if (!adminToken) return '';
      const [, payload] = adminToken.split('.')
      if (!payload) return '';
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return json?.role || '';
    } catch { return ''; }
  }, [adminToken]);

  const withAuthHeaders = (extra={}) => ({ ...(adminToken?{Authorization:`Bearer ${adminToken}`}:{}), ...extra });
  const buildUrl = (path, opts={}) => {
    const { includeToken = true, noCache = false } = opts || {};
    const u = new URL(path.replace(/^\//,''), apiBase.endsWith('/')?apiBase:apiBase+'/');
    if (includeToken && adminToken) u.searchParams.set('token', adminToken);
    if (noCache) u.searchParams.set('_', Date.now().toString());
    return u.toString();
  };

  // CSV helpers
  const isBinaryLike = (v) => v && typeof v === 'object' && (
    (v.data && (v.contentType || typeof v.data === 'object')) ||
    (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && (v[0].data || v[0].buffer))
  );
  const flatten = (obj, prefix = '') => {
    const out = {};
    if (!obj || typeof obj !== 'object') return out;
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v === null || v === undefined) { out[key] = ''; continue; }
      if (isBinaryLike(v)) { continue; }
      if (typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(out, flatten(v, key));
      } else if (Array.isArray(v)) {
        out[key] = v.map(x => (typeof x === 'object' ? JSON.stringify(x) : x)).join('; ');
      } else {
        out[key] = String(v);
      }
    }
    return out;
  };
  const toCSV = (rows) => {
    const flatRows = rows.map(r => flatten(r));
    const headers = Array.from(flatRows.reduce((set, r) => {
      Object.keys(r).forEach(k => set.add(k));
      return set;
    }, new Set()));
    const esc = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const lines = [];
    lines.push(headers.map(esc).join(','));
    for (const r of flatRows) {
      lines.push(headers.map(h => esc(h in r ? r[h] : '')).join(','));
    }
    return lines.join('\r\n');
  };
  const downloadCSV = (filename, text) => {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const exportAllDonorsCSV = () => {
    if (!Array.isArray(donors) || donors.length === 0) { setFlash({type:'error',message:'No donors to export.'}); return; }
    const csv = toCSV(donors);
    downloadCSV(`donors-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };
  const exportAllPatientsCSV = () => {
    if (!Array.isArray(patients) || patients.length === 0) { setFlash({type:'error',message:'No patients to export.'}); return; }
    const csv = toCSV(patients);
    downloadCSV(`patients-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };
  const exportSelectedDonorCSV = () => {
    const record = donorDetails || selectedDonor; if (!record) { setFlash({type:'error',message:'No donor selected.'}); return; }
    const csv = toCSV([record]);
    downloadCSV(`donor-${normalizeId(record._id||record.userId)||'record'}.csv`, csv);
  };
  const exportSelectedPatientCSV = () => {
    const record = patientDetails || selectedPatient; if (!record) { setFlash({type:'error',message:'No patient selected.'}); return; }
    const csv = toCSV([record]);
    downloadCSV(`patient-${normalizeId(record._id||record.userId)||'record'}.csv`, csv);
  };

  // Login to admin-backend to mint an admin token (dev helper)
  const loginAdmin = async () => {
    try {
      setFlash({ type: '', message: '' });
      const res = await fetch(`${adminAuthUrl.replace(/\/$/, '')}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok || !data?.token) {
        throw new Error(data?.message || 'Login failed');
      }
      setAdminToken(data.token);
      setShowSettings(false);
      setFlash({ type: 'success', message: 'Admin token set from login.' });
      // refresh data
      fetchMatchRequests();
      if (selectedDonor) fetchDonorRequests(selectedDonor);
    } catch (e) {
      setFlash({ type: 'error', message: `Admin login failed: ${e?.message || e}` });
      setTimeout(() => setFlash({ type: '', message: '' }), 3000);
    }
  };

  const filteredDonors = useMemo(() => {
    if (!Array.isArray(donors)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return donors;
    return donors.filter(d => ((d.name||d.fullName||'').toLowerCase().includes(q)) || ((d.email||'').toLowerCase().includes(q)) || ((d.bloodGroup||'').toLowerCase().includes(q)));
  }, [donors, query]);

  // Donor details and requests
  const fetchDonorRequests = async (donorInfo) => {
    setLoadingRequests(true); setDonorRequests([]);
    try {
      const donorId = normalizeId(donorInfo?.userId ?? donorInfo?._id ?? selectedDonor?.userId ?? selectedDonor?._id);
      if (!donorId) throw new Error('Missing donor id');
      const res = await fetch(buildUrl(`/api/donation-request/by-donor/${donorId}`, { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
      if (res.status === 304) { return; }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(()=>null);
      setDonorRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      const m = String(err?.message||err||'');
      if (m.includes('401')||m.includes('403')) setDetailsError('Unable to fetch organ donation requests. Please log in again as admin.');
      else setDetailsError('Unable to fetch organ donation requests.');
    } finally { setLoadingRequests(false);} }

  const handleDonorClick = async (donor) => {
    setSelectedDonor(donor); setLoadingDetails(true); setDetailsError(''); setDonorDetails(null); setDonorRequests([]);
    try {
      const res = await fetch(buildUrl(`/api/donor/by-id/${donor._id}`, { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
      if (res.status === 304) { await fetchDonorRequests(donor); return; }
      if (!res.ok) throw new Error('Failed to fetch donor details');
      const data = await res.json().catch(()=>null); setDonorDetails(data||{}); await fetchDonorRequests(data||donor);
    } catch (e) { setDetailsError('Unable to fetch donor details.'); } finally { setLoadingDetails(false); }
  };

  // Matches
  const fetchMatchRequests = async () => {
    setLoadingMatches(true); setMatchesError('');
    try {
      const res = await fetch(buildUrl('/api/match/all', { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
      if (res.status === 304) { return; }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(()=>null);
      setMatchRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = String(e?.message||e||'');
      setMatchesError(msg.includes('401')||msg.includes('403') ? 'Auth failed. Set admin token in Settings and retry.' : 'Unable to load match requests.');
    } finally { setLoadingMatches(false); }
  };
  useEffect(() => { fetchMatchRequests(); }, []);

  const approveMatch = async (m) => {
    setSavingMatchId(m._id); setFlash({type:'',message:''});
    try {
      const res = await fetch(buildUrl('/api/match/approve'), { method:'POST', headers: withAuthHeaders({'Content-Type':'application/json'}), body: JSON.stringify({ patientId:m.patient, donorId:m.donor, organ:m.organ })});
      if (!res.ok) throw new Error(await res.text());
      setMatchRequests(prev=>prev.map(x=>x._id===m._id?{...x,status:'approved'}:x)); setFlash({type:'success',message:'Match approved.'});
    } catch { setFlash({type:'error',message:'Failed to approve match.'}); }
    finally { setSavingMatchId(null); setTimeout(()=>setFlash({type:'',message:''}),2500); }
  };
  const rejectMatch = async (m) => {
    setSavingMatchId(m._id); setFlash({type:'',message:''});
    try {
      const res = await fetch(buildUrl('/api/match/reject'), { method:'POST', headers: withAuthHeaders({'Content-Type':'application/json'}), body: JSON.stringify({ matchId:m._id })});
      if (!res.ok) throw new Error(await res.text());
      setMatchRequests(prev=>prev.map(x=>x._id===m._id?{...x,status:'rejected'}:x)); setFlash({type:'success',message:'Match rejected.'});
    } catch { setFlash({type:'error',message:'Failed to reject match.'}); }
    finally { setSavingMatchId(null); setTimeout(()=>setFlash({type:'',message:''}),2500); }
  };

  const matchStats = useMemo(()=>{
    const s={total:matchRequests.length,pending:0,approved:0,rejected:0};
    for(const m of matchRequests){ if(m.status==='approved') s.approved++; else if(m.status==='rejected') s.rejected++; else s.pending++; }
    return s;
  },[matchRequests]);
  const filteredMatches = useMemo(()=>{
    const q = matchQuery.trim().toLowerCase();
    return matchRequests.filter(m=>{
      if(statusFilter!=='all' && String(m.status||'pending').toLowerCase()!==statusFilter) return false;
      if(organFilter!=='all' && String(m.organ||'').toLowerCase()!==organFilter.toLowerCase()) return false;
      if(!q) return true;
      const donor = donors?.find(d=>normalizeId(d.userId)===normalizeId(m.donor));
      const patient = patients?.find(p=>normalizeId(p.userId)===normalizeId(m.patient)||normalizeId(p._id)===normalizeId(m.patient));
      const dn=(donor?.name||donor?.fullName||donor?.email||'').toLowerCase();
      const pn=(patient?.name||patient?.fullName||patient?.email||'').toLowerCase();
      return dn.includes(q)||pn.includes(q)||String(m.organ||'').toLowerCase().includes(q);
    });
  },[matchRequests,statusFilter,organFilter,matchQuery,donors,patients]);

  // Modal + status actions
  const closeModal = () => { setSelectedDonor(null); setDonorDetails(null); setDetailsError(''); setDonorRequests([]); };
  const openStatusModal = (requestId, targetStatus) => setStatusModal({ open:true, requestId, targetStatus, remarks: targetStatus==='Verified'?'Verified by admin': (targetStatus==='Donated'?'Marked as donated by admin':'Rejected by admin'), donationDetails: '' });
  const closeStatusModal = () => setStatusModal({ open:false, requestId:null, targetStatus:null, remarks:'' });
  const handleSaveStatus = async () => {
    const { requestId, targetStatus, remarks, donationDetails } = statusModal; if(!requestId||!targetStatus) return;
    setVerifyingId(requestId); setFlash({type:'',message:''});
    try{
      const payload = { status: targetStatus, adminRemarks: remarks||undefined };
      if (targetStatus === 'Donated' && donationDetails && String(donationDetails).trim()) {
        payload.donationDetails = donationDetails;
      }
      const res = await fetch(buildUrl(`/api/donation-request/${requestId}/status`), { method:'PUT', headers: withAuthHeaders({'Content-Type':'application/json'}), body: JSON.stringify(payload) });
      if(!res.ok){ const t=await res.text(); throw new Error(t||'Failed to update status'); }
      setDonorRequests(prev=>prev.map(r=>r._id===requestId?{...r,status:targetStatus,adminRemarks:remarks, ...(targetStatus==='Donated'?{donatedAt:new Date().toISOString()}: {})}:r));
      setFlash({type:'success',message:`Status updated to ${targetStatus}.`}); closeStatusModal();
    }catch(err){ setFlash({type:'error',message:'Failed to update status. Please try again.'}); }
    finally{ setVerifyingId(null); setTimeout(()=>setFlash({type:'',message:''}),3000); }
  };
  const handleVerifyRequest = (requestId)=>openStatusModal(requestId,'Verified');
  const handleRejectRequest = (requestId)=>openStatusModal(requestId,'Rejected');

  // Patients: detail fetch
  const handlePatientClick = async (p) => {
    try {
      setSelectedPatient(p);
      setPatientDetails(null);
      setPatientDetailsError('');
      setLoadingPatientDetails(true);
      const userId = normalizeId(p?.userId || p?._id);
      if (!userId) throw new Error('Missing user id');
      // Try normalized details endpoint first; then patient record; then user
      let data = null;
      try {
        const r0 = await fetch(buildUrl(`/api/patient/details/${userId}`, { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
        if (r0.ok) data = await r0.json().catch(()=>null);
      } catch {}
      if (!data) {
        try {
          const r1 = await fetch(buildUrl(`/api/patient/by-user/${userId}`, { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
          if (r1.ok) data = await r1.json().catch(()=>null);
        } catch {}
      }
      if (!data) {
        const r2 = await fetch(buildUrl(`/api/user/${userId}`, { noCache: true }), { headers: withAuthHeaders(), cache: 'no-store' });
        if (r2.ok) data = await r2.json().catch(()=>null);
        else throw new Error('Failed to fetch patient details');
      }
      setPatientDetails(data || null);
      setPatientForm({
        fullName: data?.name || data?.patientProfile?.fullName || data?.fullName || p?.name || '',
        email: data?.email || p?.email || '',
        bloodGroup: data?.bloodGroup || data?.patientProfile?.bloodGroup || p?.bloodGroup || '',
        contact: data?.phone || data?.contact || data?.patientProfile?.contact || p?.contact || '',
        gender: data?.gender || data?.patientProfile?.gender || '',
        dob: data?.dob || data?.patientProfile?.dob || '',
        city: data?.city || data?.patientProfile?.city || p?.city || '',
        state: data?.state || data?.patientProfile?.state || p?.state || '',
        country: data?.country || data?.patientProfile?.country || p?.country || '',
        emergencyContact: data?.emergencyContact || data?.patientProfile?.emergencyContact || '',
        kinConsent: (data?.kinConsent ?? data?.patientProfile?.kinConsent) ?? false,
        regId: data?.regId || data?.patientProfile?.regId || '',
        regDate: data?.regDate || data?.patientProfile?.regDate || '',
        regPlace: data?.regPlace || data?.patientProfile?.regPlace || '',
        address: data?.address || data?.patientProfile?.address || '',
      });
    } catch (e) {
      setPatientDetailsError('Unable to fetch patient details.');
    } finally {
      setLoadingPatientDetails(false);
    }
  };
  const closePatientModal = () => { setSelectedPatient(null); setPatientDetails(null); setPatientDetailsError(''); };

  const savePatientForm = async () => {
    if (!selectedPatient) return;
    try {
      const userId = normalizeId(selectedPatient?.userId || selectedPatient?._id);
      setSavingMatchId('patient');
      const res = await fetch(buildUrl(`/api/patient/admin/${userId}`, { noCache: true }), {
        method: 'PUT',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(patientForm)
      });
      if (!res.ok) throw new Error(await res.text());
      setFlash({ type: 'success', message: 'Patient profile saved.' });
      setEditingPatient(false);
      // Refresh details and patient list
      await handlePatientClick(selectedPatient);
      if (typeof onRefreshPatients === 'function') onRefreshPatients();
    } catch (e) {
      setFlash({ type: 'error', message: 'Failed to save patient profile. Ensure admin token is set in Settings.' });
    } finally {
      setSavingMatchId(null);
      setTimeout(() => setFlash({ type: '', message: '' }), 2500);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      {/* Ambient animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse [animation-duration:5s]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-pulse [animation-duration:6s]" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40 bg-slate-900/70 border-b border-slate-800 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          {/* Logo and branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30"></div>
              <img src="/logo.png" alt="Ram Setu" className="relative h-10 w-10 rounded-xl ring-2 ring-cyan-400/50" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Ram Setu Admin</h1>
              <p className="text-xs text-slate-400">Organ Donation Network</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:flex">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search donors..."
              loading={loadingDonors}
            />
          </div>

          {/* User controls */}
          <div className="flex items-center gap-3">
            <button 
              className="hidden sm:inline rounded-lg px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium transition shadow-lg"
              onClick={() => setNewRequestModal({ open: true })}
              title="Create a new organ donation request"
            >
              ➕ New Request
            </button>
            <button 
              className="hidden sm:inline rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-300 transition"
              onClick={() => setShowSettings(s => !s)}
            >
              ⚙️ Settings
            </button>
            <button 
              className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-300 transition"
              onClick={onLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden border-t border-slate-800 px-6 py-3 bg-slate-900/50">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search donors..."
            loading={loadingDonors}
          />
        </div>
        {showSettings && (
          <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Settings</h3>
              
              {/* API Configuration */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">API Base URL</label>
                    <input 
                      value={apiBase} 
                      onChange={(e) => setApiBase(e.target.value)} 
                      className="w-full rounded-lg bg-slate-800/70 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition" 
                      placeholder="http://localhost:5000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Admin Token (JWT)</label>
                    <input 
                      value={adminToken} 
                      onChange={(e) => setAdminToken(e.target.value)} 
                      className="w-full rounded-lg bg-slate-800/70 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition" 
                      placeholder="Paste JWT token here" 
                    />
                  </div>
                </div>

                {adminToken && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${tokenRole === 'admin' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-orange-500/10 border-orange-500/30 text-orange-300'}`}>
                    Token role detected: <span className="font-semibold">{tokenRole || 'unknown'}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    className="rounded-lg px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition shadow-lg"
                    onClick={() => { fetchMatchRequests(); if (selectedDonor) fetchDonorRequests(selectedDonor); }}
                  >
                    ✓ Apply Changes
                  </button>
                  <button 
                    className="rounded-lg px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition"
                    onClick={() => setShowSettings(false)}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Quick Admin Login */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-4">Quick Admin Login (Dev Helper)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Auth Base URL</label>
                    <input 
                      value={adminAuthUrl} 
                      onChange={(e) => setAdminAuthUrl(e.target.value)} 
                      className="w-full rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition" 
                      placeholder="http://localhost:5001" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                    <input 
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                      className="w-full rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                    <input 
                      type="password" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)} 
                      className="w-full rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition" 
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 font-medium hover:from-purple-500 hover:to-pink-500 transition shadow-lg"
                      onClick={loginAdmin}
                    >
                      🔐 Login
                    </button>
                  </div>
                  <div className="flex items-end text-xs text-slate-400">
                    Mints a short-lived token for development
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Flash messages */}
      {flash.message && (
        <Alert
          type={flash.type === 'success' ? 'success' : 'error'}
          message={flash.message}
          onClose={() => setFlash({ type: '', message: '' })}
          autoHide={true}
          duration={3000}
        />
      )}

      {/* Main content grid */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded bg-gradient-to-b from-cyan-400 to-blue-600"></span>
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={UserGroupIcon}
              label="Total Donors"
              value={Array.isArray(donors) ? donors.length : 0}
              loading={loadingDonors}
              color="blue"
            />
            <StatCard 
              icon={HeartIcon}
              label="Total Patients"
              value={Array.isArray(patients) ? patients.length : 0}
              loading={loadingPatients}
              color="pink"
            />
            <StatCard 
              icon={TrendingIcon}
              label="Match Requests"
              value={matchRequests.length}
              loading={loadingMatches}
              color="purple"
            />
            <StatCard 
              icon={CheckIcon}
              label="Approved Matches"
              value={matchStats.approved}
              loading={loadingMatches}
              color="green"
            />
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Donors & Patients', icon: UserGroupIcon },
            { id: 'matches', label: '💞 Matches', icon: HeartIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Donors List */}
        <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-100">
              <span className="w-2 h-8 rounded bg-gradient-to-b from-emerald-400 to-cyan-500"></span>
              Donors
            </h3>
            <div className="flex gap-2">
              <button 
                className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
                onClick={onRefreshDonors}
              >
                🔄 Refresh
              </button>
              <button 
                className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
                onClick={exportAllDonorsCSV}
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {loadingDonors ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : donorError ? (
            <Alert type="error" message={donorError} />
          ) : filteredDonors.length > 0 ? (
            <ul className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {filteredDonors.map((donor) => (
                <li
                  key={donor._id}
                  onClick={() => handleDonorClick(donor)}
                  className="group cursor-pointer rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 p-4 transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-400/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                        {donor.name || donor.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{donor.email || '—'}</div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-sm font-semibold text-cyan-300">
                      {donor.bloodGroup || 'BG'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No donors found</p>
            </div>
          )}
        </section>
        {/* Donor Profile Panel */}
        <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 shadow-xl backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-100">
              <span className="w-2 h-8 rounded bg-gradient-to-b from-purple-400 to-pink-500"></span>
              Donor Profile
            </h3>
            {selectedDonor && (
              <button 
                className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
                onClick={exportSelectedDonorCSV}
              >
                📥 Export CSV
              </button>
            )}
          </div>

          {!selectedDonor ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <span className="text-4xl mb-3">👤</span>
              <p>Select a donor to view profile</p>
              <p className="text-sm mt-1">and donation requests</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {/* Info card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                {loadingDetails ? (
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800" />
                  </div>
                ) : detailsError ? (
                  <div className="rounded-md bg-rose-500/10 p-3 text-rose-300 ring-1 ring-rose-500/30">{detailsError}</div>
                ) : donorDetails ? (
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0"><span className="text-slate-500">Name:</span> <span className="break-words">{donorDetails.fullName || donorDetails.name || 'N/A'}</span></div>
                      <div className="min-w-0"><span className="text-slate-500">Email:</span> <span className="break-all">{donorDetails.email || 'N/A'}</span></div>
                      <div><span className="text-slate-500">Phone:</span> {donorDetails.phone || donorDetails.mobile || donorDetails.contact || 'N/A'}</div>
                      <div><span className="text-slate-500">Blood Group:</span> {donorDetails.bloodGroup || 'N/A'}</div>
                      <div><span className="text-slate-500">Gender:</span> {donorDetails.gender || 'N/A'}</div>
                      <div><span className="text-slate-500">DOB:</span> {donorDetails.dob || 'N/A'} {donorDetails.dob ? `(${calcAge(donorDetails.dob)})` : ''}</div>
                      <div><span className="text-slate-500">Height:</span> {donorDetails.height || '—'}</div>
                      <div><span className="text-slate-500">Weight:</span> {donorDetails.weight || '—'}</div>
                      <div><span className="text-slate-500">BMI:</span> {donorDetails.bmi || '—'}</div>
                      <div><span className="text-slate-500">Blood Pressure:</span> {donorDetails.bloodPressure || '—'}</div>
                      <div><span className="text-slate-500">City:</span> {donorDetails.city || '—'}</div>
                      <div><span className="text-slate-500">State:</span> {donorDetails.state || '—'}</div>
                      <div><span className="text-slate-500">Country:</span> {donorDetails.country || '—'}</div>
                      <div><span className="text-slate-500">Emergency Contact:</span> {donorDetails.emergencyContact || '—'}</div>
                      <div><span className="text-slate-500">Consent:</span> {(donorDetails.consent || donorDetails.consentStatus) ? 'Yes' : 'No'}</div>
                      <div><span className="text-slate-500">Consent Date:</span> {donorDetails.consentDate || '—'}</div>
                      <div><span className="text-slate-500">Kin Consent:</span> {donorDetails.kinConsent ? 'Yes' : 'No'}</div>
                      <div><span className="text-slate-500">Reg. ID:</span> {donorDetails.regId || '—'}</div>
                      <div><span className="text-slate-500">Reg. Date:</span> {donorDetails.regDate || '—'}</div>
                      <div><span className="text-slate-500">Reg. Place:</span> {donorDetails.regPlace || '—'}</div>
                      <div><span className="text-slate-500">Donor Type:</span> {donorDetails.donorType || '—'}</div>
                      <div><span className="text-slate-500">Status:</span> {donorDetails.status || '—'}</div>
                      <div className="col-span-2"><span className="text-slate-500">Address:</span> {donorDetails.address || 'N/A'}</div>
                    </div>

                    {(donorDetails.medicalHistory || donorDetails.allergies || donorDetails.diseases || donorDetails.pastSurgeries || donorDetails.organConditions || donorDetails.lifestyle) && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                        <div className="mb-2 text-xs font-semibold text-slate-400">Health Summary</div>
                        {donorDetails.medicalHistory && <div><span className="text-slate-500">History:</span> {donorDetails.medicalHistory}</div>}
                        {donorDetails.allergies && <div><span className="text-slate-500">Allergies:</span> {donorDetails.allergies}</div>}
                        {donorDetails.diseases && <div><span className="text-slate-500">Diseases:</span> {donorDetails.diseases}</div>}
                        {donorDetails.pastSurgeries && <div><span className="text-slate-500">Past Surgeries:</span> {donorDetails.pastSurgeries}</div>}
                        {donorDetails.organConditions && <div><span className="text-slate-500">Organ Conditions:</span> {donorDetails.organConditions}</div>}
                        {donorDetails.lifestyle && <div><span className="text-slate-500">Lifestyle:</span> {donorDetails.lifestyle}</div>}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Requests list */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-200">Organ Donation Requests</div>
                {loadingRequests ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded bg-slate-800" />
                    ))}
                  </div>
                ) : donorRequests.length === 0 ? (
                  <p className="text-sm text-slate-400">No organ requests found.</p>
                ) : (
                  <ul className="space-y-3">
                    {donorRequests.map((req) => (
                      <li key={req._id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                        <div className="flex w-full flex-col flex-wrap gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 break-words text-sm text-slate-300">
                            <div><b>Organ:</b> {req.organ}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span><b>Status:</b></span>
                              {req.status === 'Verified' ? (
                                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30">Verified</span>
                              ) : req.status === 'Donated' ? (
                                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300 ring-1 ring-cyan-500/30">Donated</span>
                              ) : req.status === 'Rejected' ? (
                                <span className="rounded bg-rose-500/15 px-2 py-0.5 text-rose-300 ring-1 ring-rose-500/30">Rejected</span>
                              ) : (
                                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-300 ring-1 ring-amber-500/30">Pending</span>
                              )}
                              <span className="text-xs text-slate-500">Created: {formatDateTime(req.createdAt)}</span>
                              <span className="text-xs text-slate-500">Updated: {formatDateTime(req.updatedAt)}</span>
                              <span className="text-xs text-slate-500">Consent: {req.consent ? 'Yes' : 'No'}</span>
                            </div>
                            {req.adminRemarks && <div className="break-words"><b>Remarks:</b> {req.adminRemarks}</div>}
                          </div>
                          <div className="flex w-full flex-wrap items-center gap-2 justify-start md:w-auto md:justify-end">
                            <button
                              className="rounded border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800"
                              onClick={() => setExpandedReq((m) => ({ ...m, [req._id]: !m[req._id] }))}
                            >
                              {expandedReq[req._id] ? 'Hide details' : 'Details'}
                            </button>
                            {req.status !== 'Verified' && req.status !== 'Donated' && (
                              <button
                                className="rounded bg-emerald-600 px-4 py-1 text-white transition hover:bg-emerald-500 disabled:opacity-60"
                                onClick={() => handleVerifyRequest(req._id)}
                                disabled={verifyingId === req._id}
                              >
                                {verifyingId === req._id ? 'Saving…' : 'Verify'}
                              </button>
                            )}
                            {req.status !== 'Rejected' && (
                              <button
                                className="rounded bg-rose-600 px-4 py-1 text-white transition hover:bg-rose-500 disabled:opacity-60"
                                onClick={() => handleRejectRequest(req._id)}
                                disabled={verifyingId === req._id}
                              >
                                {verifyingId === req._id ? 'Saving…' : 'Reject'}
                              </button>
                            )}
                          </div>
                        </div>

                        {expandedReq[req._id] && (
                          <div className="mt-3 rounded-md border border-slate-800 bg-slate-950/40 p-3">
                            <div className="mb-2 text-xs font-semibold text-slate-400">Test Reports</div>
                            {Array.isArray(req.tests) && req.tests.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                  <thead className="text-slate-400">
                                    <tr>
                                      <th className="px-2 py-1">Label</th>
                                      <th className="px-2 py-1">Value</th>
                                      <th className="px-2 py-1">File</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {req.tests.map((t, i) => (
                                      <tr key={i} className="border-t border-slate-800">
                                        <td className="px-2 py-1">{t.label || `Test ${i+1}`}</td>
                                        <td className="px-2 py-1">{t.value || '—'}</td>
                                        <td className="px-2 py-1">
                                          {t.fileUrl ? (
                                            <a
                                              className="text-cyan-300 hover:underline"
                                              href={`${(apiBase || '').replace(/\/$/, '')}${t.fileUrl}`}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              View file
                                            </a>
                                          ) : (
                                            <span className="text-slate-500">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No uploaded reports.</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Patients List */}
        <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-100">
              <span className="w-2 h-8 rounded bg-gradient-to-b from-cyan-400 to-blue-500"></span>
              Patients
            </h3>
            <div className="flex gap-2">
              <button 
                className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
                onClick={onRefreshPatients}
              >
                🔄 Refresh
              </button>
              <button 
                className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
                onClick={exportAllPatientsCSV}
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {loadingPatients ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : patientError ? (
            <Alert type="error" message={patientError} />
          ) : patients && patients.length > 0 ? (
            <ul className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {patients.map((p) => (
                <li 
                  key={p._id} 
                  onClick={() => handlePatientClick(p)}
                  className="group cursor-pointer rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 p-4 transition hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-400/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                        {p.name || p.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{p.email || '—'}</div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 px-3 py-1 text-sm font-semibold text-pink-300">
                      {p.bloodGroup || 'BG'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No patients found</p>
            </div>
          )}
        </section>
        </div>
        ) : (
        <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-100">
              <span className="w-2 h-8 rounded bg-gradient-to-b from-amber-400 to-orange-500"></span>
              Match Requests
            </h3>
            <button 
              className="rounded-lg px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition text-sm"
              onClick={fetchMatchRequests}
            >
              🔄 Refresh
            </button>
          </div>
          {loadingMatches ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (<div key={i} className="h-14 animate-pulse rounded-xl bg-slate-800/60" />))}
            </div>
          ) : matchesError ? (
            <div className="flex items-center justify-between rounded-xl bg-rose-500/10 p-3 text-rose-300 ring-1 ring-rose-500/30">
              <span>
                {matchesError}
                {tokenRole && tokenRole !== 'admin' && (
                  <>
                    {' '}Detected token role is "{tokenRole}". Please use an admin token.
                  </>
                )}
              </span>
              <div className="flex gap-2">
                <button className="rounded border border-rose-400/50 px-3 py-1 text-rose-100 hover:bg-rose-500/10" onClick={() => setShowSettings(true)}>Open Settings</button>
                <button className="rounded border border-rose-400/50 px-3 py-1 text-rose-100 hover:bg-rose-500/10" onClick={fetchMatchRequests}>Retry</button>
              </div>
            </div>
          ) : matchRequests.length === 0 ? (
            <div className="text-sm text-slate-400">No match requests.</div>
          ) : (
            <>
              {/* Stats + Filters */}
              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Total</div><div className="text-xl font-semibold text-slate-100">{matchStats.total}</div></div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Pending</div><div className="text-xl font-semibold text-amber-300">{matchStats.pending}</div></div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Approved</div><div className="text-xl font-semibold text-emerald-300">{matchStats.approved}</div></div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Rejected</div><div className="text-xl font-semibold text-rose-300">{matchStats.rejected}</div></div>
              </div>
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
                <input value={matchQuery} onChange={(e)=>setMatchQuery(e.target.value)} placeholder="Search by patient, donor, or organ..." className="w-full md:w-1/2 rounded-xl bg-slate-800/70 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400/50" />
                <div className="flex gap-2">
                  <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="rounded-lg bg-slate-800/70 px-3 py-2 text-sm ring-1 ring-slate-700 focus:ring-cyan-400/50 outline-none">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select value={organFilter} onChange={(e)=>setOrganFilter(e.target.value)} className="rounded-lg bg-slate-800/70 px-3 py-2 text-sm ring-1 ring-slate-700 focus:ring-cyan-400/50 outline-none">
                    <option value="all">All Organs</option>
                    <option value="Kidney">Kidney</option>
                    <option value="Liver">Liver</option>
                    <option value="Heart">Heart</option>
                    <option value="Cornea">Cornea</option>
                  </select>
                </div>
              </div>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredMatches.map((m) => {
                const donor = donors.find(d => normalizeId(d.userId) === normalizeId(m.donor));
                const patient = patients.find(p => normalizeId(p.userId) === normalizeId(m.patient) || normalizeId(p._id) === normalizeId(m.patient));
                return (
                  <li key={m._id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-100">{m.organ || 'Organ'}</div>
                      {m.status === 'approved' ? (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30 text-xs">Approved</span>
                      ) : m.status === 'rejected' ? (
                        <span className="rounded bg-rose-500/15 px-2 py-0.5 text-rose-300 ring-1 ring-rose-500/30 text-xs">Rejected</span>
                      ) : (
                        <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-300 ring-1 ring-amber-500/30 text-xs">Pending</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">Patient: {patient?.name || patient?.fullName || '—'}</div>
                    <div className="text-xs text-slate-400">Donor: {donor?.name || donor?.fullName || '—'}</div>
                    <div className="mt-3 flex gap-2">
                      {m.status !== 'approved' && (
                        <button className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500 disabled:opacity-60" onClick={() => approveMatch(m)} disabled={savingMatchId === m._id}>
                          {savingMatchId === m._id ? 'Saving…' : 'Approve'}
                        </button>
                      )}
                      {m.status !== 'rejected' && (
                        <button className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-500 disabled:opacity-60" onClick={() => rejectMatch(m)} disabled={savingMatchId === m._id}>
                          {savingMatchId === m._id ? 'Saving…' : 'Reject'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
              </ul>
            </>
          )}
        </section>
        )}
      </main>

      {/* Status Change Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl ring-1 ring-white/5">
            <h4 className="text-lg font-semibold text-slate-100">Confirm status change</h4>
            <p className="mt-1 text-sm text-slate-400">You are setting this request to <b className="text-slate-200">{statusModal.targetStatus}</b>. Optionally leave a remark.</p>
            <label className="mt-4 block text-xs font-medium text-slate-400">Admin Remarks</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 outline-none ring-1 ring-slate-800 focus:ring-cyan-500/40"
              rows={3}
              value={statusModal.remarks}
              onChange={(e) => setStatusModal((s) => ({ ...s, remarks: e.target.value }))}
              placeholder="e.g., Verified after reviewing documents"
            />
            {statusModal.targetStatus === 'Donated' && (
              <>
                <label className="mt-3 block text-xs font-medium text-slate-400">Donation Details (optional)</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 outline-none ring-1 ring-slate-800 focus:ring-cyan-500/40"
                  rows={3}
                  value={statusModal.donationDetails}
                  onChange={(e) => setStatusModal((s) => ({ ...s, donationDetails: e.target.value }))}
                  placeholder="Add any donation details to include in the notification"
                />
              </>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800" onClick={closeStatusModal}>Cancel</button>
              <button
                className={`rounded-lg px-4 py-2 text-white ${statusModal.targetStatus === 'Verified' ? 'bg-emerald-600 hover:bg-emerald-500' : statusModal.targetStatus === 'Donated' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-rose-600 hover:bg-rose-500'}`}
                onClick={handleSaveStatus}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-100">Patient Details</h4>
              <button className="rounded border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800" onClick={closePatientModal}>Close</button>
            </div>
            {selectedPatient && (
              <div className="mt-2 flex justify-end">
                <button className="rounded bg-slate-800 px-3 py-1 text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700" onClick={exportSelectedPatientCSV}>Export CSV</button>
              </div>
            )}
            {loadingPatientDetails ? (
              <div className="mt-4 space-y-2">
                {[...Array(5)].map((_,i)=>(<div key={i} className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />))}
              </div>
            ) : patientDetailsError ? (
              <div className="mt-4 rounded-md bg-rose-500/10 p-3 text-rose-300 ring-1 ring-rose-500/30">{patientDetailsError}</div>
            ) : patientDetails ? (
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-end gap-2">
                  {!editingPatient ? (
                    <button className="rounded border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800" onClick={() => setEditingPatient(true)}>Edit</button>
                  ) : (
                    <>
                      <button className="rounded border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800" onClick={() => { setEditingPatient(false); }}>Cancel</button>
                      <button className="rounded bg-emerald-600 px-4 py-1 text-white hover:bg-emerald-500" onClick={savePatientForm}>Save</button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <span className="text-slate-500">Name:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.fullName||''} onChange={e=>setPatientForm(f=>({...f, fullName:e.target.value}))} />
                    ) : (
                      <span className="break-words"> {patientDetails.name || patientDetails.patientProfile?.fullName || patientDetails.fullName || selectedPatient?.name || 'N/A'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-500">Email:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.email||''} onChange={e=>setPatientForm(f=>({...f, email:e.target.value}))} />
                    ) : (
                      <span className="break-all"> {patientDetails.email || selectedPatient?.email || 'N/A'}</span>
                    )}
                  </div>
                  <div><span className="text-slate-500">Role:</span> {patientDetails.role || 'patient'}</div>
                  <div>
                    <span className="text-slate-500">Blood Group:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.bloodGroup||''} onChange={e=>setPatientForm(f=>({...f, bloodGroup:e.target.value}))} />
                    ) : (
                      <> {patientDetails.bloodGroup || patientDetails.patientProfile?.bloodGroup || patientDetails.bloodgroup || selectedPatient?.bloodGroup || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.contact||''} onChange={e=>setPatientForm(f=>({...f, contact:e.target.value}))} />
                    ) : (
                      <> {patientDetails.phone || patientDetails.contact || patientDetails.patientProfile?.contact || selectedPatient?.contact || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Gender:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.gender||''} onChange={e=>setPatientForm(f=>({...f, gender:e.target.value}))} />
                    ) : (
                      <> {patientDetails.gender || patientDetails.patientProfile?.gender || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">DOB:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.dob||''} onChange={e=>setPatientForm(f=>({...f, dob:e.target.value}))} placeholder="YYYY-MM-DD" />
                    ) : (
                      <> {(patientDetails.dob || patientDetails.patientProfile?.dob) || '—'} {(patientDetails.dob || patientDetails.patientProfile?.dob) ? `(${calcAge(patientDetails.dob || patientDetails.patientProfile?.dob)})` : ''}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">City:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.city||''} onChange={e=>setPatientForm(f=>({...f, city:e.target.value}))} />
                    ) : (
                      <> {patientDetails.city || patientDetails.patientProfile?.city || selectedPatient?.city || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">State:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.state||''} onChange={e=>setPatientForm(f=>({...f, state:e.target.value}))} />
                    ) : (
                      <> {patientDetails.state || patientDetails.patientProfile?.state || selectedPatient?.state || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Country:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.country||''} onChange={e=>setPatientForm(f=>({...f, country:e.target.value}))} />
                    ) : (
                      <> {patientDetails.country || patientDetails.patientProfile?.country || selectedPatient?.country || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Emergency Contact:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.emergencyContact||''} onChange={e=>setPatientForm(f=>({...f, emergencyContact:e.target.value}))} />
                    ) : (
                      <> {patientDetails.emergencyContact || patientDetails.patientProfile?.emergencyContact || selectedPatient?.emergencyContact || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Kin Consent:</span>
                    {editingPatient ? (
                      <input type="checkbox" className="ml-2" checked={!!patientForm.kinConsent} onChange={e=>setPatientForm(f=>({...f, kinConsent:e.target.checked}))} />
                    ) : (
                      <> {(patientDetails.kinConsent ?? patientDetails.patientProfile?.kinConsent) ? 'Yes' : 'No'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Reg. ID:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.regId||''} onChange={e=>setPatientForm(f=>({...f, regId:e.target.value}))} />
                    ) : (
                      <> {patientDetails.regId || patientDetails.patientProfile?.regId || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Reg. Date:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.regDate||''} onChange={e=>setPatientForm(f=>({...f, regDate:e.target.value}))} placeholder="YYYY-MM-DD" />
                    ) : (
                      <> {patientDetails.regDate || patientDetails.patientProfile?.regDate || '—'}</>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Reg. Place:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.regPlace||''} onChange={e=>setPatientForm(f=>({...f, regPlace:e.target.value}))} />
                    ) : (
                      <> {patientDetails.regPlace || patientDetails.patientProfile?.regPlace || '—'}</>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Address:</span>
                    {editingPatient ? (
                      <input className="mt-1 w-full rounded bg-slate-800 px-2 py-1" value={patientForm.address||''} onChange={e=>setPatientForm(f=>({...f, address:e.target.value}))} />
                    ) : (
                      <> {patientDetails.address || patientDetails.patientProfile?.address || selectedPatient?.address || 'N/A'}</>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-400">No details available.</div>
            )}
          </div>
        </div>
      )}

      {/* Local page styles */}
      <style>{`
        .shadow-neon { box-shadow: 0 10px 40px rgba(34, 211, 238, 0.15); }
      `}</style>
    </div>
  );
}

export default Dashboard;
