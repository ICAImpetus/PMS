const formDataObjArray = [
    {
        "question": "Relationship Manager",
        "type": "multiple_choice",
        "options": [
            "Anant Khandal",
            "Vijay Sharma",
            "Rohit Singh",
            "Arjun Singh",
            "Others (Specify)"
        ],
        "allowOtherOption": true,
        "required": true,
        "points": 10
    },
    {
        "question": "Patient's Name",
        "type": "short_answer",
        "placeholder": "Short answer text",
        "required": false,
        "points": 10
    },
    {
        "question": "Contact Number / Ext Number",
        "type": "short_answer",
        "placeholder": "Short answer text",
        "validation": {
            "maxLength": 10,
            "errorMessage": ""
        },
        "required": false
    },
    {
        "title": "Call Status",
        "type": "multipleChoice",
        "options": [
            {
                "value": "Connected",
                "action": "Continue to next section"
            },
            {
                "value": "Call Waiting",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Not Answered",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Asked to Call Back",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Switched Off / Not reachable",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Wrong Number",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Call Disconnected",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Already Visited Name in OPD",
                "action": "Go to section 3 (Purpose of Calling)"
            },
            {
                "value": "Mobile Number Not Mentioned",
                "action": "Go to section 3 (Purpose of Calling)"
            }
        ],
        "required": true,
        "points": 10
    },
    {
        "title": "Purpose of Calling",
        "type": "dropdown",
        "options": [
            {
                "value": "Feedback-IPD Discharge",
                "action": "Go to section 4 (Feedback-IPD)"
            },
            {
                "value": "Feedback-OPD Visit",
                "action": "Go to section 5 (Feedback-OPD)"
            },
            {
                "value": "Follow Up-Appointment",
                "action": "Go to section 7 (Follow up-Appointment)"
            },
            {
                "value": "Follow Up-Surgery Query",
                "action": "Go to section 9 (Follow up-OPD)"
            },
            {
                "value": "Follow Up-OPD Query",
                "action": "Go to section 9 (Follow up-OPD)"
            },
            {
                "value": "Follow up-Diagnose & Tests",
                "action": "Go to section 10 (Follow up- Diagnose& Tests)"
            },
            {
                "value": "STS",
                "action": "Go to section 11 (STS)"
            },
            {
                "value": "Call Back",
                "action": "Go to section 12 (Call back)"
            },
            {
                "value": "Appointment Reschedule",
                "action": "Continue to next section"
            },
            {
                "value": "Appointment Cancel",
                "action": "Submit form"
            },
            {
                "value": "Followup Up-Covid Query",
                "action": "Go to section 8 (Follow up-Surgery/Covid)"
            },
            {
                "value": "Feedback-Complaint/Negat...",
                "action": "Go to section 14 (Feedback-Complaint... Negative Feedback)"
            },
            {
                "value": "Follow up- Emergency Query",
                "action": "Go to section 9 (Follow up-OPD)"
            },
            {
                "value": "Follow up- Whats app Query",
                "action": "Go to section 15 (Follow up- Whats app Query)"
            },
            {
                "value": "Campaign Lead",
                "action": "Go to section 16 (Campaign Lead)"
            },
            {
                "value": "IPD Revisit Follow-up",
                "action": "Go to section 17 (IPD Revisit Follow-up)"
            },
            {
                "value": "Whats App Query",
                "action": "Go to section 18 (Whats App Query)"
            },
            {
                "value": "Informative",
                "action": "Go to section 21 (Informative Calls)"
            },
            {
                "value": "Facebook",
                "action": "Go to section 22 (Facebook Calls)"
            }
        ],
        "required": true,
        "points": 10
    },
    {
        "title": "Feedback-IPD",
        "description": "", // Or add a description if available
        "questions": [
            {
                "title": "IPD Number",
                "type": "shortAnswer",
                "required": true
            },
            {
                "title": "Doctor Name",
                "type": "dropdown",
                "options": [
                    { "value": "Dr Manoj Choudhary" },
                    { "value": "Dr Manju Choudhary" },
                    { "value": "Dr Pradeep Agarwal" },
                    { "value": "Dr Nikky Punia" },
                    { "value": "Dr Ankit Kayal" },
                    { "value": "Dr Ankit Choudhary" },
                    { "value": "Dr Paras Choudhary" },
                    { "value": "Dr Rajesh Pandey" },
                    { "value": "Dr Kishor Agarwal" },
                    { "value": "Dr Gaurav Goyal" },
                    { "value": "Dr Sameer Parihar" },
                    { "value": "Dr BK Chabra" },
                    { "value": "Dr Saurabh Agarwal" },
                    { "value": "Dr Vinod Sharma" },
                    { "value": "Dr KB Jhalani" },
                    { "value": "Dr Deepesh Goyal" },
                    { "value": "Dr Pankaj Kumar" },
                    { "value": "Duty Doctor" },
                    { "value": "Dr Yamini Singhal" },
                    { "value": "Dr. Ravi Kumar" },
                    { "value": "Dr. Deepak Sharma" },
                    { "value": "Dr. Sarika Lamba" },
                    { "value": "Dr. Nitesh Agarwal" }
                ],
                "required": true
            }
        ],
        "points": 10
    },
    
];


  