import "./App.css";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { RoleRoute } from "./components/shared/RoleRoute";
import { Home } from "./components/dashboard/Home";
import { MySession } from "./pages/MySession";
import { Psychologists } from "./pages/support";
import { Calendar } from "./pages/Calendar";
import { Journal } from "./pages/Journal";
import { CognitiveGames } from "./pages/CognitiveGames";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { PractitionerDashboard } from "./components/practitioner/PractitionerDashboard";

function App() {
  const { user } = useSelector((state: RootState) => state.auth!);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Protected dashboard routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <DashboardLayout userName={user?.username || "User"}>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/sessions" element={
          <ProtectedRoute>
            <DashboardLayout><MySession /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/psychologists" element={
          <ProtectedRoute>
            <DashboardLayout><Psychologists /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <DashboardLayout><Calendar /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/journal" element={
          <ProtectedRoute>
            <DashboardLayout><Journal /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/games" element={
          <ProtectedRoute>
            <DashboardLayout><CognitiveGames /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <DashboardLayout><Chat /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout><Settings /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Practitioner — only PRACTITIONER role */}
        <Route path="/practitioner" element={
          <RoleRoute allowedRoles={["PRACTITIONER"]}>
            <DashboardLayout><PractitionerDashboard /></DashboardLayout>
          </RoleRoute>
        } />

        {/* Volunteer — only VOLUNTEER role (shows their assigned cases) */}
        <Route path="/volunteer" element={
          <RoleRoute allowedRoles={["VOLUNTEER"]}>
            <DashboardLayout><PractitionerDashboard /></DashboardLayout>
          </RoleRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
