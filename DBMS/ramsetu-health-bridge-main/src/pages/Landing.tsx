import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Users,
  Shield,
  Activity,
  FileText,
  ShieldCheck,
  HeartHandshake,
  Video as VideoIcon,
  Newspaper,
  PlayCircle,
  ArrowRight,
  Lock,
  Stethoscope,
  Eye,
  Award,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type SyntheticEvent } from "react";

// Dynamically include all images placed under /Images (png, jpg, jpeg, webp, avif, gif)
const importedGallery = import.meta.glob("../../Images/*.{png,jpg,jpeg,webp,avif,gif}", {
  eager: true,
}) as Record<string, { default: string }>;
const galleryImages: string[] = Object.values(importedGallery).map((m) => m.default);
// Fallbacks if no local images are found
if (galleryImages.length === 0) {
  galleryImages.push(
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580281657527-47d5b1a98c2b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?q=80&w=1200&auto=format&fit=crop"
  );
}

const Landing = () => {
  // Optional: env-driven video URL; defaults to local MP4 to avoid embed blocks
  const { VITE_LANDING_VIDEO_URL, VITE_DONOR_VIDEO_URL } =
    (import.meta.env as unknown as {
      VITE_LANDING_VIDEO_URL?: string;
      VITE_DONOR_VIDEO_URL?: string;
    });

  const LANDING_VIDEO_URL: string =
    VITE_LANDING_VIDEO_URL || VITE_DONOR_VIDEO_URL || "/videos/awareness.mp4";

  // Normalize YouTube links to embeddable form
  const toYouTubeEmbed = (raw?: string): string | null => {
    if (!raw) return null;
    try {
      const url = new URL(
        raw,
        typeof window !== "undefined" ? window.location.origin : "https://localhost"
      );
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      const path = url.pathname;
      const qp = url.searchParams;

      const parseStart = () => {
        const s = qp.get("start") || qp.get("t") || "";
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
  };

  // Lightbox state for gallery images
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8">
            {/* Logo on the left for desktop, top for mobile */}
            <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto mb-8 md:mb-0">
              <img
                src="/logo.png"
                alt="Ram Setu Logo"
                className="h-56 w-56 md:h-72 md:w-72 rounded-full shadow-2xl border-4 border-white bg-white object-contain animate-float"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-7">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-5 py-1.5 rounded-full border border-white/30 shadow-sm">
                <Heart className="h-4 w-4 text-accent" />
                <span className="text-base text-white font-medium tracking-wide">Bridging Healthcare</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg font-sans">
                RamSetu: <span className="text-accent">Connecting Life</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto md:mx-0 font-normal">
                A secure platform bridging organ donors and patients, creating hope through verified connections and compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-4">
                <Link to="/signup?role=donor">
                  <Button size="lg" className="bg-white text-primary font-semibold px-8 py-3 text-base rounded-lg shadow hover:bg-primary/10 hover:text-primary border border-primary transition-all">
                    Register as Donor
                  </Button>
                </Link>
                <Link to="/signup?role=patient">
                  <Button size="lg" className="bg-white text-primary font-semibold px-8 py-3 text-base rounded-lg shadow hover:bg-primary/10 hover:text-primary border border-primary transition-all">
                    Register as Patient
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="font-semibold px-8 py-3 text-base rounded-lg shadow border border-primary text-primary bg-white/80 hover:bg-primary/10 transition-all">
                    Login
                  </Button>
                </Link>
              </div>
              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-95">
                {["Secure", "Verified", "HIPAA-like", "24/7 Support"].map((t) => (
                  <div
                    key={t}
                    className="text-white/80 text-sm bg-white/10 rounded-lg px-3 py-2 border border-white/20 flex items-center gap-2 justify-center"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-300" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Subtle gradient highlights */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Journey Timeline + Mosaic Gallery */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl grid gap-10 md:grid-cols-5">
          {/* Timeline */}
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Our Journey</h2>
            <ol className="relative border-l-2 border-muted-foreground/20 pl-5 space-y-8">
              {[
                { title: "Founded with a mission", desc: "Connecting donors and patients securely and compassionately.", Icon: Heart },
                { title: "Verified process launched", desc: "Introduced rigorous document checks and privacy safeguards.", Icon: Shield },
                { title: "Smart matching rolled out", desc: "Better compatibility insights for faster connections.", Icon: Activity },
                { title: "Community support 24/7", desc: "Always-on guidance for families and donors.", Icon: Users },
              ].map(({ title, desc, Icon }, i) => (
                <li key={title} className="ml-2">
                  <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold">{title}</div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* Mosaic Gallery */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-semibold mb-4">In Pictures</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {galleryImages.slice(0, 8).map((src, idx) => {
                const big = idx === 0;
                const cls = big
                  ? "col-span-2 md:col-span-3 row-span-2 md:row-span-2"
                  : idx % 3 === 0
                  ? "col-span-1 md:col-span-2"
                  : "col-span-1 md:col-span-1";
                return (
                  <figure
                    key={src + idx}
                    className={`${cls} relative overflow-hidden rounded-xl border border-border shadow group cursor-pointer`}
                    onClick={() => setLightbox(src)}
                  >
                    <div className={big ? "aspect-[16/10]" : "aspect-[4/3]"}>
                      <img
                        src={src}
                        alt={`Journey photo ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                      Moment {idx + 1}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
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
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-6 bg-white border-t border-border/60">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Verified donors", value: "1,200+" },
            { icon: HeartHandshake, label: "Patients helped", value: "850+" },
            { icon: Clock, label: "Avg. match time", value: "1-2 days" },
            { icon: FileText, label: "Documents processed", value: "9,000+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-muted/40 p-4 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold leading-tight">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{/* Dashboard link removed as requested */}</h2>
            <p className="text-muted-foreground text-lg">
              A transparent, secure process from registration to life-saving connections
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
                <p className="text-muted-foreground">
                  Simple signup process for donors and patients with secure profile creation and document verification.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified & Secure</h3>
                <p className="text-muted-foreground">
                  Admin verification of all medical documents ensuring authenticity and safety for all parties involved.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Matching & Support</h3>
                <p className="text-muted-foreground">
                  Smart matching system connects patients with compatible donors, with ongoing support from our team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organ Programs */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Donation Programs</h2>
            <div className="text-sm text-muted-foreground">We support multiple organ and tissue programs</div>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { title: "Heart", Icon: Heart, copy: "Comprehensive heart donation pathway with medical guidance." },
              { title: "Liver", Icon: Activity, copy: "Thorough evaluation and support throughout the process." },
              { title: "Kidney", Icon: Stethoscope, copy: "Living and deceased donor programs with safeguards." },
              { title: "Cornea", Icon: Eye, copy: "Restoring sight with strict quality and safety protocols." },
            ].map(({ title, Icon, copy }) => (
              <div
                key={title}
                className="rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition group bg-gradient-to-b from-white to-muted/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="font-semibold text-lg group-hover:text-primary">{title}</div>
                </div>
                <p className="text-sm text-muted-foreground">{copy}</p>
                <div className="mt-4">
                  <Link
                    to={`/signup?role=donor&organ=${title.toLowerCase()}`}
                    className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                  >
                    Start form <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Security, Privacy, and Compliance</h2>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
              Your data is protected with industry-standard practices. We only share information necessary to enable matching and care coordination.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: Shield, title: "Verified identities", text: "Multi-step verification for donors and patients." },
              { Icon: Lock, title: "Data privacy", text: "Sensitive documents stored securely, accessible only by authorized staff." },
              { Icon: FileText, title: "Audit & traceability", text: "Every action is logged for transparency and compliance." },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-5 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="font-semibold">{title}</div>
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Note: We align to HIPAA-like safeguards; this platform is not a substitute for professional medical advice.
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-10 px-6 bg-white border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-primary" /> Trusted by communities and clinics
            </div>
            <div className="text-xs text-muted-foreground">Pilot initiatives across regions</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center opacity-80">
            {["MedConnect", "CareLink", "HealthBridge", "LifeTrust", "OpenHearts"].map((brand) => (
              <div key={brand} className="rounded-lg border border-border py-3 px-4 bg-muted text-center text-sm">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awareness Video + Suggestions */}
      <section className="py-16 px-6 bg-white border-t border-border">
        <div className="container mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow border border-border">
            <div className="bg-gray-50 p-3 flex items-center gap-2 border-b border-border">
              <VideoIcon className="h-5 w-5 text-primary" />
              <div className="font-semibold">Awareness video</div>
            </div>
            <div className="bg-black/5">
              {(() => {
                const embed = toYouTubeEmbed(LANDING_VIDEO_URL);
                if (embed) {
                  return (
                    <div className="relative aspect-video">
                      <iframe
                        src={embed}
                        title="Organ donation awareness"
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
                    <source src={LANDING_VIDEO_URL} />
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Newspaper className="h-5 w-5 text-accent" /> Suggested videos
            </div>
            {[
              { title: "Why organ donation matters", url: "https://www.youtube.com/watch?v=1vMNPUj-reE" },
              { title: "Myth vs facts: donation", url: "https://www.youtube.com/watch?v=4b-_0AEUYYk" },
              { title: "Living donor journey", url: "https://www.youtube.com/watch?v=7PFKSl2QV9w" },
            ].map((v) => (
              <a
                key={v.title}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition"
              >
                <PlayCircle className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <div className="font-medium group-hover:text-primary">{v.title}</div>
                  <div className="text-xs text-muted-foreground">YouTube</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Trusted by Families & Donors</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <div className="bg-muted rounded-xl p-6 shadow w-full md:w-1/2">
              <p className="text-lg italic mb-2">“RamSetu made the process so easy and safe. We found a matching donor in days!”</p>
              <span className="font-semibold text-primary">- Patient’s Family</span>
            </div>
            <div className="bg-muted rounded-xl p-6 shadow w-full md:w-1/2">
              <p className="text-lg italic mb-2">“I always wanted to help. RamSetu’s team guided me at every step.”</p>
              <span className="font-semibold text-accent">- Donor</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest health articles</h2>
            <a href="#" className="text-primary text-sm hover:underline">
              See all
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200&auto=format&fit=crop",
                title: "NCBI Bookshelf: Organ donation & transplantation",
                excerpt: "Evidence-based reference from the U.S. National Library of Medicine.",
                href: "https://www.ncbi.nlm.nih.gov/books/NBK557431/",
              },
              {
                img: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=1200&auto=format&fit=crop",
                title: "JCHM: Community health perspective",
                excerpt: "Peer-reviewed article from the Journal of Community Health Management.",
                href: "https://jchm.in/archive/volume/7/issue/3/article/14041#article",
              },
              {
                img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
                title: "Frontiers in Psychology (2023)",
                excerpt: "Open-access research exploring psychological aspects of donation.",
                href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1111328/full",
              },
            ].map((a, i) => (
              <article key={i} className="bg-white rounded-xl overflow-hidden shadow border border-border">
                <img src={a.img} alt={a.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{a.excerpt}</div>
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:underline"
                  >
                    Read article <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Contact Section */}
      <section className="py-16 px-6 bg-background border-t border-border">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Check our <a href="/contact" className="text-primary underline">FAQ</a> or
            <a href="/contact" className="text-accent underline"> contact our team</a> for more information.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
            >
              Contact Us
            </a>
            <a
              href="/about"
              className="bg-accent text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-accent/90 transition"
            >
              About Us
            </a>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-12 px-6 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto max-w-6xl text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold">Ready to create a bridge of hope?</h3>
          <p className="text-white/90 mt-2">
            Join our community of donors and families—every step is guided, secure, and compassionate.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup?role=donor" className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white text-primary px-5 py-2 font-semibold shadow hover:bg-white/90">
                Become a donor <Heart className="h-4 w-4" />
              </span>
            </Link>
            <Link to="/signup?role=patient" className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-5 py-2 font-semibold ring-1 ring-white/40 hover:bg-white/15">
                I’m a patient <Stethoscope className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-muted border-t border-border mt-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Ram Setu Logo"
              className="h-8 w-8 rounded-full bg-white border border-gray-200 object-contain"
            />
            <span className="font-bold text-primary">RamSetu</span>
          </div>
          <div className="text-muted-foreground text-sm">labourzkart@gmail.com | 7505675163</div>
          <div className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} RamSetu. All rights reserved.</div>
          <div className="flex gap-3">
            <a href="#" className="hover:text-primary transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition">
              Terms
            </a>
          </div>
        </div>
      </footer>

      <style>
        {`
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default Landing;
