import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonationFormHeader from "@/components/DonationFormHeader";
import DonationFormFooter from "@/components/DonationFormFooter";

const HeartDonationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<null | "Pending" | "Verified" | "Rejected" | "THANK_YOU">(null);
  const [fields, setFields] = useState({
    bloodGroup: "",
    viralMarkers: "",
    echo: "",
    angiography: "",
    chestImaging: "",
    generalHealth: "",
    bloodGroupFile: null,
    viralMarkersFile: null,
    echoFile: null,
    angiographyFile: null,
    chestImagingFile: null,
    generalHealthFile: null,
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
    console.log("HeartDonationForm token:", token);
    fetch(`${API_URL}/donation-request/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const req = data.find((r: any) => r.organ === "Heart");
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
    setError(null);
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
        { label: "Viral markers", value: fields.viralMarkers },
        { label: "Echocardiography", value: fields.echo },
        { label: "Angiography", value: fields.angiography },
        { label: "Chest imaging", value: fields.chestImaging },
        { label: "General health", value: fields.generalHealth },
      ];
      formData.append("tests", JSON.stringify(tests));
      if (fields.bloodGroupFile) formData.append("files", fields.bloodGroupFile);
      if (fields.viralMarkersFile) formData.append("files", fields.viralMarkersFile);
      if (fields.echoFile) formData.append("files", fields.echoFile);
      if (fields.angiographyFile) formData.append("files", fields.angiographyFile);
      if (fields.chestImagingFile) formData.append("files", fields.chestImagingFile);
      if (fields.generalHealthFile) formData.append("files", fields.generalHealthFile);
      formData.append("consent", fields.consent ? "true" : "false");
      const res = await fetch(`${API_URL}/donation-request/Heart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired or authentication failed. Please log in again.");
        } else {
          const errData = await res.json();
          throw new Error(errData.error || "Submission failed");
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
        const req = refetchData.find((r: any) => r.organ === "Heart");
        if (req) {
          setServerStatus(req.status);
          setSubmitted(true);
        }
      } catch {
        setServerStatus("Pending");
        setSubmitted(true);
      }
      // Notify DonorLanding to refetch instantly
      window.dispatchEvent(new CustomEvent("donation-status-updated", { detail: { organ: "Heart", status: "Pending" } }));
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
        <DonationFormHeader organ="Heart" />
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
            <h2 className="text-2xl font-bold mb-4 text-green-700">Thank you for submitting your heart donation request!</h2>
            <p className="mb-6 text-lg">Your data has been saved. We appreciate your life-saving decision.</p>
          </div>
        ) : (serverStatus === "Verified" || serverStatus === "Pending") ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-bold mb-4 ${serverStatus === "Verified" ? "text-green-700" : "text-yellow-600"}`}>Status: {serverStatus}</h2>
            <p className="mb-6 text-lg">
              {serverStatus === "Verified"
                ? "Your heart donation request has been verified. Thank you for your life-saving decision."
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
                <label className="font-semibold">Viral markers</label>
                <Input name="viralMarkers" value={fields.viralMarkers} onChange={handleChange} placeholder="Enter result" />
                <Input name="viralMarkersFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Echocardiography</label>
                <Input name="echo" value={fields.echo} onChange={handleChange} placeholder="Enter result" />
                <Input name="echoFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Angiography</label>
                <Input name="angiography" value={fields.angiography} onChange={handleChange} placeholder="Enter result" />
                <Input name="angiographyFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">Chest imaging</label>
                <Input name="chestImaging" value={fields.chestImaging} onChange={handleChange} placeholder="Enter result" />
                <Input name="chestImagingFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="font-semibold">General health</label>
                <Input name="generalHealth" value={fields.generalHealth} onChange={handleChange} placeholder="Enter result" />
                <Input name="generalHealthFile" type="file" onChange={handleChange} className="mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="consent" checked={fields.consent} onChange={handleChange} />
              <span>I give my consent for heart donation and verification.</span>
            </div>
            <Button className="w-full mt-4" type="submit">Submit for Verification</Button>
          </form>
        )}
        <DonationFormFooter />
      </div>
    </div>
  );
};

export default HeartDonationForm;
