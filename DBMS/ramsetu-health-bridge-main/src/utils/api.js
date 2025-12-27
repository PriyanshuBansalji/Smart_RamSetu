// utils/api.js
export async function fetchSmartMatches(patientId, organ, urgency, token) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/match/smart/${patientId}/${organ}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ urgency_level: urgency }),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch matches");
  return await res.json();
}
