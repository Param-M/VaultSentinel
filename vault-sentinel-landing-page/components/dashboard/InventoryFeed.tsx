"use client";

import { useState } from "react";

const initialInventory = [
  { id: "A-01", name: "User Auth Service", endpoint: "/api/v1/user/auth", status: "ACTIVE", rps: 342 },
  { id: "A-02", name: "Legacy Payment Gateway", endpoint: "/api/v0/pay/legacy", status: "ZOMBIE", rps: 12 },
  { id: "A-03", name: "Transaction Core", endpoint: "/api/v2/txn/core", status: "ACTIVE", rps: 890 },
  { id: "A-04", name: "Unmapped Shadow API", endpoint: "/api/test/dev", status: "ZOMBIE", rps: 5 },
  { id: "A-05", name: "Reporting Module", endpoint: "/api/v1/reports", status: "WARN", rps: 120 },
  { id: "A-06", name: "GraphQL Aggregator", endpoint: "/graphql", status: "ACTIVE", rps: 450 },
  { id: "A-07", name: "Deprecated Tokenizer", endpoint: "/api/v1/tokenize", status: "ZOMBIE", rps: 0 },
];

export default function InventoryFeed() {
  const [filter, setFilter] = useState("ALL");

  const filtered = initialInventory.filter(item => {
    if(filter === "ALL") return true;
    return item.status === filter;
  });

  return (
    <div className="w-full bg-alt border border-card-border rounded-xl p-6 h-full flex flex-col min-h-[500px]">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="text-xl font-bold text-foreground">API Inventory Registry</h3>
          <div className="flex bg-background border border-card-border rounded-md overflow-hidden">
             {["ALL", "ACTIVE", "ZOMBIE", "WARN"].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs font-bold tracking-widest transition-colors ${filter === f ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue' : 'text-muted hover:text-foreground'}`}
                >
                  {f}
                </button>
             ))}
          </div>
       </div>

       <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
             <thead>
               <tr className="border-b border-card-border text-muted">
                 <th className="pb-4 font-medium pl-4">API ID</th>
                 <th className="pb-4 font-medium">NAME</th>
                 <th className="pb-4 font-medium">ENDPOINT</th>
                 <th className="pb-4 font-medium text-right pr-4">RPS</th>
                 <th className="pb-4 font-medium text-center">STATUS</th>
               </tr>
             </thead>
             <tbody>
               {filtered.map((item, i) => (
                 <tr key={i} className="border-b border-card-border/50 hover:bg-white/5 transition-colors">
                   <td className="py-4 pl-4 font-mono text-xs font-semibold text-accent-cyan">{item.id}</td>
                   <td className="py-4 font-semibold text-foreground">{item.name}</td>
                   <td className="py-4 font-mono text-xs text-muted">{item.endpoint}</td>
                   <td className="py-4 text-right pr-4 font-semibold">{item.rps}</td>
                   <td className="py-4 text-center">
                     <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold tracking-widest ${
                       item.status === 'ACTIVE' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                       item.status === 'ZOMBIE' ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20' :
                       'bg-accent-orange/10 text-accent-orange border border-accent-orange/20'
                     }`}>
                       {item.status}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="text-center py-10 text-muted">No endpoints matching current filter.</div>
          )}
       </div>
    </div>
  );
}
