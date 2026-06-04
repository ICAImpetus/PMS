// services/backupService.js
import { exec } from "child_process";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/mailer.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const execAsync = (cmd) =>
    new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) reject(stderr || err);
            else resolve(stdout);
        });
    });

// retry wrapper
const withRetry = async (fn, retries = 3, delay = 3000) => {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        await sleep(delay);
        return withRetry(fn, retries - 1, delay * 2);
    }
};

export const runBackup = async () => {
    const date = new Date().toISOString().split("T")[0];
    const fileName = `backup-${date}.gz`;
    const uri = process.env.MONGO_URL?.trim();

    try {
        // 1. MongoDB Backup (COMPRESSED)
        await withRetry(() =>
            execAsync(
                `mongodump --uri="${uri}" --gzip --archive=${fileName}`
            )
        );

        // 2. Upload to Cloudinary (RAW)
        const uploadResult = await withRetry(() =>
            cloudinary.uploader.upload(fileName, {
                resource_type: "raw",
                folder: "mongodb-backups",
                public_id: fileName,
                overwrite: true,
            })
        );

        // 3. Delete local file after upload
        fs.unlinkSync(fileName);

        // 4. Success Email
        await sendEmail({
            subject: ` Backup Success - ${date}`,
            text: `
Backup completed successfully.


File: ${fileName}
Date: ${date}
Status: SUCCESS
      `,
        });

        console.log("Backup completed");
    } catch (error) {
        // Failure Email
        await sendEmail({
            subject: ` Backup Failed - ${date}`,
            text: `
Backup failed!

Date: ${date}
Error: ${error}
      `,
        });

        console.error("Backup failed:", error);
    }
};