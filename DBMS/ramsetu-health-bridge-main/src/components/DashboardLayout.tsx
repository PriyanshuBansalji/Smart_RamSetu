import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, FileText, Users, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "donor" | "patient" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const getNavItems = () => {
    // Route mappings to existing pages
    if (role === "patient") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/patient-dashboard" },
        { icon: FileText, label: "Documents", path: "/patient-profile-form" },
        { icon: Settings, label: "Settings", path: "/about" },
      ];
    }

    if (role === "donor") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/donor-dashboard" },
        { icon: FileText, label: "Documents", path: "/donor-medical-form" },
        { icon: Settings, label: "Settings", path: "/about" },
      ];
    }

    if (role === "admin") {
      // Restrict to routes that exist in App.tsx to avoid NotFound
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
        { icon: FileText, label: "About", path: "/about" },
        { icon: Heart, label: "Contact", path: "/contact" },
      ];
    }

    // Fallback (should not hit)
    return [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: FileText, label: "Documents", path: "/about" },
      { icon: Settings, label: "Settings", path: "/contact" },
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Ram Setu Logo" className="h-10 w-10 rounded-full shadow-md border border-gray-200 bg-white object-contain" />
              <span className="font-extrabold text-2xl tracking-wide text-gray-800">RAM SETU</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium capitalize">{role} Portal</p>
                <p className="text-xs text-muted-foreground">user@email.com</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="space-y-2 sticky top-24">
              {getNavItems().map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.path}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
