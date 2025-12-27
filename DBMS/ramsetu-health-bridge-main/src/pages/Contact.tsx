import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLayout from "@/components/AppLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type FormState = {
  name: string;
  email: string;
  message: string;
  location: string;
};

const initialForm: FormState = { name: "", email: "", message: "", location: "" };

// Fix Leaflet marker icons not showing in bundlers (Vite/webpack)
// Ensure this runs in browser only
if (typeof window !== "undefined") {
  // @ts-ignore - private prop
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  });
}

// Helper component: click map to set marker
const ClickToSetMarker: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Restore last location from localStorage (if present)
  useEffect(() => {
    const saved = localStorage.getItem("contact:lastLocation");
    if (saved) {
      try {
        const [lat, lng] = JSON.parse(saved) as [number, number];
        setPosition([lat, lng]);
        setForm((p) => ({ ...p, location: `${lat},${lng}` }));
      } catch {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Simple validators
  const emailValid = useMemo(() => /.+@.+\..+/.test(form.email.trim()), [form.email]);
  const nameValid = form.name.trim().length >= 2;
  const messageValid = form.message.trim().length >= 10;
  const messageLen = form.message.trim().length;
  const formValid = nameValid && emailValid && messageValid;

  // Get location from browser
  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Geolocation is not supported by your browser." });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setForm((prev) => ({ ...prev, location: `${latitude},${longitude}` }));
        localStorage.setItem("contact:lastLocation", JSON.stringify([latitude, longitude]));
        setLocating(false);
      },
      (err) => {
        setStatus({ type: "error", message: err.message || "Unable to retrieve your location." });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    if (!formValid) {
      setStatus({ type: "error", message: "Please complete all required fields correctly." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
      setStatus({ type: "success", message: "Thank you! Your message has been sent. We’ll get back to you soon." });
      setForm(initialForm);
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <section className="relative">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="container mx-auto px-6 py-16 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 animate-fade-in">
                📬 Get in touch
              </h1>
              <p className="text-blue-100/90 text-lg max-w-xl">
                We'd love to hear from you. Send us a message and our team will respond promptly with any questions or feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 -mt-8 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Form card */}
            <div className="rounded-2xl bg-white border border-blue-100 shadow-2xl p-8 transform hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">✉️</span>
                <h2 className="text-2xl font-extrabold text-gray-900">Send us a message</h2>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your full name"
                    required
                    minLength={2}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${nameValid ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200" : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"}`}
                  />
                  {!nameValid && form.name && <p className="text-xs text-red-600 mt-1">🚫 Name must be at least 2 characters</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="you@example.com"
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${emailValid ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200" : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"}`}
                  />
                  {!emailValid && form.email && <p className="text-xs text-red-600 mt-1">🚫 Please enter a valid email address</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900">Message</label>
                    <span className={`text-xs font-semibold ${messageValid ? "text-green-600" : "text-red-600"}`}>
                      {messageLen}/10 characters
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help? Be as detailed as possible..."
                    rows={5}
                    required
                    minLength={10}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none resize-none ${messageValid ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200" : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"}`}
                  />
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${messageValid ? "bg-green-500 w-full" : `bg-red-500 w-[${Math.min(messageLen, 10) * 10}%]`}`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">📍 Location (optional)</label>
                  <div className="flex gap-2">
                    <input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      type="text"
                      placeholder="lat,lng or address"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white px-5 py-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 transition-all duration-200"
                    >
                      {locating ? "📍 Locating…" : "📍 My location"}
                    </button>
                  </div>
                  {position && (
                    <div className="text-xs text-green-600 mt-2 font-semibold">✅ Location detected: {form.location}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-disabled={loading}
                  title={!formValid && !loading ? `Please complete name (min 2), a valid email, and message (min 10). Currently ${messageLen}/10.` : undefined}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 transition-all duration-200 mt-2"
                >
                  {loading ? "⏳ Sending…" : "🚀 Send message"}
                </button>

                {!formValid && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    ⚠️ Please enter your name (min 2 characters), a valid email, and a message of at least 10 characters.
                  </p>
                )}
              </form>

              {status && (
                <div
                  role="alert"
                  className={`mt-6 rounded-xl border-2 p-4 text-sm font-semibold shadow-lg animate-in fade-in zoom-in-95 duration-300 ${status.type === "success" ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-green-200" : "border-red-400 bg-gradient-to-r from-red-50 to-rose-50 text-red-800 shadow-red-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">{status.type === "success" ? "✅" : "❌"}</span>
                    <span>{status.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Contact details & map */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-blue-100 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">📞</span>
                  <h2 className="text-2xl font-extrabold text-gray-900">Other ways to reach us</h2>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <span className="text-2xl mt-0.5">📧</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Email</div>
                      <a href="mailto:labourzkart@gmail.com" className="text-blue-600 font-bold hover:text-blue-800 text-lg hover:underline transition">labourzkart@gmail.com</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <span className="text-2xl mt-0.5">☎️</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Phone</div>
                      <a href="tel:+917505675163" className="text-green-600 font-bold hover:text-green-800 text-lg hover:underline transition">+91 75056 75163</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-fuchsia-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <span className="text-2xl mt-0.5">🕐</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Hours</div>
                      <p className="text-purple-700 font-bold text-lg">Mon–Fri, 9:00–18:00 IST</p>
                      <p className="text-purple-600 text-xs mt-1">📞 Emergency support available 24/7</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white border border-blue-100 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🗺️</span>
                  <h3 className="text-xl font-extrabold text-gray-900">Location Map</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Select your location to help us better serve you</p>
                {position ? (
                  <MapContainer center={position} zoom={15} style={{ height: "300px", width: "100%", borderRadius: "1rem", border: "3px solid #e0f2fe" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickToSetMarker
                      onPick={(lat, lng) => {
                        setPosition([lat, lng]);
                        setForm((p) => ({ ...p, location: `${lat},${lng}` }));
                        localStorage.setItem("contact:lastLocation", JSON.stringify([lat, lng]));
                      }}
                    />
                    <Marker position={position} />
                  </MapContainer>
                ) : (
                  <div className="h-80 w-full rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col items-center justify-center text-center p-6 gap-3 hover:border-blue-400 hover:shadow-lg transition-all">
                    <span className="text-5xl animate-bounce">🗺️</span>
                    <p className="text-base font-semibold text-blue-900">Enable Location to See Map</p>
                    <p className="text-xs text-blue-600">Click "My location" button above or enter coordinates manually to display the map</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg">
                      <span>💡</span>
                      <span className="text-xs text-blue-700">Tip: We only collect location with your permission</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Contact;
