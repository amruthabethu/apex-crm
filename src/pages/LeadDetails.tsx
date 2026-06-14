import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Lead, FollowUpEvent } from "../types";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Building, 
  Compass, 
  FileText,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface LeadDetailsProps {
  leadId: string;
  onNavigate: (pageId: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function LeadDetails({ 
  leadId, 
  onNavigate, 
  onShowToast 
}: LeadDetailsProps) {
  const { token } = useAuth();
  
  // Data states
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // View vs Edit Toggle
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields states (for editing profile)
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editSource, setEditSource] = useState<any>("Other");
  const [editStatus, setEditStatus] = useState<any>("New");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // New Follow up timeline log state
  const [newNoteText, setNewNoteText] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId, token]);

  const fetchLeadDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load lead details from file storage.");
      }
      setLead(data);
      
      // Populate edit states
      setEditName(data.name);
      setEditEmail(data.email || "");
      setEditPhone(data.phone || "");
      setEditCompany(data.company || "");
      setEditSource(data.source || "Other");
      setEditStatus(data.status || "New");
      setEditFollowUpDate(data.followUpDate || "");
      setEditNotes(data.notes || "");
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Could not retrieve lead logs.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      onShowToast("Full Name is a mandatory field.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          company: editCompany.trim(),
          source: editSource,
          status: editStatus,
          notes: editNotes.trim(),
          followUpDate: editFollowUpDate || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not update lead profile data.");
      }

      setLead(data.lead);
      setIsEditing(false);
      onShowToast("Lead record updated successfully.", "success");
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Profile updates failed.", "error");
    }
  };

  const handleAddFollowUpEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      onShowToast("Follow up timeline item description is required.", "error");
      return;
    }

    setIsAddingFollowUp(true);

    try {
      const res = await fetch(`/api/leads/${leadId}/follow-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          note: newNoteText.trim(),
          followUpDate: newFollowUpDate || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit follow up timeline entry.");
      }

      setLead(data.lead);
      setNewNoteText("");
      setNewFollowUpDate("");
      onShowToast("Follow-up timeline session logged successfully.", "success");
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Could not submit follow-up checklist.", "error");
    } finally {
      setIsAddingFollowUp(false);
    }
  };

  const handleDeleteLeadFromDetail = async () => {
    if (!confirm(`Are you absolutely sure you want to permanently delete lead ID "${lead?.name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove lead files.");
      }
      onShowToast("Lead deleted successfully.", "success");
      onNavigate("leads");
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || "Failed to delete lead files.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-9 w-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Restoring client timeline logs...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Lead Workspace Unavailable</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">The record is not present or was purged from disk index files.</p>
        <button
          id="btn-back-faulty"
          onClick={() => onNavigate("leads")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          See Active Leads
        </button>
      </div>
    );
  }

  // Define Badge style logic
  const statusColors = {
    "New": "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-300/30",
    "Contacted": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-300/30",
    "Follow Up": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-300/30",
    "Converted": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-300/30",
    "Lost": "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-300/30"
  }[lead.status] || "bg-slate-50 text-slate-700";

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Route Headers Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="btn-back-detail"
          onClick={() => onNavigate("leads")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Register</span>
        </button>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              id="btn-trigger-edit"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Details</span>
            </button>
          )}
          <button
            id="btn-delete-profile"
            onClick={handleDeleteLeadFromDetail}
            className="px-3.5 py-2 text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-xl border border-rose-200/25 dark:border-rose-900/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge Record</span>
          </button>
        </div>
      </div>

      {/* Main Container Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Details editing */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-md transition-colors duration-200">
            <div className="text-center pb-5 border-b border-slate-100 dark:border-slate-850">
              <div className="h-16 w-16 bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-950/60 text-indigo-700 dark:text-indigo-450 rounded-2xl flex items-center justify-center font-sans font-bold text-2xl mx-auto border border-indigo-200/20 shadow-md">
                {lead.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-905 dark:text-white mt-4">{lead.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{lead.company || "No Company Account"}</p>
              
              <div className="flex items-center justify-center gap-2 mt-3.5">
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${statusColors}`}>
                  Pipeline: {lead.status}
                </span>
                <span className="inline-block px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
                  Source: {lead.source}
                </span>
              </div>
            </div>

            {/* Profile Fields view vs edit */}
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="pt-5 space-y-4">
                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="edit-name" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Contact Name
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Email
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-phone" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-company" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Company Account
                    </label>
                    <input
                      id="edit-company"
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="edit-source" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Source
                      </label>
                      <select
                        id="edit-source"
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value as any)}
                        className="w-full text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 focus:outline-none"
                      >
                        <option value="Website">Website</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Referral">Referral</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-status" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Status
                      </label>
                      <select
                        id="edit-status"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-followup" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                      Follow Up Date
                    </label>
                    <input
                      id="edit-followup"
                      type="date"
                      value={editFollowUpDate}
                      onChange={(e) => setEditFollowUpDate(e.target.value)}
                      className="w-full text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    id="edit-save-btn"
                    type="submit"
                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Update</span>
                  </button>
                  <button
                    id="edit-cancel-btn"
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 text-slate-705 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-5 space-y-4 text-xs font-medium">
                {/* Email detail */}
                <div className="flex items-center gap-3.5 text-slate-600 dark:text-slate-400">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                  <div className="overflow-hidden">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                    <a href={`mailto:${lead.email}`} className="text-slate-900 dark:text-slate-300 font-semibold truncate block mt-0.5 hover:underline decoration-indigo-400">
                      {lead.email || "No email available"}
                    </a>
                  </div>
                </div>

                {/* Telephone detail */}
                <div className="flex items-center gap-3.5 text-slate-600 dark:text-slate-400">
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                  <div className="overflow-hidden">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Telephone Phone</span>
                    <span className="text-slate-800 dark:text-slate-300 font-semibold block mt-0.5">
                      {lead.phone || "No phone registered"}
                    </span>
                  </div>
                </div>

                {/* Company detail */}
                <div className="flex items-center gap-3.5 text-slate-600 dark:text-slate-400">
                  <Building className="h-4.5 w-4.5 text-slate-400" />
                  <div className="overflow-hidden">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Company Account</span>
                    <span className="text-slate-800 dark:text-slate-300 font-semibold block mt-0.5">
                      {lead.company || "Self employed / Independent"}
                    </span>
                  </div>
                </div>

                {/* Scheduled Follow up detail */}
                <div className="flex items-center gap-3.5 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  <div className="overflow-hidden">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Follow-Up Target</span>
                    {lead.followUpDate ? (
                      <span className="text-orange-600 dark:text-orange-400 font-bold block mt-0.5">
                        {lead.followUpDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-normal block mt-0.5">None programmed</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block">Lead logs tracking metadata:</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Created: {new Date(lead.createdAt).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Updated: {new Date(lead.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Follow-up History Timeline Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Note description panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-md transition-colors duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Lead Active Account Note</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-900/50">
              <p className="text-slate-800 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-wrap">
                {lead.notes || "No standard overview statement registered. Log an timeline event below to configure a follow-up summary."}
              </p>
            </div>
          </div>

          {/* Append follow-up trigger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-md transition-colors duration-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <Plus className="h-4.5 w-4.5 text-emerald-500" />
              <h3 className="font-sans font-bold text-base">Record Follow-Up Session Note</h3>
            </div>

            <form onSubmit={handleAddFollowUpEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="followup-note-input" className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Timeline Update Note/Summary <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="followup-note-input"
                    type="text"
                    required
                    placeholder="Briefly describe meeting conversation or email status update..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="followup-date-input" className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Reschedule Follow Up Date
                  </label>
                  <input
                    id="followup-date-input"
                    type="date"
                    value={newFollowUpDate}
                    onChange={(e) => setNewFollowUpDate(e.target.value)}
                    className="w-full text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2"
                  />
                </div>
              </div>
              
              <button
                id="btn-timeline-submit"
                type="submit"
                disabled={isAddingFollowUp}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-650/10 transition-colors disabled:opacity-50"
              >
                {isAddingFollowUp ? "Saving timeline log..." : "Append Timeline Event"}
              </button>
            </form>
          </div>

          {/* Timeline History rendering */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-md transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">Follow-Up Logs history</h3>
            </div>

            <div className="relative border-l-2 border-slate-100 dark:border-slate-850 ml-4 space-y-6">
              {!lead.followUpHistory || lead.followUpHistory.length === 0 ? (
                <div className="pl-6 text-slate-400 dark:text-slate-550 text-xs">
                  No timeline history items present. Create your first follow-up note to construct a tracking timeline log.
                </div>
              ) : (
                lead.followUpHistory.map((event, index) => (
                  <div key={event.id} className="relative pl-6 group">
                    {/* Pulsing indicator marker */}
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 bg-indigo-500 border border-white dark:border-slate-900 rounded-full group-hover:scale-110 transition-transform shadow-sm" />
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900/50 flex flex-col justify-between sm:flex-row sm:items-start gap-2.5">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-350 text-xs leading-relaxed font-semibold">
                          {event.note}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <span>Logged: {new Date(event.createdAt).toLocaleString()}</span>
                          {event.followUpDate && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                Reassigned follow up date to: {event.followUpDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 px-2 py-0.5 rounded text-slate-450 dark:text-slate-500 font-bold shrink-0 self-start">
                        Event #{lead.followUpHistory.length - index}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
