import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LandlordDashboard from "./pages/LandlordDashboard";
import LoginPage from "./pages/LoginPage";
import AddPropertyPage from "./pages/AddPropertyPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import PropertyListPage from "./pages/PropertyListPage";
import RegisterPage from "./pages/RegisterPage";
import TenantDashboard from "./pages/TenantDashboard";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ReceivedApplicationsPage from "./pages/ReceivedApplicationsPage";
import CreateLeasePage from "./pages/CreateLeasePage";
import MyLeasesPage from "./pages/MyLeasesPage";
import MyPaymentsPage from "./pages/MyPaymentsPage";
import MaintenancePage from "./pages/MaintenancePage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/properties" element={<PropertyListPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route
          path="/applications"
          element={
            <ProtectedRoute requiredRole="TENANT">
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/applications"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <ReceivedApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/leases/new"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <CreateLeasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leases"
          element={
            <ProtectedRoute>
              <MyLeasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <MyPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/dashboard"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/properties/new"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <AddPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/properties/:id/edit"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <EditPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute requiredRole="TENANT">
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
