import React, { useState, useEffect, useRef } from "react";
import { useRef as useLeafletRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, Heart, FileText, Info, CheckCircle2 } from "lucide-react";

const initialState = {
  fullName: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  address: "",
  city: "",
  state: "",
  country: "",
  contact: "",
  email: "",
  emergencyContact: "",
  height: "",
  weight: "",
  bmi: "",
  // bloodPressure removed
  medicalHistory: "",
  allergies: "",
  diseases: "",
  pastSurgeries: "",
  organConditions: "",
  lifestyle: "",
  organs: [],
  donorType: "",
  consentStatus: false,
  consentDate: "",
  signature: null,
  govId: null,
  govIdType: "Aadhaar",
  govIdNumber: "",
  kinConsent: false,
  regId: "",
  regDate: "",
  regPlace: "",
  profileImage: null,
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DonorMedicalForm = () => {
  const markerRef = useLeafletRef<any>(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState(() => {
    // Try to auto-fill email from localStorage (if available)
    const user = localStorage.getItem("user");
    let email = "";
    try {
      if (user) email = JSON.parse(user).email || "";
    } catch {}
    // Generate unique regId (timestamp + random)
    const regId = `DON-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return { ...initialState, email, regId };
  });

  // Get location from browser
  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setForm((prev) => ({ ...prev, address: `${latitude},${longitude}` }));
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

  // Update address when marker is dragged
  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const latlng = marker.getLatLng();
      setPosition([latlng.lat, latlng.lng]);
      setForm((prev) => ({ ...prev, address: `${latlng.lat},${latlng.lng}` }));
    }
  };
  // Autofill email handler
  const handleAutoFillEmail = () => {
    const user = localStorage.getItem("user");
    let email = "";
    try {
      if (user) email = JSON.parse(user).email || "";
    } catch {}
    setForm((prev) => ({ ...prev, email }));
  };
  const [errors, setErrors] = useState<any>({});
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    let newValue = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "file") {
      newValue = files[0];
    }
    // Restrict contact to numbers only
    if (name === "contact") {
      newValue = newValue.replace(/\D/g, "");
    }
    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      if ((name === "height" || name === "weight") && updated.height && updated.weight) {
        const h = parseFloat(updated.height) / 100;
        const w = parseFloat(updated.weight);
        if (h > 0 && w > 0) {
          updated.bmi = (w / (h * h)).toFixed(2);
        } else {
          updated.bmi = "";
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    const newErrors: any = {};
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (form.contact && !/^\d{10,15}$/.test(form.contact)) {
      newErrors.contact = "Invalid contact number";
    }
    setErrors(newErrors);
    const required = ["fullName", "dob", "gender", "bloodGroup", "address", "city", "state", "country", "contact", "email", "emergencyContact"];
    const allFilled = required.every((k) => form[k]);
    setIsValid(allFilled && Object.keys(newErrors).length === 0);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check FormData support
    if (typeof window.FormData === "undefined") {
      toast({ title: "Error", description: "Your browser does not support file uploads.", variant: "destructive" });
      return;
    }
    // Optional: Check file size (e.g., 5MB max for profileImage/govId)
    const maxFileSize = 5 * 1024 * 1024;
    if (form.profileImage && form.profileImage.size > maxFileSize) {
      toast({ title: "Error", description: "Profile image is too large (max 5MB).", variant: "destructive" });
      return;
    }
    if (form.govId && form.govId.size > maxFileSize) {
      toast({ title: "Error", description: "Gov ID file is too large (max 5MB).", variant: "destructive" });
      return;
    }
    // Check for authentication token before submitting
    const token = localStorage.getItem("token");
    console.log("[DonorMedicalForm] Token before submit:", token); // Debug log
    if (!token || token === "undefined" || token === "null" || !token.trim()) {
      toast({
        title: "Session Expired",
        description: "No valid session token found. Please log in again.",
        variant: "destructive",
      });
      // Show a clear error in the UI for debugging
      alert("Session expired: No valid token in localStorage. Please log in again.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v, i) => fd.append(`${key}[${i}]`, v));
        } else if (value !== null && value !== undefined) {
          fd.append(key, value as any);
        }
      });
      const res = await fetch(`${API_URL}/donor/profile`, {
        method: "PUT",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (res.status === 401 || res.status === 403) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      if (!res.ok) {
        // Try to extract error message from response
        let errMsg = "Failed to save details";
        try {
          const errJson = await res.json();
          if (errJson && errJson.error) errMsg = errJson.error;
        } catch {}
        throw new Error(errMsg);
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/login");
      }, 1800);
      toast({ title: "Profile Saved", description: "Your details have been saved successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save details.", variant: "destructive" });
    }
  };

  useEffect(() => {
    // Check backend connectivity on mount
    fetch(`${API_URL}/donor/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status !== "ok") {
          toast({ title: "Backend Error", description: "Cannot connect to backend or database.", variant: "destructive" });
        }
      })
      .catch(() => {
        toast({ title: "Backend Error", description: "Cannot connect to backend or database.", variant: "destructive" });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-green-200 p-6">
      <div className="w-full max-w-3xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex gap-4">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-700' : 'text-gray-400'}`}> <User size={28} /><span className="text-xs mt-1">Personal</span></div>
            <div className={`h-1 w-8 rounded bg-gradient-to-r from-blue-400 to-green-400 ${step >= 2 ? '' : 'opacity-30'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-red-500' : 'text-gray-400'}`}> <Heart size={28} /><span className="text-xs mt-1">Medical</span></div>
            <div className={`h-1 w-8 rounded bg-gradient-to-r from-red-400 to-gray-400 ${step >= 3 ? '' : 'opacity-30'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-gray-700' : 'text-gray-400'}`}> <FileText size={28} /><span className="text-xs mt-1">Legal</span></div>
          </div>
        </div>
        <Card className="shadow-2xl rounded-3xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-green-600 rounded-t-3xl p-10 mb-6 shadow-xl flex flex-col items-center animate-fade-in">
            <img src="/logo.png" alt="Logo" className="h-20 w-20 rounded-full shadow-lg border-4 border-white mb-4 bg-white object-contain animate-bounce" />
            <div className="flex items-center gap-4">
              <CardTitle className="text-white text-3xl font-extrabold tracking-wide drop-shadow animate-slide-in">Donor Medical Information</CardTitle>
            </div>
            <p className="text-blue-100 mt-3 text-base font-medium text-center">Please fill out all required fields to complete your donor profile. All information is kept confidential.</p>
          </CardHeader>
          <CardContent className="p-10 bg-white rounded-b-3xl">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <CheckCircle2 className="text-green-500 mb-4 animate-pulse" size={64} />
                <div className="text-2xl font-bold text-green-700 mb-2">Profile Saved!</div>
                <div className="text-gray-600 mb-2">Your details have been saved successfully.</div>
                <div ref={confettiRef} />
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Info */}
              <section>
                <div className="flex items-center gap-3 mb-4 animate-fade-in">
                  <User className="text-blue-600 bg-blue-100 rounded-full p-1" size={24} />
                  <span className="font-semibold text-xl text-gray-900">Personal Information</span>
                  <Info className="ml-2 text-blue-400" size={18} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/80 p-6 rounded-2xl mb-2 border border-blue-200">
                  <div><Label>Full Name</Label><Input name="fullName" value={form.fullName} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                  <div><Label>Date of Birth</Label><Input name="dob" type="date" value={form.dob} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                  <div><Label>Gender</Label><select name="gender" value={form.gender} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                  <div><Label>Blood Group</Label><select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl"><option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <div className="flex gap-2">
                      <Input name="address" value={form.address} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" />
                      <Button type="button" variant="outline" onClick={handleGetLocation} className="ml-1">{locating ? "Locating..." : "Get My Location"}</Button>
                    </div>
                    {position && (
                      <div className="mt-2 text-sm text-green-700">Location: {form.address}</div>
                    )}
                    {position && (
                      <div>
                        <MapContainer center={position as [number, number]} zoom={15} style={{ height: "200px", width: "100%" }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={position as [number, number]}
                            draggable={true}
                            eventHandlers={{ dragend: handleMarkerDragEnd }}
                            ref={markerRef}
                          />
                        </MapContainer>
                        <Button type="button" variant="outline" className="mt-2" onClick={() => {
                          if (position) setForm((prev) => ({ ...prev, address: `${position[0]},${position[1]}` }));
                        }}>Use Map Location</Button>
                      </div>
                    )}
                  </div>
                  <div><Label>City</Label><Input name="city" value={form.city} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                  <div><Label>State</Label><Input name="state" value={form.state} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                  <div><Label>Country</Label><Input name="country" value={form.country} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                  <div><Label>Contact Number <Info size={14} className="inline ml-1 text-blue-400" /></Label><Input name="contact" value={form.contact} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" />
                    {errors.contact && <span className="text-red-500 text-xs">{errors.contact}</span>}
                  </div>
                  <div>
                    <Label>Email ID</Label>
                    <div className="flex gap-2">
                      <Input name="email" value={form.email} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" />
                      <Button type="button" variant="outline" onClick={handleAutoFillEmail} className="ml-1">Auto-Fill</Button>
                    </div>
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                  </div>
                  <div className="md:col-span-2"><Label>Emergency Contact</Label><Input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} required className="mt-1 focus:ring-2 focus:ring-blue-400 rounded-xl" /></div>
                </div>
              </section>
              {/* Medical Info */}
              <section>
                <div className="flex items-center gap-3 mb-4 mt-8 animate-fade-in">
                  <Heart className="text-red-500 bg-red-100 rounded-full p-1" size={24} />
                  <span className="font-semibold text-xl text-gray-900">Medical Information</span>
                  <Info className="ml-2 text-red-400" size={18} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-red-50/80 p-6 rounded-2xl mb-2 border border-red-200">
                  <div><Label>Height (cm)</Label><Input name="height" value={form.height} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div><Label>Weight (kg)</Label><Input name="weight" value={form.weight} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div><Label>BMI</Label><Input name="bmi" value={form.bmi} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" readOnly />
                    {form.bmi && (
                      <span className="text-xs text-gray-500">{Number(form.bmi) < 18.5 ? "Underweight" : Number(form.bmi) < 25 ? "Normal" : Number(form.bmi) < 30 ? "Overweight" : "Obese"}</span>
                    )}
                  </div>
                  <div className="md:col-span-2"><Label>Medical History</Label><Input name="medicalHistory" value={form.medicalHistory} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div><Label>Allergies</Label><Input name="allergies" value={form.allergies} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div><Label>Existing Diseases</Label><Input name="diseases" value={form.diseases} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div><Label>Past Surgeries</Label><Input name="pastSurgeries" value={form.pastSurgeries} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div className="md:col-span-2"><Label>Organ-specific Conditions</Label><Input name="organConditions" value={form.organConditions} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                  <div className="md:col-span-2"><Label>Lifestyle Habits</Label><Input name="lifestyle" value={form.lifestyle} onChange={handleChange} className="mt-1 focus:ring-2 focus:ring-red-300 rounded-xl" /></div>
                </div>
              </section>
              {/* Legal & Consent */}
              <section>
                <div className="flex items-center gap-3 mb-4 mt-8 animate-fade-in">
                  <FileText className="text-gray-700 bg-gray-100 rounded-full p-1" size={24} />
                  <span className="font-semibold text-xl text-gray-900">Legal & Consent Information</span>
                  <Info className="ml-2 text-gray-400" size={18} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/80 p-6 rounded-2xl mb-2 border border-gray-200">
                  <div>
                    <Label>Government-issued ID</Label>
                    <div className="flex gap-2 mb-2">
                      <select name="govIdType" value={form.govIdType} onChange={handleChange} className="border rounded px-2 py-1">
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="VoterID">Voter ID</option>
                        <option value="DrivingLicense">Driving License</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input name="govIdNumber" value={form.govIdNumber} onChange={handleChange} placeholder="Enter ID Number" className="mt-1" />
                    </div>
                    <Input name="govId" type="file" onChange={handleChange} className="mt-1" />
                  </div>
                  <div><Label>Next of Kin Consent</Label><input type="checkbox" name="kinConsent" checked={form.kinConsent} onChange={handleChange} className="mt-2" /></div>
                  <div>
                    <Label>Donor Registration ID</Label>
                    <Input name="regId" value={form.regId} readOnly className="mt-1 bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div><Label>Date of Registration</Label><Input name="regDate" value={form.regDate} onChange={handleChange} type="date" className="mt-1" /></div>
                  <div><Label>Place of Registration</Label><Input name="regPlace" value={form.regPlace} onChange={handleChange} className="mt-1" /></div>
                  <div><Label>Profile Image (upload)</Label><Input name="profileImage" type="file" onChange={handleChange} className="mt-1" /></div>
                </div>
              </section>
              <Button type="submit" className="w-full mt-10 bg-gradient-to-r from-blue-800 to-green-600 text-white font-bold text-xl py-4 rounded-2xl shadow-xl hover:from-blue-900 hover:to-green-700 transition-all duration-200 animate-fade-in" disabled={!isValid}>Submit</Button>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorMedicalForm;
