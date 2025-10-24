import { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  const keys = ["token", "accessToken", "authToken"]; let t:string|null=null;
  for (const k of keys) { const v = localStorage.getItem(k); if (v && v !== "undefined" && v !== "null" && v.trim()) { t = v; break; } }
  return t;
}

const UploadDocuments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organ, setOrgan] = useState("");
  const [details, setDetails] = useState(""); // JSON string
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) setError("Please log in to upload documents.");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const token = getToken();
      if (!token) { setError("Session expired. Please log in again."); setLoading(false); return; }
      if (!type) { setError("Document type is required."); setLoading(false); return; }
      const fd = new FormData();
      fd.append("type", type);
      if (title) fd.append("title", title);
      if (description) fd.append("description", description);
      if (organ) fd.append("organ", organ);
      if (details) fd.append("details", details);
      if (files && files.length) {
        Array.from(files).forEach((f) => fd.append("files", f));
      }
      const res = await axios.post(`${API_URL}/document/upload-multiple`, fd, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status >= 400) {
        const msg = (res.data && res.data.error) ? res.data.error : `Upload failed (${res.status})`;
        setError(msg);
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
        return;
      }
      toast({ title: "Documents uploaded", description: "Your files and details have been saved." });
      // Navigate back to dashboard
      window.location.href = "/patient-dashboard";
    } catch (err:any) {
      const msg = err?.message || "Upload failed";
      setError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-emerald-50 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="rounded-2xl shadow-2xl border-2 border-emerald-100 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">Upload Medical Documents</CardTitle>
              <CardDescription className="text-slate-600">Attach certificates/reports and add optional details</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block mb-1 font-medium">Type<span className="text-red-500">*</span></label>
                  <Input value={type} onChange={(e)=>setType(e.target.value)} placeholder="e.g., medical, certificate" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Title</label>
                    <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Organ</label>
                    <select className="w-full border rounded-md h-10 px-3 bg-white" value={organ} onChange={(e)=>setOrgan(e.target.value)}>
                      <option value="">— Select —</option>
                      <option>Kidney</option>
                      <option>Liver</option>
                      <option>Heart</option>
                      <option>Cornea</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Optional notes" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Details (JSON)</label>
                  <Textarea value={details} onChange={(e)=>setDetails(e.target.value)} placeholder='{"hospital":"AIIMS","physician":"Dr. A"}' />
                  <p className="text-xs text-muted-foreground mt-1">Optional advanced details; if provided, must be valid JSON.</p>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Files (PDF/JPG/PNG)</label>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e)=>setFiles(e.target.files)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default UploadDocuments;
