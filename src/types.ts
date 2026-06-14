export interface FollowUpEvent {
  id: string;
  note: string;
  followUpDate: string | null;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: "Website" | "LinkedIn" | "Referral" | "Instagram" | "Other";
  status: "New" | "Contacted" | "Follow Up" | "Converted" | "Lost";
  notes: string;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
  followUpHistory: FollowUpEvent[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  contacted: number;
  followUp: number;
  converted: number;
  lost: number;
  sources: {
    website: number;
    linkedin: number;
    referral: number;
    instagram: number;
    other: number;
  };
}
