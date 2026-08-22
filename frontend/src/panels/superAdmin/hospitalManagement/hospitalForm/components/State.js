// templatesData.js
export const REMARK_INBOUND_TEMPLATES = [
  {
    category: "Appointment",
    name: "Appointment Booked",
    code: "/appointment_booked",
    content: `Patient called for appointment with [DoctorName]. Appointment successfully booked on [DateAndTime]. Patient was informed about the appointment details and required instructions.`
  },
  {
    category: "Appointment",
    name: "Appointment CaPatient called for appointment with [DoctorName]. Appointment successfully booked on [DateAndTime]. Patient was informed about the appointment details and required instructions ncellation",
    code: "/appointment_cancellation",
    content: "Patient called to cancel the appointment with [DoctorName] scheduled for [DateAndTime]. Cancellation reason: Reason. Appointment cancelled successfully."
  },
  {
    category: "Appointment",
    name: "Appointment Reschedule",
    code: "/appointment_reschedule",
    content: "Patient requested rescheduling of the appointment with [DoctorName] from  [DateAndTime] to [DateAndTime]. Appointment was Rescheduled/Not Rescheduled."
  },
  {
    category: "OPD Timings",
    name: "OPD Timing",
    code: "/opd_timing",
    content: `Patient enquired about OPD timings for [DoctorName] in [Department]. OPD timing of Time/Days was communicated to the patient.`
  },
  {
    category: "OPD Timings",
    name: "Doctor Availability",
    code: "/doctor_availability",
    content: "Patient enquired about the availability of [DoctorName] on [DateAndTime]. Doctor availability was confirmed as [Available][Unavailable]. Alternative slot/doctor information was provided."
  },
  {
    category: "Surgery",
    name: "Surgery Enquiry",
    code: "/surgery_enquiry",
    content: "Patient enquired about [SurgeryName] under [Department] of [DoctorName] in [CategoryName]. Patient was advised to consult the concerned [DoctorName] in [Department] for clinical assessment and final treatment-related information."
  },
  {
    category: "Surgery",
    name: "Surgery Cost",
    code: "/surgery_cost",
    content: "Patient enquired about the estimated cost of [SurgeryName]. Available pricing/package information of ₹[Amount/Range] was communicated. Patient was informed that final charges may vary based on clinical requirements and hospital billing."
  },
  {
    category: "Surgery",
    name: "Surgery Cost",
    code: "/surgery_cost_denied",
    content: "Patient enquired about the estimated cost of [SurgeryName]. Asked patient to visit and consult Doctor and estimate cost will be shared by Doctor only"
  },
  {
    category: "Surgery",
    name: "Surgery Admission",
    code: "/surgery_admission",
    content: "Patient enquired about the admission process for [SurgeryName]. Admission requirements and available information were communicated. Patient was directed to [Department] [Admission Desk] for further assistance."
  },
  {
    category: "Health Check Up",
    name: "Checkup Enquiry",
    code: "/healthcheckup_enquiry",
    content: "Patient enquired about health checkup [PackageName]. Available details including tests/services and applicable price of ₹[Amount] were communicated."
  },
  {
    category: "Health Check Up",
    name: "Health Checkup Packages",
    code: "/healthcheckup_packages",
    content: "Patient enquired about available health checkup packages. Available options [PackageName] were explained based on the hospital package information."
  },
  {
    category: "Health Check Up",
    name: "Health Checkup Price",
    code: "/healthcheckup_price",
    content: "Patient enquired about the price of [PackageName]. Applicable price communicated: ₹[Amount]."
  },
  {
    category: "Health Check Up",
    name: "Health Checkup Booking",
    code: "/healthcheckup_booking",
    content: "Patient requested booking of [PackageName] for [DateAndTime]. Booking status: [Confirmed][Pending][NotBooked]."
  },
  {
    category: "Diagnose & Test Price",
    name: "Diagnostic/Test Enquiry",
    code: "/test_enquiry",
    content: "Patient enquired about [TestName]. Information regarding availability, applicable charges and relevant instructions was [provided/referred to concerned department]."
  },
  {
    category: "Diagnose & Test Price",
    name: "Test Price",
    code: "/test_price",
    content: "Patient enquired about the price of [TestName]. Applicable charge communicated: ₹[Amount]."
  },
  {
    category: "Diagnose & Test Price",
    name: "Sample Collection",
    code: "/home_sample_collection",
    content: "Patient enquired about home sample collection for [TestName]. Informed patient that home collection service is not available at hospital."
  },
  {
    category: "Reports",
    name: "Report Status",
    code: "/report_status",
    content: "Patient enquired about the status of the [TestName] report conducted on [Date]. Current report status: [Available/Pending/Under Process]. Patient was informed accordingly."
  },
  {
    category: "Reports",
    name: "Report Sharing",
    code: "/report_sharing",
    content: "Patient requested the [TestName] report to be shared through [WhatsApp]. Shared the report and confirmed."
  },
  {
    category: "Reports",
    name: "Report Sharing Denied",
    code: "/report_sharing_denied",
    content: "Patient requested the [TestName] report to be shared through [WhatsApp]. Asked patient to visit hospital an collect the report as These reports are only available for in-person collection at the hospital."
  },
  {
    category: "Emergency",
    name: "Emergency Visit",
    code: "/emergency_visit",
    content: "Caller enquired regarding an emergency situation involving [Brief Description]. Caller was advised to directly visit the hospital Emergency Department immediately. Emergency location/access instructions were provided, where required."
  },
  {
    category: "Emergency",
    name: "Emergency Enquiry",
    code: "/emergency_enquiry",
    content: "Caller contacted the hospital regarding an emergency situation involving [Remarks]. Available emergency-related information was provided and patient was asked to visit hospital."
  },
  {
    category: "Ambulance",
    name: "Ambulance Require",
    code: "/ambulance_requirement_transfer",
    content: "Caller requested ambulance service. Call was transferred to the ambulance driver/team for further coordination."
  },
  {
    category: "Ambulance",
    name: "Ambulance Number",
    code: "/ambulance_requirement_number",
    content: "Caller requested ambulance service. Ambulance driver/contact number was shared with the caller for further coordination."
  },
  {
    category: "Ambulance",
    name: "Ambulance Charges",
    code: "/ambulance_charges_number",
    content: "Caller enquired about ambulance charges. Call was transferred to the ambulance driver/team for further clarification."
  },
  {
    category: "Complaint",
    name: "General Complaint",
    code: "/complaint_general",
    content: "Patient/attendant reported a complaint regarding [Issue] related to [Department][Service]. Patient/attendant was asked to explain the issue in detail."
  },
  {
    category: "Complaint",
    name: "Staff Complaint",
    code: "/complaint_staff",
    content: "Patient/attendant reported a complaint regarding staff behaviour/service at [Department][Location]. [Document the issue (free test)]"
  },
  {
    category: "Complaint",
    name: "Doctor Complaint",
    code: "/complaint_doctor",
    content: "Patient/attendant reported a complaint regarding consultation/service provided by [DoctorName]. [Document the issue (free test)]"
  },
  {
    category: "Complaint",
    name: "Waiting Time Complaint",
    code: "/complaint_waiting",
    content: "Patient reported excessive waiting time at [Department][Location]. [Document the issue (free test)]"
  },
  {
    category: "Complaint",
    name: "Billing Complaint",
    code: "/complaint_billing",
    content: "Patient reported a billing-related complaint regarding [Issue]. [Document the issue (free test)]"
  },
  {
    category: "Complaint",
    name: "Cleanliness Complaint",
    code: "/complaint_cleanliness",
    content: "Patient reported a cleanliness/hygiene-related issue at [Location]. [Document the issue (free test)]"
  },
  {
    category: "Complaint",
    name: "Facility Complaint",
    code: "/complaint_facility",
    content: "Patient reported a facility/infrastructure issue at [Location] regarding [Issue]. [Document the issue (free test)]"
  },
  {
    category: "Marketing Campaign",
    name: "Campaign Enquiry",
    code: "/campaign",
    content: "Patient responded to [CampaignName] campaign and enquired about [Service/Offer]. Details were communicated."
  },
  {
    category: "Marketing Campaign",
    name: "Campaign Offer",
    code: "/campaign_offer",
    content: "Patient enquired about promotional offer [OfferName] received through [SMS/WhatsApp/Social Media/Other]. Offer details and applicable conditions were communicated."
  },
  {
    category: "Marketing Campaign",
    name: "Campaign Health Checkup",
    code: "/campaign_healthcheck",
    content: "Patient responded to [CampaignName] regarding health checkup package [PackageName]. Price/details were communicated."
  },
  {
    category: "Job Enquiry",
    name: "Job Enquiry",
    code: "/job_enquiry",
    content: "Caller enquired about employment opportunities for the position of [Position]. Available recruitment process/contact information was communicated."
  },
  {
    category: "Job Enquiry",
    name: "Job Application",
    code: "/job_application",
    content: "Caller enquired about the status/process of job application for [Position]. Available information was communicated and asked to mail resume on HR email or asked to contact HR, number shared."
  },
  {
    category: "General Query",
    name: "General Query",
    code: "/general_query",
    content: "Caller wanted to know [Query], shared details."
  }
];
export const IndianStatesWithDistricts = {
  "Andhra Pradesh": [
    "Alluri Sitarama Raju",
    "Anakapalli",
    "Anantapur",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B.R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa"
  ],
  "Arunachal Pradesh": [
    "Anjaw",
    "Changlang",
    "Dibang Valley",
    "East Kameng",
    "East Siang",
    "Itanagar Capital Complex",
    "Kamle",
    "Kra Daadi",
    "Kurung Kumey",
    "Lepa Rada",
    "Lohit",
    "Longding",
    "Lower Dibang Valley",
    "Lower Siang",
    "Lower Subansiri",
    "Namsai",
    "Pakke Kessang",
    "Papum Pare",
    "Shi Yomi",
    "Siang",
    "Tawang",
    "Tirap",
    "Upper Siang",
    "Upper Subansiri",
    "West Kameng",
    "West Siang"
  ],
  "Assam": [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Dima Hasao",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salmara-Mankachar",
    "Tinsukia",
    "Udalguri",
    "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Gaurela-Pendra-Marwahi",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Manendragarh-Chirmiri-Bharatpur",
    "Mohla-Manpur-Ambagarh Chowki",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sarangarh-Bilaigarh",
    "Shakti",
    "Sukma",
    "Surajpur",
    "Surguja"
  ],
  "Goa": [
    "North Goa",
    "South Goa"
  ],
  "Gujarat": [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad"
  ],
  "Haryana": [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una"
  ],
  "Jharkhand": [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahebganj",
    "Seraikela Kharsawan",
    "Simdega",
    "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayanagara",
    "Vijayapura",
    "Yadgir"
  ],
  "Kerala": [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Niwari",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha"
  ],
  "Maharashtra": [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "North Garo Hills",
    "Ri Bhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl",
    "Champhai",
    "Hnahthial",
    "Khawzawl",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Saitual",
    "Serchhip"
  ],
  "Nagaland": [
    "Chümoukedima",
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Niuland",
    "Noklak",
    "Peren",
    "Phek",
    "Shamator",
    "Tseminyu",
    "Tuensang",
    "Wokha",
    "Zünheboto"
  ],
  "Odisha": [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Kendujhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Subarnapur",
    "Sundargarh"
  ],
  "Punjab": [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Malerkotla",
    "Mansa",
    "Moga",
    "Mohali",
    "Muktsar",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sangrur",
    "Shaheed Bhagat Singh Nagar",
    "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer",
    "Alwar",
    "Anupgarh",
    "Balotra",
    "Banswara",
    "Baran",
    "Barmer",
    "Beawar",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Deeg",
    "Dholpur",
    "Didwana-Kuchaman",
    "Dudu",
    "Dungarpur",
    "Gangapur City",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kekri",
    "Khairthal-Tijara",
    "Kota",
    "Kotputli-Behror",
    "Nagaur",
    "Neem Ka Thana",
    "Pali",
    "Phalodi",
    "Pratapgarh",
    "Rajsamand",
    "Salumbar",
    "Sanchore",
    "Sawai Madhopur",
    "Shahpura",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur"
  ],
  "Sikkim": [
    "East Sikkim",
    "North Sikkim",
    "South Sikkim",
    "West Sikkim"
  ],
  "Tamil Nadu": [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kanchipuram",
    "Kanyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hanamkonda",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Kumuram Bheem",
    "Mahabubabad",
    "Mahbubnagar",
    "Mancherial",
    "Medak",
    "Medchal–Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal",
    "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kheri",
    "Kushinagar",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi"
  ],
  "Uttarakhand": [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur"
  ],
  "Andaman and Nicobar Islands": [
    "Nicobar",
    "North and Middle Andaman",
    "South Andaman"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli",
    "Daman",
    "Diu"
  ],
  "Delhi": [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi"
  ],
  "Jammu and Kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Poonch",
    "Pulwama",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur"
  ],
  "Ladakh": [
    "Kargil",
    "Leh"
  ],
  "Lakshadweep": [
    "Lakshadweep"
  ],
  "Puducherry": [
    "Karaikal",
    "Mahe",
    "Puducherry",
    "Yanam"
  ]
};
export const CATEGORY = [
  // Basic
  { key: "Cash", label: "Cash" },

  {
    key: "Govt. Health Scheme",
    label: "Govt. Health Scheme",
  },

  {
    key: "Non-Govt. Health Scheme",
    label: "Non-Govt. Health Scheme",
  },

  {
    key: "NA",
    label: "NA",
  },

  // Central Government Schemes
  {
    key: "AB-PMJAY",
    label:
      "AB-PMJAY (Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana)",
  },

  {
    key: "AB-PMJAY Vay Vandana",
    label:
      "AB-PMJAY Vay Vandana (Free ₹5L cover for all citizens aged 70+)",
  },

  {
    key: "CGHS",
    label: "CGHS (Central Government Health Scheme)",
  },

  {
    key: "ECHS",
    label:
      "ECHS (Ex-Servicemen Contributory Health Scheme)",
  },

  {
    key: "ESIC",
    label:
      "ESIC (Employees' State Insurance Corporation)",
  },

  {
    key: "Ayushman CAPF",
    label: "Ayushman CAPF",
  },

  {
    key: "UHIS",
    label: "Universal Health Insurance Scheme (UHIS)",
  },

  {
    key: "RSBY",
    label:
      "Rashtriya Swasthya Bima Yojana (RSBY)",
  },

  {
    key: "AABY",
    label:
      "Aam Aadmi Bima Yojana (AABY)",
  },

  {
    key: "JBY",
    label:
      "Janshree Bima Yojana (JBY)",
  },

  {
    key: "PMSBY",
    label:
      "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
  },

  // Rajasthan
  {
    key: "RGHS",
    label:
      "RGHS (Rajasthan Government Health Scheme)",
  },

  {
    key: "MAAY",
    label:
      "Mukhyamantri Ayushman Arogya Yojana (MAAY)",
  },

  // Maharashtra
  {
    key: "MJPJAY",
    label:
      "Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)",
  },

  // West Bengal
  {
    key: "Swasthya Sathi",
    label: "Swasthya Sathi",
  },

  // Odisha
  {
    key: "BSKY",
    label:
      "Biju Swasthya Kalyan Yojana (BSKY)",
  },

  // Andhra Pradesh
  {
    key: "YSR Aarogyasri",
    label:
      "Dr. YSR Aarogyasri",
  },

  // Telangana
  {
    key: "EJHS",
    label:
      "Telangana Employees & Journalists Health Scheme (EJHS)",
  },

  // Kerala
  {
    key: "KASP",
    label:
      "Karunya Health Care Scheme (KASP)",
  },

  // Punjab
  {
    key: "Punjab Sehat Bima",
    label:
      "Ayushman Bharat - Mukhya Mantri Sehat Bima Yojana",
  },

  // Tamil Nadu
  {
    key: "CMCHIS",
    label:
      "Chief Minister’s Comprehensive Health Insurance Scheme (CMCHIS)",
  },

  // Karnataka
  {
    key: "Yashasvini",
    label:
      "Yashasvini Health Insurance Scheme",
  },

  // Maternal & Specialty
  {
    key: "JSY",
    label:
      "Janani Suraksha Yojana (JSY)",
  },

  {
    key: "PMMVY",
    label:
      "PM Matru Vandana Yojana (PMMVY)",
  },

  {
    key: "RBSK",
    label:
      "Rashtriya Bal Swasthya Karyakram (RBSK)",
  },

  {
    key: "NPHCE",
    label:
      "National Programme for Health Care of the Elderly (NPHCE)",
  },

  {
    key: "Rashtriya Vayoshri",
    label:
      "Rashtriya Vayoshri Yojana",
  },

  {
    key: "Nikshay Poshan",
    label:
      "Nikshay Poshan Yojana",
  },

  // Digital Health
  {
    key: "ABDM",
    label:
      "ABDM (Ayushman Bharat Digital Mission / ABHA)",
  },

  {
    key: "NHCX",
    label:
      "NHCX (National Health Claims Exchange)",
  },

  {
    key: "e-Sanjeevani",
    label:
      "e-Sanjeevani (National Telemedicine Service)",
  },
];
export const INBOUND_PURPOSE_OPTIONS = [
  { label: "Appointment", value: "Appointment" },
  { label: "General Query", value: "General Query" },
  { label: "Surgery", value: "Surgery" },
  { label: "Health Checkup", value: "Health Checkup" },
  { label: "Emergency Query", value: "Emergency Query" },
  { label: "Marketing Campaign", value: "Marketing Campaign" },
  { label: "Complaints", value: "Complaints" },
  { label: "OPD Timings", value: "OPD Timings" },
  {
    label: "Diagnose or Test Price",
    value: "Diagnose or Test Price",
  },
  { label: "Test Reports", value: "Test_Reports" },
  // {
  //   label: "Government Health Schemes",
  //   value: "Government Health Schemes",
  // },
  // {
  //   label: "Non-Government Schemes",
  //   value: "Non-Government Schemes",
  // },
  { label: "Ambulance", value: "Ambulance" },
  { label: "Junk", value: "Junk" },
  { label: "Job Related", value: "Job Related" },
];
export const OUTBOUND_PURPOSE_OPTIONS = [
  {
    label: "Appointment/Reschedule Appointment",
    value: "Appointment",
  },

  {
    label: "Follow Up Call",
    value: "Followup",
  },

  {
    label: "Informative",
    value: "Informative",
  },

  {
    label: "Marketing Campaign",
    value: "Marketing",
  },

  {
    label: "Feedback",
    value: "Feedback",
  },

  {
    label: "Missed Calls",
    value: "Missed",
  },

  {
    label: "JustDial",
    value: "Justdial",
  },

  {
    label: "Practo",
    value: "Practo",
  },

  {
    label: "Whatsapp",
    value: "Whatsapp",
  },

  {
    label: "Facebook",
    value: "Facebook",
  },
];
export const REFERENCE_OPTIONS = [
  { label: "Doctor", value: "Doctor" },

  {
    label: "Friends And Family",
    value: "Friends And Family",
  },

  {
    label: "Marketing Campaign",
    value: "Marketing Campaign",
  },

  { label: "News Paper", value: "News Paper" },

  { label: "Radio", value: "Radio" },

  {
    label: "Existing Patient",
    value: "Existing Patient",
  },

  { label: "Google", value: "Google" },

  {
    label: "Govt. Hospital",
    value: "Govt. Hospital",
  },

  { label: "Website", value: "Website" },

  {
    label: "Social Media",
    value: "Social Media",
  },

  { label: "Health Camp", value: "Health Camp" },

  {
    label: "Lives Nearby",
    value: "Lives Nearby",
  },

  { label: "NA", value: "NA" },
];
export const getCurrentDateTime = () => {
  const now = new Date();

  // local timezone ke according datetime-local format
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};
export const initialPatientDetails = {
  patientName: "",
  patientMobile: "",
  alternateMobile: "",
  patientArrivalTime: "",
  patientAge: "",
  gender: "",
  status: "",
  location: "",
  category: "",
};
export const initialFormData = {
  typeOfDisease: "",
  callerType: "",
  referenceFrom: "",
  refDoctorName: "",
  refHospitalName: "",
  refHospitalLocation: "",
  diagnosisOrTestName: "",
  patientDetails: initialPatientDetails,
  bookSlot: null,
  missedConnectionStatus: "",
  attendantDetails: {
    attendantName: "",
    attendantMobile: ""
  },
  informativeTopic: "",
  informativeDetailsShared: "",
  feedbackType: "",
  feedback: {
    feedbackType: "",
    ipdNumber: "",
    opdNumber: "",
    questions: []
  },
  noFeedbackRemarks: "",
  notConnectedRemarks: "",
  opdNumber: "",
  marketingCampaignName: "",
  marketingDetailsShared: "",
  remarks: "",
  callBack: "",
  callDropReason: "",
  connected: "",
  disconnectionReason: "",
  surgeryName: "",
  healthPackageName: "",
  healthSchemeName: "",
  reportName: "",
  issue: "",
  ambulanceLocation: "",
  ambulanceShared: "",
  govertHealthSchemeName: "",
  nonGovtHealthSchemeName: "",
  dateTime: getCurrentDateTime(),
  followupType: "",
  status: "",
  detailsShared: "",
  slotDuration: "",
  appointmentSlot: null,
  patientArrivalTime: "",
};

export const initialFormState = {
  formType: "inbound",
  purpose: "",
  doctor: null,
  department: null,
  branchId: null,
  hospitalId: null,
  callStatus: "",
  useForFollowup: false,
  formData: initialFormData
};