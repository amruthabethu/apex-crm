import { Request, Response } from "express";
import { LeadModel } from "../models/Lead";
import { EmailService } from "../services/emailService";

export class LeadController {
  // GET /api/leads with advanced filtering, searching, sorting, and pagination
  public static async getAll(req: Request, res: Response) {
    try {
      let leads = await LeadModel.find();

      // Implement searching across Name, Email, Company, Notes
      const search = req.query.search as string;
      if (search) {
        const query = search.toLowerCase();
        leads = leads.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.email.toLowerCase().includes(query) ||
            l.company.toLowerCase().includes(query) ||
            (l.notes && l.notes.toLowerCase().includes(query))
        );
      }

      // Implement filter by Status
      const status = req.query.status as string;
      if (status && status !== "All") {
        leads = leads.filter((l) => l.status.toLowerCase() === status.toLowerCase());
      }

      // Implement filter by Source
      const source = req.query.source as string;
      if (source && source !== "All") {
        leads = leads.filter((l) => l.source.toLowerCase() === source.toLowerCase());
      }

      // Implement Sorting (by default: newest first)
      const sortBy = req.query.sortBy as string; // 'newest', 'oldest', 'name', 'followUp'
      if (sortBy === "oldest") {
        leads.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortBy === "name") {
        leads.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "followUp") {
        leads.sort((a, b) => {
          if (!a.followUpDate) return 1;
          if (!b.followUpDate) return -1;
          return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
        });
      } else {
        // Default: newest first
        leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Pagination
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const totalLeads = leads.length;
      const totalPages = Math.ceil(totalLeads / limit);
      const paginatedLeads = leads.slice(startIndex, endIndex);

      // Aggregate state counters for the dashboard
      const allOriginalLeads = await LeadModel.find();
      const stats = {
        total: allOriginalLeads.length,
        new: allOriginalLeads.filter((l) => l.status === "New").length,
        contacted: allOriginalLeads.filter((l) => l.status === "Contacted").length,
        followUp: allOriginalLeads.filter((l) => l.status === "Follow Up").length,
        converted: allOriginalLeads.filter((l) => l.status === "Converted").length,
        lost: allOriginalLeads.filter((l) => l.status === "Lost").length,
        sources: {
          website: allOriginalLeads.filter((l) => l.source === "Website").length,
          linkedin: allOriginalLeads.filter((l) => l.source === "LinkedIn").length,
          referral: allOriginalLeads.filter((l) => l.source === "Referral").length,
          instagram: allOriginalLeads.filter((l) => l.source === "Instagram").length,
          other: allOriginalLeads.filter((l) => l.source === "Other").length,
        }
      };

      return res.status(200).json({
        leads: paginatedLeads,
        pagination: {
          totalLeads,
          totalPages,
          currentPage: page,
          limit,
        },
        stats,
      });
    } catch (error: any) {
      console.error("Fetch leads controller error:", error);
      return res.status(500).json({ error: "Failed to load CRM leads." });
    }
  }

  // GET /api/leads/:id
  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lead = await LeadModel.findById(id);

      if (!lead) {
        return res.status(404).json({ error: `Lead not found with ID: ${id}` });
      }

      return res.status(200).json(lead);
    } catch (error: any) {
      console.error("Fetch single lead controller error:", error);
      return res.status(500).json({ error: "Failed to fetch lead details." });
    }
  }

  // POST /api/leads
  public static async create(req: Request, res: Response) {
    try {
      const { name, email, phone, company, source, status, notes, followUpDate } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Lead 'name' field is a mandatory requirement." });
      }

      const freshLead = await LeadModel.create({
        name,
        email: email || "",
        phone: phone || "",
        company: company || "",
        source: source || "Other",
        status: status || "New",
        notes: notes || "",
        followUpDate: followUpDate || null,
      });

      // Dispatch non-blocking Nodemailer notification
      EmailService.sendNewLeadNotification(freshLead).catch((err) => {
        console.error("Nodemailer dispatch alert failed in controller background:", err);
      });

      return res.status(211).json({
        message: "Created new lead successfully and notified system admins.",
        lead: freshLead,
      });
    } catch (error: any) {
      console.error("Create lead controller error:", error);
      return res.status(500).json({ error: "Failed to construct new CRM lead record." });
    }
  }

  // PUT /api/leads/:id
  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const originalLead = await LeadModel.findById(id);

      if (!originalLead) {
        return res.status(404).json({ error: `Lead not found with ID: ${id}` });
      }

      const updated = await LeadModel.findByIdAndUpdate(id, req.body);
      return res.status(200).json({
        message: "Lead updated successfully.",
        lead: updated,
      });
    } catch (error: any) {
      console.error("Update lead controller error:", error);
      return res.status(500).json({ error: "Failed to save lead updates." });
    }
  }

  // DELETE /api/leads/:id
  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exists = await LeadModel.findById(id);

      if (!exists) {
        return res.status(404).json({ error: `Lead not found with ID: ${id}` });
      }

      await LeadModel.findByIdAndDelete(id);
      return res.status(200).json({
        message: `Lead ${id} has been completely removed from CRM.`,
        deletedId: id,
      });
    } catch (error: any) {
      console.error("Delete lead controller error:", error);
      return res.status(500).json({ error: "Failed to purge lead data." });
    }
  }

  // POST /api/leads/:id/follow-up
  public static async addFollowUp(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { note, followUpDate } = req.body;

      if (!note) {
        return res.status(400).json({ error: "Follow up event requires a 'note' description." });
      }

      const updatedLead = await LeadModel.addFollowUpNote(id, note, followUpDate || null);

      if (!updatedLead) {
        return res.status(404).json({ error: `Lead not found with ID: ${id}` });
      }

      return res.status(200).json({
        message: "Added follow-up history item successfully.",
        lead: updatedLead,
      });
    } catch (error: any) {
      console.error("Add follow up history item error:", error);
      return res.status(500).json({ error: "Failed to append follow up history." });
    }
  }
}
