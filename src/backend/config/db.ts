import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Define Data Folder and File Paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

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
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}

export interface DbSchema {
  leads: Lead[];
  users: User[];
}

// Default Seed Data
const defaultLeads: Lead[] = [
  {
    _id: "lead_1",
    name: "Johnathan Doe",
    email: "john.doe@techcorp.com",
    phone: "+1 (555) 019-2834",
    company: "TechCorp Solutions",
    source: "Website",
    status: "New",
    notes: "Interested in enterprise plan. Reached out via website contact form.",
    followUpDate: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    followUpHistory: []
  },
  {
    _id: "lead_2",
    name: "Sarah Jenkins",
    email: "sjenkins@innovatedesign.io",
    phone: "+1 (555) 043-9812",
    company: "Innovate Design",
    source: "LinkedIn",
    status: "Contacted",
    notes: "Spoke briefly on LinkedIn. Sent pricing deck. Waiting for response.",
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // in 2 days
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    followUpHistory: [
      {
        id: "note_1",
        note: "Initial LinkedIn connection request accepted.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "note_2",
        note: "Sent agency introduction brochure and scheduled tentative call.",
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: "lead_3",
    name: "Marcus Aurelius",
    email: "marcus@stoicleads.org",
    phone: "+1 (555) 012-7492",
    company: "Stoic Advisors",
    source: "Referral",
    status: "Follow Up",
    notes: "Referred by Julius. Needs urgent consulting package setup.",
    followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // tomorrow
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    followUpHistory: [
      {
        id: "note_3",
        note: "Met at local network event. Requested a customized consultation proposal.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "note_4",
        note: "Sent premium proposal file via email. Confirmed receipt.",
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: "lead_4",
    name: "Emilia Clarke",
    email: "e.clarke@dragonwear.com",
    phone: "+1 (555) 091-8843",
    company: "Dragonwear Apparel",
    source: "Instagram",
    status: "Converted",
    notes: "Contract signed and deposit received. Setup kickoff on Monday! Excellent client.",
    followUpDate: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    followUpHistory: [
      {
        id: "note_5",
        note: "Custom design quote sent.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "note_6",
        note: "Contract finalized and signed via DocuSign.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: "lead_5",
    name: "Robert Baratheon",
    email: "robert@kinglydrinks.com",
    phone: "+1 (555) 077-1111",
    company: "Kingly Breweries",
    source: "Other",
    status: "Lost",
    notes: "Decided to build an in-house brewing software instead. Keep on radar for Q4.",
    followUpDate: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    followUpHistory: [
      {
        id: "note_7",
        note: "Presented system architectural diagram.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "note_8",
        note: "Client chose internal route due to budget reallocations.",
        followUpDate: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Seed Admin: admin@crm.com / admin123
const defaultUsers: User[] = [
  {
    _id: "user_admin",
    email: "admin@crm.com",
    passwordHash: bcrypt.hashSync("admin123", 10), // dynamically generated on compilation/first-run
    name: "Admin Coordinator",
    role: "admin"
  }
];

class Database {
  private schema: DbSchema = { leads: [], users: [] };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.schema = JSON.parse(fileContent);
        
        // Backward compatibility and data safety
        if (!this.schema.leads) this.schema.leads = [];
        if (!this.schema.users || this.schema.users.length === 0) {
          this.schema.users = defaultUsers;
        } else {
          // Verify and upgrade old static passwords if needed for environment parity
          let hasUpdated = false;
          this.schema.users = this.schema.users.map((u) => {
            if (
              u.email === "admin@crm.com" &&
              u.passwordHash === "$2a$10$7R7z6mH77gGzKj2pWzNo8O71mQFr897mU6e9zHmWn7O8n.6XQ/f4G"
            ) {
              u.passwordHash = bcrypt.hashSync("admin123", 10);
              hasUpdated = true;
            }
            return u;
          });
          if (hasUpdated) {
            this.save();
          }
        }
      } else {
        // First run seed
        this.schema = {
          leads: defaultLeads,
          users: defaultUsers
        };
        this.save();
      }
    } catch (error) {
      console.error("Database initialization failed. Falling back to memory state:", error);
      this.schema = { leads: defaultLeads, users: defaultUsers };
    }
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), "utf-8");
    } catch (error) {
      console.error("Database save failed:", error);
    }
  }

  public getLeads(): Lead[] {
    return this.schema.leads;
  }

  public setLeads(leads: Lead[]): void {
    this.schema.leads = leads;
    this.save();
  }

  public getUsers(): User[] {
    return this.schema.users;
  }

  public setUsers(users: User[]): void {
    this.schema.users = users;
    this.save();
  }
}

// Export a single database instance
export const db = new Database();

console.log("Database initialized successfully with mock MongoDB collection handlers.");
