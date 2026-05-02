import HospitalModel from '../models/HospitalModel.js';
import { generateUniqueId } from '../utils/database.js';

/**
 * Hospital Service
 * Handles hospital CRUD operations, branch management, and nested operations
 */

class HospitalService {
  /**
   * Get all hospitals with active data filtering
   */
  async getAllHospitals(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, skip = 0 } = pagination;
      const query = { isDeleted: { $ne: true }, ...filters };

      const hospitals = await HospitalModel.aggregate([
        // Match non-deleted hospitals
        { $match: query },
        
        // Filter out deleted branches and their nested items
        {
          $addFields: {
            branches: {
              $filter: {
                input: '$branches',
                as: 'branch',
                cond: { $ne: ['$$branch.isDeleted', true] }
              }
            }
          }
        },
        
        // Sort and paginate
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const total = await HospitalModel.countDocuments(query);

      return {
        success: true,
        data: hospitals,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to get hospitals: ${error.message}`);
    }
  }

  /**
   * Get hospital by ID
   */
  async getHospitalById(hospitalId) {
    try {
      const hospital = await HospitalModel.findOne({
        ID: hospitalId,
        isDeleted: { $ne: true }
      });

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      // Filter deleted branches
      if (hospital.branches) {
        hospital.branches = hospital.branches.filter(b => b.isDeleted !== true);
      }

      return {
        success: true,
        data: hospital
      };
    } catch (error) {
      throw new Error(`Failed to get hospital: ${error.message}`);
    }
  }

  /**
   * Create new hospital
   */
  async createHospital(hospitalData) {
    try {
      const hospitalId = generateUniqueId();

      const newHospital = new HospitalModel({
        ...hospitalData,
        ID: hospitalId,
        branches: hospitalData.branches || [],
        createdAt: new Date(),
        isDeleted: false
      });

      await newHospital.save();

      return {
        success: true,
        message: 'Hospital created successfully',
        data: newHospital
      };
    } catch (error) {
      throw new Error(`Failed to create hospital: ${error.message}`);
    }
  }

  /**
   * Update hospital
   */
  async updateHospital(hospitalId, updateData) {
    try {
      delete updateData.ID;
      delete updateData._id;

      const hospital = await HospitalModel.findOneAndUpdate(
        { ID: hospitalId, isDeleted: { $ne: true } },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      return {
        success: true,
        message: 'Hospital updated successfully',
        data: hospital
      };
    } catch (error) {
      throw new Error(`Failed to update hospital: ${error.message}`);
    }
  }

  /**
   * Soft delete hospital
   */
  async deleteHospital(hospitalId) {
    try {
      const hospital = await HospitalModel.findOneAndUpdate(
        { ID: hospitalId, isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date()
          }
        },
        { new: true }
      );

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      return {
        success: true,
        message: 'Hospital deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete hospital: ${error.message}`);
    }
  }

  /**
   * Add branch to hospital
   */
  async addBranch(hospitalId, branchData) {
    try {
      const branchId = generateUniqueId();
      const newBranch = {
        ...branchData,
        ID: branchId,
        isDeleted: false,
        createdAt: new Date()
      };

      const hospital = await HospitalModel.findOneAndUpdate(
        { ID: hospitalId, isDeleted: { $ne: true } },
        { $push: { branches: newBranch } },
        { new: true, runValidators: true }
      );

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      return {
        success: true,
        message: 'Branch added successfully',
        data: newBranch
      };
    } catch (error) {
      throw new Error(`Failed to add branch: ${error.message}`);
    }
  }

  /**
   * Update branch in hospital
   */
  async updateBranch(hospitalId, branchId, updateData) {
    try {
      const hospital = await HospitalModel.findOne({
        ID: hospitalId,
        isDeleted: { $ne: true }
      });

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      const branchIndex = hospital.branches.findIndex(
        b => b.ID === branchId && b.isDeleted !== true
      );

      if (branchIndex === -1) {
        return {
          success: false,
          message: 'Branch not found'
        };
      }

      // Update branch
      hospital.branches[branchIndex] = {
        ...hospital.branches[branchIndex].toObject(),
        ...updateData,
        ID: branchId // Preserve ID
      };

      await hospital.save();

      return {
        success: true,
        message: 'Branch updated successfully',
        data: hospital.branches[branchIndex]
      };
    } catch (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }
  }

  /**
   * Soft delete branch
   */
  async deleteBranch(hospitalId, branchId) {
    try {
      const hospital = await HospitalModel.findOneAndUpdate(
        { 
          ID: hospitalId, 
          isDeleted: { $ne: true },
          'branches.ID': branchId
        },
        {
          $set: {
            'branches.$[branch].isDeleted': true,
            'branches.$[branch].deletedAt': new Date()
          }
        },
        {
          arrayFilters: [{ 'branch.ID': branchId }],
          new: true
        }
      );

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital or branch not found'
        };
      }

      return {
        success: true,
        message: 'Branch deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  }

  /**
   * Get branch by ID
   */
  async getBranchById(hospitalId, branchId) {
    try {
      const hospital = await HospitalModel.findOne({
        ID: hospitalId,
        isDeleted: { $ne: true }
      });

      if (!hospital) {
        return {
          success: false,
          message: 'Hospital not found'
        };
      }

      const branch = hospital.branches.find(
        b => b.ID === branchId && b.isDeleted !== true
      );

      if (!branch) {
        return {
          success: false,
          message: 'Branch not found'
        };
      }

      return {
        success: true,
        data: branch
      };
    } catch (error) {
      throw new Error(`Failed to get branch: ${error.message}`);
    }
  }

  /**
   * Get doctors and departments by branch
   */
  async getDoctorsAndDepartmentsByBranch(hospitalTrimmedName, branchId) {
    try {
      const pipeline = [
        {
          $match: {
            trimmedName: hospitalTrimmedName,
            'branches.ID': branchId,
            isDeleted: { $ne: true }
          }
        },
        { $unwind: '$branches' },
        {
          $match: {
            'branches.ID': branchId,
            'branches.isDeleted': { $ne: true }
          }
        },
        {
          $project: {
            _id: 0,
            doctors: '$branches.doctors',
            departments: '$branches.departments'
          }
        }
      ];

      const result = await HospitalModel.aggregate(pipeline);

      if (!result || result.length === 0) {
        return {
          success: false,
          message: 'Branch not found'
        };
      }

      return {
        success: true,
        data: {
          doctors: result[0].doctors || [],
          departments: result[0].departments || []
        }
      };
    } catch (error) {
      throw new Error(`Failed to get doctors and departments: ${error.message}`);
    }
  }
}

export default new HospitalService();
