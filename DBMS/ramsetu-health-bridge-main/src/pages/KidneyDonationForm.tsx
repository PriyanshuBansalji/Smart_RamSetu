import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonationFormHeader from "@/components/DonationFormHeader";
import DonationFormFooter from "@/components/DonationFormFooter";

const KidneyDonationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<null | "Pending" | "Verified" | "Rejected" | "THANK_YOU">(null);
  const [fields, setFields] = useState({
    bloodGroup: "",
    hla: "",
    renalFunction: "",
    viralMarkers: "",
    cbc: "",
    urine: "",
    imaging: "",
    cardiac: "",
    bloodGroupFile: null,
    hlaFile: null,
    renalFunctionFile: null,
    viralMarkersFile: null,
    cbcFile: null,
    urineFile: null,
    imagingFile: null,
    cardiacFile: null,
    consent: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setError("Session expired or authentication failed. Please log in again.");
      setLoading(false);
      return;
    }
    // Debug: log token for troubleshooting
    console.log("KidneyDonationForm token:", token);
    fetch(`${API_URL}/donation-request/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const req = data.find((r: any) => r.organ === "Kidney");
          if (req) {
            setServerStatus(req.status);
            setSubmitted(true);
          }
          setLoading(false);
        } catch (err) {
          if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            setError("API returned HTML instead of JSON. Backend may be down, misconfigured, or endpoint is wrong.");
          } else {
            setError("Failed to parse API response: " + text);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, files, checked } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Submitting with token:", token); // <--- DEBUG
      if (!token || token === "undefined" || token === "null") {
        setError("Session expired or authentication failed. Please log in again.");
        setLoading(false);
        return;
      }
      // Debug: log token for troubleshooting
      console.log("Submitting with token:", token);
      const formData = new FormData();
      const tests = [
        { label: "Blood group + Rh typing", value: fields.bloodGroup },
        { label: "HLA matching", value: fields.hla },
        { label: "Renal function tests", value: fields.renalFunction },
        { label: "Viral markers", value: fields.viralMarkers },
        { label: "CBC, LFT, electrolytes", value: fields.cbc },
        { label: "Urine tests", value: fields.urine },
        { label: "Imaging", value: fields.imaging },
        { label: "Cardiac evaluation", value: fields.cardiac },
      ];
      formData.append("tests", JSON.stringify(tests));
      if (fields.bloodGroupFile) formData.append("files", fields.bloodGroupFile);
      if (fields.hlaFile) formData.append("files", fields.hlaFile);
      if (fields.renalFunctionFile) formData.append("files", fields.renalFunctionFile);
      if (fields.viralMarkersFile) formData.append("files", fields.viralMarkersFile);
      if (fields.cbcFile) formData.append("files", fields.cbcFile);
      if (fields.urineFile) formData.append("files", fields.urineFile);
      if (fields.imagingFile) formData.append("files", fields.imagingFile);
      if (fields.cardiacFile) formData.append("files", fields.cardiacFile);
      formData.append("consent", fields.consent ? "true" : "false");
      const res = await fetch(`${API_URL}/donation-request/Kidney`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log("Form submit response status:", res.status); // <--- DEBUG
      if (!res.ok) {
        const errText = await res.text();
        console.log("Form submit error response:", errText); // <--- DEBUG
        if (res.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired or authentication failed. Please log in again.");
        } else {
          try {
            const errData = JSON.parse(errText);
            throw new Error(errData.error || "Submission failed");
          } catch {
            throw new Error("Submission failed: " + errText);
          }
        }
        setLoading(false);
        return;
      }
      // Refetch requests to update status instantly
      const refetch = await fetch(`${API_URL}/donation-request/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refetchText = await refetch.text();
      let userEmail = "";
      try {
        const refetchData = JSON.parse(refetchText);
        const req = refetchData.find((r: any) => r.organ === "Kidney");
        if (req) {
          setServerStatus(req.status);
          setSubmitted(true);
          userEmail = req.email || "";
        }
      } catch {
        setServerStatus("Pending");
        setSubmitted(true);
      }
      // Notify DonorLanding to refetch instantly
      window.dispatchEvent(new CustomEvent("donation-status-updated", { detail: { organ: "Kidney", status: "Pending" } }));

      // --- Send pending email to user for all organs ---
      if (userEmail) {
        fetch(`${API_URL}/notify/pending`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: userEmail,
            organ: "Kidney",
            status: "Pending"
          }),
        }).catch(() => {});
      }
      // Show thank you message after successful submission
      setTimeout(() => {
        setServerStatus("THANK_YOU");
      }, 500);
    } catch (err: any) {
      setError(err.message);
      console.error("Form submit catch error:", err); // <--- DEBUG
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-0">
        <DonationFormHeader organ="Kidney" />
        {error === "Session expired or authentication failed. Please log in again." ? (
          <div className="p-8 text-center text-red-600 font-bold">
            {error}
            <div className="mt-4">
              <a href="/login" className="text-blue-700 underline">Go to Login</a>
            </div>
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-lg">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-bold">{error}</div>
        ) : serverStatus === "THANK_YOU" ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Thank you for submitting your kidney donation request!</h2>
            <p className="mb-6 text-lg">Your data has been saved. We appreciate your life-saving decision.</p>
          </div>
        ) : (serverStatus === "Verified" || serverStatus === "Pending") ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-bold mb-4 ${serverStatus === "Verified" ? "text-green-700" : "text-yellow-600"}`}>Status: {serverStatus}</h2>
            <p className="mb-6 text-lg">
              {serverStatus === "Verified"
                ? "Your kidney donation request has been verified. Thank you for your life-saving decision."
                : "Your request is under review. You cannot submit again until admin verification."}
            </p>
            {serverStatus === "Verified" && (
              <Button className="bg-gradient-to-r from-green-600 to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg">Download Certificate</Button>
            )}
          </div>
        ) : (
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Blood group + Rh typing</label>
                <Input name="bloodGroup" value={fields.bloodGroup} onChange={handleChange} placeholder="Enter result" />
                <Input name="bloodGroupFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">HLA matching</label>
                <Input name="hla" value={fields.hla} onChange={handleChange} placeholder="Enter result" />
                <Input name="hlaFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Renal function tests</label>
                <Input name="renalFunction" value={fields.renalFunction} onChange={handleChange} placeholder="Enter result" />
                <Input name="renalFunctionFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Viral markers: HIV, Hepatitis B, Hepatitis C etc.</label>
                <Input name="viralMarkers" value={fields.viralMarkers} onChange={handleChange} placeholder="Enter result" />
                <Input name="viralMarkersFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Complete blood count, liver function tests, electrolytes</label>
                <Input name="cbc" value={fields.cbc} onChange={handleChange} placeholder="Enter result" />
                <Input name="cbcFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Urine tests (protein, infection etc.)</label>
                <Input name="urine" value={fields.urine} onChange={handleChange} placeholder="Enter result" />
                <Input name="urineFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Imaging (Kidney ultrasound etc.)</label>
                <Input name="imaging" value={fields.imaging} onChange={handleChange} placeholder="Enter result" />
                <Input name="imagingFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Cardiac evaluation (if risk)</label>
                <Input name="cardiac" value={fields.cardiac} onChange={handleChange} placeholder="Enter result" />
                <Input name="cardiacFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="consent" checked={fields.consent} onChange={handleChange} />
              <span>I give my consent for kidney donation and verification.</span>
            </div>
            <Button className="w-full mt-4" type="submit">Submit for Verification</Button>
          </form>
        )}
        <DonationFormFooter />
      </div>
    </div>
  );
};

export default KidneyDonationForm;
