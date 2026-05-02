import bcrypt from "bcrypt";
import mongoose, { model } from "mongoose";
import { getAdminAgentModel, getBranchModel, getConnection, getHospitalModel, MasterConn } from "../utils/db.manager.js";
import { toObjectId } from "../utils/toObjectId.js";
import { auditLog } from "../middlewares/apiLogger.middleware.js";


const AdminAndAgentModel = getAdminAgentModel(MasterConn)
const HospitalModel = getHospitalModel(MasterConn)

export const checkUserName = async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    // Case-insensitive search
    const existingUser = await AdminAndAgentModel.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    });
    console.log(existingUser);

    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "Username already exists",
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      message: "Username available",
    });
  } catch (error) {
    next(error);
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const user = req.user;
    const { hosId, branchId, filterType } = req.query;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await AdminAndAgentModel.findById(user.id).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    let query = { isDeleted: false };

    // ---------------- FILTER TYPE ----------------
    if (filterType) {
      query.type = filterType.toLowerCase();
    } else {

      // ---------------- HOSPITAL FILTER ----------------
      if (!hosId || !mongoose.isValidObjectId(hosId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hospital ID",
        });
      }

      query["hospitals.hospitalId"] = new mongoose.Types.ObjectId(hosId);

      // ---------------- ROLE BASED FILTER ----------------
      const type = profile?.type?.toLowerCase();

      if (type === "superadmin") {
        query.type = { $nin: ["superadmin", "admin"] };
      }
      else if (type === "admin") {
        query.type = { $nin: ["superadmin", "admin"] };
      }
      else if (type === "supermanager") {
        query.type = { $nin: ["superadmin", "supermanager", "admin"] };
      }
      else if (type === "teamleader") {
        query.type = {
          $nin: ["supermanager", "superadmin", "admin", "teamleader"],
        };

        //  IMPORTANT: Branch filter for teamleader
        if (branchId && mongoose.isValidObjectId(branchId)) {
          query["branches.branchId"] = new mongoose.Types.ObjectId(branchId);
        }
      }
    }

    // ---------------- FETCH USERS ----------------
    const data = await AdminAndAgentModel.find(query)
      .select("name username email type canDelete hospitals branches")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Users successfully fetched",
      data,
    });

  } catch (error) {
    console.error("Error in fetching data:", error);

    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching",
    });
  }
};
export const getUsersByAdmin = async (req, res) => {
  try {
    const { adminName } = req.params;
    if (!adminName) {
      return res.json({ message: "Admin name is required", success: false });
    }

    const data = await AdminAndAgentModel.find({
      parentUser: adminName,
      isDeleted: { $ne: true },
    })
      .select(
        "username email type name hospitalNames name hospitalName ID parentUser",
      )
      .lean();
    res.json({
      message: "Users successfully fetched",
      success: true,
      data: data || null,
    });
  } catch (error) {
    console.error("Error in fetching data:", error);
    res.json({ message: "Error occurred while fetching", success: false });
  }
};
export const createUser = async (req, res) => {
  let createdUser = null;

  // rollback tracking
  let hospitalIds = [];
  let branchIds = [];
  let typeSafe = "";
  let hospitalForBranch = null;
  console.log("req.body", req.body);


  try {
    const {
      name,
      email,
      type,
      username,
      password,
      hospitalName,
      selectedBranch,
    } = req.body;

    // ---------------- VALIDATION ----------------
    if (!name || !email || !type || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // checking dublicate UserName

    const checkUser = await AdminAndAgentModel.findOne({ username, isDeleted: false }).lean()
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User Name Already Exists! Try Another Username ",
      });
    }


    typeSafe = type.toLowerCase();

    const allowedTypes = ["admin", "superadmin", "supermanager", "teamleader", "executive"];
    if (!allowedTypes.includes(typeSafe)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    if (!Array.isArray(hospitalName) || !hospitalName.length) {
      return res.status(400).json({
        success: false,
        message: "hospitalName must be non-empty array",
      });
    }

    // ---------------- PREPARE HOSPITALS ----------------
    hospitalIds = hospitalName.map(toObjectId).filter(Boolean);

    const hospitalsData = await HospitalModel.find(
      { _id: { $in: hospitalIds } },
      { _id: 1, name: 1, trimmedName: 1 }
    ).lean();

    if (!hospitalsData.length) {
      throw new Error("Invalid hospitals");
    }

    const hospitalsFormatted = hospitalsData.map((h) => ({
      hospitalId: h._id,
      name: h.name,
    }));


    createdUser = await AdminAndAgentModel.create({
      name,
      email,
      type: typeSafe,
      username,
      password,
      hospitals: hospitalsFormatted,
      branches: [],
    });

    // ---------------- HOSPITAL ASSIGNMENT ----------------
    if (["admin", "supermanager"].includes(typeSafe)) {
      const updateField =
        typeSafe === "admin"
          ? "assignedToAdmin"
          : "assignedToManager";

      await HospitalModel.updateMany(
        { _id: { $in: hospitalIds } },
        {
          $set: {
            [updateField]: {
              userId: createdUser._id,
              name: createdUser.name,
              email: createdUser.email,
            },
          },
        }
      );
    }

    // ---------------- BRANCH LEVEL ----------------
    let branchesFormatted = [];

    if (["teamleader", "executive"].includes(typeSafe)) {
      if (!Array.isArray(selectedBranch) || !selectedBranch.length) {
        throw new Error("selectedBranch required");
      }

      hospitalForBranch = hospitalsData[0];

      if (!hospitalForBranch?.trimmedName) {
        throw new Error("Invalid hospital");
      }

      const conn = await getConnection(hospitalForBranch.trimmedName);
      const BranchModel = await getBranchModel(conn);

      branchIds = selectedBranch.map(toObjectId).filter(Boolean);

      const branchesData = await BranchModel.find(
        { _id: { $in: branchIds } },
        { _id: 1, name: 1 }
      ).lean();

      if (!branchesData.length) {
        throw new Error("Invalid branches");
      }

      branchesFormatted = branchesData.map((b) => ({
        branchId: b._id,
        name: b.name,
        hospitalId: hospitalForBranch._id,
      }));

      const updateField =
        typeSafe === "teamleader"
          ? "assignedToTeamLeader"
          : "assignedToExecutive";

      await BranchModel.updateMany(
        { _id: { $in: branchIds } },
        {
          $set: {
            [updateField]: {
              userId: createdUser._id,
              name: createdUser.name,
              email: createdUser.email,
            },
          },
        }
      );

      await AdminAndAgentModel.updateOne(
        { _id: createdUser._id },
        { $set: { branches: branchesFormatted } }
      );
    }


    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "ADD_USER",
      module: "AdminAndAgentModel",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created user "${createdUser?.name}"`,
      name: actorName,
      userId: req?.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });


    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: createdUser._id,
        name: createdUser.name,
        username: createdUser?.username,
        type: createdUser?.type,
        email: createdUser.email,
        hospitals: hospitalsFormatted,
        branches: branchesFormatted,
      },
    });

  } catch (error) {
    console.error("Create User Error:", error.message);

    // ---------------- FULL ROLLBACK ----------------
    try {
      // 1. delete user
      if (createdUser?._id) {
        await AdminAndAgentModel.deleteOne({ _id: createdUser._id });
      }

      // 2. rollback hospital
      if (hospitalIds.length && ["admin", "supermanager"].includes(typeSafe)) {
        const field =
          typeSafe === "admin"
            ? "assignedToAdmin"
            : "assignedToManager";

        await HospitalModel.updateMany(
          {
            _id: { $in: hospitalIds },
            [`${field}.userId`]: createdUser?._id,
          },
          {
            $unset: { [field]: null },
          }
        );
      }

      // 3. rollback branch
      if (
        branchIds.length &&
        ["teamleader", "executive"].includes(typeSafe) &&
        hospitalForBranch?.trimmedName
      ) {
        const conn = await getConnection(hospitalForBranch.trimmedName);
        const BranchModel = await getBranchModel(conn);

        const field =
          typeSafe === "teamleader"
            ? "assignedToTeamLeader"
            : "assignedToExecutive";

        await BranchModel.updateMany(
          {
            _id: { $in: branchIds },
            [`${field}.userId`]: createdUser?._id,
          },
          {
            $unset: { [field]: null },
          }
        );
      }

    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr.message);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      username,
      name,
      email,
      type,
      canDelete,
      hospitalName = [],
      selectedBranch = [],
    } = req.body;

    console.log(req.body);


    const existingUser = await AdminAndAgentModel.findById(id);

    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const typeSafe = type?.toLowerCase();
    console.log("superadmin", typeSafe)


    const roleFields = {
      superadmin: "superadmin",
      admin: "assignedToAdmin",
      supermanager: "assignedToManager",
      teamleader: "assignedToTeamLeader",
      executive: "assignedToExecutive",
    };

    if (!roleFields[typeSafe]) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    if (typeSafe !== "superadmin") {

      // ===================== HOSPITAL =====================
      if (!hospitalName.length) {
        return res.status(400).json({
          success: false,
          message: "hospitalName required",
        });
      }

      const hospitalIds = hospitalName.map(toObjectId).filter(Boolean);

      const hospitalsData = await HospitalModel.find(
        { _id: { $in: hospitalIds } },
        { _id: 1, name: 1, trimmedName: 1 }
      ).lean();

      const hospitalsFormatted = hospitalsData.map((h) => ({
        hospitalId: h._id,
        name: h.name,
      }));

      // ===================== CLEAR OLD BRANCH ASSIGN =====================
      if (existingUser.branches?.length) {
        const oldField = roleFields[existingUser.type];

        if (oldField) {
          const hospital = await HospitalModel.findById(
            existingUser.hospitals?.[0]?.hospitalId
          ).select("trimmedName");

          if (hospital) {
            const conn = await getConnection(hospital.trimmedName);
            const BranchModel = await getBranchModel(conn);

            await BranchModel.updateMany(
              {
                _id: {
                  $in: existingUser.branches.map((b) => b.branchId),
                },
                [`${oldField}.userId`]: existingUser._id,
              },
              {
                $set: {
                  [oldField]: null,
                },
              }
            );
          }
        }
      }

      // ===================== ADMIN / MANAGER =====================
      if (["admin", "supermanager"].includes(typeSafe)) {
        const field = roleFields[typeSafe];

        await HospitalModel.updateMany(
          { _id: { $in: hospitalIds } },
          {
            $set: {
              [field]: {
                userId: existingUser._id,
                name,
                email,
              },
            },
          }
        );
      }

      // ===================== BRANCH =====================
      let branchesFormatted = [];

      if (["teamleader", "executive"].includes(typeSafe)) {
        if (!selectedBranch.length) {
          return res.status(400).json({
            success: false,
            message: "selectedBranch required",
          });
        }

        const hospitalForBranch = hospitalsData[0];

        const conn = await getConnection(hospitalForBranch.trimmedName);
        const BranchModel = await getBranchModel(conn);

        const branchIds = selectedBranch.map(toObjectId).filter(Boolean);
        const field = roleFields[typeSafe];

        // =================  STEP 1: REMOVE OLD =================
        if (existingUser.branches?.length) {
          await BranchModel.updateMany(
            {
              _id: { $in: existingUser.branches.map((b) => b.branchId) },
              [`${field}.userId`]: existingUser._id,
            },
            {
              $set: {
                [field]: null,
              },
            }
          );
        }

        // =================  STEP 2: ASSIGN NEW =================
        await BranchModel.updateMany(
          { _id: { $in: branchIds } },
          {
            $set: {
              [field]: {
                userId: existingUser._id,
                name: name,
                email: email,
              },
            },
          }
        );

        // =================  STEP 3: FETCH + FORMAT =================
        const branchesData = await BranchModel.find(
          { _id: { $in: branchIds } },
          { _id: 1, name: 1 }
        ).lean();

        console.log("branchesData", branchesData);


        branchesFormatted = branchesData.map((b) => ({
          branchId: b._id,
          name: b.name,
          hospitalId: hospitalForBranch._id,
        }));
      }

      // ===================== UPDATE USER =====================
      existingUser.name = name ?? existingUser.name;
      existingUser.email = email ?? existingUser.email;
      existingUser.username = username ?? existingUser.username;
      existingUser.type = typeSafe;
      existingUser.canDelete = canDelete ?? existingUser.canDelete;
      existingUser.hospitals = hospitalsFormatted;
      existingUser.branches = branchesFormatted;
    }
    else {
      existingUser.name = name ?? existingUser.name;
      existingUser.email = email ?? existingUser.email;
      existingUser.username = username ?? existingUser.username;
      existingUser.type = typeSafe;
    }


    await existingUser.save();

    // ===================== AUDIT LOG =====================
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "UPDATE",
      module: "AdminAndAgentModel",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" updated user "${existingUser?.name}"`,
      name: actorName,
      userId: req?.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: existingUser,
    });

  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User Id is required",
      });
    }

    const user = await AdminAndAgentModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const role = user?.type?.toLowerCase();
    console.log("rols", role);
    console.log("user", user);



    // ===================== HOSPITAL IDS =====================
    const hospitalIds =
      user.hospitals?.map((h) => h.hospitalId) || [];
    // ===================== ADMIN =====================
    console.log("hospitalIds", hospitalIds);

    if (role === "admin") {
      // if (!user.canDelete) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Delete permission denied",
      //   });
      // }

      await HospitalModel.updateMany(
        {
          _id: { $in: hospitalIds },
          "assignedToAdmin.userId": user._id,
        },
        { $set: { assignedToAdmin: null } }
      );
    }

    // ===================== SUPER MANAGER =====================
    if (role === "supermanager") {
      await HospitalModel.updateMany(
        {
          _id: { $in: hospitalIds },
          "assignedToManager.userId": user._id,
        },
        { $set: { assignedToManager: null } }
      );
    }

    // ===================== BRANCH LEVEL =====================
    if (["teamleader", "executive"].includes(role)) {
      // loop per hospital (multi-tenant)
      for (const hospital of user.hospitals || []) {
        const conn = await getConnection(hospital.trimmedName || "");
        const BranchModel = await getBranchModel(conn);

        const branchIds =
          user.branches?.map((b) => b.branchId) || [];

        const field =
          role === "teamleader"
            ? "assignedToTeamLeader"
            : "assignedToExecutive";

        await BranchModel.updateMany(
          {
            _id: { $in: branchIds },
            [`${field}.userId`]: user._id,
          },
          { $set: { [field]: null } }
        );
      }
    }

    // ===================== SOFT DELETE =====================
    user.isDeleted = true;
    user.branches = [];
    user.hospitals = [];

    await user.save();


    // ===================== AUDIT LOG =====================
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "DELETE_USER",
      module: "AdminAndAgentModel",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted user "${user?.name}"`,
      name: actorName,
      userId: req?.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    // ===================== RESPONSE =====================
    return res.status(200).json({
      success: true,
      message: "User deleted and unassigned successfully",
    });

  } catch (error) {
    console.error("Delete User Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const updatePassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!newPassword) {
      return res.json({ success: false, message: "New password is required" });
    }
    if (!username) {
      return res.json({ success: false, message: "username is required" });
    }
    const userToUpdate = await AdminAndAgentModel.findOne({
      username,
      isDeleted: { $ne: true },
    }).lean();
    if (!userToUpdate) {
      return res.json({ success: false, message: "User not found" });
    }
    // Hash the new password before updating
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await AdminAndAgentModel.updateOne(
      { username, isDeleted: { $ne: true } },
      { $set: { password: hashedPassword } },
    );
    const actorName = req.user?.name || "Unknown User";
    const actorRole = req.user?.type || "User";
    const targetUser = userToUpdate?.name || "Unknown User";

    auditLog({
      action: "PASSWORD_CHANGED",
      module: "AdminAndAgentModel",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" updated the password for user "${targetUser}".`,
      name: actorName,
      userId: req.user.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in /updatePassword API:", error);
    return res.status(500).json({ success: false, message: error?.message || "Internal server error" });
  }
};

