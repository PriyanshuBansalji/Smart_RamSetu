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
        <div className="bg-gradient-to-br from-primary/90 to-accent/80 text-white">
          <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact us</h1>
            <p className="text-white/90 mt-2 max-w-2xl">Have questions or feedback? We’d love to hear from you. Send us a message and we’ll respond promptly.</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 -mt-6 pb-12">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Form card */}
            <div className="rounded-xl bg-white border border-border shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your full name"
                    required
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${nameValid ? "border-border" : "border-red-400"} focus:outline-none focus:ring-2 focus:ring-primary/40`}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="you@example.com"
                    required
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${emailValid ? "border-border" : "border-red-400"} focus:outline-none focus:ring-2 focus:ring-primary/40`}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    rows={4}
                    required
                    className={`mt-1 w-full px-4 py-2 rounded-lg border ${messageValid ? "border-border" : "border-red-400"} focus:outline-none focus:ring-2 focus:ring-primary/40`}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-foreground">Location (optional)</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      type="text"
                      placeholder="lat,lng or address"
                      className="flex-1 px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-primary text-white px-4 py-2 font-semibold shadow hover:bg-primary/90 disabled:opacity-60"
                    >
                      {locating ? "Locating…" : "Use my location"}
                    </button>
                  </div>
                  {position && (
                    <div className="text-xs text-muted-foreground mt-1">Detected: {form.location}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !formValid}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-2.5 rounded-xl shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>

              {status && (
                <div
                  role="alert"
                  className={`mt-4 rounded-lg border p-3 text-sm ${status.type === "success" ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"}`}
                >
                  {status.message}
                </div>
              )}
            </div>

            {/* Contact details & map */}
            <div className="rounded-xl bg-white border border-border shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Other ways to reach us</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  Email: <a href="mailto:labourzkart@gmail.com" className="text-primary hover:underline">labourzkart@gmail.com</a>
                </li>
                <li>
                  Phone: <a href="tel:+917505675163" className="text-primary hover:underline">+91 75056 75163</a>
                </li>
                <li>Hours: Mon–Fri, 9:00–18:00 IST</li>
              </ul>

              <div className="mt-4">
                {position ? (
                  <MapContainer center={position} zoom={15} style={{ height: "260px", width: "100%", borderRadius: "0.75rem" }}>
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
                  <div className="h-[260px] w-full rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                    Map preview will appear after you set your location (or click "Use my location").
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
