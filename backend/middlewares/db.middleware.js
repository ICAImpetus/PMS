import { getConnection, getHospitalModel, MasterConn } from "../utils/db.manager.js";
import { toObjectId } from "../utils/toObjectId.js";

const HospitalModel = await getHospitalModel(MasterConn)

export const dbMiddleware = async (req, res, next) => {
    try {
        const { hospitals, type } = req.user
        console.log(req.user);


        let hospitalsObj = [];
        let roleLowercase = type

        if (roleLowercase === "superadmin") {
            hospitalsObj = await HospitalModel.find({ isDeleted: false }).lean()
        }
        else {
            if (!hospitals || hospitals?.length === 0) {
                return res.status(400).json({
                    message: "No hospital assigned",
                });
            }
            const hosIds = Array.isArray(user.hospitals)
                ? user.hospitals
                : []
                    .map(toObjectId)
                    .filter(Boolean); // remove null

            hospitalsObj = await HospitalModel.find({
                _id: { $in: hosIds },
            });

        }
        const connections = await Promise.all(
            hospitalsObj.map(async (hos) => {
                const conn = await getConnection(hos?.trimmedName)
                return {
                    hospital: hos,
                    conn
                }
            })
        )
        // attach to request
        req.dbs = connections;
        next()
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
        });
    }
}