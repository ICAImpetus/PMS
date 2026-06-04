// utils/mailer.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // app password
        },
    });

    await transporter.sendMail({
        from: `"DB Backup System" <${process.env.EMAIL_USER}>`,
        to: process.env.MANAGEMENT_EMAIL, // primary
        cc: process.env.MANAGEMENT_CC,    // comma separated
        subject,
        text,
    });
};