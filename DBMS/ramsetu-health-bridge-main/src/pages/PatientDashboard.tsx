import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  FileText,
  CheckCircle,
  Upload,
  User,
  Mail,
  MapPin,
  ShieldCheck,
  List,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE = API_URL.replace(/\/api$/, "");

type MatchItem = any;
type DocItem = { _id: string; type?: string; fileUrl: string; createdAt?: string };

function getTokenAndUserId() {
  const tokenKeys = ["token", "accessToken", "authToken"];
  let token: string | null = null;
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k);
    if (v && v !== "undefined" && v !== "null" && v.trim()) { token = v; break; }
  }
  let userId = localStorage.getItem("userId");
  if (userId === "undefined" || userId === "null" || !userId?.trim()) userId = null;
  if (!userId && token) {
    try { const payload = JSON.parse(atob(token.split(".")[1])); userId = payload?.sub || payload?.id || payload?.userId || null; } catch {}
  }
  return { token, userId };
}

const TABS = [
  { key: "profile", label: "Profile", icon: <User className="w-4 h-4 mr-1" /> },
  { key: "matches", label: "Matches", icon: <List className="w-4 h-4 mr-1" /> },
  { key: "documents", label: "Documents", icon: <FileText className="w-4 h-4 mr-1" /> },
  { key: "feedback", label: "Feedback", icon: <ShieldCheck className="w-4 h-4 mr-1" /> },
];

const ICONS: Record<string, JSX.Element> = {
  fullName: <User className="inline w-4 h-4 mr-1 text-blue-700" />,
  email: <Mail className="inline w-4 h-4 mr-1 text-blue-700" />,
  bloodGroup: <Heart className="inline w-4 h-4 mr-1 text-red-600" />,
  city: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
};

const formatDateTime = (d?: string) => { try { return d ? new Date(d).toLocaleString() : "—"; } catch { return d || "—"; } };

