import DoctorModel from "../models/teanants/doctorModel.js";

/**
 * PATCH /doctor/:id/availability
 * Body: { date: "YYYY-MM-DD", status: "absent" | "present", reason?: string }
 */
export const updateDoctorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, status, reason } = req.body;
        const userId = req.user?._id; // assuming auth middleware sets req.user
        if (!date || !status || !["absent", "present"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        const doctor = await DoctorModel.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (status === "absent") {
            // Prevent duplicate
            const alreadyAbsent = doctor.unavailableDates.some((d) => d.date === date);
            if (alreadyAbsent) {
                return res.status(200).json({ success: true, message: "Already marked absent" });
            }
            doctor.unavailableDates.push({ date, reason: reason || "", markedBy: userId });
        } else if (status === "present") {
            // Remove absent entry if exists
            doctor.unavailableDates = doctor.unavailableDates.filter((d) => d.date !== date);
        }
        await doctor.save();
        return res.status(200).json({ success: true, unavailableDates: doctor.unavailableDates });
    } catch (err) {
        console.error("updateDoctorAvailability error", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export default { updateDoctorAvailability };
