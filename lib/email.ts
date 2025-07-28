import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to} with subject: ${subject}`)
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
    throw new Error("Failed to send email notification.")
  }
}
