import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "", location: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setForm((prev) => ({ ...prev, location: `${latitude},${longitude}` }));
          setLocating(false);
        },
        () => {
          alert("Unable to retrieve your location.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setStatus("Thank you for your feedback! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "", location: "" });
      setPosition(null);
    } catch (err: any) {
      setStatus(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-green-800">Contact Us</h1>
        <p className="text-lg text-gray-700 mb-6">
          Have questions, feedback, or need support? Reach out to our team and we’ll get back to you as soon as possible.
        </p>
        <div className="bg-green-100 rounded-xl p-6 shadow-md">
          <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div>
              <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Your Name" className="w-full px-4 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
            <div>
              <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Your Email" className="w-full px-4 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
            <div>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows={4} className="w-full px-4 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
            <div className="mb-4">
              <button type="button" onClick={handleGetLocation} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">
                {locating ? "Locating..." : "Get My Location"}
              </button>
              {position && (
                <div className="mt-2 text-sm text-green-700">Location: {form.location}</div>
              )}
            </div>
            {position && (
              <MapContainer center={position} zoom={15} style={{ height: "250px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} />
              </MapContainer>
            )}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-800 to-green-600 text-white font-bold py-2 rounded-xl shadow hover:from-blue-900 hover:to-green-700 transition-all duration-200">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
          {status && <div className="mt-4 text-center text-green-700 font-semibold">{status}</div>}
          <div className="mt-8 text-gray-600 text-sm">
            Or email us at <a href="mailto:labourzkart@gmail.com" className="text-blue-700 underline">labourzkart@gmail.com</a> or call <span className="text-blue-700">7505675163</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Contact;
