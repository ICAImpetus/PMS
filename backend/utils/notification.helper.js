import { MasterConn } from "./db.manager.js";
import { NotificationSchema } from "../models/master.models/NotiificationModel.js";

const Notification = MasterConn.model("Notification", NotificationSchema);

/**
 * Create a new notification in the Master DB.
 * @param {Object} notificationData - { hospitalId, type, title, message, data, createdFor }
 */
export const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        console.log(`Notification created: ${notificationData.type}`);
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
