import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import TenantHomePage from "../pages/tenant/TenantHomePage";
import PropertyDetailsPage from "../pages/tenant/PropertyDetailsPage";
import TenantBookingsPage from "../pages/tenant/TenantBookingsPage";
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage";
import AddPropertyPage from "../pages/owner/AddPropertyPage";
import EditPropertyPage from "../pages/owner/EditPropertyPage";
import ManageBookingsPage from "../pages/owner/ManageBookingsPage";
import OwnerPropertiesPage from "../pages/owner/OwnerPropertiesPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TenantHomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />

      <Route
        path="/tenant/bookings"
        element={
          <ProtectedRoute role="TENANT">
            <TenantBookingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute role="OWNER">
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/properties"
        element={
          <ProtectedRoute role="OWNER">
            <OwnerPropertiesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/add-property"
        element={
          <ProtectedRoute role="OWNER">
            <AddPropertyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/edit-property/:id"
        element={
          <ProtectedRoute role="OWNER">
            <EditPropertyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/bookings"
        element={
          <ProtectedRoute role="OWNER">
            <ManageBookingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}