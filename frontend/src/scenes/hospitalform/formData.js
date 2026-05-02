// formData.js
export const initialHospitalData = {
  name: "",
  contactNumbers: [""],
  branches: [
    {
      name: "",
      location: "",
      contact: "",
      contactNumbers: [""],
      code: "",
      numberOfBeds: 0,
      departments: [
        {
          doctorName: "",
          enabled: true,
          opdNumber: "",
          specialties: [""],
          opdTiming: {
            morning: "",
            evening: "",
          },
          opdDays: "",
          experience: "",
          contactNumber: "",
          extensionNumber: "",
          paName: "",
          paContactNumber: "",
          consultationCharges: 0,
          videoConsultation: {
            enabled: false,
            timeSlot: "",
            charges: 0,
            days: "",
          },
          teleMedicine: false,
          empanelmentList: ["Cash", "TPA", "RGHS", "CGHS"],
          additionalInfo: "",
          serviceDescription: "",
          availability: {
            enabled: true,
            leave: false,
            halfDay: false,
            fullDay: false,
          },
        },
      ],
    },
  ],
  empanelmentList: [
    {
      policyName: "",
      coveringSpecialties: [""],
      doctorsAvailability: [
        {
          doctorName: "",
          time: "",
        },
      ],
      additionalRemarks: "",
      coverageType: "Cashless",
    },
  ],
  testLabType: {
    location: "",
    testCode: "",
    testName: "",
    serviceGroup: "",
    serviceCharge: 0,
    floor: "",
    description: "",
    precaution: "",
    categoryApplicability: ["TPA", "Cash", "RGHS"],
    tatReport: "",
    source: "In",
    remarks: "",
  },
  codeAnnouncements: [
    {
      name: "",
      color: "",
      description: "",
      concernedPerson: "",
      staff: [
        {
          time: "Morning",
          contactNumber: "",
        },
      ],
      shortCode: "",
      timeAvailability: "",
    },
  ],
  ipd: {
    numberOfBeds: 0,
    charges: 0,
    location: "",
    category: "",
    serviceType: "",
  },
  dayCare: {
    numberOfBeds: 0,
    charges: 0,
    location: "",
    category: "",
    serviceType: "",
  },
  procedureList: [
    {
      procedureName: "",
      description: "",
      category: "",
      doctorName: "",
      empanelmentType: [""],
      rates: 0,
      coordinatorName: "",
    },
  ],
  departmentIncharge: {
    name: "",
    extensionNumber: "",
    contactNumber: "",
    departmentName: "",
    timeSlot: "",
    serviceType: "",
  },
};

export const initialValues = {
  // Hospital Details
  name: "",
  city: "",
  state: "",

  contactNumbers: [""], // Array to hold multiple contact numbers

  accondDetails: {
    nameOfLegalEntityForBilling: "",
    gst: "",
    tan: "",
    bankName: "",
    ifsc: "",
    accountNumber: "",
    modeOfPayment: "",
    cycleOfPayment: "",
  },

  // Branches
  branches: [
    {
      name: "",
      location: "",
      contact: "",
      state: "",
      city: "",
      email: "",
      contactNumbers: [""], // Array to hold multiple contact numbers for each branch
      code: "",
      beds: "", // Number of beds in the branch
    },
  ],

  // management Details
  managementDetails: [
    {
      type: "",
      name: "",
      phoneNumber: "",
      designation: "",
      eaName: "",
      eaContactNumber: "",
      locationAlignment: "",
    },
  ],

  // Departments
  departments: [
    {
      name: "",
      doctors: [
        {
          name: "",
          opdNo: "",
          specialties: [""], // Array to hold multiple specialties
          timings: {
            morning: "",
            evening: "",
          },
          opdDays: "", // OPD days
          experience: "",
          contactNumber: "",
          extensionNumber: "",
          paName: "",
          paContactNumber: "",
          consultationCharges: "",
          videoConsultation: {
            enabled: false, // Boolean to enable/disable video consultation
            timeSlot: "",
            charges: "",
            days: "",
          },
          teleMedicine: "", // Tele-medicine option
          empanelmentList: [""], // Array to hold multiple empanelment types
          additionalInfo: "",
          descriptionOfServices: "",
          isEnabled: true, // Boolean to enable/disable doctor availability
        },
      ],
    },
  ],

  // Empanelment List
  empanelmentList: [
    {
      policyName: "",
      coveringAreasOfSpeciality: [""], // Array to hold multiple specialties
      doctorsAvailable: [""],
      additionalRemarks: "",
      typeOfCoverage: "", // e.g., Cashless, Government Rates, etc.
    },
  ],

  // Test Lab Types
  testLabs: [
    {
      location: "",
      testCode: "",
      testName: "",
      serviceGroup: "",
      serviceCharge: "", // OPD Plus Additionals
      floor: "",
      description: "",
      precaution: "",
      categoryApplicability: [""], // Array to hold multiple categories (TPA, Cash, etc.)
      tatReport: "",
      source: "", // In/Out
      remarks: "",
    },
  ],

  // Code Announcements
  codeAnnouncements: [
    {
      name: "",
      color: "",
      description: "",
      concernedPerson: "",
      staff: [
        {
          name: "",
          shift: "", // Morning, Evening, or Night
          contactNo: "",
        },
      ],
      shortCode: "",
      timeAvailability: "",
      enabled: false,
    },
  ],

  // IPD Details
  ipdDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Day Care Details
  dayCareDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Procedure List
  procedureList: [
    {
      name: "",
      description: "",
      category: "",
      doctorName: [""],
      empanelmentType: [""],
      ratesCharges: "",
      coordinatorName: [""],
    },
  ],

  // Department Incharge
  departmentIncharge: [
    {
      name: "",
      extensionNo: "",
      contactNo: "",
      departmentName: "",
      timeSlot: "",
      serviceType: "",
    },
  ],
};