export const getUsersBySuperadmin = async (req, res) => {
  try {
    const users = await AdminAndAgentModel.find({
      userCreatedBy: "superadmin",
      isDeleted: { $ne: true },
    }).lean();
    return res.json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error in /getUsersBySuperadmin API:", error);
    return res.json({ success: false, message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(400).json({
        message: "Authentication failed. User ID not found in token.",
        success: false,
      });
    }

    const objectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const userData = await AdminAndAgentModel.findOne({
      _id: objectId,
      isDeleted: { $ne: true },
    })
      .select("-password")
      .lean();

    if (!userData) {
      return res.status(404).json({
        message: "User not found in the database.",
        success: false,
      });
    }
    res.json({
      message: "User profile successfully fetched",
      data: userData,
      success: true,
    });
  } catch (error) {
    console.error("Error in fetching user profile:", error);
    res.status(500).json({
      message: "Internal server error while fetching profile",
      success: false,
    });
  }
};
export const handleMigrateData = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and To user IDs are required",
      });
    }

    if (from === to) {
      return res.status(400).json({
        success: false,
        message: "Cannot migrate to same user",
      });
    }

    const fromUser = await AdminAndAgentModel.findById(from);
    const toUser = await AdminAndAgentModel.findById(to);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  hospital compare
    const fromHospitals = (fromUser?.hospitals || []).map(h =>
      h?.hospitalId?.toString()
    );

    const toHospitals = (toUser?.hospitals || []).map(h =>
      h?.hospitalId?.toString()
    );

    const isSameHospital =
      fromHospitals.length === toHospitals.length &&
      fromHospitals.every(h => toHospitals.includes(h));

    if (!isSameHospital) {
      return res.status(400).json({
        success: false,
        message: "Users belong to different hospitals",
      });
    }

    //  safer hospital selection
    const hospitalMatch = fromHospitals.find(h =>
      toHospitals.includes(h)
    );

    const hospital = await HospitalModel.findById(hospitalMatch)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    //  tenant connection
    const conn = await getConnection(hospital.trimmedName);
    const BranchModel = await getBranchModel(conn);

    //  STEP 1: find branches
    const branchesToMigrate = await BranchModel.find({
      "assignedToTeamLeader.userId": fromUser._id,
    }).select("_id name hospitalId");

    //  STEP 2: update branches
    await BranchModel.updateMany(
      { _id: { $in: branchesToMigrate.map(b => b._id) } },
      {
        $set: {
          "assignedToTeamLeader.userId": toUser._id,
          "assignedToTeamLeader.name": toUser.name,
          "assignedToTeamLeader.email": toUser.email,
        },
      }
    );

    //  STEP 3: convert to metadata format
    const newBranches = branchesToMigrate.map(b => ({
      branchId: b._id,
      name: b.name,
      hospitalId: b.hospitalId,
    }));

    //  STEP 4: merge without duplicates
    const mergedMap = new Map();

    (toUser.branches || []).forEach(b => {
      mergedMap.set(b.branchId.toString(), b);
    });

    newBranches.forEach(b => {
      mergedMap.set(b.branchId.toString(), b);
    });

    toUser.branches = Array.from(mergedMap.values());

    //  STEP 5: clear fromUser branches ONLY
    fromUser.branches = [];
    fromUser.hospitals = [];
    fromUser.isDeleted = true;

    await toUser.save();
    await fromUser.save();


    //  audit log
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "DATA_MIGRATE",
      event: "UPDATE",
      module: "AdminAgents",
      role: actorRole,

      customMessage: `${actorRole} "${actorName}" migrated data from "${fromUser?.name}" to "${toUser?.name}".`,

      name: actorName,
      userId: req.user?.id,
      ip: req.userIp || req.ip,
      userAgent: req.headers["user-agent"] || "Unknown",
    });

    return res.status(200).json({
      success: true,
      message: "Data migrated successfully",
      data: {
        toUser: toUser,
        fromUser: fromUser,
      },
    });

  } catch (error) {
    console.error("Migration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};