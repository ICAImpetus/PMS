import { Box } from '@mui/material'
import React from 'react'
import './style.css'
import { toast } from "react-toastify";
import axios from 'axios'
// import Razorpay from 'razorpay';
import { UserContextHook } from '../../../contexts/UserContexts'

const Subscription = () => {

    const { currentUser } = UserContextHook();

    const handlePay = async (ammount) => {
        try {
            // console.log('ammount',ammount)
            const res = await axios.post('http://localhost:5000/api/create-order', { ammount }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            const order = res?.data;
            const options = {
                key: 'rzp_test_uoEvO2jxZxqBeZ',

                amount: order.amount,

                currency: order.currency,

                name: "IMPETUS CONSULTING ASSOCIATES",

                description: "Software Subscription",

                order_id: order.id,

                handler: async function (response) {
                    console.log("Payment Success");

                    console.log(response);

                    /*
                    response.razorpay_payment_id
                    response.razorpay_order_id
                    response.razorpay_signature
                    */

                    // Next Step:
                    // Backend verification API call

                    const verifyRes =
                        await axios.post(
                            "http://localhost:5000/api/verify-payment",
                            { ...response, ammount, userId: currentUser?._id }
                        );

                    console.log(verifyRes.data);
                },

                prefill: {
                    name: "Customer Name",
                    email: "customer@gmail.com",
                    contact: "9999999999",
                },

                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.open();
        } catch (error) {
            console.log('error in handle pay', error);
            toast.error(response?.message || 'Error Occured, Contact Admin!')
        }
    }

    return (
        <main className="container">

            <div className="header">
                <span className="badge-blue">System Pricing</span>
                <h1>Predictable Plans for Clinical Operations</h1>
                {/* <p>Choose a plan tailored to your facility's scale. All tiers are fully HIPAA-compliant and feature end-to-end data encryption.</p> */}

                {/* <div className="toggle-container">
                    <button id="toggle-monthly" className="toggle-btn active" aria-pressed="true">
                        Monthly Billing
                    </button>
                    <button id="toggle-annual" className="toggle-btn" aria-pressed="false">
                        Annual Billing
                        <span className="badge-green">-20%</span>
                    </button>
                </div> */}
            </div>

            <div className="pricing-grid">

                <section className="plan-card">
                    <div>
                        <h2>One Month</h2>
                        <p className="plan-description">Essential digital toolsets for solo medical practitioners and small private consultancies.</p>

                        <div className="price-container">
                            <span className="price-currency">₹</span>
                            <span id="price-starter" className="price-transition price-value">3999</span>
                            {/* <span className="price-period">/month</span> */}
                        </div>

                        <ul className="feature-list" aria-label="Starter Plan Features">
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Up to 250 Active Patient Records</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Standard Calendar & Scheduling</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Basic Electronic Health Records (EHR)</span>
                            </li>
                            <li className="feature-item disabled">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                                <span className="line-through">Automated Patient Reminders</span>
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => handlePay(3999)}
                        className="btn-action btn-secondary">Deploy Starter</button>
                </section>

                <section className="plan-card featured">
                    <div className="featured-badge">Recommended Tactic</div>
                    <div>
                        <h2>3 Months</h2>
                        <p className="plan-description">Designed for growing dynamic clinics requiring intelligent automation and telehealth infrastructure.</p>

                        <div className="price-container">
                            <span className="price-currency">₹</span>
                            <span id="price-pro" className="price-transition price-value">9999</span>
                            {/* <span className="price-period">/month</span> */}
                        </div>

                        <ul className="feature-list" aria-label="Professional Plan Features">
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span className="highlight">Unlimited Active Patient Records</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Integrated Video Telehealth Module</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>AI-Assisted Digital e-Prescriptions</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Automated SMS & Email Notifications</span>
                            </li>
                        </ul>
                    </div>
                    <button className="btn-action btn-primary"
                        onClick={() => handlePay(9999)}

                    >Provision Care Pro</button>
                </section>

                <section className="plan-card">
                    <div>
                        <h2>1 Year</h2>
                        <p className="plan-description">Full architectural control, multi-branch syncing, and custom regulatory protocols.</p>

                        <div className="price-container">
                            <span className="price-currency">₹</span>
                            <span id="price-enterprise" className="price-transition price-value">36999</span>
                            {/* <span className="price-period">/month</span> */}
                        </div>

                        <ul className="feature-list" aria-label="Enterprise Plan Features">
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Everything standard in Care Pro</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>Multi-Branch Operations Hub</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>HL7 / FHIR Native API Integrations</span>
                            </li>
                            <li className="feature-item checked">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span>SLA Support & Dedicated Manager</span>
                            </li>
                        </ul>
                    </div>
                    <button className="btn-action btn-dark"
                        onClick={() => handlePay(36999)}

                    >Request Enterprise Access</button>
                </section>

            </div>
        </main>
    )
}

export default Subscription
