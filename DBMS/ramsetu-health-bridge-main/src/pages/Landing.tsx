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
  ChevronDown,
  Sparkles,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type SyntheticEvent, useEffect } from "react";

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
  
  // Mock data for recent donor requests - in production, fetch from API
  const [recentRequests, setRecentRequests] = useState([
    { id: 1, name: "Arjun Kumar", organ: "Kidney", bloodType: "O+", urgency: "High", timePosted: "2 hours ago", location: "Mumbai" },
    { id: 2, name: "Priya Singh", organ: "Heart", bloodType: "AB+", urgency: "Critical", timePosted: "4 hours ago", location: "Delhi" },
    { id: 3, name: "Rajesh Sharma", organ: "Liver", bloodType: "B+", urgency: "Medium", timePosted: "6 hours ago", location: "Bangalore" },
    { id: 4, name: "Neha Patel", organ: "Cornea", bloodType: "A-", urgency: "Low", timePosted: "1 day ago", location: "Ahmedabad" },
    { id: 5, name: "Vikram Singh", organ: "Kidney", bloodType: "O-", urgency: "High", timePosted: "1 day ago", location: "Chennai" },
  ]);

  useEffect(() => {
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      // In production, fetch from API endpoint: GET /api/recent-donor-requests
      // setRecentRequests(newData);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case "Critical": return "from-red-600 to-red-700 border-red-400";
      case "High": return "from-orange-500 to-orange-600 border-orange-400";
      case "Medium": return "from-yellow-500 to-yellow-600 border-yellow-400";
      case "Low": return "from-green-500 to-green-600 border-green-400";
      default: return "from-gray-500 to-gray-600 border-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Super Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-blue-700 py-16 px-6 flex items-center justify-center min-h-[70vh]">
        {/* Dynamic animated background layers */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 -z-0 animate-bg-pan"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 15% 20%, rgba(255,255,255,0.10), transparent 50%), radial-gradient(700px 350px at 85% 25%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(600px 300px at 50% 90%, rgba(255,255,255,0.06), transparent 60%)",
            backgroundRepeat: "no-repeat",
          }}
        />
        
        {/* Floating particles effect */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, rgba(255,255,255,0.3), transparent)`,
                animation: `float ${Math.random() * 8 + 6}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10 pb-12">
          {/* Left: Textual Content - Enhanced */}
          <div className="flex-1 text-center md:text-left space-y-5">
            {/* Top badge with animation */}
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur px-6 py-3 rounded-full border border-white/40 shadow-lg hover:bg-white/40 hover:border-white/60 transition-all duration-300 group cursor-pointer">
              <Sparkles className="h-5 w-5 text-white animate-pulse group-hover:animate-spin" />
              <span className="text-lg text-white font-semibold tracking-wide">🇮🇳 India's Trusted Organ Bridge</span>
            </div>

            {/* Main heading with improved styling */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl font-sans">
                <span className="block text-accent animate-fade-in" style={{ animationDelay: "0.1s" }}>RamSetu</span>
                <div className="block mt-2 overflow-hidden">
                  <span className="inline-block text-white">Connecting </span>
                  <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent via-pink-300 to-purple-300 animate-gradient ml-2 font-black">Life</span>
                </div>
                <div className="block overflow-hidden">
                  <span className="inline-block text-white">&amp; </span>
                  <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-300 animate-gradient ml-2 font-black">Hope</span>
                </div>
              </h1>
            </div>

            {/* Enhanced description */}
            <div className="space-y-2">
              <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto md:mx-0 font-medium leading-relaxed">
                Empowering families and saving lives by securely connecting verified organ donors and patients across India. 💚
              </p>
              <p className="text-lg text-white/80 max-w-2xl mx-auto md:mx-0">
                Every registration is a bridge of hope. Join thousands of verified donors in making a difference.
              </p>
            </div>

            {/* CTA Buttons - Enhanced Design */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-3">
              <Link to="/signup?role=donor" className="group">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-accent to-pink-500 hover:from-accent/90 hover:to-pink-600 text-white font-bold px-8 py-3 text-sm rounded-xl shadow-lg hover:shadow-2xl border-2 border-white/40 transition-all duration-300 group-hover:scale-105 group-hover:border-white/60 relative overflow-hidden"
                >
                  <span className="relative flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span>Become a Donor</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Button>
              </Link>
              <Link to="/signup?role=patient" className="group">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white hover:bg-white/95 text-primary font-bold px-8 py-3 text-sm rounded-xl shadow-lg hover:shadow-2xl border-2 border-white transition-all duration-300 group-hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative flex items-center gap-2">
                    <span className="text-xl">💊</span>
                    <span>Need Transplant?</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Button>
              </Link>
              <Link to="/login" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto font-bold px-8 py-3 text-sm rounded-xl shadow-lg border-2 border-white/50 text-white bg-white/15 hover:bg-white/25 hover:border-white/70 transition-all duration-300 group-hover:scale-105"
                >
                  <span className="relative flex items-center gap-2">
                    <span className="text-xl">🔐</span>
                    <span>Login</span>
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust badges - Enhanced Glass design */}
            <div className="mt-4 rounded-2xl bg-white/12 backdrop-blur-2xl ring-1 ring-white/40 shadow-lg p-4 inline-flex flex-col sm:flex-row flex-wrap gap-2 justify-center md:justify-start border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300">
              {[
                { label: "✅ Secure & Private", icon: <ShieldCheck className="h-6 w-6 text-emerald-300" /> },
                { label: "👥 Verified Donors", icon: <Users className="h-6 w-6 text-blue-200" /> },
                { label: "🔒 HIPAA Compliant", icon: <Shield className="h-6 w-6 text-yellow-300" /> },
                { label: "⏰ 24/7 Support", icon: <Activity className="h-6 w-6 text-pink-300" /> },
              ].map(({ label, icon }, idx) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/30 text-white text-xs font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 cursor-default"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {icon} <span className="whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats in Hero - Enhanced */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t-2 border-white/30">
              {[
                { number: "1,200+", label: "Donors", icon: "👥" },
                { number: "850+", label: "Lives Saved", icon: "❤️" },
                { number: "1-2 days", label: "Avg Match", icon: "⚡" },
              ].map(({ number, label, icon }, idx) => (
                <div key={label} className="text-center group cursor-pointer hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mt-1 group-hover:text-accent transition-colors">{number}</div>
                  <div className="text-xs text-white/80 mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Hero Visual - Super Enhanced */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4 w-full md:w-auto relative">
            <div className="relative group">
              {/* Multi-layer animated glow rings */}
              <div className="absolute -inset-8 bg-gradient-to-r from-accent to-pink-500 rounded-full opacity-30 blur-3xl group-hover:opacity-60 transition-all duration-500 animate-pulse" />
              <div className="absolute -inset-6 bg-gradient-to-r from-accent/60 to-purple-500/60 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-500" style={{ animation: "pulse 2s ease-in-out infinite", animationDelay: "0.5s" }} />
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/40 to-purple-500/40 rounded-full opacity-10 blur-xl group-hover:opacity-30 transition-all duration-500" style={{ animation: "pulse 3s ease-in-out infinite", animationDelay: "1s" }} />
              
              {/* Main Logo with enhanced styling */}
              <img
                src="/logo.png"
                alt="Ram Setu Logo"
                className="relative h-48 w-48 md:h-64 md:w-64 rounded-full shadow-xl border-6 border-white/80 bg-white object-contain animate-float group-hover:scale-110 group-hover:drop-shadow-lg transition-all duration-500"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
              
              {/* Rotating accent ring */}
              <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-white/40 border-r-white/60 group-hover:border-t-accent group-hover:border-r-accent transition-all duration-500" style={{ animation: "spin 8s linear infinite", animationDirection: "reverse" }} />
              
              {/* Floating achievement badges - Animated positioning */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border-2 border-white/70 whitespace-nowrap animate-bounce hover:scale-105 transition-all duration-300 cursor-pointer">
                <span>🎯</span> 1,200+
              </div>
              
              <div className="absolute top-4 -right-4 bg-white text-primary px-3 py-1 rounded-lg text-xs font-bold shadow-lg ring-1 ring-white animate-pulse hover:scale-105 transition-all duration-300 cursor-pointer">
                <span>⚡</span> 1-2d
              </div>

              {/* Pulse circles around logo */}
              <div className="absolute -inset-16 rounded-full border border-white/10 group-hover:border-white/30 transition-all duration-500" style={{ animation: "pulse-border 2s ease-in-out infinite" }} />
              <div className="absolute -inset-24 rounded-full border border-white/5 group-hover:border-white/20 transition-all duration-500" style={{ animation: "pulse-border 3s ease-in-out infinite", animationDelay: "0.5s" }} />
            </div>

            {/* Inspirational tagline */}
            <div className="hidden md:block mt-2 text-center max-w-sm">
              <p className="text-white/90 text-sm font-semibold italic drop-shadow leading-relaxed">
                "Every registration bridges hope. 🌉 Join our mission to save lives."
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Scroll hint */}
        <a href="#journey" className="group absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 text-white/90 hover:text-white transition">
          <span className="text-xs tracking-wide bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30 group-hover:bg-white/30 transition-all">Explore more</span>
          <span className="h-9 w-9 rounded-full border border-white/40 bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors animate-bounce">
            <ChevronDown className="h-4 w-4" />
          </span>
        </a>
    </section>

    {/* Removed duplicated hero-like block that caused unbalanced JSX */}

      {/* Journey Timeline + Mosaic Gallery - Enhanced */}
  <section id="journey" className="py-20 px-6 bg-gradient-to-br from-white via-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl grid gap-12 md:grid-cols-5">
          {/* Timeline */}
          <div className="md:col-span-2">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300 mb-4">
                <span className="text-lg">🗺️</span>
                <span className="font-semibold text-blue-700">Our Journey</span>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold mb-8 text-gray-900">How We Got Here</h2>
            <ol className="relative border-l-4 border-blue-400 pl-6 space-y-8">
              {[
                { title: "Founded with a mission", desc: "Connecting donors and patients securely and compassionately.", Icon: Heart, color: "bg-red-100 border-red-300" },
                { title: "Verified process launched", desc: "Introduced rigorous document checks and privacy safeguards.", Icon: Shield, color: "bg-blue-100 border-blue-300" },
                { title: "Smart matching rolled out", desc: "Better compatibility insights for faster connections.", Icon: Activity, color: "bg-green-100 border-green-300" },
                { title: "Community support 24/7", desc: "Always-on guidance for families and donors.", Icon: Users, color: "bg-purple-100 border-purple-300" },
              ].map(({ title, desc, Icon, color }, i) => (
                <li key={title} className="ml-0 relative">
                  <div className={`absolute -left-9 top-0 h-8 w-8 rounded-full ${color} border-2 flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg`}>
                    {i + 1}
                  </div>
                  <div className="flex items-start gap-3 pl-2">
                    <Icon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-lg text-gray-900">{title}</div>
                      <p className="text-sm text-gray-600 mt-1">{desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* Mosaic Gallery */}
          <div className="md:col-span-3">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border-2 border-green-300 mb-4">
                <span className="text-lg">📸</span>
                <span className="font-semibold text-green-700">Gallery</span>
              </div>
            </div>
            <h3 className="text-4xl font-extrabold mb-8 text-gray-900">Moments from Our Community</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                    className={`${cls} relative overflow-hidden rounded-2xl border-4 border-white shadow-lg group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-300`}
                    onClick={() => setLightbox(src)}
                  >
                    <div className={big ? "aspect-[16/10]" : "aspect-[4/3]"}>
                      <img
                        src={src}
                        alt={`Journey photo ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">🔍</span>
                    </div>
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                      Moment #{idx + 1}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
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
              className="max-h-[85vh] w-auto max-w-[95vw] rounded-2xl shadow-2xl border-4 border-white/30"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </section>

      {/* Quick Stats - Enhanced */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 border-t border-blue-200/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300 mb-4">
              <span className="text-lg">📊</span>
              <span className="font-semibold text-blue-700">Our Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Making a Real Difference</h2>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Verified donors", value: "1,200+", emoji: "👥", color: "from-blue-100 to-blue-200" },
              { icon: HeartHandshake, label: "Patients helped", value: "850+", emoji: "❤️", color: "from-green-100 to-emerald-200" },
              { icon: Clock, label: "Avg. match time", value: "1-2 days", emoji: "⏱️", color: "from-purple-100 to-purple-200" },
              { icon: FileText, label: "Documents processed", value: "9,000+", emoji: "📄", color: "from-orange-100 to-orange-200" },
            ].map(({ icon: Icon, label, value, emoji, color }) => (
              <div key={label} className={`rounded-xl border-2 border-white bg-gradient-to-br ${color} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform group`}>
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-white/60 flex items-center justify-center text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                    <div className="text-sm text-gray-700 font-semibold">{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300 mb-4 hover:scale-105 transition-transform">
              <span className="text-lg">✨</span>
              <span className="font-semibold text-blue-700">Key Features</span>
            </div>
            <h2 className="text-5xl md:text-5xl font-extrabold text-gray-900 mb-3">Why Choose RamSetu?</h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mt-4"></div>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto mt-4">A transparent, secure process from registration to life-saving connections powered by technology and compassion</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "📋", title: "Easy Registration", desc: "Simple signup process for donors and patients with secure profile creation and document verification.", color: "from-blue-50 to-blue-100", border: "border-blue-300", shadow: "shadow-blue-200", number: "01" },
              { emoji: "🔐", title: "Verified & Secure", desc: "Admin verification of all medical documents ensuring authenticity and safety for all parties involved.", color: "from-green-50 to-green-100", border: "border-green-300", shadow: "shadow-green-200", number: "02" },
              { emoji: "🧠", title: "Matching & Support", desc: "Smart matching system connects patients with compatible donors, with ongoing support from our team.", color: "from-purple-50 to-purple-100", border: "border-purple-300", shadow: "shadow-purple-200", number: "03" },
            ].map(({ emoji, title, desc, color, border, shadow, number }) => (
              <div key={title} className={`rounded-2xl border-2 ${border} bg-gradient-to-br ${color} p-8 shadow-lg ${shadow} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform group relative overflow-hidden`}>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                    <div className="text-5xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">{number}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-700 text-base leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organ Programs - Enhanced */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-green-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border-2 border-green-300 mb-4">
              <span className="text-lg">❤️</span>
              <span className="font-semibold text-green-700">Donation Programs</span>
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-3">Organs & Tissues We Support</h2>
            <p className="text-gray-700 text-lg">Comprehensive donation pathways with medical guidance and strict safety protocols</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { title: "❤️ Heart", emoji: "❤️", Icon: Heart, copy: "Comprehensive heart donation pathway with medical guidance.", color: "from-red-100 to-pink-100", border: "border-red-300" },
              { title: "🫘 Liver", emoji: "🫘", Icon: Activity, copy: "Thorough evaluation and support throughout the process.", color: "from-amber-100 to-orange-100", border: "border-amber-300" },
              { title: "💧 Kidney", emoji: "💧", Icon: Stethoscope, copy: "Living and deceased donor programs with safeguards.", color: "from-cyan-100 to-blue-100", border: "border-cyan-300" },
              { title: "👁️ Cornea", emoji: "👁️", Icon: Eye, copy: "Restoring sight with strict quality and safety protocols.", color: "from-green-100 to-emerald-100", border: "border-green-300" },
            ].map(({ title, emoji, Icon, copy, color, border }) => (
              <div
                key={title}
                className={`rounded-2xl border-2 ${border} bg-gradient-to-br ${color} p-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform group`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl group-hover:scale-125 transition-transform duration-300">{emoji}</div>
                  <div className="font-bold text-xl text-gray-900 flex-1">{title}</div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awareness Video + Suggestions */}
      <section className="py-16 px-6 bg-white border-t border-border">
        <div className="container mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 flex items-center gap-2 border-b-2 border-blue-300">
              <VideoIcon className="h-5 w-5 text-white animate-pulse" />
              <div className="font-semibold text-white text-lg">🎥 Awareness video</div>
            </div>
            <div className="bg-black/5 relative group">
              {(() => {
                const embed = toYouTubeEmbed(LANDING_VIDEO_URL);
                if (embed) {
                  return (
                    <div className="relative aspect-video">
                      <iframe
                        src={embed}
                        title="Organ donation awareness"
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
                    <source src={LANDING_VIDEO_URL} />
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Newspaper className="h-5 w-5 text-accent animate-bounce" /> Suggested videos
            </div>
            {[
              { title: "Why organ donation matters", url: "https://www.youtube.com/watch?v=1vMNPUj-reE", emoji: "❤️" },
              { title: "Myth vs facts: donation", url: "https://www.youtube.com/watch?v=4b-_0AEUYYk", emoji: "🔍" },
              { title: "Living donor journey", url: "https://www.youtube.com/watch?v=7PFKSl2QV9w", emoji: "🌟" },
            ].map((v) => (
              <a
                key={v.title}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-4 rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{v.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-blue-600 truncate">{v.title}</div>
                  <div className="text-xs text-gray-600">YouTube</div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-testimonial" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-testimonial)" />
          </svg>
        </div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30 mb-6">
            <span className="text-lg">💬</span>
            <span className="font-semibold">Testimonials</span>
          </div>
          <h2 className="text-5xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Trusted by Families & Donors</h2>
          <p className="text-white/90 mb-16 text-xl max-w-3xl mx-auto">Real stories from people who have changed lives through RamSetu</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border-2 border-cyan-300/50 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 backdrop-blur p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">👨‍👩‍👧</div>
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-2xl">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-lg italic mb-4 leading-relaxed text-white drop-shadow">"RamSetu made the process so easy and safe. We found a matching donor in just 2 days! Our gratitude is endless."</p>
              <div className="font-semibold text-white/90">- Patient's Family</div>
            </div>
            <div className="rounded-2xl border-2 border-pink-300/50 bg-gradient-to-br from-rose-400/30 to-pink-400/20 backdrop-blur p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">❤️</div>
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-2xl">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-lg italic mb-4 leading-relaxed text-white drop-shadow">"I always wanted to help. RamSetu's team guided me at every step. It was the most meaningful decision of my life."</p>
              <div className="font-semibold text-white/90">- Organ Donor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section - Enhanced */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300 mb-4">
              <span className="text-lg">📚</span>
              <span className="font-semibold text-blue-700">Knowledge Hub</span>
            </div>
            <h2 className="text-5xl md:text-5xl font-extrabold text-gray-900 mb-3">Latest Health Articles</h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto"></div>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mt-4">Evidence-based resources and expert insights on organ donation and transplantation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200&auto=format&fit=crop",
                title: "NCBI Bookshelf: Organ donation & transplantation",
                excerpt: "Evidence-based reference from the U.S. National Library of Medicine.",
                href: "https://www.ncbi.nlm.nih.gov/books/NBK557431/",
                emoji: "📖"
              },
              {
                img: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=1200&auto=format&fit=crop",
                title: "JCHM: Community health perspective",
                excerpt: "Peer-reviewed article from the Journal of Community Health Management.",
                href: "https://jchm.in/archive/volume/7/issue/3/article/14041#article",
                emoji: "🔬"
              },
              {
                img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
                title: "Frontiers in Psychology (2023)",
                excerpt: "Open-access research exploring psychological aspects of donation.",
                href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1111328/full",
                emoji: "🧠"
              },
            ].map((a, i) => (
              <article key={i} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:scale-105 transform">
                <div className="relative overflow-hidden h-48">
                  <img src={a.img} alt={a.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-5xl">{a.emoji}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{a.title}</div>
                  <div className="text-sm text-gray-600 mb-4">{a.excerpt}</div>
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 group/link transition-all duration-300"
                  >
                    Read article <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Contact Section - Enhanced */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-purple-50 to-blue-50 border-t border-blue-200/40">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full border-2 border-purple-300 mb-6">
            <span className="text-lg">❓</span>
            <span className="font-semibold text-purple-700">Get Help</span>
          </div>
          <h2 className="text-5xl font-extrabold mb-4 text-gray-900">Still have questions?</h2>
          <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
            Our expert team is here to guide you through every step of your organ donation journey. Reach out anytime!
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "🎯", title: "Learn More", desc: "Explore detailed information about donation", link: "/about" },
              { icon: "📞", title: "Contact Us", desc: "Get in touch with our support team", link: "/contact" },
              { icon: "❓", title: "FAQ", desc: "Find answers to common questions", link: "/contact" },
            ].map(({ icon, title, desc, link }) => (
              <Link key={title} to={link} className="group">
                <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105 h-full">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </Link>
            ))}
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

/* Gentle background panning for hero soft lights */
@keyframes bg-pan {
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(2%, -2%, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.animate-bg-pan { animation: bg-pan 18s ease-in-out infinite; will-change: transform; }

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-bg-pan, .animate-float { animation: none !important; }
}
        `}
      </style>
    </div>
  );
};

export default Landing;
