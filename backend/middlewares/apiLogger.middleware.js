import { getAuditLogModel, MasterConn } from "../utils/db.manager.js";
import logger from "../utils/winston.js";
import { createNotification } from "../utils/notification.helper.js";

export const requestLogger = (req, res, next) => {
    const start = Date.now();

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        null;

    req.userIp = ip;

    res.on("finish", () => {
        logger.info({
            type: "API",
            requestId: req.requestId || null,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            ip: req.userIp,
            responseTimeMs: Date.now() - start,
            userId: req.user?.id || null
        });
    });

    next();
};

export const auditLog = async (data) => {
    // console.log("auditLog", data);

    const AuditLog = await getAuditLogModel(MasterConn)
    try {
        await AuditLog.create({
            level: "audit",
            message: "Audit Event",
            action: data.action,
            role: data.role,
            event: data.event,
            module: data.module,
            customMessage: data.customMessage,
            name: data.name,
            userId: data.userId,
            oldData: data.oldData,
            newData: data.newData,
            ip: data.ip,
        })

        // Automatically trigger notification for significant events
        const isSignificantEvent = ["ADD", "UPDATE", "DELETE", "TOGGLE", "INSERT"].includes(data.event?.toUpperCase());
        const isSpecialAction = data.action?.includes("NEW_") || data.action?.includes("_FORM_") || data.action?.includes("PATIENT");

        if (isSignificantEvent || isSpecialAction) {
            
            // Determine notification type
            let notifType = "TENANT_OPERATION";
            if (data.action?.includes("PATIENT")) notifType = "NEW_PATIENT";
            if (data.action?.includes("_FORM_")) notifType = "FORM_SUBMITTED";

            await createNotification({
                hospitalId: data.hospitalId || data.newData?.hospitalId || null,
                type: notifType,
                title: `${data.module || "System"} Operation`,
                message: data.customMessage || `${data.action} performed by ${data.name}`,
                data: { 
                    action: data.action, 
                    module: data.module, 
                    performedBy: data.name,
                    details: data.newData
                }
            });
        }
    } catch (error) {
        console.error("Failed to save audit log/notification:", error);
    }
};



export default requestLogger;