import nodemailer from "nodemailer";
import { GENERAL_CONFIG } from "../config/generalConfig";
import ejs from "ejs";
import path from "path";

export default class Mailer {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "smtp", // or use host, port, and secure for custom SMTP
      host: GENERAL_CONFIG.email.smtp.host,
      port: GENERAL_CONFIG.email.smtp.port,
      secure: true,
      auth: {
        user: GENERAL_CONFIG.email.smtp.user, // your email address
        pass: GENERAL_CONFIG.email.smtp.pass, // app password or real password (use ENV!)
      },
    });
  }

  sendWelcomeEmail = async ({
    userName,
    password,
    email,
    otp,
  }: {
    userName: string | null;
    email: string;
    password: string;
    otp: string;
  }) => {
    const year = new Date().getFullYear();
    const resetUrl = "http://example.com/reset";
    const unsubscribeUrl = "http://example.com/unsubscribe";
    const helpUrl = "http://example.com/help";
    const socialLinks = {
      facebook: "http://facebook.com/yourpage",
      twitter: "http://twitter.com/yourhandle",
    };

    const logoUrl = "https://creappui.krestdev.com";
    const userEmail = email;
    const userPassword = password;
    const loginUrl = "https://creapp-two.vercel.app/connexion";
    const supportEmail = "support@example.com";
    const companyAddress = "Douala Akwa";
    const phone = "123-456-789";
    const verifyAccount = `https://creappapi.krestdev.com/api/v1.0.0/base/user/verify/${otp}?email=${encodeURIComponent(
      email
    )}`;

    // Render EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../../assets/templates/userwelcome.ejs"),
      {
        userName,
        email,
        appName: GENERAL_CONFIG.app.name,
        loginUrl,
        logoUrl,
        companyAddress,
        userEmail,
        userPassword,
        verifyAccount,
        helpUrl,
        socialLinks,
        year,
        resetUrl,
        unsubscribeUrl,
        supportEmail,
        phone,
      }
    );

    // Send email
    await this.transporter.sendMail({
      from: GENERAL_CONFIG.email.from,
      to: email,
      subject: `Welcome to ${GENERAL_CONFIG.app.name}!`,
      html,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  };

  sendResetPasswordEmail = async ({
    resetUrl,
    unsubscribeUrl,
    supportEmail,
    phone,
    email,
  }: {
    resetUrl: string;
    unsubscribeUrl: string;
    supportEmail: string;
    phone: string;
    email: string;
  }) => {
    const year = new Date().getFullYear();
    // const resetUrl = "http://example.com/reset";
    // const unsubscribeUrl = "http://example.com/unsubscribe";
    // const supportEmail = "support@example.com";
    // const phone = "123-456-7890";

    // Render EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../../assets/templates/userwelcome.ejs"),
      {
        year,
        resetUrl,
        unsubscribeUrl,
        supportEmail,
        phone,
        email,
        appName: GENERAL_CONFIG.app.name,
      }
    );

    // Send email
    await this.transporter.sendMail({
      from: GENERAL_CONFIG.email.from,
      to: email,
      subject: `Welcome to ${GENERAL_CONFIG.app.name}!`,
      html,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  };

  sendPasswordRestOtp = async ({
    userName,
    email,
    resetUrl,
  }: {
    userName: string | null;
    email: string;
    resetUrl: string;
  }) => {
    const year = new Date().getFullYear();

    // Render HTML from EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../../emailtemplates/passwordReset.ejs"),
      { userName, email, appName: GENERAL_CONFIG.app.name, resetUrl, year }
    );

    // Send the email
    await this.transporter.sendMail({
      from: GENERAL_CONFIG.email.from,
      to: email,
      subject: `Reset Your ${GENERAL_CONFIG.app.name} Password`,
      html,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  };
}
