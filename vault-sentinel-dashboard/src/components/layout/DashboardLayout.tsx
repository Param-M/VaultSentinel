import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/simulation": "Attack Simulation",
  "/dashboard/owasp": "OWASP Scanner",
  "/dashboard/quarantine": "Quarantine Manager",
  "/dashboard/honeytrap": "HoneyTrap System",
  "/dashboard/compliance": "Compliance Reports",
  "/dashboard/alerts": "Alert Center",
};

export function DashboardLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || "Vault Sentinel";

  return (
    <div className="flex min-h-screen bg-[#070d1a]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
