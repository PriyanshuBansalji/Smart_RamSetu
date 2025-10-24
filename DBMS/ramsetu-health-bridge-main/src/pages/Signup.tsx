import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<"donor" | "patient">(
    (roleParam as "donor" | "patient") || "donor"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [passwordValue, setPasswordValue] = useState("");
  const [otp, setOtp] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email");
    const password = fd.get("password");
    setPasswordValue(password as string); // Store password in state
    setFormData({ email, role }); // Do not store password in formData
    setEmailForOtp(email as string);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Signup error:", data);
        throw new Error(data.message || data.error || "Signup failed");
      }
      setStep("otp");
      toast({ title: "OTP Sent", description: "Check your email for the OTP code." });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [verified, setVerified] = useState(false);
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: passwordValue,
          otp,
        }),
      });
      const data = await res.json();
        if (!res.ok) {
          console.error("OTP error:", data);
          throw new Error(data.message || data.error || "OTP verification failed");
        }
        setVerified(true);
        setStep("done");
        toast({ title: "Registration Successful", description: "You can now continue your profile." });
        // Set a temporary token for donor medical form usage (simulate login)
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Card className="shadow-medium">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Ram Setu Logo" className="h-16 w-16 rounded-full shadow-md border border-gray-200 bg-white object-contain" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-wide text-gray-800">Sign Up for RAM SETU</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            {step === "form" && (
              <form onSubmit={handleSignup}>
                {/* Role Selection */}
                <div className="space-y-4 mb-6">
                  <Label>I am a:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={role === "donor" ? "default" : "outline"}
                      onClick={() => setRole("donor")}
                      className="h-auto py-3"
                      disabled={loading}
                    >
                      Donor
                    </Button>
                    <Button
                      type="button"
                      variant={role === "patient" ? "default" : "outline"}
                      onClick={() => setRole("patient")}
                      className="h-auto py-3"
                      disabled={loading}
                    >
                      Patient
                    </Button>
                  </div>
                </div>
                {/* Email and Password */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="labourzkart@gmail.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      value={passwordValue}
                      onChange={e => setPasswordValue(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            )}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="mb-4 text-center text-base text-gray-700">
                  Enter the 6-digit OTP sent to <span className="font-semibold">{emailForOtp}</span>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="border rounded px-2 py-2 w-full text-center text-lg tracking-widest"
                  placeholder="Enter OTP"
                  autoFocus
                />
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify OTP & Complete Signup"}
                </Button>
              </form>
            )}
            {step === "done" && verified && (
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-green-600 text-2xl font-bold flex flex-col items-center">
                  <span>🎉 Registration Successful!</span>
                  <span className="text-base text-gray-700 mt-2">Welcome to RamSetu. Please complete your profile to continue.</span>
                </div>
                <Button
                  className="w-60 text-lg bg-gradient-to-r from-blue-800 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:from-blue-900 hover:to-green-700"
                  onClick={() => {
                    if (role === "donor") navigate("/donor-medical-form");
                    else if (role === "patient") navigate("/patient-profile-form");
                  }}
                >
                  Continue to {role === "donor" ? "Donor" : "Patient"} Form
                </Button>
              </div>
            )}
            {step === "form" && (
              <div className="mt-4 text-center text-sm">
                Already have an account? <Link to="/login" className="text-primary underline">Login</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
