import ipRangeCheck from "ip-range-check";
import { getHospitalModel, MasterConn } from "../utils/db.manager.js";

const HospitalModel = getHospitalModel(MasterConn)
export const checkHospitalIPAccess = async (req, res, next) => {
    try {
        // Real Client IP Extract karein
        let clientIP = req.ip || req.socket.remoteAddress;

        // IPv6 formatting clean karein (::ffff:192.168.1.1 -> 192.168.1.1)
        if (clientIP && clientIP.startsWith("::ffff:")) {
            clientIP = clientIP.replace("::ffff:", "");
        }

        console.log("clientIP", clientIP);


        const hospitalId = req.query.hospitalId || req.params.hospitalId || null


        console.log("hospitalId", hospitalId);

        if (!hospitalId) {
            return res.status(400).json({ success: false, message: "Hospital ID is required" });
        }

        const hospital = await HospitalModel.findById(hospitalId).select("ipAddresses isActive");

        if (!hospital) {
            return res.status(403).json({ success: false, message: "Hospital account is inactive or not found." });
        }

        console.log("hospital.ipAddresses", hospital.ipAddresses);
        // Agar IP whitelist empty hai toh default allow/block setup karein


        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: `Hosptial Not Found`,
            });
        }

        if (!hospital.ipAddresses || hospital.ipAddresses.length === 0) {
            return res.status(403).json({
                success: false,
                message: `Access Denied! Your IP (${clientIP}) is not registered in this hospital.`,
            });
        }

        const allowedIPs = hospital.ipAddresses.map((item) => item.ip);

        // Single IP & Range (CIDR) dono check karta hai
        const isAllowed = ipRangeCheck(clientIP, allowedIPs);

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: `Access Denied! Your IP (${clientIP}) is not whitelisted for this hospital.`,
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};