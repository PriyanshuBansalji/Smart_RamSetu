import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Heart, ShieldAlert } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-white/60 shadow-xl overflow-hidden">
          <div className="px-8 py-10 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">404</h1>
            <p className="mt-2 text-lg text-slate-600">We couldn’t find that page.</p>
            <p className="text-sm text-slate-500">The link may be broken or the page might have been removed.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Link to="/login?role=patient">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Patient Login
                </Button>
              </Link>
              <Link to="/login?role=donor">
                <Button variant="outline" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Donor Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
