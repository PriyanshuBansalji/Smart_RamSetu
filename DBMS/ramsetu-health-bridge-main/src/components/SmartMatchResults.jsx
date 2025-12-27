
import React, { useState } from "react";
import { fetchSmartMatches } from "../utils/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";


function SmartMatchResults({ patientId, organ }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState({}); // donorId -> loading
  const [requested, setRequested] = useState({}); // donorId -> status

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await fetchSmartMatches(patientId, organ, 4, token); // urgency_level=4 as example
      setMatches(data.ranked);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (donorId) => {
    setRequesting((r) => ({ ...r, [donorId]: true }));
    setRequested((r) => ({ ...r, [donorId]: undefined }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL.replace(/\/+$/, "")}/match/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ donorId, organ }),
      });
      if (!res.ok) {
        const t = await res.text();
        setRequested((r) => ({ ...r, [donorId]: `Failed: ${t || res.status}` }));
        return;
      }
      setRequested((r) => ({ ...r, [donorId]: "Requested" }));
    } catch (e) {
      setRequested((r) => ({ ...r, [donorId]: `Error: ${e?.message || "Unable to request"}` }));
    } finally {
      setRequesting((r) => ({ ...r, [donorId]: false }));
    }
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Matching..." : "Find Best Donors"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <ul className="mt-4">
        {matches.map((donor) => (
          <li key={donor.donorId} className="mb-4 p-3 border rounded-xl bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-semibold">{donor.name}</span> <span className="text-xs text-slate-600">({donor.email})</span>
              <span className="ml-2">[{donor.bloodGroup}]</span>
              <span className="ml-2 text-green-700">Match Score: {donor.match_score.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-60"
                disabled={requesting[donor.donorId] || requested[donor.donorId] === "Requested"}
                onClick={() => handleRequest(donor.donorId)}
              >
                {requesting[donor.donorId]
                  ? "Requesting..."
                  : requested[donor.donorId] === "Requested"
                  ? "Requested"
                  : "Request Match"}
              </button>
              {requested[donor.donorId] && requested[donor.donorId] !== "Requested" && (
                <span className="text-xs text-rose-600">{requested[donor.donorId]}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SmartMatchResults;
