export type RiskClass = "ACTIVE" | "DORMANT" | "ZOMBIE" | "GHOST";

export interface ZombieAPI {
  id: number;
  endpoint: string;
  method: string;
  service_name: string | null;
  owner_team: string | null;
  risk_score: number;
  risk_class: RiskClass;
  is_documented: boolean;
  auth_type: string;
  inactive_days: number;
  cve_count: number;
  cvss_max: number;
  resurrection_detected: boolean;
  owasp_results: OWASPResult[] | null;
  is_quarantined: boolean;
  honeypot_deployed: boolean;
  gemini_summary: string | null;
  last_seen: string | null;
  first_seen: string;
}

export interface OWASPResult {
  rule_id: string;
  rule_name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

export interface Alert {
  id: number;
  endpoint: string;
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  details: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_apis: number;
  active_count: number;
  dormant_count: number;
  zombie_count: number;
  ghost_count: number;
  quarantined_count: number;
  honeypot_hits_today: number;
  avg_risk_score: number;
  compliance_score: number;
  last_scan: string | null;
}

export interface HoneypotHit {
  id: number;
  honeypot_endpoint: string;
  attacker_ip: string;
  attacker_method: string;
  captured_at: string;
}

export interface QuarantinedEndpoint {
  endpoint: string;
  reason: string | null;
  blocked_at: string | null;
}

export interface SimulationEvent {
  type: string;
  stage_id?: number;
  stage_name?: string;
  description?: string;
  message?: string;
  severity?: string;
  records_leaked?: number;
  endpoints_found?: number;
  endpoints?: string[];
  success?: boolean;
  blocked_by_vault_sentinel?: boolean;
  vault_sentinel_blocked?: boolean;
  total_records_leaked?: number;
  summary?: string;
  target?: string;
  timestamp?: string;
}
