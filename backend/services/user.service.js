import AdminAgentModel from '../models/AdminAgentModel.js';
import CustomerModel from '../models/CustomerModel.js';
import { generateUniqueId } from '../utils/database.js';

/**
 * User Service
 * Handles user management operations (CRUD, stats, filtering)
 */

class UserService {
  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, skip = 0 } = pagination;
      const query = { isDeleted: { $ne: true }, ...filters };

      // Get users from AdminAgent collection
      const adminUsers = await AdminAgentModel.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await AdminAgentModel.countDocuments(query);

      return {
        success: true,
        data: adminUsers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      let user = await AdminAgentModel.findOne({ 
        ID: userId, 
        isDeleted: { $ne: true } 
      }).select('-password');

      if (!user) {
        user = await CustomerModel.findOne({ 
          ID: userId, 
          isDeleted: { $ne: true } 
        }).select('-password');
      }

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
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      // Check if username already exists
      const existingUser = await AdminAgentModel.findOne({ 
        username: userData.username,
        isDeleted: { $ne: true }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }

      // Generate unique ID
      const userId = generateUniqueId();

      // Create user with ID field
      const newUser = new AdminAgentModel({
        ...userData,
        ID: userId,
        createdAt: new Date(),
        isDeleted: false
      });

      await newUser.save();

      // Return user without password
      const userObject = newUser.toObject();
      delete userObject.password;

      return {
        success: true,
        message: 'User created successfully',
        data: userObject
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    try {
      // Remove fields that shouldn't be updated this way
      delete updateData.password; // Password should be updated separately
      delete updateData.ID;
      delete updateData._id;

      const user = await AdminAgentModel.findOneAndUpdate(
        { ID: userId, isDeleted: { $ne: true } },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: user
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Soft delete user
   */
  async deleteUser(userId) {
    try {
      const user = await AdminAgentModel.findOneAndUpdate(
        { ID: userId, isDeleted: { $ne: true } },
        { 
          $set: { 
            isDeleted: true,
            deletedAt: new Date()
          } 
        },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Get users by type/role
   */
  async getUsersByRole(role, pagination = {}) {
    try {
      const filters = { type: role };
      return await this.getAllUsers(filters, pagination);
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error.message}`);
    }
  }

  /**
   * Get users by hospital
   */
  async getUsersByHospital(hospitalId, pagination = {}) {
    try {
      const filters = { assignedHospitals: hospitalId };
      return await this.getAllUsers(filters, pagination);
    } catch (error) {
      throw new Error(`Failed to get users by hospital: ${error.message}`);
    }
  }
}

export default new UserService();