const PatientDashboard = () => {
  const [tab, setTab] = useState("profile");
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  const [docs, setDocs] = useState<DocItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    setProfileLoading(true); setProfileError(null);
    const { token } = getTokenAndUserId();
    try {
      const res = await axios.get(`${API_URL}/patient/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 401 || res.status === 403) { setProfileError("Session expired or unauthenticated. Please log in."); setProfile(null); return; }
      if (!res.data || res.data.error) { setProfileError(res.data?.error || "Patient profile not found."); setProfile(null); return; }
      setProfile(res.data);
    } catch {
      setProfileError("Failed to fetch patient profile."); setProfile(null);
    } finally { setProfileLoading(false); }
  };

  const fetchMatches = async () => {
    setMatchesLoading(true); setMatchesError(null);
    const { token } = getTokenAndUserId();
    try {
      const res = await axios.get(`${API_URL}/match/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 401 || res.status === 403) { setMatchesError("Session expired. Please log in again."); setMatches([]); return; }
      setMatches(Array.isArray(res.data) ? res.data : []);
    } catch { setMatchesError("Failed to fetch matches."); setMatches([]); }
    finally { setMatchesLoading(false); }
  };

  const fetchDocuments = async () => {
    setDocsLoading(true); setDocsError(null);
    const { token } = getTokenAndUserId();
    try {
      const res = await axios.get(`${API_URL}/document/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 401 || res.status === 403) { setDocsError("Session expired. Please log in again."); setDocs([]); return; }
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch { setDocsError("Failed to fetch documents."); setDocs([]); }
    finally { setDocsLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { fetchMatches(); fetchDocuments(); }, [profile]);

  const handleRefresh = () => { fetchProfile(); fetchMatches(); fetchDocuments(); toast({ title: "Data refreshed!" }); };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { token } = getTokenAndUserId();
      await axios.post(`${API_URL}/feedback`, {
        feedback,
        email: profile?.email || "",
        patientId: profile?.id || profile?._id || "",
        name: profile?.fullName || "",
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true });
      toast({ title: "Thank you for your feedback!", description: "We appreciate your input." });
      setFeedback("");
    } catch {
      toast({ title: "Feedback failed", description: "Could not submit feedback. Please try again.", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-blue-200 rounded w-1/3" />
      <div className="h-6 bg-blue-100 rounded w-1/2" />
      <div className="h-4 bg-blue-100 rounded w-2/3" />
      <div className="h-4 bg-blue-100 rounded w-1/4" />
    </div>
  );
  const MatchesSkeleton = () => (
    <div className="space-y-3">
      {[1,2,3].map(i => (<div key={i} className="animate-pulse h-20 bg-green-100 rounded-xl" />))}
    </div>
  );

  return (
    <AppLayout>
  <div className="relative min-h-screen bg-gradient-to-b from-white via-sky-50 to-emerald-50 pb-16">
        {/* Banner */}
  <div className="w-full h-48 md:h-64 bg-gradient-to-r from-rose-600 via-emerald-600 to-emerald-500 rounded-b-[3rem] shadow-2xl flex items-end justify-center relative overflow-hidden">
          <span className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-10 tracking-wide">
            Welcome, {profile?.fullName?.split(' ')[0] || "Patient"}
          </span>
          <div className="absolute top-6 right-8">
            <Button variant="secondary" onClick={handleRefresh} className="hover:scale-110 transition-transform shadow-md bg-white/30 backdrop-blur border border-white/40">
              <RefreshCw className="mr-1 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Patient Card */}
        <div className="max-w-3xl mx-auto -mt-28 mb-10 px-4">
          <div className="rounded-3xl shadow-2xl border border-emerald-200 bg-white/40 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-8 p-10 transition-all duration-300 hover:shadow-emerald-200/80">
            <div className="relative">
              <img src="/logo.png" alt="Profile" className="h-40 w-40 rounded-full object-cover border-4 border-emerald-500 shadow-xl bg-white ring-4 ring-emerald-200" />
              <span className="absolute bottom-2 right-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-1 shadow-lg"></span>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <h2 className="text-4xl font-extrabold text-slate-900 flex items-center gap-2 drop-shadow">
                {profile?.fullName || ""}
                {profile?.bloodGroup && (
                  <Badge variant="secondary" className="ml-2 px-3 py-1 text-lg shadow">
                    {profile.bloodGroup}
                  </Badge>
                )}
              </h2>
              <div className="flex gap-4 items-center mt-2 flex-wrap text-lg">
                {profile?.email && (
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <Mail className="w-5 h-5" /> {profile.email}
                  </span>
                )}
                {profile?.city && (
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <MapPin className="w-5 h-5" /> {profile.city}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto mb-10 flex gap-3 justify-center">
          {TABS.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "outline"}
              className={`rounded-full px-7 py-2 flex items-center gap-2 text-lg font-semibold transition-all duration-200 shadow
                ${tab === t.key
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg scale-110"
                  : "hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 bg-white/60"}
              `}
              style={{ boxShadow: tab === t.key ? "0 4px 24px 0 rgba(16,185,129,0.20)" : undefined }}
              onClick={() => setTab(t.key)}
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>

        {(profileError || matchesError || docsError) && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-300 text-red-800 rounded-xl p-4 text-sm shadow">
            <strong>Debug Info:</strong>
            <pre className="whitespace-pre-wrap mt-2">
              {profileError && `Profile Error: ${profileError}\n`}
              {matchesError && `Matches Error: ${matchesError}\n`}
              {docsError && `Documents Error: ${docsError}`}
            </pre>
          </div>
        )}

        {/* Tab Content */}
        <div className="max-w-3xl mx-auto transition-all duration-300">
          {tab === "profile" && (
            <>
              {profileLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-emerald-100 mb-8 bg-white/70 backdrop-blur">
                  <CardContent><ProfileSkeleton /></CardContent>
                </Card>
              )}
              {!profileLoading && profile && (
                <Card className="rounded-3xl shadow-2xl border border-emerald-200 bg-white/60 backdrop-blur-2xl mb-8">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-3xl font-bold mb-2">Profile Details</CardTitle>
                    <CardDescription className="text-slate-600 text-base">Your patient profile and health info</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-base text-gray-800">
                      <div>
                        <div className="mb-2 text-lg font-semibold text-emerald-700">Personal Info</div>
                        <div className="mb-1">{ICONS.fullName} <span className="font-semibold">Full Name:</span> {profile.fullName || "N/A"}</div>
                        <div className="mb-1">{ICONS.email} <span className="font-semibold">Email:</span> {profile.email || "N/A"}</div>
                        <div className="mb-1">{ICONS.bloodGroup} <span className="font-semibold">Blood Group:</span> {profile.bloodGroup || "N/A"}</div>
                      </div>
                      <div>
                        <div className="mb-2 text-lg font-semibold text-emerald-700">Location</div>
                        <div className="mb-1">{ICONS.city} <span className="font-semibold">City:</span> {profile.city || "N/A"}</div>
                        <div className="mb-1">State: {profile.state || "N/A"}</div>
                        <div className="mb-1">Address: {profile.address || "N/A"}</div>
                      </div>
                      <div className="md:col-span-2 mt-4">
                        <div className="mb-2 text-lg font-semibold text-emerald-700">Medical</div>
                        <div className="mb-1"><span className="font-semibold">Required Organ:</span> {matches.find(m=> (m.status||'').toLowerCase()!=='rejected')?.organ || "N/A"}</div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button variant="outline" onClick={() => (window.location.href = '/patient-profile-form')}>Edit Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {tab === "matches" && (
            <>
              {matchesLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-green-100 mb-8 bg-white/70 backdrop-blur"><CardContent><MatchesSkeleton /></CardContent></Card>
              )}
              {!matchesLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-emerald-100 mb-8 bg-white/70 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-emerald-900 text-2xl font-bold">Matches</CardTitle>
                    <CardDescription className="text-emerald-700">Pending and approved matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matches.length === 0 ? (
                      <div className="flex items-center gap-2 text-slate-600 py-6 justify-center"><AlertTriangle className="h-4 w-4" />No matches yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((m:any) => {
                          const status = (m.status||'pending').toLowerCase();
                          const donor = m.donorSummary || {};
                          return (
                            <div key={m._id} className="p-4 border rounded-xl bg-white/80 mb-2 hover:shadow-md transition-shadow">
                              <p><strong>Organ:</strong> {m.organ}</p>
                              <p><strong>Status:</strong> {status}</p>
                              {status === 'approved' && (
                                <div className="mt-2 text-sm">
                                  <p><strong>Donor:</strong> {donor.fullName || donor.name || '—'}</p>
                                  <p><strong>Email:</strong> {donor.email || '—'}</p>
                                  <p><strong>Phone:</strong> {donor.phone || donor.contact || '—'}</p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">Updated: {formatDateTime(m.updatedAt)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {tab === "documents" && (
            <Card className="rounded-2xl shadow-lg border-2 border-emerald-100 mb-8 bg-white/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900 text-2xl font-bold">Medical Documents</CardTitle>
                <CardDescription className="text-slate-600">Uploaded certificates and reports</CardDescription>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <MatchesSkeleton />
                ) : docs.length === 0 ? (
                  <div className="text-center text-gray-600 py-6">No documents uploaded yet.</div>
                ) : (
                  <div className="space-y-4">
                    {docs.map((doc) => {
                      const files = Array.isArray((doc as any).files) && (doc as any).files.length
                        ? (doc as any).files
                        : (doc.fileUrl ? [{ fileUrl: doc.fileUrl }] : []);
                      const createdAt = (doc as any).createdAt || (doc as any).uploadedAt;
                      const details = (doc as any).details;
                      const tests = (doc as any).tests as Array<any> | undefined;
                      const title = (doc as any).title || doc.type || 'Document';
                      const organ = (doc as any).organ;
                      const status = (doc as any).status;
                      const description = (doc as any).description;
                      return (
                        <div key={doc._id} className="p-4 border rounded-xl bg-white/80 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{title}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {formatDateTime(createdAt as any)}{status ? ` · Status: ${status}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <div><span className="font-medium">Type:</span> {doc.type || '—'}</div>
                              <div><span className="font-medium">Organ:</span> {organ || '—'}</div>
                              {description && (
                                <div className="mt-1"><span className="font-medium">Description:</span> {description}</div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">Details:</div>
                              {details && typeof details === 'object' ? (
                                <ul className="list-disc ml-5 text-xs text-gray-700">
                                  {Object.entries(details).map(([k, v]) => (
                                    <li key={k}><span className="font-medium">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </div>
                          </div>
                          {/* Files list */}
                          <div className="mt-3">
                            <div className="font-medium mb-1">Files:</div>
                            {files.length === 0 ? (
                              <div className="text-xs text-gray-500">No files</div>
                            ) : (
                              <ul className="list-disc ml-5 space-y-1">
                                {files.map((f: any, idx: number) => (
                                  <li key={idx}>
                                    <a
                                      className="text-emerald-700 hover:underline break-all"
                                      href={`${SERVER_BASE}${f.fileUrl?.startsWith('/') ? '' : '/'}${f.fileUrl || ''}`}
                                      target="_blank" rel="noreferrer"
                                    >
                                      {f.originalName || f.fileUrl}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {/* Tests list */}
                          {Array.isArray(tests) && tests.length > 0 && (
                            <div className="mt-3">
                              <div className="font-medium mb-1">Tests:</div>
                              <ul className="list-disc ml-5 space-y-1 text-sm">
                                {tests.map((t, i) => (
                                  <li key={i}>
                                    <span className="font-medium">{t.label || `Test ${i+1}`}:</span> {t.value || '—'}
                                    {t.fileUrl && (
                                      <>
                                        {' '}·{' '}
                                        <a
                                          className="text-emerald-700 hover:underline"
                                          href={`${SERVER_BASE}${t.fileUrl.startsWith('/') ? '' : '/'}${t.fileUrl}`}
                                          target="_blank" rel="noreferrer"
                                        >
                                          View file
                                        </a>
                                      </>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button className="mt-6" variant="outline" onClick={() => (window.location.href = '/upload-documents')}>
                  <Upload className="h-4 w-4 mr-2" /> Upload Additional Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "feedback" && (
            <Card className="rounded-2xl shadow-lg border-2 border-emerald-200 mb-8 bg-gradient-to-r from-rose-50 to-emerald-50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-900 text-2xl font-bold">Feedback</CardTitle>
                <CardDescription className="text-emerald-700">Share your experience or suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <Textarea value={feedback} onChange={(e)=>setFeedback(e.target.value)} placeholder="Type your feedback here..." className="min-h-[80px] rounded-xl border-blue-300 focus:ring-2 focus:ring-blue-400 bg-white/80 transition-shadow focus:shadow-lg" required />
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 hover:scale-105" disabled={submitting || !feedback}>
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PatientDashboard;
