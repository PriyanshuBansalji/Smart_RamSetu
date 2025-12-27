import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Heart, ShieldCheck, Users, Activity, PlayCircle, ArrowRight } from "lucide-react";

// Helper: normalize YouTube links to embeddable form. Returns null for non-YouTube.
function toYouTubeEmbed(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://localhost");
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname;
    const qp = url.searchParams;

    const parseStart = () => {
      let s = qp.get("start") || qp.get("t") || "";
      if (!s) return "";
      const rx = /^((\d+)h)?((\d+)m)?((\d+)s)?$/;
      const m = rx.exec(s);
      if (m) {
        const h = parseInt(m[2] || "0", 10);
        const mi = parseInt(m[4] || "0", 10);
        const se = parseInt(m[6] || "0", 10);
        return String(h * 3600 + mi * 60 + se);
      }
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? String(n) : "";
    };

    let id: string | null = null;
    if (host === "youtu.be") id = path.replace(/^\//, "").split("/")[0] || null;
    else if (host.endsWith("youtube.com")) {
      if (path === "/watch") id = qp.get("v");
      else if (path.startsWith("/embed/")) id = path.split("/")[2] || null;
      else if (path.startsWith("/shorts/")) id = path.split("/")[2] || null;
    }
    if (!id) return null;
    const start = parseStart();
    const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
    if (start) params.set("start", start);
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

// Auto-import images from the project's Images directory
const importedGallery = import.meta.glob("../../Images/*.{png,jpg,jpeg,webp,avif,gif}", { eager: true }) as Record<string, { default: string }>;
const galleryImages: string[] = Object.values(importedGallery).map((m) => m.default);
if (galleryImages.length === 0) {
  galleryImages.push(
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop"
  );
}

const About: React.FC = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const ABOUT_VIDEO_URL: string =
    (import.meta as any).env?.VITE_ABOUT_VIDEO_URL ||
    (import.meta as any).env?.VITE_LANDING_VIDEO_URL ||
    (import.meta as any).env?.VITE_DONOR_VIDEO_URL ||
    "/videos/awareness.mp4";

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero - redesigned */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-accent/80 text-white">
          {/* Decorative background orbs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
            <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
            <div className="absolute bottom-[-3rem] right-[-2rem] h-96 w-96 rounded-full bg-rose-300/20 blur-3xl" />
          </div>
          {/* Subtle grid pattern */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="relative z-10">
            <div className="container mx-auto px-6 py-16 grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full border border-white/25 shadow-sm">
                  <Heart className="h-4 w-4 text-rose-200" />
                  <span className="text-sm">About RamSetu Health Bridge</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
                  Bridging hope with secure, compassionate connections
                </h1>
                <p className="text-white/90 max-w-xl">
                  We connect organ donors and patients through a verified, privacy-first process—guided by empathy, supported by technology.
                </p>
                <div className="flex gap-3">
                  <a href="/signup?role=donor" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg border border-white/40 hover:bg-white/90 transition">
                    Become a donor <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="/signup?role=organ-taker" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg border border-white/40 hover:bg-white/90 transition">
                    Become a Organ Taker <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="/about#mission" className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-lg border border-white/30 hover:bg-white/15 transition">
                    Learn more
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a href="/signin?role=patient" className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-md border border-white/30 hover:bg-white/15 text-sm transition">
                    Login as Patient
                  </a>
                  <a href="/signin?role=organ-taker" className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-md border border-white/30 hover:bg-white/15 text-sm transition">
                    Login as Organ Taker
                  </a>
                </div>
                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3 max-w-md text-left">
                  <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                    <div className="text-xl font-bold">1k+</div>
                    <div className="text-xs text-white/80 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Donors</div>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                    <div className="text-xl font-bold">2k+</div>
                    <div className="text-xs text-white/80 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Docs verified</div>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                    <div className="text-xl font-bold">24/7</div>
                    <div className="text-xs text-white/80 flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Support</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-[2rem] bg-white/15 blur-md" />
                  <div className="relative rounded-[2rem] border-4 border-white/60 bg-white/90 p-3 shadow-2xl rotate-[0.deg]">
                    <img src="/logo.png" alt="RamSetu" className="h-56 w-56 md:h-72 md:w-72 rounded-2xl object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Curved divider */}
          <svg aria-hidden className="block w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,64 C320,0 1120,128 1440,64 L1440,80 L0,80 Z" fill="#ffffff" fillOpacity="1" />
          </svg>
        </section>

        {/* Mission / Vision / Values */}
        <section id="mission" className="py-16 px-6 bg-gradient-to-b from-white via-blue-50 to-green-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-200 mb-4">
                <span className="text-lg">💡</span>
                <span className="font-semibold text-blue-700">Our Foundation</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-gray-900">Core Values That Guide Us</h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">Mission, vision, and values that drive everything we do to bridge hope with compassion</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "🎯 Our Mission",
                  text: "Make organ donation and matching transparent, secure, and accessible for everyone.",
                  Icon: Activity,
                  bgColor: "from-blue-50 to-cyan-50",
                  borderColor: "border-blue-300",
                  accentColor: "bg-blue-200",
                  shadowColor: "shadow-blue-200",
                },
                {
                  title: "🌟 Our Vision",
                  text: "Bridge the gap between hope and healing using responsible technology and human-first design.",
                  Icon: ShieldCheck,
                  bgColor: "from-green-50 to-emerald-50",
                  borderColor: "border-green-300",
                  accentColor: "bg-green-200",
                  shadowColor: "shadow-green-200",
                },
                {
                  title: "❤️ Our Values",
                  text: "Compassion • Transparency • Security • Innovation • Community",
                  Icon: Users,
                  bgColor: "from-purple-50 to-pink-50",
                  borderColor: "border-purple-300",
                  accentColor: "bg-purple-200",
                  shadowColor: "shadow-purple-200",
                },
              ].map(({ title, text, Icon, bgColor, borderColor, accentColor, shadowColor }) => (
                <div key={title} className={`rounded-2xl border-2 ${borderColor} bg-gradient-to-br ${bgColor} p-8 shadow-xl ${shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 transform group`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-xl ${accentColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-gray-900" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">{title}</h3>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video + Key Points */}
        <section className="py-20 px-6 bg-gradient-to-br from-white via-blue-50 to-green-50">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-200">
                <span className="text-lg">🎬</span>
                <span className="font-semibold text-blue-700">How We Work</span>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-200 hover:shadow-3xl hover:border-blue-400 transition-all duration-300 hover:scale-105 transform origin-bottom-left group bg-black/5">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-5 flex items-center gap-3 border-b-4 border-blue-300">
                  <PlayCircle className="h-6 w-6 text-white animate-pulse" />
                  <div className="font-bold text-white text-lg">🎥 How RamSetu Works</div>
                </div>
                <div className="bg-gray-900 relative overflow-hidden">
                  {(() => {
                    const embed = toYouTubeEmbed(ABOUT_VIDEO_URL);
                    if (embed) {
                      return (
                        <div className="relative aspect-video">
                          <iframe
                            src={embed}
                            title="About RamSetu"
                            className="absolute inset-0 h-full w-full group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return (
                      <video className="w-full h-auto group-hover:scale-105 transition-transform duration-300" controls preload="metadata">
                        <source src={ABOUT_VIDEO_URL} />
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { emoji: "🔐", title: "Privacy-first profiles", desc: "Your data is encrypted and protected with industry standards" },
                  { emoji: "✅", title: "Admin-verified documents", desc: "All documents verified by certified healthcare professionals" },
                  { emoji: "🧠", title: "Smart matching logic", desc: "Advanced algorithm finds the best patient-donor matches" },
                  { emoji: "❤️", title: "Compassionate support", desc: "24/7 support team to guide you through every step" },
                ].map((p) => (
                  <div key={p.title} className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group/card">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl group-hover/card:scale-125 transition-transform duration-300">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-base">{p.title}</div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <a href="/contact" className="inline-flex items-center justify-center gap-2 w-full text-white bg-gradient-to-r from-blue-600 to-green-600 hover:shadow-lg hover:from-blue-700 hover:to-green-700 px-6 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 text-base">
                  Contact our team <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-4xl">📸</span>
                <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Gallery & Moments</h2>
                </div>
              </div>
              <p className="text-gray-700 mb-2 max-w-3xl text-lg font-medium">Snapshots from our community of donors and patients making a difference together.</p>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {galleryImages.slice(0, 10).map((src, idx) => (
                <figure
                  key={src + idx}
                  className={`relative overflow-hidden rounded-2xl border-4 border-white shadow-lg group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-300 ${idx % 5 === 0 ? "col-span-2 md:col-span-3 row-span-2" : "col-span-1"}`}
                  onClick={() => setLightbox(src)}
                >
                  <div className={idx % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}>
                    <img
                      src={src}
                      alt={`About gallery ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e: any) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <span className="text-white text-4xl font-bold animate-bounce">🔍</span>
                    <p className="text-white text-sm font-semibold mt-2">View Image</p>
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                    Moment #{idx + 1}
                  </figcaption>
                </figure>
              ))}
            </div>
            {lightbox && (
              <div
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
                onClick={() => setLightbox(null)}
                role="dialog"
                aria-modal="true"
              >
                <button
                  onClick={() => setLightbox(null)}
                  className="absolute top-6 right-6 text-white text-4xl hover:text-red-400 transition-colors font-bold"
                  aria-label="Close"
                >
                  ✕
                </button>
                <img
                  src={lightbox}
                  alt="Expanded gallery"
                  className="max-h-[85vh] w-auto max-w-[95vw] rounded-2xl shadow-2xl border-4 border-white/30 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots-cta" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots-cta)" />
            </svg>
          </div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30 mb-6">
              <span className="text-lg">🌉</span>
              <span className="font-semibold">Next Steps</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight">Ready to be part of the bridge?</h3>
            <p className="text-white/95 mb-10 text-xl max-w-3xl mx-auto leading-relaxed">Whether you're a donor or seeking support for a loved one, we're here to help you make a life-changing difference. Join thousands of compassionate people saving lives.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="/signup?role=donor" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 text-lg">
                ✅ Become a Donor
              </a>
              <a href="/signup?role=patient" className="inline-flex items-center justify-center gap-2 bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 text-lg">
                💊 Become a Recipient
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signin?role=donor" className="inline-flex items-center justify-center gap-2 bg-white/15 text-white px-6 py-3 rounded-xl font-semibold border-2 border-white/40 hover:bg-white/25 hover:border-white/60 backdrop-blur transition-all duration-200 hover:scale-105">
                Login as Donor
              </a>
              <a href="/signin?role=patient" className="inline-flex items-center justify-center gap-2 bg-white/15 text-white px-6 py-3 rounded-xl font-semibold border-2 border-white/40 hover:bg-white/25 hover:border-white/60 backdrop-blur transition-all duration-200 hover:scale-105">
                Login as Recipient
              </a>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;
