import FilledForm from '../models/FilledForm.js';
import AdminAgentModel from '../models/AdminAgentModel.js';

/**
 * Form Service
 * Handles form submission, retrieval, and statistics using Mongoose
 */

class FormService {
  /**
   * Create filled form (inbound or outbound)
   */
  async createFilledForm(formData) {
    try {
      // Validate required fields
      if (!formData.formType) {
        return {
          success: false,
          message: 'Form type is required'
        };
      }

      // Prepare data based on form type
      const filledFormData = {
        formType: formData.formType,
        hospitalId: formData.hospitalId || null,
        agentId: formData.agentId || null,
        submittedAt: new Date()
      };

      // Map inbound form data
      if (formData.formType === 'inbound') {
        filledFormData.inboundData = this._mapInboundData(formData);
      }
      // Map outbound form data
      else if (formData.formType === 'outbound') {
        filledFormData.outboundData = this._mapOutboundData(formData);
      }

      const filledForm = new FilledForm(filledFormData);
      await filledForm.save();

      return {
        success: true,
        message: 'Form submitted successfully',
        data: filledForm
      };
    } catch (error) {
      throw new Error(`Failed to create form: ${error.message}`);
    }
  }

  /**
   * Get all filled forms with filtering and pagination
   */
  async getFilledForms(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, skip = 0 } = pagination;
      const query = { ...filters };

      const forms = await FilledForm.find(query)
        .sort({ submittedAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('hospitalId', 'name')
        .populate('agentId', 'name email');

      const total = await FilledForm.countDocuments(query);

      return {
        success: true,
        data: forms,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to get forms: ${error.message}`);
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(formId) {
    try {
      const form = await FilledForm.findById(formId)
        .populate('hospitalId', 'name address')
        .populate('agentId', 'name email phone');

      if (!form) {
        return {
          success: false,
          message: 'Form not found'
        };
      }

      return {
        success: true,
        data: form
      };
    } catch (error) {
      throw new Error(`Failed to get form: ${error.message}`);
    }
  }

  /**
   * Update filled form
   */
  async updateForm(formId, updateData) {
    try {
      const form = await FilledForm.findByIdAndUpdate(
        formId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!form) {
        return {
          success: false,
          message: 'Form not found'
        };
      }

      return {
        success: true,
        message: 'Form updated successfully',
        data: form
      };
    } catch (error) {
      throw new Error(`Failed to update form: ${error.message}`);
    }
  }

  /**
   * Delete filled form
   */
  async deleteForm(formId) {
    try {
      const form = await FilledForm.findByIdAndDelete(formId);

      if (!form) {
        return {
          success: false,
          message: 'Form not found'
        };
      }

      return {
        success: true,
        message: 'Form deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  }

  /**
   * Get form statistics by agent
   */
  async getFormStatisticsByAgent(agentId, dateFilters = {}) {
    try {
      const matchStage = { agentId };

      // Apply date filters
      if (dateFilters.startDate || dateFilters.endDate) {
        matchStage.submittedAt = {};
        if (dateFilters.startDate) matchStage.submittedAt.$gte = new Date(dateFilters.startDate);
        if (dateFilters.endDate) matchStage.submittedAt.$lte = new Date(dateFilters.endDate);
      }

      const statistics = await FilledForm.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$formType',
            count: { $sum: 1 },
            inboundPurposes: {
              $push: {
                $cond: [
                  { $eq: ['$formType', 'inbound'] },
                  '$inboundData.purpose',
                  null
                ]
              }
            },
            outboundPurposes: {
              $push: {
                $cond: [
                  { $eq: ['$formType', 'outbound'] },
                  '$outboundData.purpose',
                  null
                ]
              }
            }
          }
        }
      ]);

      // Process purpose counts
      const purposeStats = {
        inbound: {},
        outbound: {}
      };

      statistics.forEach(stat => {
        if (stat._id === 'inbound') {
          stat.inboundPurposes.forEach(purpose => {
            if (purpose) {
              purposeStats.inbound[purpose] = (purposeStats.inbound[purpose] || 0) + 1;
            }
          });
        } else if (stat._id === 'outbound') {
          stat.outboundPurposes.forEach(purpose => {
            if (purpose) {
              purposeStats.outbound[purpose] = (purposeStats.outbound[purpose] || 0) + 1;
            }
          });
        }
      });

      const inboundCount = statistics.find(s => s._id === 'inbound')?.count || 0;
      const outboundCount = statistics.find(s => s._id === 'outbound')?.count || 0;

      return {
        success: true,
        data: {
          totalForms: inboundCount + outboundCount,
          inboundCount,
          outboundCount,
          purposeStats
        }
      };
    } catch (error) {
      throw new Error(`Failed to get form statistics: ${error.message}`);
    }
  }

  /**
   * Get agent dashboard counts
   */
  async getAgentDashboardCounts(agentId) {
    try {
      // Get agent data
      const agent = await AdminAgentModel.findOne({ ID: agentId });
      if (!agent) {
        return {
          success: false,
          message: 'Agent not found'
        };
      }

      // Define today's date range
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Run queries in parallel
      const [allTimeInbound, allTimeOutbound, allTimeAppointments] = await Promise.all([
        FilledForm.countDocuments({ agentId, formType: 'inbound' }),
        FilledForm.countDocuments({ agentId, formType: 'outbound' }),
        FilledForm.countDocuments({
          agentId,
          formType: 'inbound',
          'inboundData.purpose': 'Appointment'
        })
      ]);

      return {
        success: true,
        data: {
          inbound: allTimeInbound,
          outbound: allTimeOutbound,
          appointments: allTimeAppointments
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard counts: ${error.message}`);
    }
  }

