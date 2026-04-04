import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLinkToken } from "../hooks/useLinkToken";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/auth";
import { Hexagon, Lock, ShieldAlert, Loader2, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { isLoading, isValid, payload, token, errorMessage } = useLinkToken();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !payload?.email) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await login({ email: payload.email, password, link_token: token });
      setSession(response.access_token, {
        client_id: response.client_id,
        bank_name: response.bank_name,
        email: response.email,
        role: response.role,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err?.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070d1a] flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#0066cc 1px, transparent 1px), linear-gradient(90deg, #0066cc 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#0066cc]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 relative mb-4">
            <Hexagon className="w-16 h-16 text-[#0066cc] fill-[#0066cc]/10" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#00d4ff]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-white">VAULT SENTINEL</h1>
          <p className="text-[#475569] text-xs tracking-widest mt-1">SECURE ACCESS PORTAL</p>
        </div>

        <div className="bg-[#080e1d] border border-[#0d2040] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-[#0066cc] animate-spin" />
              <p className="text-[#64748b] text-sm font-mono">VERIFYING ACCESS LINK...</p>
            </div>
          ) : !isValid ? (
            /* No-access state */
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Access Restricted</p>
                <p className="text-[#64748b] text-sm leading-relaxed">{errorMessage}</p>
              </div>
              <div className="w-full p-3 bg-[#0a1628] border border-[#0d2040] rounded-lg text-left">
                <p className="text-[#475569] text-xs">
                  Vault Sentinel dashboards are only accessible via a private link provided by your account manager.
                  There is no public login.
                </p>
              </div>
            </div>
          ) : (
            /* Valid token — show login form */
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-green-400 text-xs font-mono">ACCESS LINK VERIFIED</p>
                </div>
                <p className="text-[#94a3b8] text-sm">
                  Welcome, <span className="text-white font-semibold">{payload?.bank_name}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email — pre-filled, locked */}
                <div>
                  <label className="block text-[#64748b] text-xs font-mono uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={payload?.email || ""}
                      readOnly
                      className="w-full bg-[#0a1628] border border-[#0d2040] text-[#475569] rounded-lg px-4 py-3 text-sm cursor-not-allowed select-none"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1e3a5f]" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#64748b] text-xs font-mono uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoFocus
                      className="w-full bg-[#0a1628] border border-[#0d2040] focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]/30 text-white rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-[#1e3a5f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !password}
                  className="w-full py-3 bg-gradient-to-r from-[#0055aa] to-[#0066cc] hover:from-[#0066cc] hover:to-[#0077ee] text-white rounded-lg font-semibold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
                  ) : (
                    "Access Dashboard →"
                  )}
                </button>
              </form>

              <p className="text-[#2d4a6e] text-xs text-center mt-6">
                Password sent in a separate email from your access link.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[#1e3a5f] text-xs mt-6 tracking-wide">
          Because every door in your bank deserves a guardian.
        </p>
      </div>
    </div>
  );
}
