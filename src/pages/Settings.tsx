import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Settings, 
  Moon, 
  Sun, 
  Key, 
  Mail, 
  ShieldCheck, 
  HelpCircle,
  Save,
  BellRing
} from "lucide-react";

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function CRM_Settings({ 
  darkMode, 
  onToggleDarkMode, 
  onShowToast 
}: SettingsProps) {
  const { user } = useAuth();
  
  // SMTP credentials simulated configurations states
  const [smtpHost, setSmtpHost] = useState("smtp.gamil.local");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("crm-mailer@gmail.com");
  const [adminEmail, setAdminEmail] = useState("admin@crm.com");

  // Notifications active switches
  const [leadCreatedEmailAlert, setLeadCreatedEmailAlert] = useState(true);
  const [slackLogsActive, setSlackLogsActive] = useState(false);

  const handleSaveSMTPSettings = (e: FormEvent) => {
    e.preventDefault();
    onShowToast("Nodemailer SMTP mailer parameter configuration saved offline.", "success");
  };

  const handleTestDispatch = () => {
    onShowToast("Sent simulated test transaction email alert to admin receiver address.", "info");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fadeIn">
      
      <div>
        <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white tracking-tight">System Configuration Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure security profiles, notification dispatch parameters and SMTP triggers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick preference switch card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2 text-slate-950 dark:text-white">
              <Sun className="h-4.5 w-4.5 text-orange-500" />
              <h3 className="text-sm font-bold tracking-tight">Quick Settings</h3>
            </div>
            
            <div className="space-y-4.5 text-xs">
              {/* Dark mode selector switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">Dark Visual Mode</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Enable warm colors for late hours</span>
                </div>
                <button
                  id="settings-mode-btn"
                  onClick={onToggleDarkMode}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-250 ${darkMode ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <div className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-250 ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Email dispatches switcher */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">Lead Email Alerts</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Dispatch Nodemailer trigger</span>
                </div>
                <button
                  id="toggle-email-alert"
                  onClick={() => setLeadCreatedEmailAlert(!leadCreatedEmailAlert)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-250 ${leadCreatedEmailAlert ? "bg-emerald-600" : "bg-slate-200"}`}
                >
                  <div className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-250 ${leadCreatedEmailAlert ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Simulated Slack updates */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-400 block">Simulate Slack Logs</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Append events to enterprise channel</span>
                </div>
                <button
                  id="toggle-slack"
                  onClick={() => setSlackLogsActive(!slackLogsActive)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-250 ${slackLogsActive ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <div className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-250 ${slackLogsActive ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Connected User Profile details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-850">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-sm font-bold tracking-tight">Access Information</h3>
            </div>
            
            <div className="text-xs space-y-2">
              <p className="text-slate-450 dark:text-slate-500">Logged in Administrator Profile:</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-900/50 rounded-xl space-y-1.5 font-sans font-medium text-slate-700 dark:text-slate-350">
                <p>Name: <strong className="text-slate-900 dark:text-white font-bold">{user?.name}</strong></p>
                <p>Email: <span className="font-semibold">{user?.email}</span></p>
                <p>Profile: <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">Workspace Chief Admin</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Mailer NodeMailer system parameters Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2.5 mb-2 text-slate-900 dark:text-white">
              <Mail className="h-5 w-5 text-indigo-500" />
              <h3 className="font-sans font-bold text-base">NodeMailer SMTP parameters</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Setup transaction mailer settings below. When a new lead is created, the system sends notifications to the administrative administrator email destination.</p>

            <form onSubmit={handleSaveSMTPSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Admin Destination email */}
                <div className="sm:col-span-2">
                  <label htmlFor="settings-admin-email" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Receiver Destination Email Alerts Address
                  </label>
                  <input
                    id="settings-admin-email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* SMTP Host address */}
                <div>
                  <label htmlFor="settings-smtp-host" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    SMTP Server Host Server
                  </label>
                  <input
                    id="settings-smtp-host"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* SMTP Port address */}
                <div>
                  <label htmlFor="settings-smtp-port" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Port Number
                  </label>
                  <input
                    id="settings-smtp-port"
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* SMTP Sender address */}
                <div className="sm:col-span-2">
                  <label htmlFor="settings-smtp-user" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    SMTP Account User login Username
                  </label>
                  <input
                    id="settings-smtp-user"
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800"
                  />
                </div>

              </div>

              {/* Saves SMTP details */}
              <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  id="settings-save-smtp"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Mailer Config</span>
                </button>
                <button
                  id="settings-test-smtp"
                  type="button"
                  onClick={handleTestDispatch}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Test Connection Alert
                </button>
              </div>
            </form>
          </div>

          {/* Sandbox informational instructions block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-950 dark:text-white">
              <HelpCircle className="h-5 w-5 text-indigo-500" />
              <h3 className="font-sans font-bold text-base">Development Profile Documentation</h3>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 leading-relaxed font-medium">
              <p>For development in the sandbox environment, our Express CRM server wraps file-based persistence natively. Your leads, statistics, custom notes and updates will persist on database files inside of `/data/db.json` across client refreshes.</p>
              <p>To configure real SMTP servers, append variables: <code className="bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 p-1 rounded font-mono">SMTP_HOST</code>, <code className="bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 p-1 rounded font-mono">SMTP_PORT</code>, <code className="bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 p-1 rounded font-mono">SMTP_USER</code> and <code className="bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 p-1 rounded font-mono">SMTP_PASS</code> in your secrets folder.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
