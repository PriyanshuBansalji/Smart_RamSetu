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
import { Input } from "@/components/ui/input"; // modern input
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
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE = API_URL.replace(/\/api$/, "");

function getTokenAndUserId() {
  const tokenKeys = ["token", "accessToken", "authToken"];
  let token: string | null = null;
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k);
    if (v && v !== "undefined" && v !== "null" && v.trim()) {
      token = v;
      break;
    }
  }
  let userId = localStorage.getItem("userId");
  if (userId === "undefined" || userId === "null" || !userId?.trim()) {
    userId = null;
  }
  if (!userId && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload?.sub || payload?.id || payload?.userId || null;
    } catch {}
  }
  return { token, userId };
}

const TABS = [
  { key: "profile", label: "Profile", icon: <User className="w-4 h-4 mr-1" /> },
  { key: "requests", label: "Requests", icon: <List className="w-4 h-4 mr-1" /> },
  { key: "documents", label: "Documents", icon: <FileText className="w-4 h-4 mr-1" /> },
  { key: "feedback", label: "Feedback", icon: <ShieldCheck className="w-4 h-4 mr-1" /> },
];

const ICONS: Record<string, JSX.Element> = {
  fullName: <User className="inline w-4 h-4 mr-1 text-blue-700" />,
  email: <Mail className="inline w-4 h-4 mr-1 text-blue-700" />,
  phone: <PhoneIcon className="inline w-4 h-4 mr-1 text-blue-700" />,
  mobile: <PhoneIcon className="inline w-4 h-4 mr-1 text-blue-700" />,
  gender: <User className="inline w-4 h-4 mr-1 text-blue-700" />,
  dob: <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-700" />,
  dateOfBirth: <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-700" />,
  bloodGroup: <Heart className="inline w-4 h-4 mr-1 text-red-600" />,
  donorType: <ShieldCheck className="inline w-4 h-4 mr-1 text-green-700" />,
  city: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
  state: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
  country: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
  address: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
  organs: <Heart className="inline w-4 h-4 mr-1 text-pink-600" />,
  consent: <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" />,
  consentStatus: <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" />,
  regDate: <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-700" />,
  regPlace: <MapPin className="inline w-4 h-4 mr-1 text-gray-700" />,
  status: <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" />,
};

function PhoneIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function CalendarIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

