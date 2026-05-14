import env from "../config/env.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { getAdminAgentModel, MasterConn } from "../utils/db.manager.js";


export const createUser = async (req, res, next) => {
  try {
    let {
      username,
      password,
      name,
      email,
      type,
      hospitals = [],
      branches = [],
      canDelete = false,
    } = req.body;

    // Clean input
    const cleanUsername = username?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    // Validation
    if (!cleanUsername || !cleanPassword || !name || !type) {
      return res.status(400).json({
        success: false,
        message: "Username, password, name, and type are required",
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const AdminAndAgentModel = getAdminAgentModel(MasterConn);

    // Check existing user
    const existingUser = await AdminAndAgentModel.findOne({
      username: cleanUsername,
      isDeleted: { $ne: true },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const newUser = await AdminAndAgentModel.create({
      username: cleanUsername,
      password: cleanPassword,
      name: name?.trim(),
      email: email?.trim()?.toLowerCase(),
      type,
      hospitals,
      branches,
      canDelete,
      userCreatedBy: req.user?.id || "system",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      result: {
        mongoId: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    next(error);
  }
};
export const userLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;


    if (!env.jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const AdminAndAgentModel = getAdminAgentModel(MasterConn)

    const userData = await AdminAndAgentModel.findOne({
      username,
      isDeleted: { $ne: true },
    })
      .select("+password")
      .populate("hospitals.hospitalId", "corporateAddress hospitallogo")
      .lean();

    // Verify user exists
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // --- SECURE PASSWORD CHECK ---
    let isPasswordValid = false;
    let needsMigration = false;

    // 1. Try bcrypt comparison (for new/migrated users)
    // Note: userData is a plain object from .lean(), so we use bcrypt directly
    // checking if the stored password looks like a bcrypt hash (starts with $2b$ or $2a$)
    const isHashed =
      userData.password &&
      (userData.password.startsWith("$2b$") ||
        userData.password.startsWith("$2a$"));

    if (isHashed) {
      const match = await bcrypt.compare(password, userData.password);
      if (match) isPasswordValid = true;
    } else {
      // 2. Fallback to plain text comparison (for legacy users)
      if (password === userData.password) {
        isPasswordValid = true;
        needsMigration = true; // Mark for migration to secure hash
      }
    }

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    const tokenPayload = {
      id: userData._id,// Add this for compatibility with getMe and logout
      name: userData.name,
      username: userData.username,
      type: userData.type,
      hospitals: userData?.hospitals,
      branches: userData?.branches,
      email: userData.email,
      canDelete: Boolean(userData.canDelete),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
    };

    const token = jwt.sign(tokenPayload, env.jwtSecret);



    const result = {
      id: userData.ID,
      mongoId: userData._id,
      name: userData.name || userData.username,
      email: userData.email,
      username: userData?.username,
      type: userData?.type,
      hospitals: userData?.hospitals,
      branches: userData?.branches,
      canDelete: Boolean(userData.canDelete),
      createdAt: userData.createdAt,
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      result,
      token,
    });
  } catch (error) {
    next(error);
    console.error("Login error:", error);

  }
};

export const userLogout = async (req, res) => {
  const AdminAndAgentModel = getAdminAgentModel(MasterConn)
  try {
    // userId now contains the MongoDB _id from the token
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }


    const userData = await AdminAndAgentModel.findOne({ _id: userId }).lean();
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let sessionDuration = 0;

    if (userData.isLoggedIn && userData.sessionStart) {
      const sessionEnd = new Date();
      const sessionStartDate = new Date(userData.sessionStart);
      const validSessionStart =
        sessionStartDate instanceof Date &&
          !Number.isNaN(sessionStartDate.getTime())
          ? sessionStartDate
          : null;

      const today = formatDate(sessionEnd);
      let todaysSessionSeconds = 0;

      if (validSessionStart) {
        sessionDuration = secondsBetween(validSessionStart, sessionEnd);
        todaysSessionSeconds = secondsForToday(validSessionStart, sessionEnd);
      } else {
        sessionDuration = 0;
      }

      const existingDailySeconds =
        typeof userData.dailyAccumulatedTime === "number"
          ? userData.dailyAccumulatedTime
          : Number(userData.dailyAccumulatedTime) || 0;

      const dailyAccumulatedTime =
        userData.dailyLoginDate === today
          ? existingDailySeconds + todaysSessionSeconds
          : todaysSessionSeconds;

      await AdminAndAgentModel.updateOne(
        { _id: userData._id },
        {
          $set: {
            isLoggedIn: false,
            lastLogoutTime: sessionEnd,
            lastSessionDuration: sessionDuration,
            dailyAccumulatedTime,
            dailyLoginDate: today,
          },
          $unset: { sessionStart: "" },
        },
      );
    } else {
      await AdminAndAgentModel.updateOne(
        { _id: userData._id },
        { $set: { isLoggedIn: false }, $unset: { sessionStart: "" } },
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      sessionDuration: formatDuration(sessionDuration),
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};