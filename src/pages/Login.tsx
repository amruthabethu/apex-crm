import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface LoginProps {
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function Login({ onShowToast }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill out both email and password fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication credentials rejected.");
      }

      login(data.token, data.user);
      onShowToast("Successfully signed in as administrator.", "success");
    } catch (err: any) {
      console.error("Login failure:", err);
      setErrorMessage(err.message || "Failed to establish a network connection.");
      onShowToast(err.message || "Invalid credentials. Please click the auto-fill help chip below.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@crm.com");
    setPassword("admin123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        
        {/* Brand Logo & Presentation */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mx-auto mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Access Apex CRM Suite</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Manage generated leads, clients and statistics</p>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none transition-colors duration-200">
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Security Alert</p>
                <p className="mt-0.5 leading-relaxed text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@crm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-slate-900 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Secure Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Submit Action Block */}
            <button
              id="submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl py-3 border border-indigo-700/10 dark:border-indigo-400/10 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/15 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign In to Admin Workspace</span>
              )}
            </button>
          </form>

          {/* Quick-Access Auto-fill Feature */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col items-center justify-center gap-3">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              MOCK SANDBOX DEVELOPMENT PROFILE
            </span>
            <button
              id="btn-quick-fill"
              onClick={handleQuickFill}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-xs text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping" />
              <span>Auto-Fill Admin Credentials</span>
            </button>
          </div>

        </div>

        {/* Footer Credit Line */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-600 mt-6 md:mt-8 tracking-wide font-sans">
          Protected by industry-standard JWT parameters.
        </p>

      </div>
    </div>
  );
}
