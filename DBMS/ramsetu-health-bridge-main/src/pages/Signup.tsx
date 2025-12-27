import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface PasswordStrength {
  score: number;
  strength: "weak" | "fair" | "good" | "strong";
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  missing: string[];
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  // Check password strength in real-time
  const checkPasswordStrength = async (password: string) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/check-password-strength`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setPasswordStrength(data);
    } catch (err) {
      console.error("Failed to check password strength:", err);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPasswordValue(pwd);
    checkPasswordStrength(pwd);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name");
    const email = fd.get("email");
    const password = fd.get("password");
    setPasswordValue(password as string); // Store password in state
    setFormData({ email, name, role }); // Include name in formData
    setEmailForOtp(email as string);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name }),
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
                {/* Name, Email and Password */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      required
                      disabled={loading}
                    />
                  </div>
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
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        value={passwordValue}
                        onChange={handlePasswordChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {passwordStrength && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Strength:</span>
                          <div className="flex gap-1 flex-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i < (passwordStrength.score / 20)
                                    ? passwordStrength.strength === "strong"
                                      ? "bg-green-500"
                                      : passwordStrength.strength === "good"
                                      ? "bg-blue-500"
                                      : passwordStrength.strength === "fair"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              passwordStrength.strength === "strong"
                                ? "text-green-700 bg-green-100"
                                : passwordStrength.strength === "good"
                                ? "text-blue-700 bg-blue-100"
                                : passwordStrength.strength === "fair"
                                ? "text-yellow-700 bg-yellow-100"
                                : "text-red-700 bg-red-100"
                            }`}
                          >
                            {passwordStrength.strength.toUpperCase()}
                          </span>
                        </div>
                        {passwordStrength.missing.length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <p className="font-medium mb-1">Missing:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {passwordStrength.missing.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
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
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
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
