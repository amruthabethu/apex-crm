import { useEffect, useState } from "react";
import { 
  Users, 
  Sparkles, 
  UserCheck, 
  UserMinus, 
  Clock, 
  PhoneCall, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Lead, DashboardStats } from "../types";

interface DashboardProps {
  onNavigate: (pageId: string) => void;
  onSelectLead: (leadId: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function Dashboard({ 
  onNavigate, 
  onSelectLead, 
  onShowToast, 
  darkMode 
}: DashboardProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [urgentFollowUps, setUrgentFollowUps] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/leads?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard statistics.");
      }

      setStats(data.stats);
      setRecentLeads(data.leads);

      // Fetch all leads to compute urgent follow ups
      const allRes = await fetch("/api/leads?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allData = await allRes.json();
      if (allRes.ok) {
        const todayStr = new Date().toISOString().split("T")[0];
        const urgent = allData.leads.filter((l: Lead) => {
          return l.status === "Follow Up" && l.followUpDate;
        }).slice(0, 4);
        setUrgentFollowUps(urgent);
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Could not sync dashboard values.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your analytical hub...</span>
      </div>
    );
  }

  // Cards layout logic
  const statCards = [
    {
      title: "Total Leads",
      value: stats.total,
      icon: Users,
      badgeText: "+12%",
      badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Lifetime logged prospects",
      themeAccent: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "New Inquiries",
      value: stats.new,
      icon: Sparkles,
      badgeText: "Needs action",
      badgeColor: "text-sky-500 bg-sky-500/10 border-sky-500/20",
      description: "Triage or pitch required",
      themeAccent: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50",
    },
    {
      title: "Contacted",
      value: stats.contacted,
      icon: PhoneCall,
      badgeText: `${stats.total ? Math.round((stats.contacted / stats.total) * 100) : 0}%`,
      badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Pitch conversations set",
      themeAccent: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      title: "Follow-Up",
      value: stats.followUp,
      icon: Clock,
      progressBar: (stats.total ? Math.round((stats.followUp / stats.total) * 100) : 0),
      description: "Scheduled calendar entries",
      themeAccent: "text-orange-600 dark:text-orange-450 bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "Converted",
      value: stats.converted,
      icon: UserCheck,
      badgeText: `${stats.total ? Math.round((stats.converted / stats.total) * 100) : 0}% rate`,
      badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Active business contracts",
      themeAccent: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Lost Deals",
      value: stats.lost,
      icon: UserMinus,
      badgeText: "Archived",
      badgeColor: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      description: "Inactive client profiles",
      themeAccent: "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/50",
    },
  ];

  // Helper variable for percentage calculation
  const totalLeadsCount = stats.total || 1;

  // Render a responsive horizontal bar chart
  const sourceChartData = [
    { label: "Website contact", count: stats.sources.website, color: "bg-blue-600 dark:bg-blue-500" },
    { label: "LinkedIn messages", count: stats.sources.linkedin, color: "bg-cyan-600 dark:bg-cyan-500" },
    { label: "Direct Referral", count: stats.sources.referral, color: "bg-indigo-600 dark:bg-indigo-500" },
    { label: "Instagram posts", count: stats.sources.instagram, color: "bg-pink-600 dark:bg-pink-500" },
    { label: "Other sources", count: stats.sources.other, color: "bg-slate-500 dark:bg-slate-400" },
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Dynamic Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors duration-200">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, Chief Administrator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome to Apex CRM. Leads are syncing in real time. We found <strong className="text-indigo-600 dark:text-indigo-400">{stats.new} new incoming inquiries</strong> needing your attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="dash-add-lead"
            onClick={() => onNavigate("add-lead")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-505 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-colors"
          >
            Create New Lead
          </button>
          <button
            id="dash-view-leads"
            onClick={() => onNavigate("leads")}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            Manage Pipeline
          </button>
        </div>
      </div>

      {/* Metric Bento Box Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              id={`stat-card-${i}`}
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-205"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{card.title}</span>
                {card.badgeText && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none shrink-0 ${card.badgeColor}`}>
                    {card.badgeText}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none font-sans">{card.value}</span>
                </div>

                {card.progressBar !== undefined && (
                  <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${card.progressBar || 5}%` }}
                    />
                  </div>
                )}

                <span className="text-[10px] text-slate-405 dark:text-slate-500 font-medium block leading-none">{card.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Source Channels distribution (Custom CSS/SVG Representation) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Inbound Lead Generation</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Distribution mapping showing conversion paths for logged prospects.</p>

            <div className="space-y-4">
              {sourceChartData.map((src, i) => {
                const percent = Math.round((src.count / totalLeadsCount) * 100);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{src.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {src.count} leads ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${src.color}`}
                        style={{ width: `${percent || 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center mt-6">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Omnichannel CRM Integration Active
            </span>
          </div>
        </div>

        {/* Lead conversion pipeline (Standard Conversion Funnel Graph) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Active Pipelines</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Status funnel map demonstrating actual qualification progression.</p>

          <div className="space-y-4">
            {/* Funnel rows */}
            {[
              { statusName: "New Inbound", count: stats.new, color: "bg-sky-500" },
              { statusName: "Contact Set", count: stats.contacted, color: "bg-amber-500" },
              { statusName: "Active Follow-Ups", count: stats.followUp, color: "bg-orange-500" },
              { statusName: "Converted Deals", count: stats.converted, color: "bg-emerald-500" },
            ].map((funnel, idx) => {
              const conversionRate = Math.round((funnel.count / totalLeadsCount) * 100);
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 text-xs font-semibold text-slate-600 dark:text-slate-400 truncate text-left">
                    {funnel.statusName}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div 
                      className={`h-6 rounded-md hover:opacity-80 transition-all ${funnel.color} text-white text-[10px] font-bold flex items-center px-2.5`}
                      style={{ width: `${Math.max(15, conversionRate)}%` }}
                    >
                      {funnel.count}
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 w-10">
                    {conversionRate}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-8 leading-relaxed">
            Aim to transition at least <strong className="text-slate-700 dark:text-slate-300">25%</strong> of your pipeline leads into <strong className="text-emerald-600 dark:text-emerald-400">Converted Status</strong> for high CRM conversion efficiency.
          </div>
        </div>

        {/* Immediate Follow Up Alert Hub */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 px-1.5 bg-orange-50 dark:bg-orange-950/40 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Urgent Lead Follow-Ups</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Leads with scheduling logs marked "Follow Up" requiring a telephone call or proposal update.</p>

          <div className="space-y-3.5">
            {urgentFollowUps.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">All follow ups completed! Clean pipeline.</span>
              </div>
            ) : (
              urgentFollowUps.map((lead) => (
                <div
                  id={`urgent-follow-${lead._id}`}
                  key={lead._id}
                  onClick={() => onSelectLead(lead._id)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/55 dark:bg-slate-900/60 dark:hover:bg-slate-850/65 rounded-xl border border-slate-150 dark:border-slate-900/40 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="overflow-hidden pr-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {lead.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{lead.company || "No Company"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md border border-orange-200/20">
                      {lead.followUpDate ? lead.followUpDate : "Pending"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 text-center mt-5">
            <button
              id="view-all-pipeline"
              onClick={() => onNavigate("leads")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>Explore Entire Pipeline Logs</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Recents Widget */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1 px-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Recent Inquiries</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Prospects logged down onto database directory files</p>
            </div>
          </div>
          <button
            id="recents-see-all"
            onClick={() => onNavigate("leads")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See Active Directory</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Lead Table / List representation */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-900">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-900 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Contact Detail</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Channel Source</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {recentLeads.slice(0, 4).map((lead) => {
                const badgeColors = {
                  "New": "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/30",
                  "Contacted": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/30",
                  "Follow Up": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200/30",
                  "Converted": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/30",
                  "Lost": "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200/30"
                }[lead.status] || "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300";

                return (
                  <tr
                    id={`row-${lead._id}`}
                    key={lead._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {lead.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {lead.company || <span className="text-slate-300 dark:text-slate-700">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {lead.source}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeColors}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-view-lead-${lead._id}`}
                        onClick={() => onSelectLead(lead._id)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-slate-200/20 dark:border-slate-800"
                        title="View Full Profile Details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
