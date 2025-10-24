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
        <section id="mission" className="py-14 px-6 bg-background">
          <div className="container mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Our Mission",
                text: "Make organ donation and matching transparent, secure, and accessible for everyone.",
                Icon: Activity,
              },
              {
                title: "Our Vision",
                text: "Bridge the gap between hope and healing using responsible technology and human-first design.",
                Icon: ShieldCheck,
              },
              {
                title: "Our Values",
                text: "Compassion • Transparency • Security • Innovation • Community",
                Icon: Users,
              },
            ].map(({ title, text, Icon }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Video + Key Points */}
        <section className="py-14 px-6 bg-white border-t border-border">
          <div className="container mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl overflow-hidden shadow border border-border">
              <div className="bg-gray-50 p-3 flex items-center gap-2 border-b border-border">
                <PlayCircle className="h-5 w-5 text-primary" />
                <div className="font-semibold">How it works</div>
              </div>
              <div className="bg-black/5">
                {(() => {
                  const embed = toYouTubeEmbed(ABOUT_VIDEO_URL);
                  if (embed) {
                    return (
                      <div className="relative aspect-video">
                        <iframe
                          src={embed}
                          title="About RamSetu"
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
                    <video className="w-full h-auto" controls preload="metadata">
                      <source src={ABOUT_VIDEO_URL} />
                      Your browser does not support the video tag.
                    </video>
                  );
                })()}
              </div>
            </div>
            <div className="space-y-4">
              {["Privacy-first profiles", "Admin-verified documents", "Smart matching logic", "Compassionate support"].map((p) => (
                <div key={p} className="p-3 rounded-lg border border-border bg-muted/40">
                  <div className="font-medium">{p}</div>
                  <p className="text-xs text-muted-foreground">We’re building responsibly to keep people safe and informed.</p>
                </div>
              ))}
              <a href="/contact" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                Contact our team <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-14 px-6 bg-muted">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">In pictures</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {galleryImages.slice(0, 10).map((src, idx) => (
                <figure
                  key={src + idx}
                  className={`relative overflow-hidden rounded-xl border border-border shadow group cursor-pointer ${idx % 5 === 0 ? "col-span-2 md:col-span-3 row-span-2" : "col-span-1"}`}
                  onClick={() => setLightbox(src)}
                >
                  <div className={idx % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}>
                    <img
                      src={src}
                      alt={`About gallery ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e: any) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                    Moment {idx + 1}
                  </figcaption>
                </figure>
              ))}
            </div>
            {lightbox && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setLightbox(null)}
                role="dialog"
                aria-modal="true"
              >
                <img
                  src={lightbox}
                  alt="Expanded gallery"
                  className="max-h-[85vh] w-auto max-w-[95vw] rounded-lg shadow-2xl border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-6 bg-white border-t border-border">
          <div className="container mx-auto max-w-3xl text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to be part of the bridge?</h3>
            <p className="text-muted-foreground mb-5">Whether you’re a donor or seeking support for a loved one, we’re here to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/signup?role=donor" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition">Register as Donor</a>
              <a href="/signup?role=patient" className="bg-accent text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-accent/90 transition">Register as Patient</a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
              <a href="/login?role=donor" className="px-6 py-3 rounded-lg font-semibold border border-border text-foreground bg-white hover:bg-muted transition">Login as Donor</a>
              <a href="/login?role=patient" className="px-6 py-3 rounded-lg font-semibold border border-border text-foreground bg-white hover:bg-muted transition">Login as Patient</a>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;
