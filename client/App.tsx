import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import NotFound from "./pages/NotFound";
import Salary from "./pages/Salary";
import PayslipPage from "./pages/PayslipPage";
import Dashboard from "./pages/Dashboard";
import IT from "./pages/IT";
import ITDashboard from "./pages/ITDashboard";
import ITPreviewPage from "./pages/ITPreviewPage";
import SystemInfo from "./pages/SystemInfo";
import SystemInfoDetail from "./pages/SystemInfoDetail";
import PCLaptopInfo from "./pages/PCLaptopInfo";
import DemoDataView from "./pages/DemoDataView";
import GoogleSheetsConfig from "./pages/GoogleSheetsConfig";
import GoogleAppsScriptConfig from "./pages/GoogleAppsScriptConfig";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/hr" element={<HRDashboard />} />
      <Route path="/employee/:employeeId" element={<EmployeeDetailsPage />} />
      <Route path="/salary" element={<Salary />} />
      <Route path="/payslip" element={<PayslipPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/deshbord" element={<Dashboard />} />
      <Route path="/it" element={<IT />} />
      <Route path="/it-dashboard" element={<ITDashboard />} />
      <Route path="/it-deshbord" element={<ITDashboard />} />
      <Route path="/it-preview/:id" element={<ITPreviewPage />} />
      <Route path="/system-info" element={<SystemInfo />} />
      <Route path="/system-info/:slug" element={<SystemInfoDetail />} />
      <Route path="/pc-laptop-info" element={<PCLaptopInfo />} />
      <Route path="/demo-data" element={<DemoDataView />} />
      <Route path="/google-sheets-config" element={<GoogleSheetsConfig />} />
      <Route
        path="/google-apps-script-config"
        element={<GoogleAppsScriptConfig />}
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