  /**
   * Get total leads from outbound forms
   */
  async getTotalLeads(filters = {}) {
    try {
      const matchStage = { formType: 'outbound', ...filters };

      const leadCounts = await FilledForm.aggregate([
        { $match: matchStage },
        {
          $project: {
            justdialLead: {
              $cond: [{ $eq: ['$outboundData.justdial.lead', 'Yes'] }, 1, 0]
            },
            practoLead: {
              $cond: [{ $eq: ['$outboundData.practo.lead', 'Yes'] }, 1, 0]
            },
            whatsappLead: {
              $cond: [{ $eq: ['$outboundData.whatsapp.lead', 'Yes'] }, 1, 0]
            },
            facebookLead: {
              $cond: [{ $eq: ['$outboundData.facebook.lead', 'Yes'] }, 1, 0]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalLeads: {
              $sum: {
                $add: ['$justdialLead', '$practoLead', '$whatsappLead', '$facebookLead']
              }
            },
            justdialLeads: { $sum: '$justdialLead' },
            practoLeads: { $sum: '$practoLead' },
            whatsappLeads: { $sum: '$whatsappLead' },
            facebookLeads: { $sum: '$facebookLead' }
          }
        }
      ]);

      const result = leadCounts[0] || {
        totalLeads: 0,
        justdialLeads: 0,
        practoLeads: 0,
        whatsappLeads: 0,
        facebookLeads: 0
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error(`Failed to get total leads: ${error.message}`);
    }
  }

  // Private helper methods

  /**
   * Map inbound form data from request to schema
   */
  _mapInboundData(formData) {
    const inboundData = {
      callerType: formData.callerType || '',
      referenceFrom: formData.referenceFrom || '',
      patientDetails: {
        patientName: formData.patientName || '',
        patientMobile: formData.patientMobile || '',
        alternateMobile: formData.alternateMobile || '',
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        location: formData.location || '',
        gender: formData.gender || '',
        status: formData.status || '',
        category: formData.category || ''
      },
      attendantDetails: {
        attendantName: formData.attendantName || '',
        attendantMobile: formData.attendantMobile || ''
      },
      purpose: formData.purpose || ''
    };

    // Map purpose-specific data
    const purposeMapping = {
      'Appointment': 'appointment',
      'General Query': 'generalQuery',
      'Surgery': 'surgery',
      'Health Checkup': 'healthCheckup',
      'Emergency Query': 'emergencyQuery',
      'Call Drop': 'callDrop',
      'Marketing Campaign': 'marketingCampaign',
      'Complaints': 'complaints',
      'OPD Timings': 'opdTimings',
      'Diagnosis or Test Price': 'diagnosingTestPrice',
      'Reports': 'reports',
      'Government Health Schemes': 'govtHealthScheme',
      'Non-Government Schemes': 'nonGovtHealthScheme',
      'Ambulance': 'ambulance',
      'Junk': 'junk',
      'Job Related': 'jobRelated'
    };

    const purposeKey = purposeMapping[formData.purpose];
    if (purposeKey && formData[purposeKey]) {
      inboundData[purposeKey] = formData[purposeKey];
    }

    return inboundData;
  }

  /**
   * Map outbound form data from request to schema
   */
  _mapOutboundData(formData) {
    const outboundData = {
      patientName: formData.patientName || '',
      mobileNumber: formData.mobileNumber || '',
      purpose: formData.purpose || ''
    };

    // Map purpose-specific data
    const purposes = ['appointment', 'followup', 'informative', 'marketing', 'feedback', 'missed'];
    const platforms = ['justdial', 'practo', 'whatsapp', 'facebook'];

    if (purposes.includes(formData.purpose) && formData[formData.purpose]) {
      outboundData[formData.purpose] = formData[formData.purpose];
    }

    if (platforms.includes(formData.purpose) && formData[formData.purpose]) {
      outboundData[formData.purpose] = formData[formData.purpose];
    }

    return outboundData;
  }
}

export default new FormService();