const DonorDashboard = () => {
  const [tab, setTab] = useState("profile");
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Documents state
  type DocItem = {
    _id: string;
    type?: string;
    title?: string;
    description?: string;
    organ?: string;
    status?: string;
    details?: any;
    tests?: Array<{ label?: string; value?: string; fileUrl?: string }>;
    fileUrl?: string;
    files?: Array<{ fileUrl: string; originalName?: string }>;
    createdAt?: string;
  };
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docStatusFilter, setDocStatusFilter] = useState<'all' | 'approved' | 'donated' | 'pending' | 'rejected'>('approved');
  const [docOrganFilter, setDocOrganFilter] = useState<string>("");

  // Add state for organ form
  const [organ, setOrgan] = useState("");
  const [consent, setConsent] = useState(false);
  const [organSubmitting, setOrganSubmitting] = useState(false);

  // Fetch donor profile directly from donor API (not user)
  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    const { token } = getTokenAndUserId();
    try {
      const res = await axios.get(`${API_URL}/donor/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      // Debug: log response for troubleshooting
      console.log("Donor profile API response:", res);

      if (res.status === 401 || res.status === 403) {
        setProfileError("Session expired or unauthenticated. Please log in.");
        setProfile(null);
        return;
      }
      if (!res.data || res.data.error) {
        setProfileError(res.data?.error || "Donor profile not found.");
        setProfile(null);
        return;
      }
      if (!res.data.email) {
        setProfileError("Donor profile found but missing email field.");
        setProfile(res.data); // Still set profile for debugging
        return;
      }
      setProfile(res.data);
    } catch (err: any) {
      setProfileError("Failed to fetch donor profile.");
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    const { token, userId } = getTokenAndUserId();
    const base = (API_URL || "").replace(/\/+$/, "");
    let requestsRes: any = null;
    try {
      let requestsUrl = "";
      if (userId) {
        requestsUrl = `${base}/donation-request/by-donor/${encodeURIComponent(userId)}`;
      } else if (profile?.email) {
        requestsUrl = `${base}/donation-request/by-email/${encodeURIComponent(profile.email)}`;
      }
      if (!requestsUrl) {
        setRequestsError("No donor ID or email available to fetch donation requests.");
        setRequests([]);
        return;
      }
      requestsRes = await axios.get(requestsUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (requestsRes.status === 401 || requestsRes.status === 403) {
        setRequestsError("Session expired. Please log in again.");
        setRequests([]);
        return;
      }
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
    } catch (err: any) {
      setRequestsError("Failed to fetch requests.");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // fetchRequests will be called after profile is loaded to get email if needed
  }, []);

  useEffect(() => {
    if (profile) fetchRequests();
  }, [profile]);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    setDocsError(null);
    const { token } = getTokenAndUserId();
    try {
      const params: Record<string,string> = {};
      if (docStatusFilter !== 'all') params.status = docStatusFilter;
      if (docOrganFilter.trim()) params.organ = docOrganFilter.trim();
      const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
      const res = await axios.get(`${API_URL}/document/my${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 401 || res.status === 403) {
        setDocsError("Session expired. Please log in again.");
        setDocs([]);
        return;
      }
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setDocsError("Failed to fetch documents.");
      setDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [docStatusFilter, docOrganFilter]);

  const handleRefresh = () => {
    fetchProfile();
    fetchRequests();
    fetchDocuments();
    toast({ title: "Data refreshed!" });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { token } = getTokenAndUserId();
      // Save feedback to backend (and send mail)
      await axios.post(
        `${API_URL}/feedback`,
        {
          feedback,
          email: profile?.email || "",
          donorId: profile?.id || profile?._id || "",
          name: profile?.fullName || "",
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      // Success: feedback saved and mail sent
      toast({ title: "Thank you for your feedback!", description: "We appreciate your input." });
      setFeedback("");
    } catch (err: any) {
      toast({
        title: "Feedback failed",
        description: "Could not submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Utility function to validate email format
  function isValidEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Example: Add this logic wherever you handle organ form submission
  // For demonstration, let's assume you have a function like handleOrganFormSubmit

  const handleOrganFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !(profile.id || profile._id) || !profile.email) {
      toast({
        title: "Profile incomplete",
        description: "Your profile is missing required information. Please log out and log in again, or contact support.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidEmail(profile.email)) {
      toast({
        title: "Invalid email",
        description: "Your email address is not valid. Please update your profile.",
        variant: "destructive",
      });
      return;
    }
    setOrganSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/donation-request`,
        {
          organ,
          consent,
          email: profile.email,
          donorId: profile.id || profile._id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast({ title: "Organ donation request submitted!" });
      setOrgan("");
      setConsent(false);
      fetchRequests();

      // --- Send pending email to user for all supported organs ---
      const supportedOrgans = ["Kidney", "Liver", "Heart", "Cornea"];
      // If organ matches a supported organ (case-insensitive), send notification
      const matchedOrgan = supportedOrgans.find(
        o => o.toLowerCase() === organ.trim().toLowerCase()
      );
      fetch(`${API_URL}/notify/pending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          email: profile.email,
          organ: matchedOrgan || organ,
          status: "Pending"
        }),
      }).catch(() => {});
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: "Could not submit organ donation request.",
        variant: "destructive",
      });
    } finally {
      setOrganSubmitting(false);
    }
  };

  // Skeleton loader for profile and requests
  const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-blue-200 rounded w-1/3" />
      <div className="h-6 bg-blue-100 rounded w-1/2" />
      <div className="h-4 bg-blue-100 rounded w-2/3" />
      <div className="h-4 bg-blue-100 rounded w-1/4" />
    </div>
  );
  const RequestsSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse h-20 bg-green-100 rounded-xl" />
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white pb-16">
        {/* Banner */}
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-blue-700 via-blue-400 to-green-400 rounded-b-[3rem] shadow-2xl flex items-end justify-center relative overflow-hidden">
          <span className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-10 tracking-wide">
            Welcome, {profile?.fullName || "Donor"}
          </span>
          <div className="absolute top-6 right-8">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="hover:scale-110 transition-transform shadow-md bg-white/30 backdrop-blur border border-white/40"
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Donor Card */}
        <div className="max-w-3xl mx-auto -mt-28 mb-10 px-4">
          <div className="rounded-3xl shadow-2xl border border-blue-200 bg-white/40 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-8 p-10 transition-all duration-300 hover:shadow-blue-200/80 glassmorphism">
            <div className="relative">
              <img
                src={profile?.profileImage?.data ? `/api/donor/profile-image/${profile.id || profile._id}` : "/logo.png"}
                alt="Profile"
                className="h-40 w-40 rounded-full object-cover border-4 border-blue-400 shadow-xl bg-white ring-4 ring-blue-200"
                style={{
                  boxShadow: "0 0 32px 0 rgba(59,130,246,0.25), 0 8px 32px 0 rgba(0,0,0,0.10)",
                }}
              />
              <span className="absolute bottom-2 right-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-1 shadow-lg"></span>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <h2 className="text-4xl font-extrabold text-blue-900 flex items-center gap-2 drop-shadow">
                {profile?.fullName || ""}
                {profile?.donorType && (
                  <Badge variant="secondary" className="ml-2 px-3 py-1 text-lg shadow">
                    {profile.donorType}
                  </Badge>
                )}
              </h2>
              <div className="flex gap-4 items-center mt-2 flex-wrap text-lg">
                {profile?.email && (
                  <span className="flex items-center gap-1 text-blue-800 font-semibold">
                    <Mail className="w-5 h-5" /> {profile.email}
                  </span>
                )}
                {profile?.bloodGroup && (
                  <span className="flex items-center gap-1 text-green-700 font-semibold">
                    <Heart className="w-5 h-5" /> {profile.bloodGroup}
                  </span>
                )}
                {profile?.city && (
                  <span className="flex items-center gap-1 text-gray-700 font-semibold">
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
                  ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg scale-110"
                  : "hover:bg-blue-100 hover:text-blue-700 hover:scale-105 bg-white/60"}
              `}
              style={{
                boxShadow: tab === t.key ? "0 4px 24px 0 rgba(59,130,246,0.15)" : undefined,
              }}
              onClick={() => setTab(t.key)}
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>

        {/* Debug Info */}
        {(profileError || requestsError) && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-300 text-red-800 rounded-xl p-4 text-sm shadow">
            <strong>Debug Info:</strong>
            <pre className="whitespace-pre-wrap mt-2">
              {profileError && `Profile Error: ${profileError}\n`}
              {requestsError && `Requests Error: ${requestsError}`}
            </pre>
          </div>
        )}

        {/* Tab Content */}
        <div className="max-w-3xl mx-auto transition-all duration-300">
          {tab === "profile" && (
            <>
              {profileLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-blue-100 mb-8 bg-white/70 backdrop-blur">
                  <CardContent>
                    <ProfileSkeleton />
                  </CardContent>
                </Card>
              )}
              {!profileLoading && profile && (
                <Card className="rounded-3xl shadow-2xl border border-blue-200 bg-white/60 backdrop-blur-2xl mb-8 glassmorphism">
                  <CardHeader>
                    <CardTitle className="text-blue-900 text-3xl font-bold mb-2">Profile Details</CardTitle>
                    <CardDescription className="text-blue-600 text-base">
                      Your donor registration and health info
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-base text-gray-800">
                      {/* Section 1 */}
                      <div>
                        <div className="mb-2 text-lg font-semibold text-blue-700">Personal Info</div>
                        <div className="mb-1">{ICONS.fullName} <span className="font-semibold">Full Name:</span> {profile.fullName || "N/A"}</div>
                        <div className="mb-1">{ICONS.email} <span className="font-semibold">Email:</span> {profile.email || "N/A"}</div>
                        <div className="mb-1">{ICONS.phone} <span className="font-semibold">Phone:</span> {profile.phone || profile.mobile || "N/A"}</div>
                        <div className="mb-1">{ICONS.gender} <span className="font-semibold">Gender:</span> {profile.gender || "N/A"}</div>
                        <div className="mb-1">{ICONS.dob} <span className="font-semibold">Date of Birth:</span> {profile.dob || profile.dateOfBirth || "N/A"}</div>
                        <div className="mb-1">{ICONS.bloodGroup} <span className="font-semibold">Blood Group:</span> {profile.bloodGroup || "N/A"}</div>
                        <div className="mb-1">{ICONS.donorType} <span className="font-semibold">Donor Type:</span> {profile.donorType || "N/A"}</div>
                      </div>
                      {/* Section 2 */}
                      <div>
                        <div className="mb-2 text-lg font-semibold text-blue-700">Location & Registration</div>
                        <div className="mb-1">{ICONS.city} <span className="font-semibold">City:</span> {profile.city || "N/A"}</div>
                        <div className="mb-1">{ICONS.state} <span className="font-semibold">State:</span> {profile.state || "N/A"}</div>
                        <div className="mb-1">{ICONS.country} <span className="font-semibold">Country:</span> {profile.country || "N/A"}</div>
                        <div className="mb-1">{ICONS.address} <span className="font-semibold">Address:</span> {profile.address || "N/A"}</div>
                        <div className="mb-1">{ICONS.regDate} <span className="font-semibold">Registration Date:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "N/A"}</div>
                        <div className="mb-1">{ICONS.regPlace} <span className="font-semibold">Registration Place:</span> {profile.regPlace || "N/A"}</div>
                        <div className="mb-1">{ICONS.status} <span className="font-semibold">Status:</span> {profile.status || "N/A"}</div>
                      </div>
                      {/* Section 3 */}
                      <div className="md:col-span-2 mt-4">
                        <div className="mb-2 text-lg font-semibold text-blue-700">Donation Info</div>
                        <div className="mb-1">{ICONS.organs} <span className="font-semibold">Organs Registered:</span> {Array.isArray(profile.organs) ? profile.organs.join(", ") : profile.organ || "N/A"}</div>
                        <div className="mb-1">{ICONS.consent} <span className="font-semibold">Consent:</span> {typeof profile.consent === "boolean" ? (profile.consent ? "Yes" : "No") : "N/A"}</div>
                        <div className="mb-1">{ICONS.regDate} <span className="font-semibold">Last Updated:</span> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "N/A"}</div>
                      </div>
                      {/* Additional fields */}
                      {Object.entries(profile)
                        .filter(
                          ([key]) =>
                            ![
                              "fullName",
                              "email",
                              "phone",
                              "mobile",
                              "gender",
                              "dob",
                              "dateOfBirth",
                              "bloodGroup",
                              "donorType",
                              "city",
                              "state",
                              "country",
                              "address",
                              "pincode",
                              "zip",
                              "organs",
                              "organ",
                              "consent",
                              "createdAt",
                              "updatedAt",
                              "profileImage",
                              "_id",
                              "__v",
                              "password",
                              "regPlace",
                              "status",
                              // Exclude government ID fields from UI
                              "govtId",
                              "governmentId",
                              "aadhar",
                              "aadhaar",
                              "pan",
                              "panNumber",
                              "aadhaarNumber",
                              "govt_id",
                              "government_id",
                              "idNumber",
                              "id_number",
                              "govId", // Remove govId option as well
                              "gov_id"
                            ].includes(key)
                        )
                        .map(([key, value]) => (
                          <div key={key} className="md:col-span-2">
                            <span className="font-semibold text-blue-800 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>{" "}
                            <span
                              className="break-all max-w-full inline-block"
                              style={{ wordBreak: "break-all", maxWidth: "100%" }}
                              title={typeof value === "string" && value.length > 100 ? value : undefined}
                            >
                              {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {tab === "requests" && (
            <>
              {requestsLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-green-100 mb-8 bg-white/70 backdrop-blur">
                  <CardContent>
                    <RequestsSkeleton />
                  </CardContent>
                </Card>
              )}
              {!requestsLoading && (
                <Card className="rounded-2xl shadow-lg border-2 border-green-100 mb-8 bg-white/70 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-green-900 text-2xl font-bold">Donation Requests</CardTitle>
                    <CardDescription className="text-green-700">
                      All your organ donation requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {requests.length === 0 ? (
                      <div className="text-center text-gray-600 py-6">No requests found.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map((r: any) => (
                          <div key={r._id} className="p-4 border rounded-xl bg-white/80 mb-2 hover:shadow-md transition-shadow">
                            <p><strong>Organ:</strong> {r.organ}</p>
                            <p><strong>Status:</strong> {r.status}</p>
                            <p><strong>Email:</strong> {r.email}</p>
                            <p><strong>Consent:</strong> {r.consent ? "Yes" : "No"}</p>
                            <p><strong>Created:</strong> {new Date(r.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {tab === "feedback" && (
            <Card className="rounded-2xl shadow-lg border-2 border-blue-200 mb-8 bg-gradient-to-r from-blue-50 to-green-50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-blue-900 text-2xl font-bold">Feedback</CardTitle>
                <CardDescription className="text-blue-700">
                  Share your experience or suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Type your feedback here..."
                    className="min-h-[80px] rounded-xl border-blue-300 focus:ring-2 focus:ring-blue-400 bg-white/80 transition-shadow focus:shadow-lg"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-700 to-green-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:from-blue-800 hover:to-green-600 transition-all duration-200 hover:scale-105"
                    disabled={submitting || !feedback}
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === "documents" && (
            <>
              <Card className="rounded-2xl shadow-lg border-2 border-blue-100 mb-8 bg-white/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-2xl font-bold">Your Documents</CardTitle>
                  <CardDescription className="text-blue-600">Uploaded certificates and reports</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <select
                        className="h-9 border rounded-md px-2 bg-white"
                        value={docStatusFilter}
                        onChange={(e)=>setDocStatusFilter(e.target.value as any)}
                      >
                        <option value="all">All</option>
                        <option value="approved">Approved</option>
                        <option value="donated">Donated</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Organ:</span>
                      <Input
                        placeholder="e.g. Kidney"
                        value={docOrganFilter}
                        onChange={(e)=>setDocOrganFilter(e.target.value)}
                        className="h-9 max-w-xs"
                      />
                    </div>
                  </div>
                  {docsLoading ? (
                    <RequestsSkeleton />
                  ) : docsError ? (
                    <div className="text-red-700 text-sm">{docsError}</div>
                  ) : docs.length === 0 ? (
                    <div className="text-center text-gray-600 py-6">No documents uploaded yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {docs.map((doc) => {
                        const allFiles = Array.isArray(doc.files) && doc.files.length
                          ? doc.files
                          : (doc.fileUrl ? [{ fileUrl: doc.fileUrl }] : []);
                        return (
                          <div key={doc._id} className="p-4 border rounded-xl bg-white/80 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{doc.title || doc.type || 'Document'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'}
                                  {doc.status ? ` · Status: ${doc.status}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <div><span className="font-medium">Type:</span> {doc.type || '—'}</div>
                                <div><span className="font-medium">Organ:</span> {doc.organ || '—'}</div>
                                {doc.description && (
                                  <div className="mt-1"><span className="font-medium">Description:</span> {doc.description}</div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">Details:</div>
                                {doc.details && typeof doc.details === 'object' ? (
                                  <ul className="list-disc ml-5 text-xs text-gray-700">
                                    {Object.entries(doc.details).map(([k, v]) => (
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
                              {allFiles.length === 0 ? (
                                <div className="text-xs text-gray-500">No files</div>
                              ) : (
                                <ul className="list-disc ml-5 space-y-1">
                                  {allFiles.map((f, idx) => (
                                    <li key={idx}>
                                      <a
                                        className="text-blue-700 hover:underline break-all"
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
                            {Array.isArray(doc.tests) && doc.tests.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-1">Tests:</div>
                                <ul className="list-disc ml-5 space-y-1 text-sm">
                                  {doc.tests.map((t, i) => (
                                    <li key={i}>
                                      <span className="font-medium">{t.label || `Test ${i+1}`}:</span> {t.value || '—'}
                                      {t.fileUrl && (
                                        <>
                                          {' '}·{' '}
                                          <a
                                            className="text-blue-700 hover:underline"
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
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg border-2 border-blue-100 mb-8 bg-white/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-2xl font-bold">Organ Donation Request</CardTitle>
                  <CardDescription className="text-blue-600">
                    Submit a new organ donation request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOrganFormSubmit} className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-1">Organ</label>
                      <Input
                        type="text"
                        value={organ}
                        onChange={e => setOrgan(e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition-shadow focus:shadow-lg"
                        placeholder="e.g. Cornea, Kidney"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => setConsent(e.target.checked)}
                        id="consent"
                        className="accent-blue-600 scale-110"
                      />
                      <label htmlFor="consent" className="text-sm">
                        I give my consent for organ donation.
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-700 to-green-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:from-blue-800 hover:to-green-600 transition-all duration-200 hover:scale-105"
                      disabled={
                        organSubmitting ||
                        !organ ||
                        !consent ||
                        !profile ||
                        !profile._id ||
                        !profile.email ||
                        !isValidEmail(profile.email)
                      }
                    >
                      {organSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DonorDashboard;
