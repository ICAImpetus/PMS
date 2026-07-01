import axios from "axios";

const WHATSAPP_API_URL =
    process.env.WHATSAPP_AUTOMATION_URL ||
    "https://whatsapp-automation-0km1.onrender.com/send_message";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send WhatsApp message through third-party automation service.
 *
 * @param {Object} data
 * @param {number} maxRetries
 * @returns {Promise<Object>}
 */
export const sendWhatsAppMessage = async (
    data,
    maxRetries = 3
) => {
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            const response = await axios.post(WHATSAPP_API_URL, data, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });

            return {
                success: true,
                status: response.status,
                data: response.data,
                attempts: attempt + 1,
            };
        } catch (error) {
            attempt++;

            const status = error.response?.status;
            const shouldRetry =
                attempt <= maxRetries &&
                (
                    !status || // Network error
                    status >= 500 || // Server error
                    error.code === "ECONNABORTED" || // Timeout
                    error.code === "ECONNRESET" ||
                    error.code === "ENOTFOUND"
                );

            console.error(
                `WhatsApp API attempt ${attempt}/${maxRetries + 1} failed`,
                {
                    status,
                    code: error.code,
                    message: error.message,
                }
            );

            if (!shouldRetry) {
                return {
                    success: false,
                    status: status || 500,
                    error: error.response?.data || error.message,
                    attempts: attempt,
                };
            }

            // Exponential backoff: 1s -> 2s -> 4s
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay} ms...`);
            await sleep(delay);
        }
    }
};

export const sendWhatsAppInBackground = (payload, delay = 0) => {
    setTimeout(async () => {
        try {
            console.log("payload", payload);

            const result = await sendWhatsAppMessage(payload);
            console.log("result", result);

            if (!result.success) {
                console.error("WhatsApp send failed:", result.error);
            }
        } catch (err) {
            console.error("WhatsApp background error:", err);
        }
    }, delay);
};