import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LoginPage } from "./pages/Login";
import { OverviewPage } from "./pages/Overview";
import { SimulationPage } from "./pages/Simulation";
import { OWASPPage } from "./pages/OWASP";
import { QuarantinePage } from "./pages/Quarantine";
import { HoneyTrapPage } from "./pages/HoneyTrap";
import { CompliancePage, AlertsPage } from "./pages/Compliance";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
      // Disable refetchInterval globally — WebSocket drives updates instead.
      // Individual pages can still set their own refetchInterval as a fallback.
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * WSWrapper — mounts WebSocketProvider only when the user is authenticated.
 * This prevents a WS connection attempt on the login page before a token exists.
 */
function WSWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <>{children}</>;
  return <WebSocketProvider>{children}</WebSocketProvider>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <WSWrapper>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route path="simulation" element={<SimulationPage />} />
                <Route path="owasp" element={<OWASPPage />} />
                <Route path="quarantine" element={<QuarantinePage />} />
                <Route path="honeytrap" element={<HoneyTrapPage />} />
                <Route path="compliance" element={<CompliancePage />} />
                <Route path="alerts" element={<AlertsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </WSWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}
