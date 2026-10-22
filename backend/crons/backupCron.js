import { google } from 'googleapis';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { MasterConn, getHospitalModel } from '../utils/db.manager.js';
import cron from 'node-cron';

import { sendEmail } from '../utils/mailer.js';
const execPromise = util.promisify(exec);

// Path setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Drive Auth Setup
const KEY_FILE = path.join(__dirname, '../service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Parent Backup Folder ID (Root folder inside Shared Drive or Google Workspace)
const DRIVE_FOLDER_ID = '0AIMyuMXRdrLUUk9PVA';
const MONGO_BASE_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

/**
 * Helper function to find or create a date subfolder (e.g., "2026-10-22")
 */
async function getOrCreateDateFolder(parentFolderId, folderName) {
    try {
        // Check if the folder already exists
        const query = `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        }

        // Create the subfolder if it does not exist
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            supportsAllDrives: true,
            fields: 'id',
        });

        console.log(`Created date folder: ${folderName} (ID: ${folder.data.id})`);
        return folder.data.id;
    } catch (error) {
        console.error('Error creating date folder:', error.message);
        throw error;
    }
}

export const runBackup = async () => {
    try {
        const HospitalModel = getHospitalModel(MasterConn);

        // Fetch active tenant hospitals
        const hospitals = await HospitalModel.find({ isDeleted: false }).lean();

        if (!hospitals || hospitals.length === 0) {
            console.log('No active tenant hospitals found for backup.');
            return;
        }

        // Generate folder name based on current date (YYYY-MM-DD)
        const dateFolder = new Date().toISOString().split('T')[0];
        const targetFolderId = await getOrCreateDateFolder(DRIVE_FOLDER_ID, dateFolder);

        const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const hospital of hospitals) {
            const dbName = hospital.trimmedName;
            if (!dbName) continue;

            const backupFileName = `${dbName}-backup-${timeStamp}.archive`;
            const localFilePath = path.join(__dirname, `../${backupFileName}`);

            console.log(`Starting backup for tenant database: ${dbName}...`);

            // Construct MongoDB URI for specific tenant DB
            const tenantMongoUri = `${MONGO_BASE_URI}/${dbName}`;
            const dumpCommand = `mongodump --uri="${tenantMongoUri}" --archive="${localFilePath}" --gzip`;

            try {
                // Step 1: Create local MongoDB dump
                await execPromise(dumpCommand);

                // Step 2: Upload to Google Drive inside the Date Subfolder
                const fileMetadata = {
                    name: backupFileName,
                    parents: [targetFolderId],
                };

                const media = {
                    mimeType: 'application/gzip',
                    body: fs.createReadStream(localFilePath),
                };

                const uploadResponse = await drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    supportsAllDrives: true,
                    supportsTeamDrives: true,
                    enforceSingleParent: true,
                    fields: 'id, name, size',
                });

                console.log(`Backup completed for ${dbName}. Drive File ID: ${uploadResponse.data.id}`);



            } catch (tenantErr) {
                console.error(`Backup failed for database ${dbName}:`, tenantErr.message);
            } finally {
                // Step 3: Cleanup local archive file if it exists
                if (fs.existsSync(localFilePath)) {
                    fs.unlinkSync(localFilePath);
                }
            }
        }
        return 'https://drive.google.com/drive/folders/0AIMyuMXRdrLUUk9PVA'
    } catch (error) {
        console.error('Multi-tenant backup runner error:', error);
    }
};

// await runBackup();

cron.schedule(
    '0 2 * * 0',
    // '* * * * *',
    async () => {
        try {
            console.log('Starting multi-tenant backup cron job...');

            const url = await runBackup();

            await sendEmail({
                subject: 'PMS Backup Completed',
                text: `The multi-tenant backup cron job has completed successfully.\nLinks to the backups can be found in the Google Drive folder: ${url}`,
            });

            console.log('Multi-tenant backup cron job completed.');
        } catch (error) {
            console.error('Error during scheduled backup job:', error.message);
        }
    },
    {
        timezone: 'Asia/Kolkata',
    }
);