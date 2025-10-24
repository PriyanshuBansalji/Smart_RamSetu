import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonationFormHeader from "@/components/DonationFormHeader";
import DonationFormFooter from "@/components/DonationFormFooter";

const LiverDonationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<null | "Pending" | "Verified" | "Rejected" | "THANK_YOU">(null);
  const [fields, setFields] = useState({
    bloodGroup: "",
    liverFunction: "",
    viralMarkers: "",
    imaging: "",
    generalHealth: "",
    coagulation: "",
    residualVolume: "",
    bloodGroupFile: null,
    liverFunctionFile: null,
    viralMarkersFile: null,
    imagingFile: null,
    generalHealthFile: null,
    coagulationFile: null,
    residualVolumeFile: null,
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
    console.log("LiverDonationForm token:", token);
    fetch(`${API_URL}/donation-request/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const req = data.find((r: any) => r.organ === "Liver");
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
      if (!token || token === "undefined" || token === "null") {
        setError("Session expired or authentication failed. Please log in again.");
        setLoading(false);
        return;
      }
      // Debug: log token for troubleshooting
      console.log("Submitting with token:", token);
      const formData = new FormData();
      const tests = [
        { label: "Blood group", value: fields.bloodGroup },
        { label: "Liver function", value: fields.liverFunction },
        { label: "Viral markers", value: fields.viralMarkers },
        { label: "Imaging", value: fields.imaging },
        { label: "General health", value: fields.generalHealth },
        { label: "Coagulation", value: fields.coagulation },
        { label: "Residual volume", value: fields.residualVolume },
      ];
      formData.append("tests", JSON.stringify(tests));
      if (fields.bloodGroupFile) formData.append("files", fields.bloodGroupFile);
      if (fields.liverFunctionFile) formData.append("files", fields.liverFunctionFile);
      if (fields.viralMarkersFile) formData.append("files", fields.viralMarkersFile);
      if (fields.imagingFile) formData.append("files", fields.imagingFile);
      if (fields.generalHealthFile) formData.append("files", fields.generalHealthFile);
      if (fields.coagulationFile) formData.append("files", fields.coagulationFile);
      if (fields.residualVolumeFile) formData.append("files", fields.residualVolumeFile);
      formData.append("consent", fields.consent ? "true" : "false");
      const res = await fetch(`${API_URL}/donation-request/Liver`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      // Debug: log server response status
      console.log("Liver form submission response status:", res.status);
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired or authentication failed. Please log in again.");
        } else {
          let errMsg = "Submission failed";
          try {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } catch {}
          setError(errMsg);
        }
        setLoading(false);
        return;
      }
      // Refetch requests to update status instantly
      const refetch = await fetch(`${API_URL}/donation-request/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refetchText = await refetch.text();
      try {
        const refetchData = JSON.parse(refetchText);
        const req = refetchData.find((r: any) => r.organ === "Liver");
        if (req) {
          setServerStatus(req.status);
          setSubmitted(true);
        }
      } catch {
        setServerStatus("Pending");
        setSubmitted(true);
      }
      // Notify DonorLanding to refetch instantly
      window.dispatchEvent(new CustomEvent("donation-status-updated", { detail: { organ: "Liver", status: "Pending" } }));
      // Show thank you message after successful submission
      setTimeout(() => {
        setServerStatus("THANK_YOU");
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-0">
        <DonationFormHeader organ="Liver" />
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
            <h2 className="text-2xl font-bold mb-4 text-green-700">Thank you for submitting your liver donation request!</h2>
            <p className="mb-6 text-lg">Your data has been saved. We appreciate your life-saving decision.</p>
          </div>
        ) : (serverStatus === "Verified" || serverStatus === "Pending") ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-bold mb-4 ${serverStatus === "Verified" ? "text-green-700" : "text-yellow-600"}`}>Status: {serverStatus}</h2>
            <p className="mb-6 text-lg">
              {serverStatus === "Verified"
                ? "Your liver donation request has been verified. Thank you for your life-saving decision."
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
                <label className="font-semibold">Blood group</label>
                <Input name="bloodGroup" value={fields.bloodGroup} onChange={handleChange} placeholder="Enter result" />
                <Input name="bloodGroupFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Liver function</label>
                <Input name="liverFunction" value={fields.liverFunction} onChange={handleChange} placeholder="Enter result" />
                <Input name="liverFunctionFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Viral markers</label>
                <Input name="viralMarkers" value={fields.viralMarkers} onChange={handleChange} placeholder="Enter result" />
                <Input name="viralMarkersFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Imaging</label>
                <Input name="imaging" value={fields.imaging} onChange={handleChange} placeholder="Enter result" />
                <Input name="imagingFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">General health</label>
                <Input name="generalHealth" value={fields.generalHealth} onChange={handleChange} placeholder="Enter result" />
                <Input name="generalHealthFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Coagulation</label>
                <Input name="coagulation" value={fields.coagulation} onChange={handleChange} placeholder="Enter result" />
                <Input name="coagulationFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Residual volume</label>
                <Input name="residualVolume" value={fields.residualVolume} onChange={handleChange} placeholder="Enter result" />
                <Input name="residualVolumeFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="consent" checked={fields.consent} onChange={handleChange} />
              <span>I give my consent for liver donation and verification.</span>
            </div>
            <Button className="w-full mt-4" type="submit">Submit for Verification</Button>
          </form>
        )}
        <DonationFormFooter />
      </div>
    </div>
  );
};

export default LiverDonationForm;