import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SellerApplicationDto } from '../auth/dto/seller-application.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/verify-email/${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - Marketplace',
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for registering with our marketplace!</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>Marketplace Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  async sendSellerUpgradeEmail(email: string): Promise<void> {
    if (!this.isConfigured) {
      console.log(
        `Email not configured. Would send seller upgrade email to: ${email}`,
      );
      return;
    }

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/login`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Account Upgraded to Seller - Marketplace',
      html: `
        <h2>🎉 Congratulations! Your Account Has Been Upgraded</h2>
        <p>Your request to become a seller has been approved!</p>
        <p>Your shopper account has been upgraded to a seller account.</p>
        <p>You can now:</p>
        <ul>
          <li>✅ Create your store</li>
          <li>✅ Add products</li>
          <li>✅ Manage orders</li>
          <li>✅ Continue shopping as before</li>
        </ul>
        <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
        <p>Welcome to our seller community!</p>
        <p>Best regards,<br>Marketplace Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Seller upgrade email sent to ${email}`);
    } catch (error) {
      console.error('Error sending seller upgrade email:', error);
    }
  }

  async sendSellerApplicationEmail(
    application: SellerApplicationDto & { upgradeRequest?: boolean },
  ): Promise<void> {
    if (!this.isConfigured) {
      console.log(
        `Email not configured. Would send seller application for: ${application.email}`,
      );
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@marketplace.com';
    const isUpgrade = application.upgradeRequest || false;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `${isUpgrade ? 'Seller Upgrade Request' : 'New Seller Application'} - Marketplace`,
      html: `
        <h2>${isUpgrade ? '🔄 Seller Upgrade Request' : '🆕 New Seller Application'}</h2>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Store Name:</strong> ${application.storeName}</p>
        <p><strong>Store Description:</strong> ${application.storeDescription || 'Not provided'}</p>
        <p><strong>Request Type:</strong> ${isUpgrade ? 'Account Upgrade (Existing Shopper)' : 'New Account'}</p>
        <p>Please review and approve this ${isUpgrade ? 'upgrade request' : 'seller application'} in the admin panel.</p>
        <p>Best regards,<br>Marketplace System</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        `Seller ${isUpgrade ? 'upgrade' : 'application'} email sent for ${application.email}`,
      );
    } catch (error) {
      console.error('Error sending seller application email:', error);
    }
  }

  async sendSellerApprovalEmail(
    email: string,
    tempPassword: string,
  ): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/login`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Seller Application Approved - Marketplace',
      html: `
        <h2>Congratulations! Your Seller Application has been Approved</h2>
        <p>Your seller application has been approved and your account has been created.</p>
        <p><strong>Login Details:</strong></p>
        <p>Email: ${email}</p>
        <p>Temporary Password: ${tempPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
        <p>You can now create your store and start selling products!</p>
        <p>Best regards,<br>Marketplace Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Seller approval email sent to ${email}`);
    } catch (error) {
      console.error('Error sending seller approval email:', error);
    }
  }

  async sendOrderStatusEmail(
    email: string,
    orderId: string,
    status: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Order Status Update - ${status.toUpperCase()}`,
      html: `
        <h2>Order Status Update</h2>
        <p>Your order #${orderId} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
        <p>You can track your order status in your account dashboard.</p>
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>Marketplace Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Order status email sent to ${email} for order ${orderId}`);
    } catch (error) {
      console.error('Error sending order status email:', error);
    }
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    totalAmount: number,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Order Confirmation - Marketplace',
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
        <p>We'll send you updates about your order status.</p>
        <p>Best regards,<br>Marketplace Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        `Order confirmation email sent to ${email} for order ${orderId}`,
      );
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }
}
