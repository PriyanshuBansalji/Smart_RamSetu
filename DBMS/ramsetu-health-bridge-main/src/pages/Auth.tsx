import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const roleParam = searchParams.get("role");
  const isAdminLogin = roleParam === "admin";
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"donor" | "patient" | "admin">(
    (roleParam as "donor" | "patient") || "donor"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailVerification, setEmailVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setEmailVerification(false);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      if (isLogin) {
        // LOGIN
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        localStorage.setItem("token", data.token);
        toast({ title: "Login Successful", description: `Welcome to RamSetu as a ${data.user.role}!` });
  // Redirects to dashboard removed as requested
      } else {
        // SIGNUP
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed");
        setEmailVerification(true);
        toast({ title: "Registration Successful", description: "Check your email to verify your account." });
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
            <CardTitle className="text-2xl font-extrabold tracking-wide text-gray-800">Welcome to RAM SETU</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your account" : "Create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              {emailVerification && !isLogin && (
                <div className="mb-4 text-green-600 text-center">
                  Registration successful! Please check your email to verify your account.
                </div>
              )}
              {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
              <form onSubmit={handleAuth}>
                {/* Role Selection */}
                <div className="space-y-4 mb-6">
                  <Label>I am a:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={role === "donor" ? "default" : "outline"}
                      onClick={() => setRole("donor")}
                      className="h-auto py-3"
                      disabled={loading || isAdminLogin}
                    >
                      Donor
                    </Button>
                    <Button
                      type="button"
                      variant={role === "patient" ? "default" : "outline"}
                      onClick={() => setRole("patient")}
                      className="h-auto py-3"
                      disabled={loading || isAdminLogin}
                    >
                      Patient
                    </Button>
                    {/* Hide admin button from public, only show if ?role=admin */}
                    {isAdminLogin && (
                      <Button
                        type="button"
                        variant={role === "admin" ? "default" : "outline"}
                        className="h-auto py-3"
                        disabled
                      >
                        Admin
                      </Button>
                    )}
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
                      placeholder="name@example.com"
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
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