export const initialValuesWithBranchParent = {
  // Hospital Details
  name: "",
  corporateAddress: "",
  hospitalCode: "",
  state: "",
  city: "",
  contact: "",
  email: "",
  itsBranch: false,
  hospitallogo: null,
  hospitallogoPreview: null,

  removeHospitalLogo: false,
  beds: "",

  // Accounting Details (Remains at the parent level)
  accondDetails: {
    nameOfLegalEntityForBilling: "",
    gst: "",
    tan: "",
    bankName: "",
    ifsc: "",
    accountNumber: "",
    modeOfPayment: "",
    cycleOfPayment: "",
  },

  // Management Details (Remains at the parent level)
  managementDetails: [
    {
      memberType: "",
      name: "",
      phoneNumber: "",
      hospitalDesignation: "",
      eaName: "",
      eaContactNumber: "",
      alignmentOfLocation: "",
    },
  ],

  // Branches (Each branch contains its own details)
  branches: [
    {
      name: "",
      location: "",
      contact: "",
      state: "",
      city: "",
      email: "",
      contactNumbers: [], // Array of strings
      code: "",
      beds: "", // Number of beds in the branch
      contactNumbers: [""], // Array to hold multiple contact numbers for each branch

      doctors: [
        // Array of doctor objects - Empty by default
      ],

      // Departments
      departments: [
      ],

      // Empanelment List
      empanelmentList: [
      ],

      // Test Lab Types
      testLabs: [

      ],

      // Code Announcements
      codeAnnouncements: [

      ],

      // IPD Details (single object)
      ipdDetails: {
        noOfBeds: "",
        charges: "",
        location: "",
        category: "",
        serviceType: "",
      },

      // Day Care Details (single object)
      dayCareDetails: {
        noOfBeds: "",
        charges: "",
        location: "",
        category: "",
        serviceType: "",
      },

      // Procedure List
      procedureList: [

      ],

      // Department Incharge
      departmentIncharge: [

      ],
    },
  ],
};

export const onlyBranchObject = {
  name: "",
  location: "",
  contact: "",
  contactNumbers: [""], // Array to hold multiple contact numbers for each branch
  code: "",
  beds: "", // Number of beds in the branch

  doctors: [
    // Array of doctor objects - Empty by default
  ],

  // Departments
  departments: [
    {
      name: "",
      doctors: [
        // {
        //   name: "",
        //   opdNo: "",
        //   specialties: [""], // Array to hold multiple specialties
        //   timings: {
        //     morning: "",
        //     evening: "",
        //   },
        //   opdDays: "", // OPD days
        //   experience: "",
        //   contactNumber: "",
        //   extensionNumber: "",
        //   paName: "",
        //   paContactNumber: "",
        //   consultationCharges: "",
        //   videoConsultation: {
        //     enabled: false, // Boolean to enable/disable video consultation
        //     timeSlot: "",
        //     charges: "",
        //     days: "",
        //   },
        //   teleMedicine: "", // Tele-medicine option
        //   empanelmentList: [""], // Array to hold multiple empanelment types
        //   additionalInfo: "",
        //   descriptionOfServices: "",
        //   isEnabled: true, // Boolean to enable/disable doctor availability
        // },
      ],
    },
  ],

  // Empanelment List
  empanelmentList: [
    {
      policyName: "",
      coveringAreasOfSpeciality: [""], // Array to hold multiple specialties
      doctorsAvailable: [""],
      additionalRemarks: "",
      typeOfCoverage: "", // e.g., Cashless, Government Rates, etc.
    },
  ],

  // Test Lab Types
  testLabs: [
    {
      location: "",
      testCode: "",
      testName: "",
      serviceGroup: "",
      serviceCharge: "", // OPD Plus Additionals
      floor: "",
      description: "",
      precaution: "",
      categoryApplicability: [""], // Array to hold multiple categories (TPA, Cash, etc.)
      tatReport: "",
      source: "", // In/Out
      remarks: "",
    },
  ],

  // Code Announcements
  codeAnnouncements: [
    {
      name: "",
      color: "",
      description: "",
      concernedPerson: "",
      staff: [
        {
          name: "",
          shift: "", // Morning, Evening, or Night
          contactNo: "",
        },
      ],
      shortCode: "",
      timeAvailability: "",
      enabled: false,
    },
  ],

  // IPD Details
  ipdDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Day Care Details
  dayCareDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Procedure List
  procedureList: [
    {
      name: "",
      description: "",
      category: "",
      doctorName: [""],
      empanelmentType: [""],
      ratesCharges: "",
      coordinatorName: [""],
    },
  ],

  // Department Incharge
  departmentIncharge: [
    {
      name: "",
      extensionNo: "",
      contactNo: "",
      departmentName: "",
      timeSlot: "",
      serviceType: "",
    },
  ],
};

