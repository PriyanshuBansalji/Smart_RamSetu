import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DonorHeader from "@/components/DonorHeader";
import DonorFooter from "@/components/DonorFooter";

const organs = [
	{ name: "Kidney", icon: "🟢", route: "/donate/kidney" },
	{ name: "Liver", icon: "🟠", route: "/donate/liver" },
	{ name: "Heart", icon: "❤️", route: "/donate/heart" },
	{ name: "Cornea", icon: "👁️", route: "/donate/cornea" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DONOR_VIDEO_URL: string =
	(import.meta as any).env?.VITE_DONOR_VIDEO_URL ||
	"https://www.youtube.com/embed/ysz5S6PUM-U"; // change via .env or replace with your URL

// Normalize common YouTube links to an embeddable URL
const toYouTubeEmbed = (raw?: string): string | null => {
	if (!raw) return null;
	try {
		const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
		const host = url.hostname.replace(/^www\./, '').toLowerCase();
		const path = url.pathname;
		const qp = url.searchParams;

		const getStart = () => {
			// Support t=1m30s or t=90 or start=90
			let s = qp.get('start') || qp.get('t') || '';
			if (!s) return '';
			const match = /^((\d+)h)?((\d+)m)?((\d+)s)?$/.exec(s);
			if (match) {
				const h = parseInt(match[2] || '0', 10);
				const m = parseInt(match[4] || '0', 10);
				const sec = parseInt(match[6] || '0', 10);
				return String(h * 3600 + m * 60 + sec);
			}
			const n = parseInt(s, 10);
			return Number.isFinite(n) ? String(n) : '';
		};

		let id: string | null = null;
		if (host === 'youtu.be') {
			id = path.replace(/^\//, '').split('/')[0] || null;
		} else if (host.endsWith('youtube.com')) {
			if (path === '/watch') id = qp.get('v');
			else if (path.startsWith('/embed/')) id = path.split('/')[2] || null;
			else if (path.startsWith('/shorts/')) id = path.split('/')[2] || null;
		}
		if (!id) return null;
		const start = getStart();
		const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
		if (start) params.set('start', start);
		return `https://www.youtube.com/embed/${id}?${params.toString()}`;
	} catch {
		return null;
	}
};
type RequestItem = {
	email: any;
	_id?: string;
	organ?: string;
	status?: string;
	createdAt?: string;
	tests?: any[];
};

const decodeJwt = (token?: string) => {
		if (!token) return null;
		try {
			const payload = token.split(".")[1];
			const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
			const json = decodeURIComponent(
				atob(b64)
					.split("")
					.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
					.join("")
			);
			return JSON.parse(json);
		} catch {
			return null;
		}
	};

const fetchEmailAndRequests = async (
    setEmail: (s: string) => void,
    setRequests: (r: RequestItem[]) => void,
    setLoading: (b: boolean) => void,
    setError: (s: string) => void,
    navigate: (path: string) => void
) => {
    setLoading(true);
    setError("");
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
        const payload = decodeJwt(token);
        userId = payload?.sub || payload?.id || payload?.userId || null;
    }

    const base = (API_URL || "").replace(/\/+$/, "");
    // Try both plural and singular endpoints for user
    const userEndpoints = userId
        ? [
            `${base}/users/${encodeURIComponent(userId)}`,
            `${base}/user/${encodeURIComponent(userId)}`,
            `${base}/users/me`,
            `${base}/user/me`
        ]
        : [
            `${base}/users/me`,
            `${base}/user/me`
        ];

    const doFetch = async (url: string, useBearer: boolean, includeCreds = false) => {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (useBearer && token) headers["Authorization"] = `Bearer ${token}`;
        headers["Content-Type"] = "application/json";
        return fetch(url, {
            method: "GET",
            headers,
            credentials: includeCreds ? "include" : "same-origin",
        });
    };

    try {
        // Fetch user info first
        let userRes: Response | null = null;
        for (const ue of userEndpoints) {
            userRes = await doFetch(ue, !!token, false);
            if ((userRes.status === 401 || userRes.status === 403) && !token) {
                userRes = await doFetch(ue, false, true);
            }
            if (userRes.ok || userRes.status === 401 || userRes.status === 403) break;
            userRes = null;
        }

        if (!userRes) {
            setError("Failed to fetch user info.");
            setLoading(false);
            return;
        }
        if (userRes.status === 401 || userRes.status === 403) {
            setError("Session expired or unauthenticated. Please log in.");
            setLoading(false);
            setTimeout(() => navigate("/login"), 600);
            return;
        }
        if (!userRes.ok) {
            const text = await userRes.text().catch(() => "");
            setError(`Failed to load user (${userRes.status} ${userRes.statusText}): ${text}`);
            setLoading(false);
            return;
        }

        const userData = await userRes.json();
        if (!userData?.email) {
            setError("User email not found in user response.");
            setLoading(false);
            return;
        }
        setEmail(userData.email);

        // persist recovered userId for future requests (only if safe)
        if (!localStorage.getItem("userId") && userData?._id) {
            localStorage.setItem("userId", String(userData._id));
            userId = String(userData._id);
        }

        // Try to fetch donation requests by donorId or email
        let requestsRes: Response | null = null;
        let requestsUrl = "";
        if (userId) {
            requestsUrl = `${base}/donation-request/by-donor/${encodeURIComponent(userId)}`;
        } else if (userData.email) {
            requestsUrl = `${base}/donation-request/by-email/${encodeURIComponent(userData.email)}`;
        } else {
            setError("No donor ID or email available to fetch donation requests.");
            setRequests([]);
            setLoading(false);
            return;
        }

        requestsRes = await doFetch(requestsUrl, !!token, false);
        if ((requestsRes.status === 401 || requestsRes.status === 403) && !token) {
            requestsRes = await doFetch(requestsUrl, false, true);
        }

        if (!requestsRes) {
            setError("Failed to fetch donation requests.");
            setRequests([]);
            setLoading(false);
            return;
        }
        if (requestsRes.status === 401 || requestsRes.status === 403) {
            setError("Session expired. Please log in again.");
            setLoading(false);
            setTimeout(() => navigate("/login"), 600);
            return;
        }
        if (!requestsRes.ok) {
            const text = await requestsRes.text().catch(() => "");
            if (requestsRes.status === 404) {
                setError("Backend endpoint not found (404). Please check your backend routes and spelling.");
            } else {
                setError(`Failed to load requests (${requestsRes.status} ${requestsRes.statusText}): ${text}`);
            }
            setRequests([]);
            setLoading(false);
            return;
        }

        const requestsData = await requestsRes.json();
        let finalRequests: RequestItem[] = [];
        if (Array.isArray(requestsData)) {
            finalRequests = requestsData;
        } else if (requestsData && Array.isArray(requestsData.requests)) {
            finalRequests = requestsData.requests;
        } else if (requestsData && typeof requestsData === "object") {
            const arrProp = Object.values(requestsData).find(v => Array.isArray(v));
            if (arrProp) {
                finalRequests = arrProp as RequestItem[];
            }
        }
        setRequests(finalRequests);
        setLoading(false);
    } catch (err: any) {
        setError("Error fetching data. See console for details.");
        setRequests([]);
        setLoading(false);
    }
};

const StatCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({
	title,
	value,
	subtitle,
}) => (
	<div className="bg-white/10 rounded-xl p-4 min-w-[140px]">
		<div className="text-2xl font-extrabold">{value}</div>
		<div className="text-sm font-semibold mt-1">{title}</div>
		{subtitle && <div className="text-xs text-white/80 mt-1">{subtitle}</div>}
	</div>
);

const DonorLanding: React.FC = () => {
	const [requests, setRequests] = useState<RequestItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const navigate = useNavigate();

	useEffect(() => {
		fetchEmailAndRequests(setEmail, setRequests, setLoading, setError, navigate);
		const handler = () => {
			fetchEmailAndRequests(setEmail, setRequests, setLoading, setError, navigate);
		};
		window.addEventListener("donation-status-updated", handler);
		return () => window.removeEventListener("donation-status-updated", handler);
	}, []);

	const blockedOrgans = requests
		.filter((r) => ["Pending", "Verified"].includes(String(r.status)))
		.map((r) => (r.organ || "").toLowerCase());

	// derive stats + recent activity dynamically from requests
	const timeAgo = (iso?: string) => {
		if (!iso) return "-";
		const diff = Date.now() - new Date(iso).getTime();
		const sec = Math.floor(diff / 1000);
		if (sec < 60) return `${sec}s ago`;
		const min = Math.floor(sec / 60);
		if (min < 60) return `${min}m ago`;
		const hr = Math.floor(min / 60);
		if (hr < 24) return `${hr}h ago`;
		const days = Math.floor(hr / 24);
		if (days < 30) return `${days}d ago`;
		const months = Math.floor(days / 30);
		if (months < 12) return `${months}mo ago`;
		return `${Math.floor(months / 12)}y ago`;
	};

	const computedStats = useMemo(() => {
		const total = requests.length;
		const pending = requests.filter((r) => String(r.status).toLowerCase() === "pending").length;
		const verified = requests.filter((r) => String(r.status).toLowerCase() === "verified").length;
		// estimate lives impacted: verified * 8 (keep previous messaging)
		const livesImpacted = verified > 0 ? `${verified * 8}+` : "—";
		return [
			{ title: "Lives impacted", value: livesImpacted, subtitle: "Estimated (verified)" },
			{ title: "Verified matches", value: `${verified}`, subtitle: `${total} total submissions` },
			{ title: "Pending", value: `${pending}`, subtitle: "Awaiting verification" },
			{ title: "Support", value: "24/7", subtitle: "Guidance & help" },
		];
	}, [requests]);

	const recentFromRequests = useMemo(() => {
		return [...requests]
			.filter((r) => r.createdAt)
			.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
			.slice(0, 6)
			.map((r) => ({
				id: r._id || `${r.organ}-${r.createdAt}`,
				text: `${r.organ} — ${r.status || "Submitted"}`,
				time: timeAgo(r.createdAt),
			}));
	}, [requests]);

	// Add missing sample data used by the UI
	const faqs = [
		{ q: "Who can donate?", a: "Healthy adults after screening can donate. Follow the form guidance." },
		{ q: "Is my data safe?", a: "Yes — RamSetu uses secure storage and restricted access." },
		{ q: "How long does verification take?", a: "Verification typically takes 3–7 days depending on required tests." },
	];

	const testimonials = [
		{ id: "t1", name: "Asha K.", text: "Easy and compassionate process — grateful to donate.", role: "Donor" },
		{ id: "t2", name: "Ravi P.", text: "RamSetu handled everything with care.", role: "Donor" },
		{ id: "t3", name: "Neha S.", text: "Support team was helpful during the whole process.", role: "Donor" },
	];

	// Add logout handler
	const handleLogout = () => {
		localStorage.clear();
		navigate("/login");
	};

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
			<DonorHeader />

			{/* HERO */}
						<section className="w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ minHeight: "55vh" }} aria-label="Hero">
				<div className="relative rounded-3xl overflow-hidden h-full">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"></div>
					<svg className="absolute -bottom-6 left-0 w-full text-white/6" style={{ height: 160 }} viewBox="0 0 1440 320" preserveAspectRatio="none" fill="none" aria-hidden>
						<path d="M0,96L80,128C160,160,320,224,480,218.7C640,213,800,139,960,117.3C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" fill="white" opacity="0.06"></path>
					</svg>

					<div className="relative z-10 max-w-7xl mx-auto py-8 lg:py-12">
												<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
														<div className="lg:col-span-4 flex flex-col items-center lg:items-start">
																<div className="bg-white rounded-full p-6 shadow-2xl flex items-center justify-center">
																		<img src="/logo.png" alt="RamSetu Logo" className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 object-cover rounded-full" />
																</div>
																{/* Awareness video */}
																<div className="mt-4 w-full max-w-md bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
																	{(() => {
																		const embed = toYouTubeEmbed(DONOR_VIDEO_URL);
																		if (embed) {
																			return (
																				<div className="relative aspect-video">
																					<iframe
																						src={embed}
																						title="Awareness video"
																						className="absolute inset-0 h-full w-full"
																						loading="lazy"
																						referrerPolicy="strict-origin-when-cross-origin"
																						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
																						allowFullScreen
																					/>
																				</div>
																			);
																		}
																											return (
																												<video
																													className="w-full h-auto"
																													controls
																													preload="metadata"
																												>
																				<source src={DONOR_VIDEO_URL} />
																				Your browser does not support the video tag.
																			</video>
																		);
																	})()}
																</div>
														</div>

							<div className="lg:col-span-5 text-center lg:text-left">
								<div className="flex-1 min-w-0">
									<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
										Make a life‑saving decision today
									</h1>
									<p className="mt-3 text-sm sm:text-base text-blue-100/90 max-w-2xl">
										RamSetu connects willing donors to patients in need — secure, verified, and compassionate. Start a donation assessment or view your current requests.
									</p>

									<div className="mt-4 flex flex-wrap gap-3">
										<Link to="/donate/kidney" className="inline-flex items-center justify-center rounded-xl bg-white text-blue-800 font-semibold px-4 py-2 shadow hover:shadow-lg transition">
											Start Donation
										</Link>
										<a href="/About" className="inline-flex items-center justify-center rounded-xl border border-white/30 text-white px-4 py-2 font-medium hover:bg-white/10 transition">
											Learn why donate
										</a>
									</div>
								</div>
							</div>

							<div className="lg:col-span-3 flex justify-center lg:justify-end">
								<div className="bg-white rounded-2xl text-blue-800 shadow-lg p-4 w-64">
									<div className="font-semibold mb-2">Quick actions</div>
									<ul className="space-y-2 text-sm">
										<li><Link to="/donate/kidney" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50"><span>🟢</span> Kidney form</Link></li>
										<li><Link to="/donate/liver" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50"><span>🟠</span> Liver form</Link></li>
										<li><Link to="/donate/heart" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50"><span>❤️</span> Heart form</Link></li>
										<li><Link to="/donate/cornea" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50"><span>👁️</span> Cornea form</Link></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* MAIN */}
			<main className="flex-1 py-8 px-4 max-w-6xl mx-auto">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-extrabold text-blue-900">Organ Donations Dashboard</h1>
				</div>

				<div className="bg-white rounded-2xl shadow p-6 mb-8">
					{loading ? (
						<div className="text-center py-12">Loading…</div>
					) : error ? (
						<div className="text-center text-red-600 py-6">{error}</div>
					) : (
						<>
							<h2 className="text-xl font-bold mb-4">Your Donation Requests</h2>
							{console.log("Frontend requests state:", requests)}
							{requests.length === 0 ? (
	<div className="text-gray-600">
		No donation requests found.
		<div className="text-xs text-red-700">
			If you expect requests, check backend API and database for correct data and endpoint spelling.
		</div>
	</div>
) : (
		<>
									{!requests.some(r => r.status) && (
										<div className="text-yellow-700 mb-2">
											Requests found, but no status field present. Please check backend response.
										</div>
									)}
									{console.log("Donation Requests Data:", requests)}
									<div className="grid gap-4 md:grid-cols-2">
										{requests.map((r) => (
											<div key={r._id || `${r.organ}-${r.createdAt}`} className="p-4 border rounded">
												<div className="flex items-center justify-between">
													<div className="font-semibold">{r.organ || "Unknown Organ"}</div>
													<div className="text-sm">
														{r.status
															? r.status === "Verified"
																? "Verified"
																: r.status === "Pending"
																	? "Pending"
																	: r.status
															: <span className="text-gray-400">No status</span>
														}
													</div>
												</div>
												<div className="text-xs text-gray-600 mt-2">
													Submitted: {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
												</div>
												{r.email && (
													<div className="text-xs text-gray-500 mt-1">Email: {r.email}</div>
												)}
											</div>
										))}
									</div>
								</>
							)}
						</>
					)}
				</div>

				{/* Statistics & Recent Activity */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<div className="md:col-span-2 bg-white rounded-2xl p-6 shadow">
						<h3 className="text-lg font-bold mb-4">Platform Statistics</h3>
						<div className="flex flex-wrap gap-3">
							{computedStats.map((s) => (
								<StatCard key={s.title} title={s.title} value={s.value} subtitle={s.subtitle} />
							))}
						</div>
						<div className="mt-6">
							<h4 className="font-semibold mb-2">Recent activity</h4>
							<ul className="space-y-2 text-sm">
								{recentFromRequests.length === 0 ? (
									<li className="text-gray-500">No recent submissions</li>
								) : (
									recentFromRequests.map((a) => (
										<li key={a.id} className="flex justify-between items-center">
											<div className="text-gray-700">{a.text}</div>
											<div className="text-xs text-gray-400">{a.time}</div>
										</li>
									))
								)}
							</ul>
						</div>
					</div>

					<aside className="bg-white rounded-2xl p-6 shadow flex flex-col gap-4">
						<h3 className="text-lg font-bold">Contact & Support</h3>
						<div className="text-sm text-gray-700">Need help with the forms or verification? Contact our support team.</div>
						<div className="mt-2">
							<div className="text-sm font-semibold">Email</div>
							<a href="mailto:support@ramsetu.org" className="text-blue-600 text-sm">labourzkart@gmail.com</a>
						</div>
						<div className="mt-auto">
							<Link to="/contact" className="inline-block rounded-lg bg-blue-600 text-white px-4 py-2">Contact Support</Link>
						</div>
					</aside>
				</div>

				{/* Forms grid */}
				<div className="grid gap-6 md:grid-cols-2 mb-8">
					{organs.map((organ) => {
						const isBlocked = blockedOrgans.includes(organ.name.toLowerCase());
						return (
							<div key={organ.name} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
								<div className="text-5xl mb-2">{organ.icon}</div>
								<div className="font-bold text-lg mb-4">{organ.name} Donation</div>
								<Button asChild className={`w-full ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`} disabled={isBlocked}>
									<Link to={organ.route}>{isBlocked ? "Already Requested" : "Open Form"}</Link>
								</Button>
							</div>
						);
					})}
				</div>

				{/* FAQ & Testimonials */}
				<div className="grid md:grid-cols-2 gap-6 mb-12">
					<div className="bg-white rounded-2xl p-6 shadow">
						<h3 className="text-lg font-bold mb-4">Frequently asked questions</h3>
						<div className="space-y-3 text-sm">
							{faqs.map((f, i) => (
								<details key={i} className="bg-gray-50 rounded-lg p-3">
									<summary className="font-semibold cursor-pointer">{f.q}</summary>
									<div className="mt-2 text-gray-700">{f.a}</div>
								</details>
							))}
						</div>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow">
						<h3 className="text-lg font-bold mb-4">Donor stories</h3>
						<div className="space-y-4">
							{testimonials.map((t) => (
								<div key={t.id} className="p-3 border rounded">
									<div className="font-semibold">{t.name} <span className="text-xs text-gray-500">— {t.role}</span></div>
									<div className="text-sm text-gray-700 mt-1">{t.text}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* CTA */}
				<section className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-12">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="text-2xl font-extrabold">Ready to save lives?</h3>
							<p className="mt-2 text-sm">Start your donation form or visit your dashboard to view request status.</p>
						</div>
						<div className="flex gap-3">
							<Link to="/donor-dashboard" className="inline-block rounded-xl border border-white/30 text-white px-6 py-3 hover:bg-white/10">Go to Dashboard</Link>
							<Link to="/donate/kidney" className="inline-block rounded-xl bg-white text-blue-700 px-6 py-3 font-semibold">Choose Organ</Link>
						</div>
					</div>
				</section>
				{/* Animated logout section before footer */}
				<div className="flex flex-col items-center justify-center py-8">
				<div className="mb-3 text-lg font-semibold text-blue-800 animate-bounce">
					Ready to leave? You can log out securely below.
				</div>
				<Button
					variant="outline"
					className="border-blue-700 text-blue-700 hover:bg-blue-50 animate-pulse"
					onClick={handleLogout}
				>
					Log out
				</Button>
			</div>
			</main>

			<DonorFooter />
		</div>
	);
};

export default DonorLanding;
