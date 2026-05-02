

import jwt from 'jsonwebtoken';
import getCustomerModel from '../models/CustomerModel.js';
import env from '../config/env.js';
import AdminAndAgentModel from '../models/AdminAgentModel.js';

const authService = {

  login: async (username, password) => {
    try {

      // Find user by username (need to include password for comparison)
      // Note: password is excluded by default (select: false), so we explicitly include it
      const user = await AdminAndAgentModel.findOne({
        username: username.toLowerCase(),
        isDeleted: false
      }).select('+password'); // Explicitly include password for verification

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Check password using bcrypt (SECURE METHOD)
      // comparePassword is a method defined in the model
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Update login tracking
      user.lastLoginTime = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      user.isLoggedIn = true;
      user.sessionStart = new Date();
      await user.save();

      // Generate JWT token with comprehensive user data
      const token = jwt.sign(
        {
          // User identification
          id: user._id.toString(),
          ID: user.ID,
          username: user.username,
          name: user.name,

          // Authorization information
          type: user.type,
          isAdmin: user.isAdmin || user.type === 'superAdmin' || user.type === 'admin',

          // Organizational context
          hospitalNames: user.hospitalNames || [],
          userCreatedBy: user.userCreatedBy,

          // For filtering purposes
          parentUsers: user.parentUsers || []
        },
        env.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return user data using safe method (without password)
      const userData = user.toSafeObject();

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userData
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: error.message
      };
    }
  },

  /**
   * Verify JWT token
   * 
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token data or error
   */
  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, env.jwtSecret || 'your-secret-key');

      return {
        success: true,
        data: decoded
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
        error: error.message
      };
    }
  },

  /**
   * Get user by ID
   * 
   * @param {string} userId - User ID to retrieve
   * @returns {Object} - User data without password
   */
  getUserById: async (userId) => {
    try {

      const user = await AdminAndAgentModel.findOne({
        _id: userId,
        isDeleted: false
      }).select('-password'); // Exclude password

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get user',
        error: error.message
      };
    }
  },

  /**
   * Logout user
   * Updates user session information
   * 
   * @param {string} userId - ID of user logging out
   * @returns {Object} - Success result
   */
  logout: async (userId) => {
    try {
      if (userId) {
        const user = await AdminAndAgentModel.findById(userId);

        if (user) {
          // Calculate session duration
          if (user.sessionStart) {
            const sessionDuration = Math.floor((Date.now() - user.sessionStart.getTime()) / 1000);
            user.lastSessionDuration = sessionDuration;
          }

          user.isLoggedIn = false;
          user.lastLogoutTime = new Date();
          await user.save();
        }
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }
};

export default authService;
