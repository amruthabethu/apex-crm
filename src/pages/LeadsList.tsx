import { useEffect, useState, MouseEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Lead } from "../types";
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Plus,
  Compass,
  AlertTriangle
} from "lucide-react";

interface LeadsListProps {
  onSelectLead: (id: string) => void;
  onNavigate: (pageId: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function LeadsList({ 
  onSelectLead, 
  onNavigate, 
  onShowToast 
}: LeadsListProps) {
  const { token } = useAuth();
  
  // Query parameters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);

  // Response data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState({
    totalLeads: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation state for deletes
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, sortBy, currentPage, token]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        source: sourceFilter,
        sortBy,
        page: currentPage.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/leads?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to query leads database.");
      }

      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Could not retrieve leads.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e: MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setLeadToDelete(lead);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      const res = await fetch(`/api/leads/${leadToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete lead from repository.");
      }

      onShowToast(`Lead "${leadToDelete.name}" was successfully removed from database.`, "success");
      setLeadToDelete(null);
      // Refresh list
      fetchLeads();
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Failed to complete delete request.", "error");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSourceFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Page Title & Add CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Leads Registry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search, qualify, sort and persist client profiles</p>
        </div>
        <button
          id="btn-add-lead-top"
          onClick={() => onNavigate("add-lead")}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Advanced Filters Control Panel Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-900 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4 text-slate-950 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-bold tracking-tight">Lead Query Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Term Bar */}
          <div className="lg:col-span-2 relative">
            <label htmlFor="search-field" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Instant Lookup Search
            </label>
            <div className="relative">
              <input
                id="search-field"
                type="text"
                placeholder="Search name, company, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-sans placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              />
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Status Badge Selection */}
          <div>
            <label htmlFor="status-select" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Pipeline Status
            </label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-sans text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Source Feed Selection */}
          <div>
            <label htmlFor="source-select" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Lead Source Feed
            </label>
            <select
              id="source-select"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-sans text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
            >
              <option value="All">All Sources</option>
              <option value="Website">Website Form</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Direct Referral</option>
              <option value="Instagram">Instagram</option>
              <option value="Other">Other Mode</option>
            </select>
          </div>

          {/* Database Sorter */}
          <div>
            <label htmlFor="sort-select" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Sorting Criteria
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-sans text-slate-700 dark:text-slate-360 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
            >
              <option value="newest">Created: Newest First</option>
              <option value="oldest">Created: Oldest First</option>
              <option value="name">Name: Alphabetical</option>
              <option value="followUp">Follow-up Date Order</option>
            </select>
          </div>
        </div>

        {/* Filters Clear Indicator bar */}
        {(search || statusFilter !== "All" || sourceFilter !== "All" || sortBy !== "newest") && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Active query filters: <strong className="text-slate-750 dark:text-slate-300">{(search ? 1 : 0) + (statusFilter !== "All" ? 1 : 0) + (sourceFilter !== "All" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0)}</strong> configuration(s) matching.
            </span>
            <button
              id="clear-filters-btn"
              onClick={handleClearFilters}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Results Leads Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-900 transition-all duration-200 overflow-hidden">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Filtering catalog indexes...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <Compass className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">No Matching Leads</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
              We couldn't locate any records on the system files using those specific constraints.
            </p>
            <button
              id="no-leads-clear"
              onClick={handleClearFilters}
              className="mt-4 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer"
            >
              See All Registered Logs
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50/70 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 border-b border-slate-200/60 dark:border-slate-900/60 text-[10px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-4 px-5">Lead Profile</th>
                    <th className="py-4 px-5">Company</th>
                    <th className="py-4 px-5">Source</th>
                    <th className="py-4 px-5">Pipeline Status</th>
                    <th className="py-4 px-5">Follow-Up scheduled</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {leads.map((lead) => {
                    // Status tag colors
                    const statusColors = {
                      "New": "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/30",
                      "Contacted": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/30",
                      "Follow Up": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200/30",
                      "Converted": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/30",
                      "Lost": "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200/30"
                    }[lead.status] || "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300";

                    return (
                      <tr
                        id={`lead-record-${lead._id}`}
                        key={lead._id}
                        onClick={() => onSelectLead(lead._id)}
                        className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all cursor-pointer group"
                      >
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {lead.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
                            <span>{lead.email}</span>
                            {lead.phone && (
                              <>
                                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                <span>{lead.phone}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-slate-750 dark:text-slate-300 font-medium">
                          {lead.company ? lead.company : <span className="text-slate-300 dark:text-slate-700">None</span>}
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {lead.source}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs">
                          {lead.followUpDate ? (
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              {lead.followUpDate}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">Not set</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              id={`action-view-${lead._id}`}
                              onClick={() => onSelectLead(lead._id)}
                              className="p-1 px-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Inspect lead files"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden lg:inline">Inspect</span>
                            </button>
                            <button
                              id={`action-delete-${lead._id}`}
                              onClick={(e) => handleDeleteClick(e, lead)}
                              className="p-1 px-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Revoke completely"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden lg:inline font-bold">Purge</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-900">
              {leads.map((lead) => {
                const statusColors = {
                  "New": "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/30",
                  "Contacted": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/30",
                  "Follow Up": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200/30",
                  "Converted": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/30",
                  "Lost": "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200/30"
                }[lead.status] || "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300";

                return (
                  <div
                    id={`mobile-card-${lead._id}`}
                    key={lead._id}
                    onClick={() => onSelectLead(lead._id)}
                    className="p-4 active:bg-slate-50 dark:active:bg-slate-900 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{lead.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.company || "No company"}</p>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
                        {lead.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
                      <p>Email: <span className="text-slate-700 dark:text-slate-300 font-medium">{lead.email}</span></p>
                      {lead.followUpDate && (
                        <p>Follow-up: <span className="text-orange-600 dark:text-orange-400 font-bold">{lead.followUpDate}</span></p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                        Source: {lead.source}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          id={`mob-view-${lead._id}`}
                          onClick={() => onSelectLead(lead._id)}
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg text-xs font-bold"
                        >
                          View Detail
                        </button>
                        <button
                          id={`mob-delete-${lead._id}`}
                          onClick={(e) => handleDeleteClick(e, lead)}
                          className="p-1 px-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Segment */}
            <div className="px-5 py-4 border-t border-slate-150 dark:border-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Page <strong className="text-slate-800 dark:text-slate-300">{pagination.currentPage}</strong> of <strong className="text-slate-800 dark:text-slate-300">{pagination.totalPages}</strong> ({pagination.totalLeads} matching leads)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="page-prev-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 hover:text-slate-950 text-slate-500 dark:text-slate-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  id="page-next-btn"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 hover:text-slate-950 text-slate-500 dark:text-slate-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            
          </div>
        )}

      </div>

      {/* Delete Lead Secure Confirmation Popup Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-450">
              <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-sans font-bold text-base text-slate-950 dark:text-white">Purge Lead From Database?</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Confirming this request will immediately purge <strong className="text-slate-800 dark:text-slate-300">"{leadToDelete.name}"</strong> (`${leadToDelete.company || "No Company"}`) directory profile. This is an irreversible structural change.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                id="btn-confirm-delete"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-rose-600/10"
              >
                Delete Lead Files
              </button>
              <button
                id="btn-cancel-delete"
                onClick={() => setLeadToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Nevermind
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
