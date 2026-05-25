# Doctor Panel Documentation

## Overview
The Doctor Panel is a comprehensive healthcare provider interface within the Patient Management System (PMS). It provides doctors with tools to manage patient consultations, appointments, schedules, emergency alerts, and clinical records.

## Folder Structure
```
frontend/src/panels/doctor/
├── dashboard/
│   └── DoctorDashboard.jsx
├── profileManagement/
│   └── DoctorProfile.jsx
├── appointmentManagement/
│   └── AppointmentManagement.jsx
├── consultations/
│   └── PatientConsultations.jsx
├── scheduleManagement/
│   └── ScheduleManagement.jsx
├── emergencyAlerts/
│   └── EmergencyAlerts.jsx
├── clinicalRecords/
│   └── ClinicalRecords.jsx
└── index.js
```

## Features

### 1. Dashboard (`DoctorDashboard.jsx`)
**Purpose:** Overview of daily activities and key metrics

**Features:**
- Welcome message with doctor's name
- Today's appointments count
- Pending consultations
- Emergency alerts overview
- Total patients under care
- Average rating and consultation rate
- Upcoming appointments list
- Recent consultations history
- Quick action buttons

**Key Components:**
- StatCard: Displays key metrics
- UpcomingAppointmentCard: Shows today's schedule
- RecentConsultationsCard: Recent patient records

### 2. Profile Management (`DoctorProfile.jsx`)
**Purpose:** Manage and view doctor's professional profile

**Features:**
- View and edit professional information
- Profile picture upload
- Basic information section (name, email, contact)
- Professional information (specialization, qualification, experience, license number)
- Hospital and department details
- Professional bio
- Edit mode with save/cancel options

**Key Sections:**
- Profile Picture: Upload and display doctor's photo
- Basic Information: Name, Doctor ID, Email, Contact
- Professional Information: Specialization, Department, Qualification, Experience, License Number, Hospital
- Professional Bio: Additional information about the doctor

### 3. Appointment Management (`AppointmentManagement.jsx`)
**Purpose:** Create, manage, and track patient appointments

**Features:**
- View all appointments with details
- Create new appointments
- Edit appointment details
- Delete appointments
- Appointment status tracking (Scheduled, Pending, Completed, Cancelled)
- Appointment type filtering (OPD, Follow-up, Emergency)
- Appointment statistics
- Patient contact information

**Appointment Types:**
- OPD: Outpatient Department consultation
- Follow-up: Post-treatment follow-up visit
- Emergency: Emergency consultation

**Appointment Status:**
- Scheduled: Confirmed appointment
- Pending: Awaiting confirmation
- Completed: Appointment completed
- Cancelled: Cancelled appointment

### 4. Patient Consultations (`PatientConsultations.jsx`)
**Purpose:** Record and manage patient consultations

**Features:**
- Log new consultations
- View consultation history
- Track diagnosis and prescriptions
- Manage consultation status (Ongoing, Completed, Pending)
- Filter consultations by status and type
- Consultation notes and observations
- Patient-specific consultation records

**Consultation Types:**
- OPD: Outpatient department
- Follow-up: Follow-up consultation
- Emergency: Emergency consultation

**Consultation Details:**
- Patient information
- Date and time
- Diagnosis
- Medications prescribed
- Treatment notes
- Consultation status

### 5. Schedule Management (`ScheduleManagement.jsx`)
**Purpose:** Manage weekly availability and consultation slots

**Features:**
- Weekly schedule management
- Set working hours for each day
- Configure appointment slot duration (15, 30, 45, 60 minutes)
- Set maximum patients per day
- Toggle availability on/off for specific days
- Calculate total available slots
- View weekly capacity statistics

**Configuration Options:**
- Days: Monday to Sunday
- Start and End times
- Slot Duration: 15, 30, 45, or 60 minutes
- Maximum Patients: Daily patient capacity
- Availability: Enable/disable consultation availability

### 6. Emergency Alerts (`EmergencyAlerts.jsx`)
**Purpose:** Monitor and respond to critical patient situations

**Features:**
- Real-time emergency alerts
- Severity levels (Critical, High, Medium)
- Alert status tracking (Pending, In Progress, Resolved)
- Patient contact information
- Location details
- Quick call functionality
- Alert acknowledgment and resolution
- Detailed alert view dialog
- Filter by severity and status

**Alert Severity:**
- **Critical:** Immediate attention required (Red)
- **High:** Urgent attention needed (Yellow)
- **Medium:** Standard urgent care (Blue)

**Alert Status:**
- Pending: New alert
- In Progress: Being handled
- Resolved: Alert resolved

### 7. Clinical Records (`ClinicalRecords.jsx`)
**Purpose:** Maintain and manage patient clinical documentation

**Features:**
- Create and maintain clinical records
- Multiple record types (Prescription, Lab Report, Surgery Report, etc.)
- Document download functionality
- Record status tracking (Active, Completed, Archived)
- Associate records with patient
- Diagnosis and medication details
- Filter records by type and status
- Search and organize records

**Record Types:**
- Prescription: Medication prescriptions
- Lab Report: Laboratory test results
- Surgery Report: Surgical procedure details
- Discharge Summary: Patient discharge information
- Medical History: Patient medical background
- X-Ray Report: Radiographic imaging
- CT Scan Report: CT imaging results

**Record Status:**
- Active: Current/ongoing record
- Completed: Completed record
- Archived: Old/archived record

## Routes and Navigation

### Doctor Panel Routes
```
/                          - Doctor Dashboard
/profile                   - My Profile
/appointments              - Appointments Management
/consultations             - Patient Consultations
/schedule                  - Schedule Management
/emergency-alerts          - Emergency Alerts
/clinical-records          - Clinical Records
/patient-history           - Patient History (Shared)
```

