import { db, Lead, FollowUpEvent } from "../config/db";

export class LeadModel {
  static async find(): Promise<Lead[]> {
    return db.getLeads();
  }

  static async findById(id: string): Promise<Lead | null> {
    const leads = db.getLeads();
    const lead = leads.find((l) => l._id === id);
    return lead || null;
  }

  static async create(leadData: Omit<Lead, "_id" | "createdAt" | "updatedAt" | "followUpHistory">): Promise<Lead> {
    const leads = db.getLeads();
    const newLead: Lead = {
      ...leadData,
      _id: "lead_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUpHistory: []
    };
    leads.push(newLead);
    db.setLeads(leads);
    return newLead;
  }

  static async findByIdAndUpdate(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    const leads = db.getLeads();
    const index = leads.findIndex((l) => l._id === id);
    if (index === -1) return null;

    const updatedLead: Lead = {
      ...leads[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    leads[index] = updatedLead;
    db.setLeads(leads);
    return updatedLead;
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    const leads = db.getLeads();
    const filtered = leads.filter((l) => l._id !== id);
    if (filtered.length === leads.length) return false;
    db.setLeads(filtered);
    return true;
  }

  static async addFollowUpNote(id: string, noteText: string, followUpDate: string | null): Promise<Lead | null> {
    const lead = await this.findById(id);
    if (!lead) return null;

    const newEvent: FollowUpEvent = {
      id: "note_" + Math.random().toString(36).substr(2, 9),
      note: noteText,
      followUpDate: followUpDate || null,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [...(lead.followUpHistory || []), newEvent];
    return this.findByIdAndUpdate(id, {
      followUpHistory: updatedHistory,
      notes: noteText, // Set current active note
      followUpDate: followUpDate || lead.followUpDate // Set active follow up date
    });
  }
}