export const initialBranchState = {
  name: "",
  location: "",
  contact: "",
  state: "",
  city: "",
  contactNumbers: [], // Array of strings
  code: "",
  beds: "", // Number of beds in the branch

  doctors: [
    // Array of doctor objects - Empty by default
  ],

  // Departments
  departments: [
    // Array of department objects
    {
      id: "dept1", // Added for unique identification in reducers
      name: "",
      doctors: [], // Array of doctor objects (can be empty or contain partial doctor data)
    },
  ],

  // Empanelment List
  empanelmentList: [
    // Array of empanelment policy objects
    {
      id: "policy1", // Added for unique identification in reducers
      policyName: "",
      coveringAreasOfSpeciality: [], // Array to hold multiple specialties
      doctorsAvailable: [], // Array to hold multiple doctor names (strings)
      additionalRemarks: "",
      typeOfCoverage: "", // e.g., Cashless, Government Rates, etc.
    },
  ],

  // Test Lab Types
  testLabs: [
    // Array of test lab objects
    {
      id: "testlab1", // Added for unique identification in reducers
      location: "",
      testCode: "",
      testName: "",
      serviceGroup: "",
      serviceCharge: "", // OPD Plus Additionals
      floor: "",
      description: "",
      precaution: "",
      categoryApplicability: [], // Array to hold multiple categories (TPA, Cash, etc.)
      tatReport: "",
      source: "", // In/Out
      remarks: "",
    },
  ],

  // Code Announcements
  codeAnnouncements: [
    // Array of code announcement objects
    {
      id: "code1", // Added for unique identification in reducers
      name: "",
      color: "",
      description: "",
      concernedPerson: "",
      staff: [
        // Array of staff objects
        {
          name: "",
          shift: "", // Morning, Evening, or Night
          contactNo: "",
        },
      ],
      shortCode: "",
      timeAvailability: "",
      enabled: false, // Boolean
    },
  ],

  // IPD Details (single object)
  ipdDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Day Care Details (single object)
  dayCareDetails: {
    noOfBeds: "",
    charges: "",
    location: "",
    category: "",
    serviceType: "",
  },

  // Procedure List
  procedureList: [
    // Array of procedure objects
    {
      id: "proc1", // Added for unique identification in reducers
      name: "",
      description: "",
      category: "",
      doctorName: [], // Array of strings
      empanelmentType: [], // Array of strings
      ratesCharges: "",
      coordinatorName: [], // Array of strings
    },
  ],

  // Department Incharge
  departmentIncharge: [
    // Array of department in-charge objects
    {
      id: "incharge1", // Added for unique identification in reducers
      name: "",
      extensionNo: "",
      contactNo: "",
      departmentName: "",
      timeSlot: "",
      serviceType: "",
    },
  ],
};

export const branchReducer = (state, action) => {
  switch (action.type) {
    case "SET_BRANCH":
      return { ...state, ...action.payload };

    case "UPDATE_FIELD":
      return { ...state, [action.payload.key]: action.payload.value };

    case "UPDATE_NESTED":
      return { ...state, [action.payload.key]: action.payload.value };

    case "RESET_BRANCH":
      return initialBranchState;

    default:
      return state;
  }
};

// * for procedureList component in branch
export const mockEmpanelmentTypes = [
  "Cashless",
  "Reimbursement",
  "Corporate Tie-up",
  "Government Scheme",
  "Insurance",
  "Self Pay",
];

//* for procedureList component in branch
export const mockCoordinators = [
  "Ms. Priya Sharma",
  "Mr. Rahul Verma",
  "Dr. Sameer Khan",
  "Ms. Neha Gupta",
  "Mr. Alok Singh",
];
