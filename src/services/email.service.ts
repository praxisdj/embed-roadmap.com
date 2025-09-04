import { EnvConfigurationError } from "@/lib/utils/errors";
import nodemailer from "nodemailer";

export class EmailService {
  private emailUser: string;
  private emailPass: string;
  private emailReceiver: string;
  private emailService: string;

  constructor() {
    this.emailUser = process.env.EMAIL_USER || "";
    this.emailPass = process.env.EMAIL_PASS || "";
    this.emailReceiver = process.env.EMAIL_RECEIVER || "";
    this.emailService = "gmail";

    if (!this.emailUser || !this.emailPass || !this.emailReceiver) {
      throw new EnvConfigurationError(
        "Email configuration is not set properly.",
      );
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    const transporter = nodemailer.createTransport({
      service: this.emailService,
      auth: {
        user: this.emailUser,
        pass: this.emailPass,
      },
    });

    await transporter.sendMail({
      from: this.emailUser,
      to: this.emailReceiver,
      subject: subject,
      text: body,
    });
  }
}
