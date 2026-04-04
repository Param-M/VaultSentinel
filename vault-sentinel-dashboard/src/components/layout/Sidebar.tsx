import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Zap, Shield, Bug, Lock, FileCheck,
  Bell, LogOut, Hexagon, Activity
} from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/simulation", icon: Zap, label: "Simulation" },
  { to: "/dashboard/owasp", icon: Bug, label: "OWASP Scanner" },
  { to: "/dashboard/quarantine", icon: Lock, label: "Quarantine" },
  { to: "/dashboard/honeytrap", icon: Shield, label: "HoneyTrap" },
  { to: "/dashboard/compliance", icon: FileCheck, label: "Compliance" },
  { to: "/dashboard/alerts", icon: Bell, label: "Alerts" },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#080e1d] border-r border-[#0d2040] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#0d2040]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Hexagon className="w-8 h-8 text-[#0066cc] fill-[#0066cc]/20" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-widest">VAULT</p>
            <p className="text-[#0066cc] font-bold text-sm tracking-widest -mt-1">SENTINEL</p>
          </div>
        </div>
        <div className="mt-4 px-3 py-2 bg-[#0a1628] rounded-lg border border-[#0d2040]">
          <p className="text-[#64748b] text-[10px] uppercase tracking-wider">Secured for</p>
          <p className="text-[#00d4ff] text-xs font-semibold truncate mt-0.5">{user?.bank_name}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-[#0066cc]/15 text-[#00d4ff] border border-[#0066cc]/30"
                  : "text-[#475569] hover:text-[#94a3b8] hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00d4ff]" : "text-[#475569] group-hover:text-[#94a3b8]"}`} />
                <span className="font-medium">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#00d4ff] rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#0d2040]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#0066cc]/20 border border-[#0066cc]/40 flex items-center justify-center">
            <span className="text-[#00d4ff] text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#94a3b8] text-xs font-medium truncate">{user?.email}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Activity className="w-2.5 h-2.5 text-green-400" />
              <p className="text-green-400 text-[10px]">ACTIVE SESSION</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#475569] hover:text-red-400 hover:bg-red-400/10 text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
