import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowLeft, Loader2, Link2, Calendar } from "lucide-react";

interface AddLeadProps {
  onNavigate: (pageId: string) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AddLead({ onNavigate, onShowToast }: AddLeadProps) {
  const { token } = useAuth();
  
  // Lead fields states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState<"Website" | "LinkedIn" | "Referral" | "Instagram" | "Other">("Website");
  const [status, setStatus] = useState<"New" | "Contacted" | "Follow Up" | "Converted" | "Lost">("New");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast("Prospect Full Name is a mandatory form requirement.", "error");
      return;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        onShowToast("Please enter a valid work email format.", "error");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          source,
          status,
          notes: notes.trim(),
          followUpDate: followUpDate || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create lead record.");
      }

      onShowToast(`Lead successfully generated for ${name}! Admin email notified.`, "success");
      onNavigate("leads");
    } catch (error: any) {
      console.error(error);
      onShowToast(error.message || "An error occurred while creating this prospect.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview badge class resolver
  const getBadgeColors = (currentStatus: string) => {
    return {
      "New": "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/30",
      "Contacted": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/30",
      "Follow Up": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200/30",
      "Converted": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/30",
      "Lost": "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200/30"
    }[currentStatus] || "bg-slate-50 text-slate-700";
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fadeIn">
      
      {/* Route Header bar navigation */}
      <button
        id="btn-back-add"
        onClick={() => onNavigate("leads")}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to Leads List</span>
      </button>

      <div>
        <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Create Prospect Lead</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enroll an organic contact generated offline or through integrations</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-md transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="lead-name" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Full Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                required
                placeholder="E.g. Jennifer Lawrence"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              />
            </div>

            {/* Work Email */}
            <div>
              <label htmlFor="lead-email" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Work Email Address
              </label>
              <input
                id="lead-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              />
            </div>

            {/* Telephone Number */}
            <div>
              <label htmlFor="lead-phone" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Telephone Number
              </label>
              <input
                id="lead-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="lead-company" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Company Name
              </label>
              <input
                id="lead-company"
                type="text"
                placeholder="E.g. Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              />
            </div>

            {/* Lead Channel Source */}
            <div>
              <label htmlFor="lead-source" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Lead Channel Source
              </label>
              <select
                id="lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full text-xs font-sans text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              >
                <option value="Website">Website Form</option>
                <option value="LinkedIn">LinkedIn Feed</option>
                <option value="Referral">Direct Referral</option>
                <option value="Instagram">Instagram Link</option>
                <option value="Other">Other Category</option>
              </select>
            </div>

            {/* Status Selector with design indicator color */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="lead-status" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Initial Status
                </label>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${getBadgeColors(status)}`}>
                  {status} Preview
                </span>
              </div>
              <select
                id="lead-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs font-sans text-slate-700 dark:text-slate-360 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
              >
                <option value="New">New Enquiry</option>
                <option value="Contacted">Contacted / Pitch Sent</option>
                <option value="Follow Up">Follow-Up Required</option>
                <option value="Converted">Converted deals</option>
                <option value="Lost">Lost Opportunity</option>
              </select>
            </div>

            {/* Scheduled Follow up date */}
            <div>
              <label htmlFor="lead-followup" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Scheduled Follow Up Date
              </label>
              <div className="relative">
                <input
                  id="lead-followup"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs font-sans text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 rounded-xl pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 h-10.5"
                />
                <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Initial Lead Notes / Inquiry message */}
          <div>
            <label htmlFor="lead-notes" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Initial Lead Notes / Inquiry Pitch Description
            </label>
            <textarea
              id="lead-notes"
              rows={4}
              placeholder="Provide a quick summary of what this client is discussing, budget specifications or meeting notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 resize-none"
            />
          </div>

          {/* Form Action triggers */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              id="submit-add-lead"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enrolling and notifying...</span>
                </>
              ) : (
                <span>Enroll Prospective Lead</span>
              )}
            </button>
            <button
              id="cancel-add-lead"
              type="button"
              onClick={() => onNavigate("leads")}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
