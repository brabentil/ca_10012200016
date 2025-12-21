import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email
 * @param options - Email options (to, subject, text, html)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"ThriftHub" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email sending failed');
  }
}

/**
 * Send payment confirmation email
 * @param email - Customer email
 * @param orderNumber - Order number
 * @param amount - Payment amount
 * @param isFullPayment - Whether this is full payment or first installment
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  orderNumber: string,
  amount: number,
  isFullPayment: boolean
): Promise<void> {
  const subject = isFullPayment
    ? 'Payment Confirmed - ThriftHub'
    : 'First Installment Received - ThriftHub';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>We have received your payment for order <strong>${orderNumber}</strong>.</p>
          <p>Payment Amount: <span class="amount">GH₵ ${amount.toFixed(2)}</span></p>
          ${
            !isFullPayment
              ? `<p><strong>Note:</strong> This is your first installment (50%). The remaining 50% will be charged on your selected payday.</p>`
              : `<p>Your payment has been completed successfully.</p>`
          }
          <p>Your order is being processed and you will receive updates on its status.</p>
          <p>Thank you for shopping with ThriftHub!</p>
        </div>
        <div class="footer">
          <p>ThriftHub - Campus Fashion Marketplace</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send payday reminder email
 * @param email - Customer email
 * @param orderNumber - Order number
 * @param amount - Remaining amount to be charged
 * @param paydayDate - Scheduled payday date
 * @param hoursUntil - Hours until payday (24 or 48)
 */
export async function sendPaydayReminderEmail(
  email: string,
  orderNumber: string,
  amount: number,
  paydayDate: Date,
  hoursUntil: number
): Promise<void> {
  const subject = `Payday Reminder: ${hoursUntil}h until auto-charge - ThriftHub`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; font-weight: bold; color: #F59E0B; }
        .warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payday Reminder</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <div class="warning">
            <strong>⏰ Reminder:</strong> Your second installment will be automatically charged in <strong>${hoursUntil} hours</strong>.
          </div>
          <p>Order Number: <strong>${orderNumber}</strong></p>
          <p>Amount to be charged: <span class="amount">GH₵ ${amount.toFixed(2)}</span></p>
          <p>Scheduled Date: <strong>${paydayDate.toLocaleDateString()}</strong></p>
          <p>Please ensure you have sufficient funds in your account to avoid any payment failures.</p>
          <p>The charge will be automatically processed using the payment method from your first installment.</p>
        </div>
        <div class="footer">
          <p>ThriftHub - Campus Fashion Marketplace</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send second payment failure email
 * @param email - Customer email
 * @param orderNumber - Order number
 * @param amount - Failed payment amount
 * @param reason - Failure reason
 */
export async function sendPaymentFailureEmail(
  email: string,
  orderNumber: string,
  amount: number,
  reason: string
): Promise<void> {
  const subject = 'Payment Failed - Action Required - ThriftHub';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; font-weight: bold; color: #DC2626; }
        .error { background-color: #FEE2E2; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <div class="error">
            <strong>❌ Payment Failed:</strong> We were unable to process your second installment.
          </div>
          <p>Order Number: <strong>${orderNumber}</strong></p>
          <p>Amount: <span class="amount">GH₵ ${amount.toFixed(2)}</span></p>
          <p>Reason: <strong>${reason}</strong></p>
          <p><strong>Action Required:</strong></p>
          <ul>
            <li>Please check your account balance and ensure sufficient funds</li>
            <li>Contact your bank if there are any card restrictions</li>
            <li>Visit your ThriftHub dashboard to retry payment</li>
          </ul>
          <p>Please complete the payment within 48 hours to avoid order cancellation.</p>
        </div>
        <div class="footer">
          <p>ThriftHub - Campus Fashion Marketplace</p>
          <p>Need help? Contact support@thrifthub.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send student verification code email
 * @param email - Student's .edu.gh email
 * @param code - 6-digit verification code
 * @param expiresAt - Code expiration time
 */
export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  expiresAt: Date
): Promise<void> {
  const subject = 'Student Verification Code - ThriftHub';

  const expiryMinutes = Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60));

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #003399; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .code-box { 
          background-color: white; 
          border: 2px solid #003399; 
          border-radius: 8px; 
          padding: 20px; 
          text-align: center; 
          margin: 20px 0;
        }
        .code { 
          font-size: 36px; 
          font-weight: bold; 
          color: #003399; 
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .warning { 
          background-color: #fff3cd; 
          border-left: 4px solid #ffc107; 
          padding: 10px; 
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Student Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for verifying your student status with ThriftHub! Use the verification code below to complete your verification:</p>
          
          <div class="code-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
            <div class="code">${code}</div>
          </div>

          <div class="warning">
            <strong>⏱️ Important:</strong> This code will expire in ${expiryMinutes} minutes.
          </div>

          <p><strong>What's next?</strong></p>
          <ul>
            <li>Enter this code on the verification page</li>
            <li>Once verified, you'll get access to student-exclusive benefits</li>
            <li>Enjoy free campus delivery and PayDay Flex payments</li>
          </ul>

          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>ThriftHub - Campus Fashion Marketplace</p>
          <p>Need help? Contact support@thrifthub.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
