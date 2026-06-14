# Apex CRM — Client Lead Management System

Apex CRM is a professional, full-stack Client Lead Management Suite (Mini CRM) designed as a centralized dashboard where businesses can monitor, triage, schedule, and qualify inward prospects captured via website forms or public channels (like LinkedIn or referrals).

---

## 🚀 Key Architectural Highlights & Features

1. **Analytical Dashboard:**
   - Visual KPI counters representing **Total, New, Contacted, Follow-Up, Converted, and Lost** lead pipeline pools.
   - Beautiful, custom inline **Inbound Channel and Qualification Pipeline visualizers**.
   - Immediate **Urgent Follow-Up Action Hub** showing contacts due for follow-ups today.
   - Comprehensive **Recent Inquiries** registry tracking directories in real-time.

2. **Rigorous Pipeline State Workflow (CRUD):**
   - Add new prospect entries featuring contact metadata (Full Name, Company Name, Email, Phone, lead channel sources, follow-up dates, initial logs).
   - Instant filtering selectors with dynamic counters matching combinations of status, channel source, and search terms.
   - Full date sorting (Newest first, Oldest first) or Follow-Up schedule sorting.
   - Advanced pagination controls.
   - Secure and fully validated delete mechanics requiring individual double-confirmation popups.

3. **Follow-Up System & Account Timeline History:**
   - Single-screen inspection workspace showing contact metrics side-by-side.
   - Interactive profile updates (name, phone, company, status, source) toggled seamlessly inside of view/edit workspaces.
   - Timeline log mechanics allowing managers to append detailed notes, adjust schedule dates, and compile chronologically indexed milestone historical event cards.

4. **Robust JWT Admin Authentication:**
   - Secure server-side validation against pre-seeded users.
   - JSON Web Token (JWT) credentials generated via `jsonwebtoken` with 24-hour expiration bounds.
   - Client-side persistence using `localStorage` triggers, keeping administrators safe across page reloads.
   - Complete logout actions clearing cache completely.

5. **Industry-Standard Codebase Design:**
   - Highly separated backend model controllers (`LeadModel`, `UserModel`), Express router triggers protected by strict authentications middleware, and granular services.
   - Fully interactive email alerts dispatched via **Nodemailer** to system administrators when incoming inquiries are finalized. Works out-of-the-box in sandboxed development via virtual logging triggers.

---

## 🏠 Project Folder Structure

```
├── data/
│   └── db.json                    # Local storage persistent file (Saves Lead and User indexes)
├── server.ts                      # Main Node.js + Express entry point (mounts Vite middleware)
├── src/
│   ├── App.tsx                    # React application landing SPA router
│   ├── main.tsx                   # React client mounting logic
│   ├── types.ts                   # Unified front-end type definitions
│   ├── index.css                  # Tailwind styles and UI micro-animations
│   ├── context/
│   │   └── AuthContext.tsx        # React Context tracking JWT security states
│   ├── components/
│   │   ├── Sidebar.tsx            # Fluid sidebar navigation drawer & theme selector
│   │   └── Toast.tsx              # Dynamic floating notification alerts
│   ├── pages/
│   │   ├── Login.tsx              # Secure Login interface with auto-fill credentials helper
│   │   ├── Dashboard.tsx          # Numerical hub, analytics bento cards, and stats charts
│   │   ├── LeadsList.tsx          # CRUD Leads directory with advanced query capabilities
│   │   ├── AddLead.tsx            # Form to register new prospects
│   │   ├── LeadDetails.tsx        # Profile inspector and timeline historical milestones manager
│   │   └── Settings.tsx           # Dark mode toggler, SMTP customization, and documentation
```

---

## 🔐 Credentials Checklist

A premium development-ready profile comes pre-seeded in the local database:

- **Admin User Login Email:** `admin@crm.com`
- **Password:** `admin123`

*(Alternatively, you can click the neon **"Auto-Fill Admin Credentials"** chip on the login interface to sign in instantly with zero typing friction!)*

---

## 🛠️ Step-by-Step Installation & Local Execution

### 1. Configure the Environment Values
Review `.env.example` in the root folder, and configure corresponding values in your secrets menu:

- **`JWT_SECRET`**: Random secret key to authorize tokens.
- **`SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`**: Necessary to dispatch email messages to system administrators on real servers. If omitted, the CRM handles dispatches seamlessly inside the server terminal logs.

---

### 2. Standard Development Run Command
To boot the full-stack system in development (using the pre-configured `tsx` compiler and live Vite middleware assets):

```bash
npm run dev
```

The terminal will report:
`CRM Web Server actively bound on http://localhost:3000`

---

### 3. Production Compilation & Standalone Start Command
To build and package the client SPA with the backend bundled cleanly into a single file ready for high-speed serverless deployment:

```bash
# Compile and build client assets + Node server bundle
npm run build

# Launch the production compiled server
npm run start
```