### Navigation Integration
The sidebar automatically displays doctor-specific menu items when a user with `type: "doctor"` logs in.

**Sidebar Menu Items:**
- Dashboard (Home)
- Patient History
- My Profile
- Appointments
- Consultations
- Schedule
- Emergency Alerts
- Clinical Records
- Logout

## Component Architecture

### Shared Features
All components follow these design principles:

1. **Material-UI Integration:** Consistent design using MUI components
2. **Theme Support:** Dark/Light mode support with custom color tokens
3. **Toast Notifications:** User feedback via react-hot-toast
4. **Responsive Design:** Mobile-friendly layouts
5. **Dialog Management:** Forms and detailed views via Material-UI Dialogs
6. **Status Tracking:** Visual status indicators using Chips
7. **Icons:** Semantic Material Icons for visual clarity

### State Management
- Local component state using `useState`
- Context API for user information (`UserContextHook`)
- Sample data initialization for demonstration

### Styling
- Uses theme colors from `tokens(theme.palette.mode)`
- Consistent spacing and layout
- Color-coded status and severity indicators
- Responsive Grid layouts

## Data Models

### Doctor
```javascript
{
  _id: string,
  name: string,
  specialization: string,
  qualification: string,
  experience: string,
  email: string,
  contactNumber: string,
  profilePicture: string,
  licenseNumber: string,
  department: string,
  hospital: string
}
```

### Appointment
```javascript
{
  id: number,
  patientName: string,
  patientId: string,
  appointmentDate: string,
  appointmentTime: string,
  status: "Scheduled" | "Pending" | "Completed" | "Cancelled",
  type: "OPD" | "Follow-up" | "Emergency",
  notes: string
}
```

### Consultation
```javascript
{
  id: number,
  patientName: string,
  patientId: string,
  consultationType: "OPD" | "Follow-up" | "Emergency",
  date: string,
  time: string,
  diagnosis: string,
  prescription: string,
  status: "Ongoing" | "Completed" | "Pending",
  notes: string
}
```

### Schedule
```javascript
{
  id: number,
  day: string,
  startTime: string,
  endTime: string,
  slotDuration: number,
  available: boolean,
  maxPatients: number
}
```

### Emergency Alert
```javascript
{
  id: number,
  patientName: string,
  patientId: string,
  severity: "Critical" | "High" | "Medium",
  condition: string,
  location: string,
  timestamp: string,
  contactNumber: string,
  status: "Pending" | "In Progress" | "Resolved",
  notes: string
}
```

### Clinical Record
```javascript
{
  id: number,
  patientName: string,
  patientId: string,
  recordType: string,
  date: string,
  diagnosis: string,
  medicines: string,
  documentUrl: string,
  status: "Active" | "Completed" | "Archived"
}
```

## Customization and Extension

### Adding New Features
1. Create a new component file in the appropriate subdirectory
2. Import and export from `index.js`
3. Add route to `App.jsx`
4. Add sidebar menu item in `Sidebar.jsx`

### Connecting to Backend API
Replace sample data with actual API calls:

```javascript
// Example API integration
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/doctor/appointments');
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### API Endpoints Needed
```
GET    /api/doctor/profile              - Get doctor profile
PUT    /api/doctor/profile              - Update doctor profile
GET    /api/doctor/appointments         - List appointments
POST   /api/doctor/appointments         - Create appointment
PUT    /api/doctor/appointments/:id     - Update appointment
DELETE /api/doctor/appointments/:id     - Delete appointment
GET    /api/doctor/consultations        - List consultations
POST   /api/doctor/consultations        - Create consultation
GET    /api/doctor/schedule             - Get weekly schedule
PUT    /api/doctor/schedule             - Update schedule
GET    /api/doctor/alerts               - List emergency alerts
PUT    /api/doctor/alerts/:id           - Update alert status
GET    /api/doctor/records              - List clinical records
POST   /api/doctor/records              - Create record
```

## User Experience Features

### Data Visualization
- Status indicators using color-coded Chips
- Icon-based navigation
- Statistics cards showing key metrics
- Table views with sortable columns

### User Actions
- Confirm dialogs for destructive actions
- Toast notifications for feedback
- Form validation before submission
- Inline editing capabilities
- Quick action buttons

### Performance Considerations
- Lazy loading of dialogs
- Efficient state management
- Optimized table rendering
- Filter and search functionality

## Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color schemes
- Clear visual hierarchy

## Security Considerations
- Role-based access control (type: "doctor")
- Protected routes in App.jsx
- Sidebar visibility based on user role
- Sensitive data handling in dialogs
- Input validation on forms

## Testing Checklist
- [ ] Dashboard displays correct metrics
- [ ] Profile page allows editing and image upload
- [ ] Appointments can be created, edited, deleted
- [ ] Consultations are properly recorded
- [ ] Schedule can be configured for weekly availability
- [ ] Emergency alerts show correct severity levels
- [ ] Clinical records can be uploaded and downloaded
- [ ] Responsive design on mobile devices
- [ ] Toast notifications display correctly
- [ ] Navigation works as expected
- [ ] Filters and search functionality work
- [ ] Dialogs open and close properly

## Future Enhancements
- Real-time appointment notifications
- Video consultation integration
- Appointment reminders
- Patient communication portal
- Analytics and reporting dashboard
- Export functionality for records
- Integration with external systems
- Advanced search and filtering
- Calendar view for appointments
- Performance analytics
- Patient satisfaction ratings
- Prescription refill automation

## Support and Maintenance
For issues or questions:
1. Check the component prop definitions
2. Review the data models
3. Check browser console for errors
4. Verify user role is set to "doctor"
5. Ensure all dependencies are installed

---

**Version:** 1.0.0
**Last Updated:** May 2026
**Status:** Production Ready
