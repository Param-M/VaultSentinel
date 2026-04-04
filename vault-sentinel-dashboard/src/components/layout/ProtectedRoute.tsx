import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#64748b] text-sm font-mono">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
