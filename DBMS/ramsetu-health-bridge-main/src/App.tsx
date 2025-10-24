import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
// import Auth from "./pages/Auth"; // Deprecated, use Login and Signup instead
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DonorMedicalForm from "./pages/DonorMedicalForm";
import PatientProfileForm from "./pages/PatientProfileForm";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DonorDashboard from "./pages/DonorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DonorLanding from "./pages/DonorLanding";
import PatientLanding from "./pages/PatientLanding";
import KidneyDonationForm from "./pages/KidneyDonationForm";
import LiverDonationForm from "./pages/LiverDonationForm";
import HeartDonationForm from "./pages/HeartDonationForm";
import CorneaDonationForm from "./pages/CorneaDonationForm";
import UploadDocuments from "./pages/UploadDocuments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Landing />} />
          {/* <Route path="/auth" element={<Auth />} />  // Deprecated, use /login and /signup instead. Remove Auth.tsx if not needed. */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/donor-medical-form" element={<DonorMedicalForm />} />
          <Route path="/patient-profile-form" element={<PatientProfileForm />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/donor" element={<DonorLanding />} />
          <Route path="/patient" element={<PatientLanding />} />
          <Route path="/donate/kidney" element={<KidneyDonationForm />} />
          <Route path="/donate/liver" element={<LiverDonationForm />} />
          <Route path="/donate/heart" element={<HeartDonationForm />} />
          <Route path="/donate/cornea" element={<CorneaDonationForm />} />
          <Route path="/upload-documents" element={<UploadDocuments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
