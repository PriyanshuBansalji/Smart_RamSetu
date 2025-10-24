import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<"donor" | "patient" | "admin">(
    (roleParam as "donor" | "patient" | "admin") || "donor"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modify the handleLoginSuccess function to redirect based on role
  const handleLoginSuccess = (response: any) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.userId);
    localStorage.setItem("userRole", response.user.role); // Add this line

    // Redirect based on role
    switch (response.user.role) {
      case "donor":
        window.location.href = "/donor";
        break;
      case "patient":
        window.location.href = "/patient";
        break;
      case "admin":
        window.location.href = "/admin";
        break;
      default:
        window.location.href = "/";
    }
  };

  // Modify the handleLogin function to include role
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role, // Include selected role in login request
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json();

      // Verify role matches
      if (data.user.role !== role) {
        throw new Error(`Invalid login. Please select correct role for this account.`);
      }

      toast({ title: "Login Successful", description: `Welcome to RamSetu as a ${data.user.role}!` });

      handleLoginSuccess(data);
    } catch (err: any) {
      setError(err.message);
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
            <CardTitle className="text-2xl font-extrabold tracking-wide text-gray-800">Login to RAM SETU</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            <form onSubmit={handleLogin}>
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
                    placeholder="name@example.com"
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
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don't have an account? <Link to="/signup" className="text-primary underline">Sign Up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
