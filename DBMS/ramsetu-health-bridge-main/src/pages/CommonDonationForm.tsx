import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";

const organFormFields = {
  Kidney: [
    { name: "bloodGroup", label: "Blood group + Rh typing" },
    { name: "hla", label: "HLA matching" },
    { name: "renalFunction", label: "Renal function tests" },
    { name: "viralMarkers", label: "Viral markers" },
    { name: "cbc", label: "CBC, LFT, electrolytes" },
    { name: "urine", label: "Urine tests" },
    { name: "imaging", label: "Imaging" },
    { name: "cardiac", label: "Cardiac evaluation" },
  ],
  Heart: [
    { name: "bloodGroup", label: "Blood group" },
    { name: "viralMarkers", label: "Viral markers" },
    { name: "echo", label: "Echocardiography" },
    { name: "angiography", label: "Angiography" },
    { name: "chestImaging", label: "Chest imaging" },
    { name: "generalHealth", label: "General health" },
  ],
  Liver: [
    { name: "bloodGroup", label: "Blood group" },
    { name: "liverFunction", label: "Liver function" },
    { name: "viralMarkers", label: "Viral markers" },
    { name: "imaging", label: "Imaging" },
    { name: "generalHealth", label: "General health" },
    { name: "coagulation", label: "Coagulation" },
    { name: "residualVolume", label: "Residual volume" },
  ],
  Cornea: [
    { name: "infectionTest", label: "Test for infections" },
    { name: "eyeHealth", label: "Eye health" },
    { name: "serology", label: "Serology" },
    { name: "causeOfDeath", label: "Cause of death" },
  ],
};

// Example placeholders for each field to improve UX and avoid ambiguous inputs
const fieldPlaceholders: Record<string, string> = {
  bloodGroup: "e.g. A+, B-, O+ (include Rh)",
  hla: "e.g. A1,A2,B1,B2 (comma separated)",
  renalFunction: "e.g. creatinine:1.1 mg/dL, eGFR:60",
  viralMarkers: "e.g. HIV-, HBsAg-, HCV-",
  cbc: "e.g. Hb:13 g/dL, WBC:6000",
  urine: "e.g. Protein: negative, Sugar: negative",
  imaging: "e.g. Ultrasound/CT report summary",
  cardiac: "e.g. ECG normal / Echo findings",
  echo: "e.g. LVEF:60%, valvular lesions if any",
  angiography: "e.g. Coronary anatomy summary",
  chestImaging: "e.g. Chest X-ray / CT findings",
  generalHealth: "e.g. No active infections, stable vitals",
  liverFunction: "e.g. ALT:25 U/L, AST:20 U/L",
  coagulation: "e.g. INR:1.0, PT:12s",
  residualVolume: "e.g. Residual volume value",
  infectionTest: "e.g. Serology/antigen results",
  eyeHealth: "e.g. Corneal clarity / opacities",
  serology: "e.g. VDRL-, HIV-, HBsAg-",
  causeOfDeath: "e.g. Cerebral hemorrhage, trauma",
};

const CommonDonationForm = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const organ = params.get("organ") || "Kidney";
  const role = params.get("role") || "patient";

  const [fields, setFields] = useState<any>({ consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFields({ consent: false });
    setError(null);
    setSuccess(false);
    setMatchScore(null);
  }, [organ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFields((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setMatchScore(null);

    try {
      // Support multiple token key names (token, accessToken, authToken)
      const tokenKeys = ["token", "accessToken", "authToken"];
      let token: string | null = null;
      for (const k of tokenKeys) {
        const v = localStorage.getItem(k);
        if (v && v !== "undefined" && v !== "null" && v.trim()) {
          token = v;
          break;
        }
      }
      if (!token) {
        setError("Authentication failed. Please login again.");
        return;
      }

      const tests = (organFormFields as any)[organ]
        .map((f: any) => ({
          label: f.label,
          value: fields[f.name],
        }))
        .filter((t: any) => t.value && t.value.trim() !== "");

      if (tests.length === 0) {
        setError("Please fill at least one test field.");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const endpoint =
        role === "donor"
          ? `/donation-request/${organ}`
          : `/patient/request/${organ}`;

      const res = await fetch(API_URL.replace(/\/+$/, "") + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tests,
          consent: !!fields.consent,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Submission failed");
        return;
      }

      // Parse response; patient route returns { patientRequest, matchScore, bestMatchDonor }
      const data = await res.json().catch(() => ({}));
      setSuccess(true);

      let score: number | null = null;
      let bestDonor: any = null;
      if (role === "patient") {
        if (data && typeof data.matchScore !== "undefined") {
          score = data.matchScore ?? null;
          bestDonor = data.bestMatchDonor ?? null;
        } else {
          // fallback: call ML endpoint directly
          try {
            const mlRes = await fetch(
              API_URL.replace(/\/+$/, "") + `/ml/match?organ=${encodeURIComponent(organ)}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tests }),
              }
            );
            if (mlRes.ok) {
              const mlData = await mlRes.json().catch(() => ({}));
              score = mlData.matchScore ?? null;
            }
          } catch {}
        }

        setMatchScore(score);

        // dispatch global event so landing pages refresh
        try { window.dispatchEvent(new CustomEvent("donation-status-updated")); } catch {}

        // navigate to patient landing with applied state, score, and best donor info
        navigate("/patient", { state: { applied: true, organ, matchScore: score, bestDonor } });
      }
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          {organ} Application ({role})
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {(organFormFields as any)[organ].map((f: any) => (
            <div key={f.name}>
              <label className="font-semibold">{f.label}</label>
              <Input
                name={f.name}
                value={fields[f.name] || ""}
                onChange={handleChange}
                placeholder={
                  fieldPlaceholders[f.name] || `Please enter ${f.label.toLowerCase()}`
                }
              />
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="consent"
              checked={fields.consent}
              onChange={handleChange}
            />
            <span>I give my consent for verification.</span>
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>

          {error && <div className="text-red-600 text-center">{error}</div>}
          {success && <div className="text-green-700 text-center">Submitted successfully!</div>}

          {/* Always show match score for patient if available */}
          {role === "patient" && matchScore !== null && (
            <div className="text-center mt-4">
              <div className="text-lg font-bold text-blue-700">
                Best Match Score
              </div>
              <div className="text-3xl font-extrabold text-blue-800">
                {matchScore}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommonDonationForm;
