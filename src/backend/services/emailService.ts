import nodemailer from "nodemailer";

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      console.log(`Configuring real Nodemailer transporter with host: ${host}:${port}`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
    } else {
      console.log("No SMTP environment credentials detected. Defaulting to safe simulation SMTP logs.");
      this.transporter = null;
    }
    return this.transporter;
  }

  public static async sendNewLeadNotification(lead: {
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
    status: string;
    notes: string;
  }): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@crm.com";
    const subject = `🚀 [CRM] New Lead Alert: ${lead.name} (${lead.company})`;
    
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fcfcfc;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">New Lead Generated!</h2>
        <p style="font-size: 16px; color: #334155;">An inquiry was submitted and a new prospective contact is registered in your Client Lead CRM.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f1f5f9;">
            <th style="text-align: left; padding: 8px; width: 140px; color: #475569;">Full Name</th>
            <td style="padding: 8px; color: #1e293b; font-weight: 600;">${lead.name}</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 8px; color: #475569;">Email</th>
            <td style="padding: 8px; color: #1e293b;"><a href="mailto:${lead.email}" style="color: #2563eb;">${lead.email}</a></td>
          </tr>
          <tr style="background-color: #f1f5f9;">
            <th style="text-align: left; padding: 8px; color: #475569;">Phone</th>
            <td style="padding: 8px; color: #1e293b;">${lead.phone || "Not provided"}</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 8px; color: #475569;">Company</th>
            <td style="padding: 8px; color: #1e293b;">${lead.company || "Not provided"}</td>
          </tr>
          <tr style="background-color: #f1f5f9;">
            <th style="text-align: left; padding: 8px; color: #475569;">Lead Source</th>
            <td style="padding: 8px; color: #1e293b;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 500; background-color: #e0f2fe; color: #0369a1;">${lead.source}</span>
            </td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 8px; color: #475569;">Lead Status</th>
            <td style="padding: 8px; color: #1e293b;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 500; background-color: #fef3c7; color: #d97706;">${lead.status}</span>
            </td>
          </tr>
          <tr style="background-color: #f1f5f9;">
            <th style="text-align: left; padding: 8px; vertical-align: top; color: #475569;">Initial Notes</th>
            <td style="padding: 8px; color: #1e293b; white-space: pre-wrap;">${lead.notes || "None"}</td>
          </tr>
        </table>
        
        <div style="margin-top: 25px; text-align: center;">
          <a href="${process.env.APP_URL || "http://localhost:3000"}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">View Lead in CRM Dashboard</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">This notification was automatically sent by the Client Lead CRM System. Customize notifications in Settings.</p>
      </div>
    `;

    try {
      const activeTransporter = this.getTransporter();
      if (activeTransporter) {
        await activeTransporter.sendMail({
          from: `"CRM Leads" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject,
          html: htmlContent,
        });
        console.log(`Nodemailer sent email notification to admin: ${adminEmail}`);
      } else {
        console.log("----------------------------------------");
        console.log("SIMULATING EMAIL DISPATCH (No credentials):");
        console.log(`TO: ${adminEmail}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`BODY:\n${htmlContent.replace(/<[^>]*>/g, " ").trim().substring(0, 400)}...`);
        console.log("----------------------------------------");
      }
    } catch (error) {
      console.error("Nodemailer service failed to deliver message:", error);
    }
  }
}
